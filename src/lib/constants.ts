export const SERVICE_TYPES = [
  "plumbing",
  "hvac",
  "electrical",
  "roofing",
  "painting",
  "landscaping",
  "cleaning",
  "general_contractor",
  "pest_control",
  "garage_door",
  "flooring",
  "remodeling",
  "fencing",
  "concrete",
  "tree_service",
  "pressure_washing",
  "handyman",
  "other",
] as const;

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  plumbing: "Plumbing",
  hvac: "HVAC",
  electrical: "Electrical",
  roofing: "Roofing",
  painting: "Painting",
  landscaping: "Landscaping",
  cleaning: "Cleaning",
  general_contractor: "General Contractor",
  pest_control: "Pest Control",
  garage_door: "Garage Door",
  flooring: "Flooring",
  remodeling: "Remodeling",
  fencing: "Fencing",
  concrete: "Concrete",
  tree_service: "Tree Service",
  pressure_washing: "Pressure Washing",
  handyman: "Handyman",
  other: "Other",
};

export const JOB_STATUSES = ["draft", "active", "completed", "archived"] as const;

export const PHOTO_TYPES = ["before", "during", "after"] as const;

export const VOICE_TONES = [
  "friendly-professional",
  "casual-fun",
  "authoritative-expert",
  "warm-family",
  "straight-shooter",
] as const;

export const VOICE_TONE_LABELS: Record<string, string> = {
  "friendly-professional": "Friendly & Professional",
  "casual-fun": "Casual & Fun",
  "authoritative-expert": "Authoritative Expert",
  "warm-family": "Warm & Family-oriented",
  "straight-shooter": "Straight Shooter",
};
