"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, Loader2, Check } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Account created! Let's set up your business.");
    router.push("/onboarding");
    router.refresh();
  }

  const benefits = [
    "AI content that sounds like you, not a robot",
    "iMessage review requests (98% open rate)",
    "Neighborhood targeting: texts + physical mailers",
    "Auto-post to GBP with geo-tagged photos",
    "Real human in every account",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel — value props */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#1A1A1A] p-12 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#FFD700] flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight" style={{ fontFamily: 'var(--font-oswald)' }}>
            TRUE<span className="text-[#FFD700]">REX</span> <span className="text-sm font-medium text-white/50">LOCAL</span>
          </span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
            One job on the street.<br />
            <span className="text-[#FFD700]">Five more from it.</span>
          </h2>
          <div className="space-y-4">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#FFD700]/20 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-3 h-3 text-[#FFD700]" />
                </div>
                <span className="text-white/70 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-sm">
          &copy; {new Date().getFullYear()} TrueRex Local
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#FAFAFA]">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'var(--font-oswald)' }}>
              TRUE<span className="text-[#FFD700]">REX</span> <span className="text-sm font-medium text-muted-foreground">LOCAL</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-1">Start your free trial</h1>
          <p className="text-muted-foreground text-sm mb-8">
            No credit card required. Set up in 2 minutes.
          </p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                placeholder="John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-[#FFD700] hover:bg-[#E6C200] text-black font-bold"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#B8960C] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
