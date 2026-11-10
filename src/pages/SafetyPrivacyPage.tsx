import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SafetyPrivacyPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Can anyone, including administrators, trace my confession back to me?',
      a: 'No. Confessions are decoupled from your real identity. When you post, a deterministic anonymous alias (e.g. "Lunar Fox") is generated using a one-way hash. Your username, email, IP address, and credentials are never attached to public confession cards.',
    },
    {
      q: 'How does the 12-hour auto-deletion work technically?',
      a: 'Every confession saved to MongoDB has an automated Time-To-Live (TTL) index. Once 12 hours elapse from the creation timestamp, the MongoDB background engine permanently drops the document. Simultaneously, all in-memory Redis cache entries are purged. There are no secondary archives, hidden logs, or undelete options.',
    },
    {
      q: 'Can I delete my confession before the 12 hours expire?',
      a: 'Yes! You have full ownership of your confessions. You can edit or permanently delete your confession at any second from your dashboard or directly on the card on the live feed.',
    },
    {
      q: 'Is my confession used to train AI models?',
      a: 'Never. Our integration with Hugging Face is strictly for runtime inference. Safety moderation checks and VibeBot companion responses are evaluated statelessly and discarded immediately. We do not permit any provider to store or train on your personal expressions.',
    },
    {
      q: 'What happens when someone reports a confession?',
      a: 'Reports are queued in the admin panel so community moderators can resolve harassment or illegal threats. Even when reviewing a report, moderators only see the reported text and the anonymous pseudonym — never your personal credentials or encrypted account identity.',
    },
  ];

  return (
    <div className="min-h-screen bg-vw-bg text-vw-text transition-colors duration-200">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden border-b border-vw-border bg-gradient-to-b from-violet-50/60 via-transparent to-transparent py-16 dark:from-zinc-900/60 sm:py-24">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-10 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-100/80 px-3.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/60 dark:text-violet-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Security & Privacy Whitepaper
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Anonymous means{' '}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              truly anonymous.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 dark:text-zinc-400 sm:text-lg">
            We built VibeWall so students and creators can express their feelings freely without fear,
            judgment, or persistent digital footprints. Here is full transparent disclosure of our
            cryptographic protections, data lifecycle, and AI ethics.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              Explore Live Feed
            </Link>
            <a
              href="#cryptography"
              className="rounded-xl border border-vw-border bg-vw-surface px-6 py-2.5 text-sm font-semibold transition hover:border-violet-300"
            >
              How It Works ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── 4 Pillars Grid ── */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: '🛡️',
              title: 'AES-256-GCM at Rest',
              desc: 'Military-grade encryption protects confession data in MongoDB with deterministic IV verification.',
            },
            {
              icon: '⏳',
              title: '12h Ephemeral Life',
              desc: 'Automatic TTL database purge cleanses expired confessions. No backups, no persistent history.',
            },
            {
              icon: '🎭',
              title: 'Decoupled Identity',
              desc: 'One-way pseudo-randomized names (e.g. "Lunar Fox") shield your account from public exposure.',
            },
            {
              icon: '🤖',
              title: 'Zero AI Training',
              desc: 'Hugging Face AI performs stateless safety moderation only. Your words are never fed to models.',
            },
          ].map((pillar, i) => (
            <div
              key={i}
              className="rounded-2xl border border-vw-border bg-vw-card p-5 shadow-xs transition hover:border-violet-300 hover:shadow-md"
            >
              <span className="text-2xl">{pillar.icon}</span>
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">{pillar.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-zinc-400">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Deep Dive 1: Data Protection ── */}
      <section id="cryptography" className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-vw-border bg-vw-card p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">1. How Your Data Is Protected</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Cryptographic isolation from device to database</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
            <p>
              Your security starts before data ever touches our database. We employ a layered defense model:
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Encrypted in Transit:</strong> All HTTP traffic between your browser and VibeWall is encrypted using TLS 1.3 / HTTPS with HSTS headers to prevent eavesdropping and interception.
              </li>
              <li>
                <strong>AES-256-GCM Server-Side Encryption:</strong> Stored content in MongoDB is cipher-encoded using AES-256 in Galois/Counter Mode. A secret 32-byte encryption key ensures ciphertext cannot be decrypted without authorized credentials.
              </li>
              <li>
                <strong>One-Way BCrypt Password Salting:</strong> Account passwords are hashed with high-cost BCrypt algorithms. Even our database administrators cannot see or reconstruct passwords.
              </li>
              <li>
                <strong>Stateless JWT Authentication:</strong> User sessions operate using short-lived JSON Web Tokens paired with rotating refresh tokens stored in Redis. Logout immediately invalidates tokens.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Deep Dive 2: 12-Hour Lifespan ── */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-vw-border bg-vw-card p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">2. How Data Is Removed from the Database</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Zero persistent retention: Ephemeral by design</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
            <p>
              Most social networks store your thoughts forever to build behavioral profiles. VibeWall is the opposite:
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-vw-border bg-vw-surface p-4">
                <span className="font-semibold text-violet-600 dark:text-violet-400">Automatic TTL Purging:</span>
                <p className="mt-1 text-xs text-gray-600 dark:text-zinc-400">
                  Every confession document is tagged with an expiration timestamp. MongoDB’s background TTL engine scans and permanently destroys documents after exactly 12 hours.
                </p>
              </div>
              <div className="rounded-xl border border-vw-border bg-vw-surface p-4">
                <span className="font-semibold text-fuchsia-600 dark:text-fuchsia-400">Instant Manual Deletion:</span>
                <p className="mt-1 text-xs text-gray-600 dark:text-zinc-400">
                  You don’t have to wait 12 hours. If you change your mind, click delete and the post is wiped from MongoDB and Redis cache in sub-100 milliseconds.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-zinc-400 pt-2">
              *When a post expires or is deleted, all feedback, replies, and reactions attached to that confession ID are purged along with it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Deep Dive 3: Who Can See Your Data ── */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-vw-border bg-vw-card p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">3. Who Can See Your Data?</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Strict permission boundaries and visibility tiers</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-vw-border text-gray-500">
                    <th className="py-2.5 font-semibold">Audience</th>
                    <th className="py-2.5 font-semibold">What They Can See</th>
                    <th className="py-2.5 font-semibold">What Is Hidden</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vw-border">
                  <tr>
                    <td className="py-3 font-semibold text-gray-900 dark:text-white">Public Feed Visitors</td>
                    <td className="py-3 text-emerald-600 dark:text-emerald-400">Confession text, anonymous pseudonym, feedback replies</td>
                    <td className="py-3 text-red-500">Real name, username, email, IP, location, account ID</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-gray-900 dark:text-white">Other Students & Peers</td>
                    <td className="py-3 text-emerald-600 dark:text-emerald-400">The same anonymous card view</td>
                    <td className="py-3 text-red-500">Cannot link multiple posts to one author profile</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-gray-900 dark:text-white">Platform Administrators</td>
                    <td className="py-3 text-emerald-600 dark:text-emerald-400">Reported text and report reason for moderation</td>
                    <td className="py-3 text-red-500">No passwords, no master decryption keys, no private history</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Deep Dive 4: AI Usage ── */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-vw-border bg-vw-card p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">4. How AI Is Used (And What We Forbid)</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Hugging Face inference with zero model training</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
            <p>
              VibeWall utilizes modern open-weights AI through the Hugging Face router for two specific purposes:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <strong>Real-Time Safety Moderation:</strong> Every submission is verified to block severe illegal hazards, targeted harassment, and self-harm incitement before it reaches the public feed.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <strong>Supportive AI Companion (VibeBot):</strong> Powers the interactive venting companion to offer empathetic, uplifting responses when you need someone to talk to.
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <span className="font-bold">Our AI Privacy Commitment:</span>
              <p className="mt-1 text-xs">
                Your confessions are NEVER used to train, tune, or improve external language models.
                Requests are processed statelessly in-memory and discarded immediately upon completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Everything you need to know to post with confidence</p>
        </div>

        <div className="mt-8 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-vw-border bg-vw-card transition"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-vw-border px-5 py-4 text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="border-t border-vw-border bg-vw-surface/40 py-12 text-center">
        <h3 className="text-lg font-bold">Ready to share what’s on your mind?</h3>
        <p className="mt-1 text-xs text-gray-500">Protected by cryptography. Cleared in 12 hours.</p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
        >
          Go to Feed & Post Anonymously
        </Link>
      </section>
    </div>
  );
}
