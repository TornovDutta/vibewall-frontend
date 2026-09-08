import { Link } from 'react-router-dom';
import ConfessionCard from '../components/ConfessionCard';
import FadeIn from '../components/FadeIn';
import type { ConfessionResponse } from '../types';

interface Props {
  confessions: ConfessionResponse[];
}

export default function LandingPage({ confessions }: Props) {
  const previewConfessions = confessions.slice(0, 3);

  return (
    <div className="font-sans selection:bg-violet-200 selection:text-violet-900 bg-vw-bg text-gray-900">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 lg:pt-48 lg:pb-32 min-h-[90vh] flex flex-col justify-center">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-10 right-1/4 w-72 h-72 bg-fuchsia-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-pink-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-sm font-semibold mb-8 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
              </span>
              Now live with AI Moderation
            </div>
          </FadeIn>
          
          <FadeIn delay={150}>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-gray-900 mb-8 leading-tight">
              Share your truth, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500">
                anonymously.
              </span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={300}>
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              VibeWall is a safe space to confess your thoughts, seek advice, and connect with others. 
              No identities. No tracking. Everything disappears in 12 hours.
            </p>
          </FadeIn>
          
          <FadeIn delay={450}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Start Confessing
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-gray-900 font-bold text-lg border-2 border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2. The Problem Section */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
                Social media is <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">exhausting.</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  We are tired of curated highlight reels, endless comparisons, and the constant pressure of maintaining a public profile. 
                </p>
                <p>
                  <strong>VibeWall is the anti-social media.</strong> It's a place where you can be incredibly real, without the fear of judgment from friends, family, or employers.
                </p>
                <p>
                  No followers, no permanent records. Just pure, unfiltered human connection.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn direction="left" delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-100 to-pink-50 transform rotate-3 rounded-3xl -z-10"></div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Why use VibeWall?</h3>
                  <ul className="space-y-4">
                    <li className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">1</span>
                      <div>
                        <strong className="block text-gray-900">Vent your frustrations</strong>
                        <span className="text-gray-600 text-sm">Let go of things weighing you down safely.</span>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-fuchsia-100 flex items-center justify-center text-fuchsia-600 font-bold">2</span>
                      <div>
                        <strong className="block text-gray-900">Seek unbiased advice</strong>
                        <span className="text-gray-600 text-sm">Get real feedback from strangers who don't know you.</span>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">3</span>
                      <div>
                        <strong className="block text-gray-900">Share your secrets</strong>
                        <span className="text-gray-600 text-sm">Unburden yourself in a completely anonymous environment.</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="py-24 bg-vw-bg">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Built for safety & expression</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">We've designed every feature to protect your identity while fostering a supportive community.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={0}>
              <FeatureCard 
                icon="🕵️‍♂️"
                title="100% Anonymous"
                description="No real names, no handles. You are given a randomly generated alias that frequently rotates to protect your identity."
              />
            </FadeIn>
            <FadeIn delay={150}>
              <FeatureCard 
                icon="🛡️"
                title="AI Moderated"
                description="Our advanced AI constantly scans and removes toxic, hateful, or harmful content instantly, keeping the community safe."
              />
            </FadeIn>
            <FadeIn delay={300}>
              <FeatureCard 
                icon="⏳"
                title="Ephemeral"
                description="Your confessions aren't permanent. Everything on the wall is automatically wiped clean after exactly 12 hours."
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 4. Live Feed Preview */}
      <section className="py-32 relative overflow-hidden bg-white border-y border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-pink-50/50 skew-y-2 transform origin-top-left -z-10"></div>
        
        <FadeIn>
          <div className="max-w-4xl mx-auto px-4 text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Happening right now</h2>
            <p className="text-gray-600 text-xl mb-8">Join thousands of others sharing their stories today.</p>
          </div>
        </FadeIn>

        <div className="max-w-3xl mx-auto px-4 space-y-6">
          {previewConfessions.length > 0 ? (
            previewConfessions.map((c, i) => (
              <FadeIn key={c.id} delay={i * 150}>
                <div className="group hover:-translate-y-1 transition-transform duration-300">
                  <ConfessionCard 
                    confession={c} 
                    onUpdate={() => {}} 
                    onDelete={() => {}} 
                  />
                </div>
              </FadeIn>
            ))
          ) : (
            <FadeIn>
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🤫</div>
                <p className="text-lg font-medium text-gray-900">The wall is quiet right now.</p>
                <p className="text-gray-500 mt-2">Be the first to post something anonymously.</p>
              </div>
            </FadeIn>
          )}
          
          <FadeIn delay={500}>
            <div className="pt-12 text-center">
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 text-violet-600 font-bold text-lg hover:text-violet-700 transition"
              >
                See all confessions
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 5. Bottom CTA */}
      <section className="py-32 relative overflow-hidden bg-gray-900 text-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-violet-600 rounded-full blur-[120px] mix-blend-screen -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-[120px] mix-blend-screen -translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <FadeIn>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8">Ready to clear your mind?</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Join the most authentic community on the internet. It takes 10 seconds to generate your anonymous alias.</p>
            <Link
              to="/register"
              className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-xl shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              Join VibeWall Now
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="h-full p-10 bg-white rounded-3xl border border-gray-100 hover:border-violet-200 shadow-sm hover:shadow-xl hover:shadow-violet-100 transition-all duration-300">
      <div className="text-5xl mb-8 bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-lg">{description}</p>
    </div>
  );
}
