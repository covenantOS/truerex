# TrueRex / LocalProof

<p align="center">
  <strong>AI-Powered Platform for Home Service Contractors</strong>
</p>

<p align="center">
  <a href="https://truerex.vercel.app">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Overview

TrueRex (also known as LocalProof) is a comprehensive, AI-powered business management platform designed specifically for home service contractors. It combines job management, AI content generation, review management, and marketing automation to help contractors grow their business and streamline operations.

### Value Proposition

- **Streamline Operations**: Manage jobs, customers, and teams from a single platform
- **AI-Powered Content**: Automatically generate job stories, blog posts, social media content, and review responses
- **Build Trust**: Leverage Google Business Profile integration and AI-powered review management
- **Grow Your Business**: Neighborhood campaigns and referral systems help you win more jobs
- **Save Time**: Field capture with camera, speech, and geolocation reduces administrative overhead

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Shadcn/UI |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **AI/ML** | OpenAI GPT-4, Claude |
| **File Storage** | Supabase Storage |
| **Deployment** | Vercel |
| **Integrations** | Google Business Profile API, Blooio, Resend, WordPress, Lob, Attom |

---

## Features

### Job Management
- Create and manage job records with full customer information
- Track job status (scheduled, in-progress, completed, invoiced)
- Assign jobs to team members
- Calendar integration for scheduling

### Field Capture
- **Camera Integration**: Capture before/after photos directly from the job site
- **Speech-to-Text**: Voice notes for quick documentation
- **Geolocation**: Track job locations and verify field visits
- Offline-capable field forms

### AI Content Generation
- **Job Stories**: Automatically generate compelling narratives about completed work
- **Blog Posts**: Create SEO-optimized blog content from job experiences
- **Social Posts**: Generate platform-specific content for Facebook, Instagram, Nextdoor
- **Review Responses**: AI-generated responses to customer reviews

### Google Business Profile Integration
- Sync business information with GBP
- Post updates directly to Google
- Monitor and manage business listings
- Access insights and analytics

### Review Management
- Monitor reviews across platforms
- AI-powered response generation
- Sentiment analysis
- Review request automation
- Track ratings over time

### Neighborhood Campaigns
- Pre-job marketing to target neighborhoods
- Post-job follow-up campaigns
- Door hanger and postcard design (via Lob integration)
- Mail tracking

### Referral System
- Track referrals and their status
- Automated referral rewards
- Partner network management
- Referral analytics

### Integrations
- **Blooio**: CRM and communication
- **Resend**: Email delivery
- **WordPress**: Blog publishing
- **Lob**: Direct mail and postcards
- **Attom**: Property data enrichment

---

## Quick Start

### Prerequisites

- Node.js 18.x or later
- npm, yarn, pnpm, or bun
- Supabase account
- API keys for integrations (see below)

### Installation

```bash
# Clone the repository
git clone https://github.com/covenantOS/truerex.git
cd truerex

# Install dependencies
npm install

# or using yarn
yarn install

# or using pnpm
pnpm install
```

### Environment Setup

Create a `.env.local` file in the root directory with the required environment variables:

```bash
# Copy the example environment file
cp .env.example .env.local
```

See [ENV.md](./ENV.md) for a complete list of environment variables and their descriptions.

### Database Setup

