import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROICalculator } from "@/components/landing/roi-calculator";
import {
  MapPackDemo,
  DashboardDemo,
  TextMessageDemo,
  MailerDemo,
  JobPhotoShowcase,
  RankingTrackerDemo,
} from "@/components/landing/demo-visuals";
import {
  Camera,
  Star,
  MapPin,
  MessageSquare,
  Share2,
  BarChart3,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Check,
  X,
  Phone,
  Mail,
  Send,
  Bot,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: Camera,
    title: "Snap. Speak. Done.",
    desc: "Your tech snaps before/after photos and tells the story. Our AI writes compelling, unique content in your voice — not robot-speak.",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: MapPin,
    title: "GBP on Autopilot",
    desc: "Every completed job auto-posts to your Google Business Profile with geo-tagged photos. Ranking signals on every single job.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Star,
    title: "Reviews That Convert",
    desc: "Auto-request reviews via iMessage (not junk SMS). AI responds to every review in YOUR voice — sounds like you, not a chatbot.",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: MessageSquare,
    title: "Neighborhood Blitz",
    desc: "Text neighbors before a job, mail branded postcards after. One job on a street turns into five more from that street.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Share2,
    title: "Content Everywhere",
    desc: "Blog posts, social media, case studies — all unique per platform, zero duplicate content. Maximum visibility, minimum effort.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: BarChart3,
    title: "See What's Working",
    desc: "Which jobs drive calls? Which techs earn the most reviews? Where's your growth coming from? Real answers, not vanity metrics.",
    color: "bg-rose-50 text-rose-600",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Tech Captures the Job",
    desc: "Snap photos, hit record, tell the story. Takes 60 seconds at the job site.",
    icon: Camera,
  },
  {
    num: "02",
    title: "AI Creates the Content",
    desc: "Unique GBP post, blog article, social posts — all in your brand voice, all different.",
    icon: Bot,
  },
  {
    num: "03",
    title: "Auto-Publish Everywhere",
    desc: "GBP, your website, social media. Geo-tagged photos, Map Pack signals, the works.",
    icon: Zap,
  },
  {
    num: "04",
    title: "Reviews + Neighbors",
    desc: "Customer gets a review request via iMessage. Neighbors get a text and postcard. You get more jobs.",
    icon: Users,
  },
];

