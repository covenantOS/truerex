/**
 * Webhook Utilities for TrueRx Project
 * 
 * Provides signature verification and rate limiting for various webhook providers:
 * - Blooio (HMAC-SHA256)
 * - Resend (Svix)
 * - Google Business Profile (Pub/Sub)
 * - Make.com (custom)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, createHmac, timingSafeEqual } from 'crypto';

// =============================================================================
// Types
// =============================================================================

export interface WebhookVerificationResult {
  valid: boolean;
  payload?: unknown;
  error?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface LoggedEvent {
  timestamp: string;
  source: string;
  eventType: string;
  ip: string;
  valid: boolean;
  details?: unknown;
}

// =============================================================================
// Environment Variables (to be configured in .env.local)
// =============================================================================

// Blooio
const BLOOIO_WEBHOOK_SECRET = process.env.BLOOIO_WEBHOOK_SECRET;

// Resend
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

// Google Business Profile
const GBP_WEBHOOK_SECRET = process.env.GBP_WEBHOOK_SECRET;

// Make.com
const MAKE_WEBHOOK_SECRET = process.env.MAKE_WEBHOOK_SECRET;

// =============================================================================
// In-Memory Rate Limiting (Simple Implementation)
// For production, use Redis or a dedicated rate limiting service
// =============================================================================

class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if the request is rate limited
   * @param identifier - Unique identifier (usually IP address)
   * @returns true if rate limited, false if allowed
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }

    if (record.count >= this.maxRequests) {
      return true;
    }

    record.count++;
    return false;
  }

  /**
   * Get remaining requests for an identifier
   */
  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - record.count);
  }

  /**
   * Clean up expired records (should be called periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Default rate limiter: 100 requests per minute
export const defaultRateLimiter = new InMemoryRateLimiter(60000, 100);

// =============================================================================
// Blooio Webhook Verification (HMAC-SHA256)
// =============================================================================

/**
 * Verify Blooio webhook signature using HMAC-SHA256
 * 
 * Blooio sends webhooks with:
 * - X-Blooio-Signature header: HMAC-SHA256 signature
 * - X-Blooio-Timestamp header: Unix timestamp (optional, for replay protection)
 * 
 * @param payload - Raw request body string
 * @param signature - Signature from X-Blooio-Signature header
 * @param timestamp - Optional timestamp from X-Blooio-Timestamp header
 * @param toleranceSeconds - Maximum age of webhook in seconds (default: 300)
 */
