import { Link } from 'react-router-dom';
import ConfessionCard from '../components/ConfessionCard';
import type { ConfessionResponse } from '../types';

interface Props {
  confessions: ConfessionResponse[];
}

export default function LandingPage({ confessions }: Props) {
  const previewConfessions = confessions.slice(0, 3);

  return (
    <div className="font-sans selection:bg-violet-200 selection:text-violet-900">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 lg:pt-48 lg:pb-32">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-10 right-1/4 w-72 h-72 bg-fuchsia-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-pink-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-sm font-medium mb-8 animate-slide-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Now live with AI Moderation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Share your truth, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
              anonymously.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
            VibeWall is a safe space to confess your thoughts, seek advice, and connect with others. 
            No identities. No tracking. Everything disappears in 12 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gray-900 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Confessing
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-gray-900 font-semibold text-lg border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Features Grid */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for safety and expression</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We've designed every feature to protect your identity while fostering a supportive community.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🔒"
              title="100% Anonymous"
              description="No real names, no handles. You are given a random generated alias that changes frequently."
              delay="0"
            />
            <FeatureCard 
              icon="🛡️"
              title="AI Moderated"
              description="Our advanced AI constantly scans and removes toxic, hateful, or harmful content instantly."
              delay="100"
            />
            <FeatureCard 
              icon="⏱️"
              title="Ephemeral"
              description="Your confessions aren't permanent. Everything is automatically wiped clean after 12 hours."
              delay="200"
            />
          </div>
        </div>
      </section>

      {/* 3. Live Feed Preview */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-violet-50/50 skew-y-3 transform origin-top-left -z-10"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Happening right now</h2>
          <p className="text-gray-600 text-lg mb-8">Join thousands of others sharing their stories today.</p>
        </div>

        <div className="max-w-3xl mx-auto px-4 space-y-6">
          {previewConfessions.length > 0 ? (
            previewConfessions.map((c, i) => (
              <div key={c.id} className="opacity-90 hover:opacity-100 transition-opacity animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                <ConfessionCard 
                  confession={c} 
                  onUpdate={() => {}} 
                  onDelete={() => {}} 
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm animate-slide-up">
              <p className="text-gray-500">The wall is quiet right now. Be the first to post!</p>
            </div>
          )}
          
          <div className="pt-10 text-center animate-slide-up" style={{ animationDelay: '400ms' }}>
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700 transition"
            >
              See all confessions
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA */}
      <section className="py-24 bg-gradient-to-b from-transparent to-violet-50">
        <div className="max-w-4xl mx-auto px-4 text-center animate-slide-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Ready to clear your mind?</h2>
          <Link
            to="/register"
            className="inline-block px-10 py-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg shadow-xl shadow-violet-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-300 transition-all duration-300"
          >
            Join VibeWall Free
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: string, title: string, description: string, delay: string }) {
  return (
    <div 
      className={`p-8 bg-vw-bg rounded-3xl border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100 transition-all duration-300 animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-4xl mb-6 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-gray-50">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