const COMPARISON = [
  { feature: "Review requests via iMessage", us: true, birdeye: false, glasshouse: false, podium: false },
  { feature: "AI writes in your voice", us: true, birdeye: false, glasshouse: false, podium: false },
  { feature: "Auto GBP posts from jobs", us: true, birdeye: false, glasshouse: true, podium: false },
  { feature: "Geo-tagged job photos", us: true, birdeye: false, glasshouse: true, podium: false },
  { feature: "Postcards + texts to neighbors", us: true, birdeye: false, glasshouse: true, podium: false },
  { feature: "Blog post per job (unique)", us: true, birdeye: false, glasshouse: false, podium: false },
  { feature: "Map Pack ranking included", us: true, birdeye: false, glasshouse: false, podium: false },
  { feature: "Dedicated account manager", us: true, birdeye: false, glasshouse: false, podium: false },
  { feature: "Before/after photo gallery", us: true, birdeye: false, glasshouse: true, podium: false },
  { feature: "AI review responses", us: true, birdeye: true, glasshouse: false, podium: true },
  { feature: "Review monitoring", us: true, birdeye: true, glasshouse: false, podium: true },
  { feature: "Referral tracking", us: true, birdeye: false, glasshouse: false, podium: false },
  { feature: "CRM integrations (HCP, ST)", us: true, birdeye: true, glasshouse: false, podium: true },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'var(--font-oswald)' }}>
              TRUE<span className="text-[#FFD700]">REX</span> <span className="text-sm font-medium text-muted-foreground">LOCAL</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#calculator" className="hover:text-foreground transition-colors">ROI Calculator</a>
            <a href="#compare" className="hover:text-foreground transition-colors">Compare</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button className="text-sm bg-[#FFD700] hover:bg-[#E6C200] text-black font-bold">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#1A1A1A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,215,0,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,#000000/15,transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/80 mb-8">
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
              The only platform that turns every job into 5 more
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              One Job on the Street.
              <span className="block text-[#FFD700]">Five More From It.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl leading-relaxed">
              Your tech snaps a photo and tells the story. TrueRex Local does the rest — GBP posts, iMessage review requests, blog content, neighbor targeting, and AI that sounds like <em>you</em>, not a robot.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="text-base px-8 py-6 bg-[#FFD700] hover:bg-[#E6C200] text-black font-bold gap-2 shadow-lg shadow-yellow-500/20">
                  Start Your Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#calculator">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 border-white/20 text-white hover:bg-white/10 bg-transparent">
                  See Your ROI
                </Button>
              </a>
            </div>

            {/* Trust signals */}
            <div className="mt-16 flex flex-wrap gap-x-10 gap-y-4 text-sm text-white/50">
              <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> iMessage reviews, not junk texts</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> A real person runs your account</span>
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Your domain, your brand</span>
              <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Postcards to every neighbor</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[#B8960C] mb-3">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              60 Seconds at the Job Site.<br />Everything Else Is Automatic.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map(({ num, title, desc, icon: Icon }) => (
              <div key={num} className="relative">
                <div className="text-6xl font-black text-[rgba(255,215,0,0.1)] mb-4">{num}</div>
                <div className="w-12 h-12 rounded-xl bg-[#000000] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Pack + Dashboard Demo */}
      <section className="py-20 md:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[#B8960C] mb-3">See It In Action</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Your Business at the Top.<br />Your Dashboard Running It.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-[#B8960C] text-sm font-semibold uppercase tracking-wide mb-3">Map Pack Rankings</p>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                When someone searches &quot;plumber near me,&quot; you show up first. We track your position across 10 local search terms every week and send you the report.
              </p>
              <MapPackDemo />
            </div>
            <div>
              <p className="text-[#B8960C] text-sm font-semibold uppercase tracking-wide mb-3">Your Dashboard</p>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Every job flows through the pipeline automatically — GBP post, blog, review request, neighbor outreach. You see it all in one place.
              </p>
              <DashboardDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[#B8960C] mb-3">Features</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Everything You Need.<br />Nothing You Don&apos;t.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-8 border shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* iMessage vs SMS callout */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-[#B8960C] mb-3">iMessage vs SMS</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Your Customers Actually <em>Read</em> iMessages
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Everyone else sends junk SMS with &quot;Reply STOP to unsubscribe.&quot; Your review requests arrive as real iMessages — blue bubbles, no spam flags, no carrier filtering. 98% open rate vs 20% for SMS.
              </p>
              <div className="space-y-4">
                {[
                  "Blue bubble iMessages — not green SMS spam",
                  "No \"Reply STOP\" footer destroying trust",
                  "Rich media: photos from the actual job",
                  "98% open rate vs 20% for bulk SMS",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <TextMessageDemo />
          </div>
        </div>
      </section>

      {/* Mailers + Job Photos */}
      <section className="py-20 md:py-28 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-[#B8960C] mb-3">Neighborhood Targeting</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                One Job on a Street Turns Into Five
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                After every job, we design and send branded postcards to nearby homes with before/after photos, a discount code, and your contact info. Postage is billed per piece — the design, targeting, and software are all included.
              </p>
              <MailerDemo />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-[#B8960C] mb-3">Job Pipeline</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Every Job Documented. Every Asset Created.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Your tech captures the job in 60 seconds. We turn it into a GBP post, blog article, review request, and neighbor campaign — all automatically.
              </p>
              <JobPhotoShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="calculator" className="py-20 md:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[#B8960C] mb-3">ROI Calculator</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              See What One Job <em>Actually</em> Turns Into
            </h2>
            <p className="text-lg text-white/60 mt-4 max-w-2xl mx-auto">
              Plug in your numbers. See how GBP ranking, review velocity, neighborhood targeting, and referrals compound your growth.
            </p>
          </div>

          <ROICalculator />
        </div>
      </section>

      {/* Competitor Comparison */}
      <section id="compare" className="py-20 md:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[#B8960C] mb-3">Compare</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Not Another Review Tool.<br />The Whole Machine.
            </h2>
            <p className="text-lg text-muted-foreground mt-4">
              Most tools do one thing. TrueRex Local does everything — and does it better.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground w-[280px]">Feature</th>
                  <th className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-[#FFD700] text-black rounded-full px-3 py-1 text-sm font-bold">
                      <Zap className="w-3 h-3" /> TrueRex
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-sm font-medium text-muted-foreground">Birdeye</th>
                  <th className="py-4 px-4 text-center text-sm font-medium text-muted-foreground">Glasshouse</th>
                  <th className="py-4 px-4 text-center text-sm font-medium text-muted-foreground">Podium</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ feature, us, birdeye, glasshouse, podium }, i) => (
                  <tr key={feature} className={i % 2 === 0 ? "bg-[#F8F8F8]" : ""}>
                    <td className="py-3 px-4 text-sm font-medium">{feature}</td>
                    <td className="py-3 px-4 text-center">
                      {us ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {birdeye ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {glasshouse ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {podium ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Other guys charge $300-500/mo just for review management.</p>
            <p className="text-sm font-semibold">TrueRex Local does reviews + Map Pack + content + neighborhood targeting + blog + referrals — with a real person running it.</p>
          </div>
        </div>
      </section>

      {/* Weekly Ranking Reports */}
      <section className="py-20 md:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-[#B8960C] mb-3">Weekly Ranking Reports</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">
                Know Exactly Where You Rank — Every Week
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                We track your Map Pack position for 10 high-value local search terms across your service area. Every Monday you get a report showing where you rank, how much you moved, and what we&apos;re doing next.
              </p>
              <div className="space-y-3">
                {[
                  "10 high-value local search terms tracked",
                  "Weekly ranking position report to your inbox",
                  "See exactly which terms are climbing",
                  "Know when you hit the top 3 for a new term",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[rgba(255,215,0,0.2)] flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-3 h-3 text-[#FFD700]" />
                    </div>
                    <span className="text-sm text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <RankingTrackerDemo />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-[#B8960C] mb-3">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              One New Job Pays for the Whole Month
            </h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              If your average job is $500+, one extra job from better rankings, a referral, or a neighbor text pays for TrueRex Local. Everything else is profit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Tier 1 */}
            <div className="bg-white rounded-2xl border p-8 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Software</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$1,000</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                The full platform. Everything you need to turn jobs into more jobs.
              </p>
              <p className="text-xs text-muted-foreground mb-6">$1,500 one-time setup</p>
              <Link href="/signup">
                <Button variant="outline" className="w-full mb-8">Get Started</Button>
              </Link>
              <ul className="space-y-3 text-sm">
                {[
                  "AI content engine (your voice)",
                  "Auto GBP posts with geo-photos",
                  "iMessage + email review requests",
                  "Elite AI review responses",
                  "WordPress auto-blogging",
                  "Neighborhood texts + mailers*",
                  "Referral tracking",
                  "CRM integrations (HCP, ST, etc.)",
                  "Dedicated human account manager",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tier 2 - Popular */}
            <div className="relative bg-white rounded-2xl border-2 border-[#FFD700] p-8 shadow-xl shadow-yellow-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD700] text-black text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
                Most Popular
              </div>
              <p className="text-sm font-semibold text-[#B8960C] uppercase tracking-wide mb-2">Software + Map Pack Ranking</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$2,000</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Full platform + we rank you in the Map Pack across a 5-mile radius.
              </p>
              <p className="text-xs text-muted-foreground mb-6">$3,500 one-time setup</p>
              <Link href="/signup">
                <Button className="w-full mb-8 bg-[#FFD700] hover:bg-[#E6C200] text-black font-bold">
                  Start Free Trial <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <ul className="space-y-3 text-sm">
                {[
                  "Everything in Software tier",
                  "5-mile Map Pack ranking radius",
                  "10 local search terms tracked",
                  "Weekly Map Pack ranking updates",
                  "Aggressive + foundation ranking strategy",
                  "See movement in weeks, not months",
                  "Dedicated ranking specialist",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tier 3 */}
            <div className="bg-white rounded-2xl border p-8 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Software + Max Ranking</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$3,000</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Dominate a 10-mile radius. Maximum coverage, maximum calls.
              </p>
              <p className="text-xs text-muted-foreground mb-6">$3,500 one-time setup</p>
              <Link href="/signup">
                <Button variant="outline" className="w-full mb-8">Get Started</Button>
              </Link>
              <ul className="space-y-3 text-sm">
                {[
                  "Everything in Software tier",
                  "10-mile Map Pack ranking radius",
                  "10 local search terms tracked",
                  "Weekly Map Pack ranking updates",
                  "Priority ranking specialist",
                  "Bi-weekly strategy calls",
                  "Competitor displacement tracking",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ROI framing */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border p-8 md:p-10">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-3xl font-black text-[#B8960C]">1 extra job</p>
                  <p className="text-sm text-muted-foreground mt-1">pays for the software</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#B8960C]">3-5 extra jobs</p>
                  <p className="text-sm text-muted-foreground mt-1">is what most contractors see in month one</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#B8960C]">10-15+ extra jobs</p>
                  <p className="text-sm text-muted-foreground mt-1">once your rankings, reviews, and referrals compound</p>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
                Every plan includes a dedicated human working your account — not a dashboard you log into and figure out yourself. We handle it.
              </p>
              <p className="text-center text-xs text-muted-foreground/60 mt-4">
                *Mailer design, targeting, and software included. Postage billed per piece (~$1-2/mailer).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Every Day Without TrueRex Local Is Jobs You&apos;re Leaving on the Table
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
            Your competitors are already auto-posting to GBP, texting neighbors, and collecting 5-star reviews on autopilot. It&apos;s time to catch up — and pass them.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-10 py-7 bg-[#FFD700] hover:bg-[#E6C200] text-black font-bold gap-2 shadow-lg shadow-yellow-500/20">
              Start Your Free Trial <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/40">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#FFD700] flex items-center justify-center">
                <Zap className="w-3 h-3 text-black" />
              </div>
              <span className="font-bold text-white/80" style={{ fontFamily: 'var(--font-oswald)' }}>TRUE<span className="text-[#FFD700]">REX</span> LOCAL</span>
            </div>
            <span className="text-[10px] text-white/30">An arm of TrueRex Marketing</span>
          </div>
          <p>&copy; {new Date().getFullYear()} TrueRex Marketing. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