export function verifyBlooioWebhook(
  payload: string,
  signature: string | null,
  timestamp: string | null,
  toleranceSeconds: number = 300
): WebhookVerificationResult {
  // Check if secret is configured
  if (!BLOOIO_WEBHOOK_SECRET) {
    console.error('[Webhook] BLOOIO_WEBHOOK_SECRET not configured');
    return { valid: false, error: 'Webhook secret not configured' };
  }

  // Check if signature is provided
  if (!signature) {
    return { valid: false, error: 'No signature provided' };
  }

  // Check timestamp for replay protection (optional but recommended)
  if (timestamp) {
    const webhookTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (isNaN(webhookTime)) {
      return { valid: false, error: 'Invalid timestamp format' };
    }

    if (Math.abs(currentTime - webhookTime) > toleranceSeconds) {
      return { valid: false, error: 'Webhook timestamp expired' };
    }
  }

  // Compute expected signature
  const expectedSignature = createHmac('sha256', BLOOIO_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Compare signatures (using timingSafeEqual to prevent timing attacks)
  const signatureBuffer = Buffer.from(signature.replace(/^sha256=/, ''), 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (signatureBuffer.length !== expectedBuffer.length) {
    return { valid: false, error: 'Invalid signature format' };
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { valid: false, error: 'Signature mismatch' };
  }

  // Parse and return the payload
  try {
    const parsedPayload = JSON.parse(payload);
    return { valid: true, payload: parsedPayload };
  } catch {
    return { valid: false, error: 'Invalid JSON payload' };
  }
}

// =============================================================================
// Resend Webhook Verification (Svix)
// =============================================================================

/**
 * Verify Resend webhook signature using Svix
 * 
 * Resend sends webhooks with Svix headers:
 * - svix-id: Unique message identifier
 * - svix-timestamp: Unix timestamp
 * - svix-signature: Cryptographic signature
 * 
 * @param payload - Raw request body string
 * @param svixId - From svix-id header
 * @param svixTimestamp - From svix-timestamp header
 * @param svixSignature - From svix-signature header
 * @param toleranceSeconds - Maximum age of webhook in seconds (default: 300)
 */
export function verifyResendWebhook(
  payload: string,
  svixId: string | null,
  svixTimestamp: string | null,
  svixSignature: string | null,
  toleranceSeconds: number = 300
): WebhookVerificationResult {
  // Check if secret is configured
  if (!RESEND_WEBHOOK_SECRET) {
    console.error('[Webhook] RESEND_WEBHOOK_SECRET not configured');
    return { valid: false, error: 'Webhook secret not configured' };
  }

  // Check required headers
  if (!svixId || !svixTimestamp || !svixSignature) {
    return { valid: false, error: 'Missing required Svix headers' };
  }

  // Check timestamp for replay protection
  const webhookTime = parseInt(svixTimestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);

  if (isNaN(webhookTime)) {
    return { valid: false, error: 'Invalid timestamp format' };
  }

  if (Math.abs(currentTime - webhookTime) > toleranceSeconds) {
    return { valid: false, error: 'Webhook timestamp expired' };
  }

  // Create the signature payload: "svixId.svixTimestamp.payload"
  const signaturePayload = `${svixId}.${svixTimestamp}.${payload}`;

  // Compute expected signature using HMAC-SHA256
  const expectedSignature = createHmac('sha256', RESEND_WEBHOOK_SECRET)
    .update(signaturePayload)
    .digest('base64');

  // The svix-signature header contains multiple signatures (v1, v2, etc.)
  // We need to find a match
  const signatures = svixSignature.split(',');
  let isValid = false;

  for (const sig of signatures) {
    const [version, sigValue] = sig.trim().split('=');
    if (version === 'v1') {
      // Compare signatures using timingSafeEqual
      const sigBuffer = Buffer.from(sigValue, 'base64');
      const expectedBuffer = Buffer.from(expectedSignature, 'base64');
      
      if (sigBuffer.length === expectedBuffer.length && 
          timingSafeEqual(sigBuffer, expectedBuffer)) {
        isValid = true;
        break;
      }
    }
  }

  if (!isValid) {
    return { valid: false, error: 'Signature mismatch' };
  }

  // Parse and return the payload
  try {
    const parsedPayload = JSON.parse(payload);
    return { valid: true, payload: parsedPayload };
  } catch {
    return { valid: false, error: 'Invalid JSON payload' };
  }
}

// =============================================================================
// Google Business Profile Webhook Verification
// =============================================================================

/**
 * Verify Google Business Profile webhook
 * 
 * Note: Google Business Profile uses GCP Pub/Sub, not traditional webhooks.
 * This function provides basic verification for custom GBP webhook implementations.
 * 
 * Expected headers:
 * - X-GBP-Signature: HMAC-SHA256 signature
 * - X-GBP-Timestamp: Unix timestamp
 * 
 * @param payload - Raw request body string
 * @param signature - Signature from X-GBP-Signature header
 * @param timestamp - Timestamp from X-GBP-Timestamp header
 */
export function verifyGBPSignature(
  payload: string,
  signature: string | null,
  timestamp: string | null
): WebhookVerificationResult {
  // Check if secret is configured
  if (!GBP_WEBHOOK_SECRET) {
    console.error('[Webhook] GBP_WEBHOOK_SECRET not configured');
    return { valid: false, error: 'Webhook secret not configured' };
  }

  // Check if signature is provided
  if (!signature) {
    return { valid: false, error: 'No signature provided' };
  }

  // Check timestamp for replay protection (optional)
  if (timestamp) {
    const webhookTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (isNaN(webhookTime)) {
      return { valid: false, error: 'Invalid timestamp format' };
    }

    // 5 minute tolerance
    if (Math.abs(currentTime - webhookTime) > 300) {
      return { valid: false, error: 'Webhook timestamp expired' };
    }
  }

  // Compute expected signature
  const expectedSignature = createHmac('sha256', GBP_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Compare signatures
  const signatureBuffer = Buffer.from(signature.replace(/^sha256=/, ''), 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (signatureBuffer.length !== expectedBuffer.length) {
    return { valid: false, error: 'Invalid signature format' };
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { valid: false, error: 'Signature mismatch' };
  }

  // Parse and return the payload
  try {
    const parsedPayload = JSON.parse(payload);
    return { valid: true, payload: parsedPayload };
  } catch {
    return { valid: false, error: 'Invalid JSON payload' };
  }
}

// =============================================================================
// Make.com Webhook Verification (Custom HMAC)
// =============================================================================

/**
 * Verify Make.com webhook signature
 * 
 * Make.com webhooks can include a custom signature in headers:
 * - X-Make-Signature: HMAC-SHA256 signature
 * 
 * @param payload - Raw request body string
 * @param signature - Signature from X-Make-Signature header
 */
export function verifyMakeWebhook(
  payload: string,
  signature: string | null
): WebhookVerificationResult {
  // Check if secret is configured
  if (!MAKE_WEBHOOK_SECRET) {
    console.error('[Webhook] MAKE_WEBHOOK_SECRET not configured');
    return { valid: false, error: 'Webhook secret not configured' };
  }

  // Check if signature is provided
  if (!signature) {
    // Make.com might not always send signatures - this is a security concern
    // Consider rejecting unsigned webhooks in production
    console.warn('[Webhook] Make.com webhook without signature - allowing for compatibility');
    // Return valid but log warning - adjust based on security requirements
    try {
      const parsedPayload = JSON.parse(payload);
      return { valid: true, payload: parsedPayload };
    } catch {
      return { valid: false, error: 'Invalid JSON payload' };
    }
  }

  // Compute expected signature
  const expectedSignature = createHmac('sha256', MAKE_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Compare signatures
  const signatureBuffer = Buffer.from(signature.replace(/^sha256=/, ''), 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (signatureBuffer.length !== expectedBuffer.length) {
    return { valid: false, error: 'Invalid signature format' };
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { valid: false, error: 'Signature mismatch' };
  }

  // Parse and return the payload
  try {
    const parsedPayload = JSON.parse(payload);
    return { valid: true, payload: parsedPayload };
  } catch {
    return { valid: false, error: 'Invalid JSON payload' };
  }
}

// =============================================================================
// Rate Limiting Helper
// =============================================================================

/**
 * Create a rate limiter with custom configuration
 */
export function createRateLimiter(windowMs: number = 60000, maxRequests: number = 100): InMemoryRateLimiter {
  return new InMemoryRateLimiter(windowMs, maxRequests);
}

/**
 * Check rate limit and return appropriate response
 */
export async function checkRateLimit(
  request: NextRequest,
  rateLimiter: InMemoryRateLimiter = defaultRateLimiter
): Promise<{ allowed: boolean; response?: NextResponse; remaining: number }> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';
  
  const isLimited = rateLimiter.isRateLimited(ip);
  const remaining = rateLimiter.getRemainingRequests(ip);

  if (isLimited) {
    return {
      allowed: false,
      response: new NextResponse(JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(rateLimiter['windowMs'] / 1000),
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(rateLimiter['maxRequests']),
          'X-RateLimit-Remaining': '0',
          'Retry-After': String(Math.ceil(rateLimiter['windowMs'] / 1000)),
        },
      }),
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining,
  };
}

// =============================================================================
// Webhook Logging
// =============================================================================

/**
 * Log webhook event for debugging and auditing
 */
export function logWebhookEvent(event: LoggedEvent): void {
  const logEntry = {
    ...event,
    timestamp: new Date().toISOString(),
  };
  
  // In production, this should go to a proper logging service
  // like Datadog, CloudWatch, etc.
  console.log('[Webhook Event]', JSON.stringify(logEntry));
}

/**
 * Create a standardized webhook log entry
 */
export function createWebhookLog(
  source: string,
  eventType: string,
  request: NextRequest,
  valid: boolean,
  details?: unknown
): LoggedEvent {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';

  return {
    timestamp: new Date().toISOString(),
    source,
    eventType,
    ip,
    valid,
    details,
  };
}

// =============================================================================
// Payload Validation Helpers
// =============================================================================

/**
 * Validate Blooio webhook payload structure
 */
export function validateBlooioPayload(payload: unknown): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload: not an object' };
  }

  const p = payload as Record<string, unknown>;
  
  // Check for expected Blooio payload fields
  // Adjust based on actual Blooio webhook event types
  if (!p.event || typeof p.event !== 'string') {
    return { valid: false, error: 'Invalid payload: missing event type' };
  }

  // Most Blooio events should have data
  if (!p.data) {
    return { valid: false, error: 'Invalid payload: missing data' };
  }

  return { valid: true };
}

/**
 * Validate Resend webhook payload structure
 */
export function validateResendPayload(payload: unknown): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload: not an object' };
  }

  const p = payload as Record<string, unknown>;
  
  // Resend webhooks have 'type' and 'data' fields
  if (!p.type || typeof p.type !== 'string') {
    return { valid: false, error: 'Invalid payload: missing type' };
  }

  // Check for valid event types
  const validTypes = [
    'email.sent',
    'email.delivered',
    'email.bounced',
    'email.opened',
    'email.clicked',
    'email.complained',
    'email.unsubscribed',
  ];

  if (!validTypes.includes(p.type as string)) {
    console.warn('[Webhook] Unknown Resend event type:', p.type);
  }

  return { valid: true };
}

/**
 * Validate Make.com webhook payload structure
 */
export function validateMakePayload(payload: unknown): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload: not an object' };
  }

  // Make.com payloads vary widely based on the scenario
  // Just ensure it's valid JSON and has content
  const p = payload as Record<string, unknown>;
  
  if (Object.keys(p).length === 0) {
    return { valid: false, error: 'Invalid payload: empty object' };
  }

  return { valid: true };
}

// =============================================================================
// Standard Response Helpers
// =============================================================================

/**
 * Create a successful webhook response
 */
export function webhookSuccess(data?: unknown): NextResponse {
  return new NextResponse(JSON.stringify({
    success: true,
    ...(data && { data }),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create an error webhook response
 */
export function webhookError(message: string, statusCode: number = 400): NextResponse {
  return new NextResponse(JSON.stringify({
    success: false,
    error: message,
  }), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}
