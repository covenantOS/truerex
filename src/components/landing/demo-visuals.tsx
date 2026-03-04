"use client";

import { useState } from "react";
import { Star, MapPin, Phone, Clock, Navigation, Camera, CheckCircle2, MessageSquare, Mail, Send } from "lucide-react";

/* ─── Map Pack Ranking Visualization ─── */
export function MapPackDemo() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border overflow-hidden max-w-md mx-auto">
      {/* Fake Google search bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-1.5 text-sm text-gray-500 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            plumber near me
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="relative h-36 bg-[#e8f0e8]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(200, 215, 200, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200, 215, 200, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }} />
        {/* Road lines */}
        <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-white/80" />
        <div className="absolute top-0 bottom-0 left-1/3 w-[3px] bg-white/80" />
        <div className="absolute top-0 bottom-0 right-1/4 w-[3px] bg-white/80" />

        {/* Map pins */}
        <div className="absolute top-8 left-[30%] flex flex-col items-center">
          <div className="w-7 h-7 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">A</div>
        </div>
        <div className="absolute top-16 left-[55%] flex flex-col items-center">
          <div className="w-7 h-7 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">B</div>
        </div>
        <div className="absolute top-6 right-[20%] flex flex-col items-center">
          <div className="w-7 h-7 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">C</div>
        </div>
      </div>

      {/* Listings */}
      <div className="divide-y">
        <MapPackListing
          rank="A"
          name="Johnson's Plumbing Co."
          rating={4.9}
          reviews={127}
          highlighted
        />
        <MapPackListing
          rank="B"
          name="Quick Fix Plumbing"
          rating={4.3}
          reviews={42}
        />
        <MapPackListing
          rank="C"
          name="City Plumbing Services"
          rating={4.1}
          reviews={28}
        />
      </div>
    </div>
  );
}

