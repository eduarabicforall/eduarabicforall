import React from 'react'

const themes = {
  teal: { headBg: '#17756A', accent2: '#0F5F52', tint: '#E1EEE9', screenBg: '#EAF6F2' },
  sand: { headBg: '#C0913F', accent2: '#9A6E1E', tint: '#F5EAD4', screenBg: '#F8F1E3' },
  crimson: { headBg: '#A33241', accent2: '#8C2233', tint: '#F6E1E4', screenBg: '#F8ECED' },
}

const navItems = [
  { icon: 'home-01', label: 'Home' },
  { icon: 'route-01', label: 'Path' },
  { icon: 'headphones', label: 'Audio' },
  { icon: 'ai-brain-01', label: 'AI' },
]

export default function PhoneMockup({ variant = 'teal', screen = 'home' }) {
  const t = themes[variant] || themes.teal
  const isHome = screen === 'home'
  const isLesson = screen === 'lesson'
  const activeIdx = isLesson ? 1 : 0

  return (
    <div style={{
      width: '100%',
      aspectRatio: '9 / 19.4',
      borderRadius: '40px',
      padding: '9px',
      background: 'linear-gradient(160deg, #2a2f3d, #0d0f16)',
      boxShadow: '0 40px 80px -30px rgba(0,0,0,.8), inset 0 0 0 1px rgba(255,255,255,.06)',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '32px',
        overflow: 'hidden',
        background: t.screenBg,
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
          width: '34%', height: '16px', background: '#000', borderRadius: '999px', zIndex: 5,
        }} />

        {/* Status bar */}
        <div style={{
          padding: '14px 16px 8px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', fontSize: '10px', fontWeight: 700, color: t.headBg,
        }}>
          <span>10:25</span>
          <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <i className="hgi-stroke hgi-signal-full-01" style={{ fontSize: '13px' }} />
            <i className="hgi-stroke hgi-wifi-01" style={{ fontSize: '13px' }} />
            <i className="hgi-stroke hgi-battery-full" style={{ fontSize: '14px' }} />
          </span>
        </div>

        <div style={{ padding: '4px 16px 0' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '26px', height: '26px', borderRadius: '8px', background: t.headBg,
                display: 'grid', placeItems: 'center', color: '#fff',
              }}>
                <i className="hgi-stroke hgi-user" style={{ fontSize: '16px' }} />
              </span>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '14px', color: '#1c2230' }}>
                Hello, Ahmad
              </span>
            </div>
            <i className="hgi-stroke hgi-notification-01" style={{ fontSize: '18px', color: t.headBg }} />
          </div>

          {isLesson && (
            <div>
              <div style={{
                borderRadius: '16px', overflow: 'hidden', background: t.headBg,
                aspectRatio: '16/10', position: 'relative', display: 'grid', placeItems: 'center', marginBottom: '12px',
              }}>
                <i className="hgi-stroke hgi-play-circle" style={{ fontSize: '40px', color: 'rgba(255,255,255,.95)' }} />
                <span style={{
                  position: 'absolute', bottom: '8px', left: '10px', fontSize: '9px', fontWeight: 700,
                  color: 'rgba(255,255,255,.9)', background: 'rgba(0,0,0,.28)', padding: '3px 7px', borderRadius: '6px',
                }}>Unit 3 · Clip 02</span>
              </div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '13px', color: '#1c2230', marginBottom: '3px' }}>
                The Nominal Sentence
              </div>
              <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: '17px', color: t.accent2, marginBottom: '12px' }}>
                الجُمْلَةُ الاِسْمِيَّة
              </div>
              <div style={{ background: '#fff', borderRadius: '14px', padding: '12px', boxShadow: '0 6px 20px -12px rgba(0,0,0,.3)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#8a90a0', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>
                  Practice
                </div>
                <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: '16px', color: '#1c2230', marginBottom: '10px' }}>
                  البَيْتُ ____
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '9px', background: t.tint, fontSize: '12px', fontWeight: 600, color: t.accent2 }}>
                    كَبِيرٌ
                  </span>
                  <span style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '9px', background: '#f1f2f5', fontSize: '12px', fontWeight: 600, color: '#6b7488' }}>
                    يَكْتُبُ
                  </span>
                </div>
              </div>
            </div>
          )}

          {isHome && (
            <div>
              <div style={{ background: t.headBg, borderRadius: '16px', padding: '14px', color: '#fff', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '15px' }}>LEVEL 5</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(255,255,255,.2)', padding: '4px 8px', borderRadius: '6px' }}>120 XP</span>
                </div>
                <div style={{ fontSize: '9px', letterSpacing: '.1em', opacity: .8, marginBottom: '6px' }}>PROGRESS</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1,2,3].map(i => <span key={i} style={{ flex: 1, height: '5px', borderRadius: '9px', background: t.accent2 }} />)}
                  {[1,2].map(i => <span key={i} style={{ flex: 1, height: '5px', borderRadius: '9px', background: 'rgba(255,255,255,.3)' }} />)}
                </div>
              </div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '12px', color: t.accent2, marginBottom: '6px' }}>Continue learning</div>
              <div style={{ background: '#fff', borderRadius: '14px', padding: '12px', boxShadow: '0 6px 20px -12px rgba(0,0,0,.3)', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: t.accent2, background: t.tint, padding: '3px 8px', borderRadius: '6px' }}>NAHW</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: t.accent2, border: `1px solid ${t.tint}`, padding: '3px 8px', borderRadius: '6px' }}>Unit 3</span>
                </div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '13px', color: '#1c2230' }}>The Nominal Sentence</div>
                <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: '15px', color: '#6b7488' }}>الجُمْلَةُ الاِسْمِيَّة</div>
              </div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '12px', color: t.accent2, marginBottom: '6px' }}>Free audio</div>
              <div style={{ background: '#fff', borderRadius: '14px', padding: '10px 12px', boxShadow: '0 6px 20px -12px rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '30px', height: '30px', borderRadius: '9px', background: t.tint, display: 'grid', placeItems: 'center', color: t.accent2 }}>
                  <i className="hgi-stroke hgi-headphones" style={{ fontSize: '18px' }} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1c2230' }}>Daily Arabic Podcast</div>
                  <div style={{ fontSize: '10px', color: '#8a90a0' }}>Ep. 12 · 6 min</div>
                </div>
                <i className="hgi-stroke hgi-play-circle" style={{ fontSize: '22px', color: t.accent2 }} />
              </div>
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff',
          borderTop: '1px solid #eceef2', padding: '10px 16px 16px',
          display: 'flex', justifyContent: 'space-between',
        }}>
          {navItems.map((n, i) => (
            <span key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: i === activeIdx ? t.accent2 : '#b4b9c4' }}>
              <i className={`hgi-stroke hgi-${n.icon}`} style={{ fontSize: '20px' }} />
              <span style={{ fontSize: '8px', fontWeight: 600 }}>{n.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
