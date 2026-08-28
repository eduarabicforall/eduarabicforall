import React from 'react'
import { Link } from 'react-router-dom'

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
            {/* Stylized illustration */}
            <div className="relative">
              {/* Person sitting */}
              <div className="text-7xl mb-2">📚</div>
              {/* Floating elements */}
              <div className="absolute -top-4 -left-6 text-2xl animate-bounce" style={{ animationDelay: '0s' }}>💬</div>
              <div className="absolute -top-2 -right-8 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎙️</div>
              <div className="absolute -bottom-2 -left-4 text-xl animate-bounce" style={{ animationDelay: '1s' }}>📝</div>
              <div className="absolute -bottom-1 -right-6 text-xl animate-bounce" style={{ animationDelay: '1.5s' }}>🧠</div>
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