1. Create a new Supabase project at [database.new](https://database.new)
2. Run the migrations in the `supabase/migrations` folder
3. Update your `.env.local` with Supabase credentials

```bash
# Apply migrations (requires Supabase CLI)
supabase db push
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

For a complete list of environment variables required for this project, see [ENV.md](./ENV.md).

### Required Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `GOOGLE_BUSINESS_PROFILE_CLIENT_ID` | Google API client ID |
| `GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET` | Google API client secret |

---

## Database Schema

### Core Tables

```sql
-- Users & Organizations
profiles           -- User profiles linked to Supabase Auth
organizations     -- Company/organization records
organization_members -- User-organization relationships

-- Customers & Jobs
customers         -- Customer information
addresses         -- Customer addresses
jobs              -- Job records
job_notes         -- Job notes and documentation
job_media         -- Photos and media attachments
job_activities    -- Activity log for jobs

-- Marketing & Reviews
reviews           -- Customer reviews
review_responses  -- AI-generated responses
campaigns         -- Marketing campaigns
campaign_leads    -- Campaign lead tracking
neighborhoods     -- Target neighborhoods

-- Referrals
referrals         -- Referral records
referral_rewards  -- Rewards tracking

-- Content
blog_posts        -- Generated blog posts
social_posts      -- Social media content
job_stories       -- AI-generated job narratives

-- Integrations
integration_configs -- API credentials for integrations
webhooks          -- Webhook configurations
```

### Key Relationships

- `organizations` → `customers` → `jobs`
- `jobs` → `job_notes`, `job_media`, `job_activities`
- `organizations` → `reviews` → `review_responses`
- `organizations` → `campaigns` → `campaign_leads`
- `customers` → `referrals`

---

## API Routes

### Authentication
- `POST /api/auth/callback` - Supabase auth callback handler
- `POST /api/auth/logout` - Logout handler

### Jobs
- `GET /api/jobs` - List jobs (with filtering/pagination)
- `POST /api/jobs` - Create new job
- `GET /api/jobs/[id]` - Get job details
- `PATCH /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job
- `POST /api/jobs/[id]/media` - Upload job media
- `POST /api/jobs/[id]/notes` - Add job note

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer details
- `PATCH /api/customers/[id]` - Update customer

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews/sync` - Sync reviews from GBP
- `POST /api/reviews/[id]/respond` - Generate AI response
- `POST /api/reviews/[id]/send` - Send response to platform

### Content Generation
- `POST /api/ai/generate/story` - Generate job story
- `POST /api/ai/generate/blog` - Generate blog post
- `POST /api/ai/generate/social` - Generate social post
- `POST /api/ai/generate/review-response` - Generate review response

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `POST /api/campaigns/[id]/send` - Send campaign

### Google Business Profile
- `GET /api/gbp/locations` - List business locations
- `POST /api/gbp/sync` - Sync GBP data
- `POST /api/gbp/post` - Create GBP post

### Integrations
- `POST /api/integrations/blooio/sync` - Sync with Blooio
- `POST /api/integrations/wordpress/publish` - Publish to WordPress
- `POST /api/integrations/lob/send` - Send direct mail
- `GET /api/integrations/attom/property` - Get property data

---

## Integration Setup Guides

### Google Business Profile

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the "My Business Business Information API"
4. Create OAuth 2.0 credentials (Client ID and Secret)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://your-domain.com/api/auth/google/callback`
6. Add your credentials to `.env.local`:
   ```
   GOOGLE_BUSINESS_PROFILE_CLIENT_ID=your_client_id
   GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET=your_client_secret
   GOOGLE_BUSINESS_PROFILE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

### Blooio

1. Log in to your Blooio account
2. Navigate to Settings → API
3. Generate an API key
4. Add to environment:
   ```
   BLOOIO_API_KEY=your_blooio_api_key
   BLOOIO_ACCOUNT_ID=your_account_id
   ```

### Resend

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in the dashboard
3. Add to environment:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```
4. Verify your sender domain in Resend dashboard

### WordPress

1. Install the "REST API" plugin on your WordPress site (if not already included)
2. Create an application password:
   - WordPress Admin → Users → Profile
   - Application Passwords section
   - Generate new password
3. Add to environment:
   ```
   WORDPRESS_URL=https://your-wordpress-site.com
   WORDPRESS_USERNAME=your_username
   WORDPRESS_APP_PASSWORD=your_app_password
   ```

### Lob (Direct Mail)

1. Sign up at [lob.com](https://lob.com)
2. Get your API key from the dashboard
3. Add to environment:
   ```
   LOB_API_KEY=your_lob_api_key
   LOB_PUBLIC_KEY=your_lob_public_key
   ```
4. Verify your address in Lob dashboard for production sending

### Attom (Property Data)

1. Sign up at [attomdata.com](https://www.attomdata.com)
2. Get your API credentials
3. Add to environment:
   ```
   ATTOM_API_KEY=your_attom_api_key
   ATTOM_API_SECRET=your_attom_secret
   ```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect your GitHub repo for automatic deployments
```

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

### Environment Variables for Production

Ensure these are set in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-...
# Add all other required variables from ENV.md
```

### Database Migration

Run migrations on your production database:

```bash
supabase db push --db-url=postgresql://user:password@host:5432/dbname
```

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/my-feature`
7. Create a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (ESLint + Prettier)
- Write meaningful commit messages
- Add tests for new features

### Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Maintenance

### Reporting Issues

Use GitHub Issues to report bugs or request features. Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

- **Documentation**: Check our [wiki](https://github.com/covenantOS/truerex/wiki)
- **Issues**: Report bugs at [GitHub Issues](https://github.com/covenantOS/truerex/issues)
- **Discussions**: Join the conversation at [GitHub Discussions](https://github.com/covenantOS/truerex/discussions)

---

## Acknowledgments

- [Next.js](https://nextjs.org) - The React Framework
- [Supabase](https://supabase.com) - Open Source Firebase Alternative
- [Vercel](https://vercel.com) - Frontend Cloud
- [OpenAI](https://openai.com) - AI Technology
