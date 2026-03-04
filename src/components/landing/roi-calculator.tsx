"use client";

import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, DollarSign, Star, MapPin, Users, Mail } from "lucide-react";

export function ROICalculator() {
  const [avgJobRevenue, setAvgJobRevenue] = useState(750);
  const [jobsPerWeek, setJobsPerWeek] = useState(8);
  const [reviewRate, setReviewRate] = useState(10);
  const [neighborhoodRadius, setNeighborhoodRadius] = useState(0.5);

  const results = useMemo(() => {
    const monthlyJobs = jobsPerWeek * 4;

    // GBP Ranking boost: more posts + geo-tagged photos = higher Map Pack rankings
    // Conservative: 10-15% more inbound calls from improved GBP presence
    const gbpBoostPct = 0.12;
    const gbpExtraJobs = Math.round(monthlyJobs * gbpBoostPct);

    // Reviews: more reviews + higher rating = higher trust + conversion
    // iMessage has ~30% response rate (vs 5% SMS)
    const reviewRequestsSent = monthlyJobs;
    const reviewsCollected = Math.round(reviewRequestsSent * (reviewRate / 100));
    // More reviews → more trust → extra conversions from search visibility
    const reviewExtraJobs = Math.round(reviewsCollected * 0.2);

    // Neighborhood targeting: text neighbors before, mail postcards after
    // ~25-50 homes in radius per job, 0.5% conversion on cold outreach
    const neighborsPerJob = Math.round(neighborhoodRadius * 50);
    const totalNeighborsReached = neighborsPerJob * monthlyJobs;
    const neighborConversionRate = 0.005; // 0.5%
    const neighborExtraJobs = Math.round(totalNeighborsReached * neighborConversionRate);

    // Referrals: happy customers refer friends/neighbors
    // ~3% of all jobs generate a referral
    const referralExtraJobs = Math.round(monthlyJobs * 0.03);

    // Blog/Content: long-tail search traffic from unique blog posts
    const contentExtraJobs = Math.round(monthlyJobs * 0.03);

    const totalExtraJobs =
      gbpExtraJobs + reviewExtraJobs + neighborExtraJobs + referralExtraJobs + contentExtraJobs;

    const extraRevenue = totalExtraJobs * avgJobRevenue;
    const annualExtraRevenue = extraRevenue * 12;
    const monthlyCost = 2000; // Middle tier
    const monthlyROI = extraRevenue - monthlyCost;
    const roiMultiple = extraRevenue / monthlyCost;

    return {
      monthlyJobs,
      gbpExtraJobs,
      reviewsCollected,
      reviewExtraJobs,
      totalNeighborsReached,
      neighborExtraJobs,
      referralExtraJobs,
      contentExtraJobs,
      totalExtraJobs,
      extraRevenue,
      annualExtraRevenue,
      monthlyROI,
      roiMultiple,
    };
  }, [avgJobRevenue, jobsPerWeek, reviewRate, neighborhoodRadius]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Inputs */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-8">
        <h3 className="text-white font-bold text-lg">Your Numbers</h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-white/70 text-sm">Average Job Revenue</label>
            <span className="text-white font-bold text-lg">${avgJobRevenue.toLocaleString()}</span>
          </div>
          <Slider
            value={[avgJobRevenue]}
            onValueChange={([v]) => setAvgJobRevenue(v)}
            min={200}
            max={5000}
            step={50}
            className="[&_[role=slider]]:bg-[#FFD700] [&_[role=slider]]:border-0 [&_.relative>div]:bg-[#FFD700]"
          />
          <div className="flex justify-between text-xs text-white/30">
            <span>$200</span>
            <span>$5,000</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-white/70 text-sm">Jobs Per Week</label>
            <span className="text-white font-bold text-lg">{jobsPerWeek}</span>
          </div>
          <Slider
            value={[jobsPerWeek]}
            onValueChange={([v]) => setJobsPerWeek(v)}
            min={2}
            max={40}
            step={1}
            className="[&_[role=slider]]:bg-[#FFD700] [&_[role=slider]]:border-0 [&_.relative>div]:bg-[#FFD700]"
          />
          <div className="flex justify-between text-xs text-white/30">
            <span>2</span>
            <span>40</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-white/70 text-sm">Expected Review Rate</label>
            <span className="text-white font-bold text-lg">{reviewRate}%</span>
          </div>
          <Slider
            value={[reviewRate]}
            onValueChange={([v]) => setReviewRate(v)}
            min={5}
            max={35}
            step={5}
            className="[&_[role=slider]]:bg-[#FFD700] [&_[role=slider]]:border-0 [&_.relative>div]:bg-[#FFD700]"
          />
          <div className="flex justify-between text-xs text-white/30">
            <span>5% (SMS avg)</span>
            <span>35% (iMessage avg)</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-white/70 text-sm">Neighborhood Radius (miles)</label>
            <span className="text-white font-bold text-lg">{neighborhoodRadius} mi</span>
          </div>
          <Slider
            value={[neighborhoodRadius]}
            onValueChange={([v]) => setNeighborhoodRadius(v)}
            min={0.25}
            max={2}
            step={0.25}
            className="[&_[role=slider]]:bg-[#FFD700] [&_[role=slider]]:border-0 [&_.relative>div]:bg-[#FFD700]"
          />
          <div className="flex justify-between text-xs text-white/30">
            <span>0.25 mi</span>
            <span>2 mi</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Big number */}
        <div className="bg-gradient-to-br from-[#FFD700] to-[#D4A800] rounded-2xl p-8 text-center">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wide mb-2">
            Estimated Extra Monthly Revenue
          </p>
          <p className="text-5xl md:text-6xl font-black text-white">
            ${results.extraRevenue.toLocaleString()}
          </p>
          <p className="text-white/70 text-sm mt-2">
            {results.roiMultiple.toFixed(1)}x return on your investment
          </p>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-center gap-2 text-sm text-white/80">
            <TrendingUp className="w-4 h-4" />
            <span>${results.annualExtraRevenue.toLocaleString()}/year extra revenue</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wide">Where the Extra Jobs Come From</h4>

          <div className="space-y-3">
            <ResultRow
              icon={MapPin}
              label="GBP ranking boost"
              jobs={results.gbpExtraJobs}
              desc="More visibility → more calls"
            />
            <ResultRow
              icon={Star}
              label="Review velocity"
              jobs={results.reviewExtraJobs}
              desc={`${results.reviewsCollected} new reviews/mo → trust → conversions`}
            />
            <ResultRow
              icon={Mail}
              label="Neighborhood targeting"
              jobs={results.neighborExtraJobs}
              desc={`${results.totalNeighborsReached.toLocaleString()} neighbors reached/mo`}
            />
            <ResultRow
              icon={Users}
              label="Referrals"
              jobs={results.referralExtraJobs}
              desc="Happy customers → word of mouth"
            />
            <ResultRow
              icon={TrendingUp}
              label="Blog + search content"
              jobs={results.contentExtraJobs}
              desc="Long-tail search traffic"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-white font-bold">Total extra jobs/month</span>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#FFD700]" />
              <span className="text-2xl font-black text-[#FFD700]">{results.totalExtraJobs}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  icon: Icon,
  label,
  jobs,
  desc,
}: {
  icon: typeof MapPin;
  label: string;
  jobs: number;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-white/70" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-white/40 text-xs truncate">{desc}</p>
      </div>
      <span className="text-white font-bold text-lg">+{jobs}</span>
    </div>
  );
}