function MapPackListing({ rank, name, rating, reviews, highlighted }: {
  rank: string;
  name: string;
  rating: number;
  reviews: number;
  highlighted?: boolean;
}) {
  return (
    <div className={`px-4 py-3 flex gap-3 ${highlighted ? "bg-yellow-50 border-l-4 border-[#FFD700]" : ""}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${highlighted ? "bg-[#FFD700] text-black" : "bg-gray-200 text-gray-600"}`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${highlighted ? "text-[#000000]" : "text-gray-700"}`}>{name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-sm font-medium text-gray-800">{rating}</span>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviews})</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Call</span>
          <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> Directions</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Open now</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard Demo Mockup ─── */
export function DashboardDemo() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border overflow-hidden max-w-lg mx-auto">
      {/* Titlebar */}
      <div className="bg-[#0A0A0A] px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 text-center text-xs text-white/50">TrueRex Local Dashboard</div>
      </div>

      <div className="flex">
        {/* Mini sidebar */}
        <div className="w-12 bg-[#0A0A0A] border-r border-white/10 py-3 flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#FFD700] flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-black" />
          </div>
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-white/50" />
          </div>
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white/50" />
          </div>
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-white/50" />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 bg-gray-50">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <StatMini label="Jobs This Week" value="12" trend="+3" />
            <StatMini label="New Reviews" value="8" trend="+5" />
            <StatMini label="Extra Leads" value="6" trend="+2" />
          </div>

          {/* Recent job card */}
          <div className="bg-white rounded-xl border p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-semibold text-gray-800">Water Heater Replace — 142 Oak St</span>
            </div>
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Camera className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> GBP posted
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> Review requested
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-400" /> 18 neighbors queued
                </div>
              </div>
            </div>
          </div>

          {/* Mini chart placeholder */}
          <div className="bg-white rounded-xl border p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Weekly Leads</p>
            <div className="flex items-end gap-1 h-12">
              {[35, 42, 38, 55, 48, 62, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{
                  height: `${h}%`,
                  backgroundColor: i === 6 ? '#FFD700' : 'rgba(255, 215, 0, 0.3)',
                }} />
              ))}
            </div>
            <div className="flex justify-between text-[8px] text-gray-400 mt-1">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="bg-white rounded-lg border p-2">
      <p className="text-[9px] text-gray-400 uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-gray-800">{value}</span>
        <span className="text-[10px] font-semibold text-green-500">{trend}</span>
      </div>
    </div>
  );
}

/* ─── iMessage Review Request Demo ─── */
export function TextMessageDemo() {
  return (
    <div className="max-w-xs mx-auto">
      {/* iPhone frame */}
      <div className="bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
        <div className="bg-white rounded-[1.5rem] overflow-hidden">
          {/* Status bar */}
          <div className="bg-gray-100 px-5 py-2 flex items-center justify-between text-[10px] text-gray-800 font-semibold">
            <span>9:41</span>
            <span className="font-bold">Messages</span>
            <span>100%</span>
          </div>

          {/* Contact */}
          <div className="bg-gray-100 px-4 pb-2 flex items-center gap-2 border-b">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">JP</div>
            <div>
              <p className="text-xs font-semibold">Johnson&apos;s Plumbing</p>
              <p className="text-[10px] text-gray-500">iMessage</p>
            </div>
          </div>

          {/* Messages */}
          <div className="px-3 py-4 space-y-3 min-h-[240px] bg-white">
            {/* Outbound */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-3.5 py-2 text-xs max-w-[85%] leading-relaxed">
                Hey Sarah! This is Mike from Johnson&apos;s Plumbing. Thanks for having us out today — your new water heater is all set! 🔧
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-3.5 py-2 text-xs max-w-[85%] leading-relaxed">
                If you have a sec, a quick Google review would mean the world to us. Here&apos;s the link:
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-3.5 py-2 text-xs max-w-[85%]">
                <span className="underline">g.page/johnsonsplumbing/review</span>
              </div>
            </div>

            {/* Reply */}
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-3.5 py-2 text-xs max-w-[85%] leading-relaxed text-gray-800">
                Of course! Mike was great, leaving one now ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="border-t px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-[10px] text-gray-400">iMessage</div>
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <Send className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Physical Mailer / Postcard Demo ─── */
export function MailerDemo() {
  return (
    <div className="max-w-md mx-auto">
      {/* Postcard front */}
      <div className="bg-white rounded-xl shadow-xl border overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-transform">
        {/* Header */}
        <div className="bg-[#000000] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#FFD700] flex items-center justify-center">
              <span className="text-black text-[10px] font-bold">JP</span>
            </div>
            <span className="text-white text-sm font-bold">Johnson&apos;s Plumbing</span>
          </div>
          <span className="text-white/50 text-[10px]">Licensed & Insured</span>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-lg font-bold text-gray-900 mb-2">We just helped your neighbor!</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We replaced a water heater at 142 Oak St this week. If yours is over 8 years old, it might be time for a checkup.
          </p>

          {/* Before / After mockup */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center">
              <Camera className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-[10px] font-semibold text-gray-500 uppercase">Before</span>
            </div>
            <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-400 mb-1" />
              <span className="text-[10px] font-semibold text-green-600 uppercase">After</span>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-[#FFD700] rounded-lg p-3 text-center">
            <p className="text-black font-bold text-sm">$50 OFF Your First Service</p>
            <p className="text-black/70 text-xs mt-0.5">Use code: <span className="font-mono font-bold text-black">OAK50</span></p>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> (555) 123-4567</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Serving Oak Park & beyond</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Before/After Job Photo Showcase ─── */
export function JobPhotoShowcase() {
  const [activeJob, setActiveJob] = useState(0);

  const jobs = [
    {
      title: "Water Heater Replacement",
      address: "142 Oak Street",
      tech: "Mike J.",
      beforeColor: "from-orange-100 to-orange-200",
      afterColor: "from-blue-100 to-blue-200",
      beforeLabel: "Rusted 15-year-old tank",
      afterLabel: "New tankless installed",
    },
    {
      title: "Kitchen Remodel Plumbing",
      address: "89 Maple Drive",
      tech: "Dave R.",
      beforeColor: "from-gray-200 to-gray-300",
      afterColor: "from-emerald-100 to-emerald-200",
      beforeLabel: "Old copper pipes",
      afterLabel: "PEX repiped + new fixtures",
    },
    {
      title: "Sewer Line Repair",
      address: "205 Elm Court",
      tech: "Carlos M.",
      beforeColor: "from-red-100 to-red-200",
      afterColor: "from-green-100 to-green-200",
      beforeLabel: "Collapsed clay pipe",
      afterLabel: "Trenchless repair complete",
    },
  ];

  const job = jobs[activeJob];

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        {/* Job header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-gray-900">{job.title}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {job.address} &middot; {job.tech}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-[10px] font-semibold text-green-700">Completed</span>
          </div>
        </div>

        {/* Before / After */}
        <div className="grid grid-cols-2 gap-0">
          <div className="relative">
            <div className={`aspect-square bg-gradient-to-br ${job.beforeColor} flex flex-col items-center justify-center`}>
              <Camera className="w-10 h-10 text-gray-400/50 mb-2" />
              <span className="text-xs text-gray-500 px-4 text-center">{job.beforeLabel}</span>
            </div>
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">Before</div>
          </div>
          <div className="relative">
            <div className={`aspect-square bg-gradient-to-br ${job.afterColor} flex flex-col items-center justify-center`}>
              <CheckCircle2 className="w-10 h-10 text-green-400/50 mb-2" />
              <span className="text-xs text-gray-500 px-4 text-center">{job.afterLabel}</span>
            </div>
            <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">After</div>
          </div>
        </div>

        {/* Pipeline status */}
        <div className="px-5 py-3 bg-gray-50 border-t">
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle2 className="w-3 h-3" /> GBP Posted</span>
            <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle2 className="w-3 h-3" /> Blog Written</span>
            <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle2 className="w-3 h-3" /> Review Sent</span>
            <span className="flex items-center gap-1 text-yellow-500 font-semibold"><Mail className="w-3 h-3" /> Mailers Queued</span>
          </div>
        </div>
      </div>

      {/* Job selector dots */}
      <div className="flex justify-center gap-2 mt-4">
        {jobs.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveJob(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeJob ? "bg-[#FFD700] scale-125" : "bg-gray-300 hover:bg-gray-400"}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Ranking Tracker Demo ─── */
export function RankingTrackerDemo() {
  const terms = [
    { term: "plumber near me", rank: 1, change: 4, city: "Oak Park" },
    { term: "emergency plumber", rank: 2, change: 3, city: "Oak Park" },
    { term: "water heater repair", rank: 1, change: 6, city: "River Forest" },
    { term: "drain cleaning near me", rank: 3, change: 2, city: "Oak Park" },
    { term: "plumbing company", rank: 2, change: 5, city: "Berwyn" },
    { term: "sewer repair near me", rank: 4, change: 1, city: "Oak Park" },
    { term: "tankless water heater", rank: 1, change: 7, city: "Elmwood Park" },
    { term: "bathroom plumber", rank: 3, change: 3, city: "Forest Park" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border overflow-hidden max-w-md mx-auto">
      <div className="px-5 py-3 bg-[#000000] flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-bold">Map Pack Rankings</p>
          <p className="text-white/50 text-[10px]">Week of Feb 24 — Johnson&apos;s Plumbing</p>
        </div>
        <div className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
          ↑ 6 avg positions
        </div>
      </div>

      <div className="divide-y">
        {terms.map(({ term, rank, change, city }) => (
          <div key={term} className="px-5 py-2.5 flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              rank <= 2 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              #{rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">&quot;{term}&quot;</p>
              <p className="text-[10px] text-gray-400">{city}</p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
              <span>↑{change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t text-center">
        <p className="text-[10px] text-gray-400">Updated every week &middot; Sent to your inbox every Monday</p>
      </div>
    </div>
  );
}
