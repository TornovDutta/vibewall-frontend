import { useSearchParams, Link } from 'react-router-dom';

export default function RulesPage() {
  const [searchParams] = useSearchParams();
  const isViolation = searchParams.get('violation') === 'true';
  const reason = searchParams.get('reason');

  const rules = [
    {
      id: 'rule-1',
      num: '01',
      title: 'Zero Tolerance for Hate Speech & Bigotry',
      icon: '🛡️',
      color: 'from-rose-500/10 to-red-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
      description:
        'Any attack, slur, or derogatory language targeting an individual or group based on race, ethnicity, nationality, religion, disability, gender identity, or sexual orientation is strictly forbidden.',
      penalty: 'Immediate content deletion and 25-point deduction.',
    },
    {
      id: 'rule-2',
      num: '02',
      title: 'No Targeted Harassment & Malicious Insults',
      icon: '🚫',
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
      description:
        'VibeWall is a supportive venting space, not a weapon. Malicious insults, name-calling, cyberbullying, public shaming, or defamation targeting specific peers, faculty, or staff are strictly prohibited.',
      penalty: 'Content blocked and -25 points from reputation.',
    },
    {
      id: 'rule-3',
      num: '03',
      title: 'Zero Threats of Violence or Self-Harm Encouragement',
      icon: '🛑',
      color: 'from-red-500/10 to-rose-600/10 border-red-600/30 text-red-600 dark:text-red-400',
      description:
        'Threats of physical harm, encouraging suicide or self-harm, and glorifying violence are immediately blocked. If you or someone you know is in distress, please use our 24/7 Crisis Support button.',
      penalty: 'Permanent ban and immediate administrative intervention.',
    },
    {
      id: 'rule-4',
      num: '04',
      title: 'Strictly No Doxxing or Private Information Leaks',
      icon: '🔒',
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
      description:
        'Do not share personal telephone numbers, student roll numbers, home addresses, private social media handles, or non-consensual photos of others.',
      penalty: 'Immediate removal and automated account suspension.',
    },
    {
      id: 'rule-5',
      num: '05',
      title: 'Reputation Point System & Negative Point Bans',
      icon: '⚖️',
      color: 'from-violet-500/10 to-fuchsia-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400',
      description:
        'Every account begins with 100 points. Upvoted, constructive posts earn +5 points. Every rule violation automatically deducts 25 points. If your points drop below zero (<0), you are banned from the entire website. Only an Admin can review appeals and unban accounts from the Admin Dashboard.',
      penalty: 'System-wide ban enforced across confessions, comments, polls, and Q&A.',
    },
  ];

  const examples = [
    {
      bad: '"My roommate is a worthless idiot who deserves to fail all their classes."',
      whyBad: 'Direct personal insult and malicious targeting.',
      good: '"Living with my roommate is causing me immense stress. Our lifestyles clash and it is taking a toll on my mental health."',
      whyGood: 'Focuses on personal feelings and situation without attacking the person.',
    },
    {
      bad: '"I hate our professor and I hope something terrible happens to them."',
      whyBad: 'Hostile wishing of harm.',
      good: '"The workload in my class feels overwhelming and unfair. I feel so burnt out trying to keep up."',
      whyGood: 'Honest, vulnerable expression of academic burnout and exhaustion.',
    },
    {
      bad: '"Don\'t talk to @student_name, they are a fake snake."',
      whyBad: 'Doxxing and targeted smear campaign.',
      good: '"I learned the hard way that not everyone you trust is a true friend. Heartbroken, but learning to set boundaries."',
      whyGood: 'Expresses heartbreak, grief, and reflection anonymously and safely.',
    },
  ];

  return (
    <div className="min-h-screen bg-vw-bg text-vw-text transition-colors duration-200">
      {/* ─── Hero Header ─── */}
      <section className="relative overflow-hidden border-b border-vw-border bg-gradient-to-b from-violet-50/60 via-transparent to-transparent py-12 dark:from-zinc-900/60 sm:py-16">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-100/80 px-3.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/60 dark:text-violet-300 mb-4">
            <span>📜</span>
            <span>Community Guidelines & Safety Policy</span>
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            VibeWall Community Rules
          </h1>
          <p className="mt-3 text-sm text-vw-textMuted max-w-2xl mx-auto leading-relaxed">
            VibeWall is a safe, empathetic sanctuary for raw student thoughts, emotional venting, and genuine vulnerability. To protect everyone, every post is checked by real-time AI moderation with zero tolerance for hate or abuse.
          </p>
        </div>
      </section>

      {/* ─── Main Content Container ─── */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* Dynamic Violation Warning Banner */}
        {isViolation && (
          <div className="mb-10 rounded-3xl border-2 border-rose-500 bg-rose-500/10 p-6 dark:border-rose-600/70 dark:bg-rose-950/40 shadow-xl shadow-rose-500/5 animate-slide-up">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-2xl text-rose-600 dark:text-rose-300">
                🚨
              </span>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-rose-700 dark:text-rose-300">
                    Submission Blocked: Content Safety Violation
                  </h2>
                  <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-700 dark:text-rose-300">
                    -25 Reputation Points Deducted
                  </span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-200/90 leading-relaxed font-medium">
                  {reason || 'Your post was rejected by AI moderation because it contained malicious insults, harassment, hate speech, or prohibited attacks.'}
                </p>
                <div className="rounded-xl bg-white/70 dark:bg-zinc-900/60 p-3 border border-rose-200 dark:border-rose-900/40 text-[11px] text-vw-textMuted">
                  💡 <span className="font-semibold text-vw-text">What to do next:</span> You can use our <span className="font-bold text-violet-600 dark:text-violet-400">"✨ AI Polish"</span> button in the modal to automatically transform any angry or harsh draft into healthy, respectful sentences before posting.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Rules Cards Grid ─── */}
        <div className="space-y-4 mb-14">
          <h2 className="text-lg font-bold text-vw-text flex items-center gap-2 mb-2">
            <span>🛡️</span>
            <span>The 5 Core Safety Rules</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-1">
            {rules.map((r) => (
              <div
                key={r.id}
                className="group relative overflow-hidden rounded-2xl border border-vw-border bg-vw-card p-5 shadow-xs transition hover:border-violet-400 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vw-muted text-xl">
                    {r.icon}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-vw-text">{r.title}</h3>
                      <span className="text-[10px] font-extrabold text-vw-textMuted font-mono">
                        RULE {r.num}
                      </span>
                    </div>
                    <p className="text-xs text-vw-textMuted leading-relaxed">
                      {r.description}
                    </p>
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      <span>⚡ Consequence:</span>
                      <span>{r.penalty}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Examples: How to Vent Safely ─── */}
        <div className="mb-14 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-vw-text flex items-center gap-2">
                <span>✨</span>
                <span>How to Express Feelings Safely (Safe vs. Unsafe)</span>
              </h2>
              <p className="text-xs text-vw-textMuted mt-0.5">
                Venting is healthy and encouraged! The secret is expressing your feelings without attacking other people.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {examples.map((ex, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-vw-border bg-vw-card overflow-hidden shadow-xs"
              >
                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-vw-border">
                  {/* Bad example */}
                  <div className="p-4 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      ✕ Rule-Violating (Blocked)
                    </span>
                    <p className="text-xs text-rose-900 dark:text-rose-200 italic font-mono bg-white/70 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40">
                      {ex.bad}
                    </p>
                    <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80">
                      {ex.whyBad}
                    </p>
                  </div>

                  {/* Good example */}
                  <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      ✓ Safe & Vulnerable (Allowed)
                    </span>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 italic font-mono bg-white/70 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                      {ex.good}
                    </p>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                      {ex.whyGood}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Footer Action Bar ─── */}
        <div className="rounded-2xl border border-vw-border bg-vw-card p-6 text-center space-y-3">
          <h3 className="text-sm font-bold text-vw-text">Ready to share safely?</h3>
          <p className="text-xs text-vw-textMuted max-w-md mx-auto">
            Your identity remains 100% anonymous, encrypted, and protected by our 12-hour disappearing policy.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 transition hover:opacity-95"
            >
              ← Back to Confessions Feed
            </Link>
            <Link
              to="/profile"
              className="rounded-xl border border-vw-border bg-vw-surface px-4 py-2 text-xs font-semibold text-vw-text transition hover:bg-vw-muted"
            >
              View My Reputation Score
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
