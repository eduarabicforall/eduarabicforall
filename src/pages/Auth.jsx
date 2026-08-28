import React from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function Auth() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        {/* Illustration area */}
        <div className="w-56 h-56 mb-8 relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-[60px]" />
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative">
              {/* Central icon */}
              <div className="w-20 h-20 bg-panel-2 border border-ea-border rounded-2xl flex items-center justify-center text-primary">
                <Icon name="book-open-01" size={40} />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-3 -left-8 w-10 h-10 bg-teal-500/15 border border-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 animate-bounce" style={{ animationDelay: '0s' }}>
                <Icon name="ai-brain-01" size={20} />
              </div>
              <div className="absolute -top-3 -right-8 w-10 h-10 bg-violet-500/15 border border-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 animate-bounce" style={{ animationDelay: '0.5s' }}>
                <Icon name="headphones" size={20} />
              </div>
              <div className="absolute -bottom-3 -left-6 w-9 h-9 bg-amber-500/15 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 animate-bounce" style={{ animationDelay: '1s' }}>
                <Icon name="mic-01" size={18} />
              </div>
              <div className="absolute -bottom-2 -right-7 w-9 h-9 bg-rose-500/15 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 animate-bounce" style={{ animationDelay: '1.5s' }}>
                <Icon name="notebook-01" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Brand */}
        <h1 className="text-3xl font-sora font-bold text-ink mb-2">EduArabic</h1>
        <p className="text-sm text-ink-faint text-center mb-10 leading-relaxed max-w-[260px]">
          Are you ready to learn Arabic easily in the funniest way?
        </p>

        {/* Buttons */}
        <div className="w-full space-y-3">
          <Link
            to="/login"
            className="block w-full py-3.5 bg-primary text-bg text-center rounded-2xl font-semibold text-[15px] hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="block w-full py-3.5 bg-panel border border-ea-border text-ink text-center rounded-2xl font-semibold text-[15px] hover:bg-panel-2 active:scale-[0.98] transition-all"
          >
            Sign up
          </Link>
        </div>

        {/* Browse comments */}
        <button className="mt-8 text-xs text-ink-faint hover:text-ink-soft transition-colors">
          Browse user comments
        </button>
      </div>
    </div>
  )
}
