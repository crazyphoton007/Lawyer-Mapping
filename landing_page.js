import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Mail, ShieldCheck, Smartphone, Sparkles, Star, Timer, CheckCircle2, Twitter, Youtube, Instagram, Github } from "lucide-react";

// CaseFit Coming Soon Page — single-file React component
// Styling: Tailwind CSS (no external CSS needed)
// Animations: framer-motion
// Icons: lucide-react
// Notes: No backend calls; the waitlist form just prints to console.

function useCountdown(daysFromNow = 120) {
  const target = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d;
  }, [daysFromNow]);

  const calc = () => {
    const now = new Date().getTime();
    const diff = Math.max(0, target.getTime() - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const total = diff;
    return { days, hours, minutes, seconds, total };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);

  return { ...time, target };
}

const milestones = [
  { title: "Private Alpha", desc: "Onboarding 10–20 lawyers & early users.", daysOffset: 15 },
  { title: "Payments & KYC", desc: "Razorpay integration, verified profiles.", daysOffset: 30 },
  { title: "Consult Booking", desc: "1:1 scheduling, reminders, receipts.", daysOffset: 45 },
  { title: "Chat & Docs", desc: "Secure chat, uploads to S3.", daysOffset: 60 },
  { title: "Public Beta", desc: "Open waitlist invites roll out.", daysOffset: 90 },
  { title: "v1 Launch", desc: "CaseFit goes live!", daysOffset: 120 },
];

function ProgressBar({ value }) {
  return (
    <div className="w-full h-3 rounded-2xl bg-white/10 overflow-hidden shadow-inner">
      <div
        className="h-full bg-white/70 backdrop-blur-sm"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function FancyBadge({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm text-white/90 shadow-sm">
      <Icon className="h-4 w-4" />
      {children}
    </span>
  );
}

export default function CaseFitComingSoon() {
  const { days, hours, minutes, seconds, total, target } = useCountdown(120);

  // progress across 120 days
  const totalDuration = 120 * 24 * 60 * 60 * 1000; // ms
  const elapsed = Math.max(0, totalDuration - total);
  const pct = (elapsed / totalDuration) * 100;

  const formattedTarget = target.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Waitlist email:", email);
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-black text-white">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" />

      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.08),transparent_50%),radial-gradient(circle_at_75%_35%,rgba(255,255,255,0.06),transparent_50%)]" />

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 backdrop-blur">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-wide">CaseFit</div>
            <div className="text-xs text-white/60">Law · Advice · Fit for your case</div>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <FancyBadge icon={ShieldCheck}>Secure by design</FancyBadge>
          <FancyBadge icon={Smartphone}>iPhone & Android</FancyBadge>
          <FancyBadge icon={Star}>Beta invites soon</FancyBadge>
        </div>
      </header>

      {/* Hero */}
      <main className="relative mx-auto max-w-6xl px-6 pt-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
        >
          <div>
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              CaseFit is <span className="bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">coming soon</span>
            </h1>
            <p className="mb-6 max-w-xl text-lg text-white/80">
              Your fast, clear path to trusted legal consultations. We’re polishing the experience — join the waitlist and be first to try it.
            </p>

            {/* Countdown */}
            <div className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/80">
                  <Timer className="h-5 w-5" />
                  <span className="text-sm">Launch target</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formattedTarget}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Days", value: days },
                  { label: "Hours", value: hours },
                  { label: "Minutes", value: minutes },
                  { label: "Seconds", value: seconds },
                ].map((b) => (
                  <div key={b.label} className="rounded-xl bg-black/30 p-3 text-center">
                    <div className="text-3xl font-extrabold tabular-nums">
                      {String(b.value).padStart(2, "0")}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-white/60">{b.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <ProgressBar value={pct} />
                <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                  <span>0%</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {pct.toFixed(1)}% done</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Waitlist */}
            <form onSubmit={handleSubmit} className="mb-8 flex items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2">
                <Mail className="h-5 w-5 text-white/60" />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none placeholder:text-white/40"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 font-semibold shadow-lg shadow-indigo-500/20 transition active:scale-[.98]"
              >
                Join waitlist
              </button>
            </form>
            {submitted && (
              <div className="mb-8 flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                You’re on the list! We’ll email you when invites roll out.
              </div>
            )}

            {/* Socials */}
            <div className="flex items-center gap-4 text-white/70">
              <span className="text-sm">Follow updates:</span>
              <a href="#" className="rounded-xl border border-white/15 bg-white/5 p-2 hover:bg-white/10" aria-label="Twitter/X">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-xl border border-white/15 bg-white/5 p-2 hover:bg-white/10" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-xl border border-white/15 bg-white/5 p-2 hover:bg-white/10" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-xl border border-white/15 bg-white/5 p-2 hover:bg-white/10" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Right: Roadmap Card */}
          <div>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xl font-semibold">120‑Day Roadmap</div>
                <span className="text-sm text-white/60">We’re building in the open</span>
              </div>
              <ol className="relative ml-3 space-y-6 border-l border-white/15 pl-6">
                {milestones.map((m, i) => {
                  const milestoneDate = new Date();
                  milestoneDate.setDate(milestoneDate.getDate() + m.daysOffset);
                  const done = (m.daysOffset / 120) * 100 <= pct;
                  return (
                    <li key={m.title} className="group">
                      <span className={`absolute -left-[9px] mt-1 h-4 w-4 rounded-full border ${done ? "bg-emerald-400/90 border-emerald-300" : "bg-white/10 border-white/20"}`} />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold tracking-wide">
                            {m.title}
                          </div>
                          <p className="text-sm text-white/70">{m.desc}</p>
                        </div>
                        <div className="text-xs text-white/60">
                          {milestoneDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-6">
                <ProgressBar value={pct} />
                <p className="mt-2 text-xs text-white/60">Tracking progress to v1.</p>
              </div>
            </div>

            {/* Highlights */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { icon: ShieldCheck, title: "Privacy‑first", text: "Your documents and chats are encrypted in transit." },
                { icon: Smartphone, title: "Mobile‑native", text: "Smooth booking on iPhone & Android from day one." },
                { icon: Star, title: "Curated lawyers", text: "Verified experts across key practice areas." },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                  <div className="mb-2 flex items-center gap-2">
                    <f.icon className="h-5 w-5" />
                    <div className="font-semibold">{f.title}</div>
                  </div>
                  <p className="text-sm text-white/70">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-semibold">Quick answers</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                q: "What will CaseFit cost?",
                a: "Simple per‑consult pricing with transparent fees during beta."
              },
              {
                q: "How do invites work?",
                a: "We’ll email waitlist members in waves as we scale capacity."
              },
              {
                q: "Is my data safe?",
                a: "Yes — we prioritize secure storage and least‑privilege access."
              },
              {
                q: "Can I become a beta lawyer?",
                a: "Yes — reply to the invite email with your bar details and niche."
              }
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
                <div className="mb-1 font-semibold">{item.q}</div>
                <p className="text-sm text-white/70">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="text-sm text-white/60">© {new Date().getFullYear()} CaseFit. All rights reserved.</div>
          <div className="text-xs text-white/50">
            Built with ♥ for people who want fast, trusted legal help.
          </div>
        </div>
      </footer>
    </div>
  );
}
