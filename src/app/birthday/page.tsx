import type { CSSProperties } from 'react'
import { RsvpForm } from './RsvpForm'

const STARS = [
  { left: '8%', top: '7%', s: 3, d: '4.5s', delay: '0s' },
  { left: '31%', top: '5%', s: 2, d: '3.8s', delay: '.6s' },
  { left: '48%', top: '9%', s: 2, d: '5.2s', delay: '1.1s' },
  { left: '82%', top: '6%', s: 3, d: '4.1s', delay: '.3s' },
  { left: '91%', top: '14%', s: 2, d: '4.7s', delay: '1.4s' },
  { left: '15%', top: '20%', s: 2, d: '3.6s', delay: '.9s' },
  { left: '65%', top: '19%', s: 2, d: '5s', delay: '.2s' },
  { left: '40%', top: '28%', s: 2, d: '4.3s', delay: '1.7s' },
  { left: '6%', top: '30%', s: 2, d: '4.9s', delay: '.5s' },
  { left: '94%', top: '28%', s: 2, d: '4.2s', delay: '1.2s' },
  { left: '22%', top: '44%', s: 2, d: '5.4s', delay: '.8s' },
  { left: '77%', top: '40%', s: 2, d: '4.6s', delay: '1.5s' },
]

const eyebrow: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 400,
  letterSpacing: '.42em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
}

export default function BirthdayPage() {
  return (
    <main
      style={
        {
          '--accent': '#d9b87a',
          '--accent-soft': '#ecd4a3',
          '--sky-top': '#0e1430',
          '--sky-mid': '#283054',
          '--horizon': '#7d5a66',
          '--glow': '#c98a73',
          '--cream': '#f3ecdd',
          position: 'relative',
          minHeight: '100svh',
          overflow: 'hidden',
          color: 'var(--cream)',
          fontFamily: 'var(--font-display)',
          background:
            'radial-gradient(130% 60% at 50% 88%, var(--glow) 0%, rgba(125,90,102,0) 46%), linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 46%, var(--horizon) 72%, #14182e 84%, #080c1c 100%)',
        } as CSSProperties
      }
    >
      {/* starfield */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {STARS.map((st, i) => (
          <span
            key={i}
            data-fly-anim
            style={{
              position: 'absolute',
              left: st.left,
              top: st.top,
              width: st.s,
              height: st.s,
              borderRadius: '50%',
              background: '#fff',
              animation: `flyTwinkle ${st.d} ease-in-out infinite ${st.delay}`,
            }}
          />
        ))}
      </div>

      {/* fireworks */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Firework left="24%" top="15%" size="clamp(180px, 34vw, 360px)" op={0.5} dur="6s" delay="0s" color="var(--accent)" coreColor="var(--accent-soft)" core />
        <Firework left="80%" top="13%" size="clamp(150px, 26vw, 280px)" op={0.42} dur="7s" delay="1.2s" color="var(--cream)" coreColor="#fff" core />
        <Firework left="62%" top="27%" size="clamp(110px, 18vw, 190px)" op={0.38} dur="5.4s" delay=".5s" color="#e3a98f" />
      </div>

      {/* content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 'min(640px, 92vw)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 'clamp(56px, 9vw, 104px) 0 clamp(48px, 8vw, 88px)',
        }}
      >
        <div className="fly-reveal" style={{ ...eyebrow, fontSize: 'clamp(13px, 1.6vw, 17px)', paddingLeft: '.42em' }}>
          Please Join Us to
        </div>

        <div className="fly-reveal" style={{ animationDelay: '.12s', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'clamp(28px, 6vw, 64px)' }}>
          <div style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(34px, 7vw, 58px)', lineHeight: 1, color: 'var(--cream)' }}>
            Celebrate with
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 'clamp(82px, 22vw, 188px)',
              lineHeight: 0.92,
              color: 'var(--accent)',
              letterSpacing: '.015em',
              marginTop: 6,
              textShadow: '0 2px 34px rgba(217,184,122,.3)',
            }}
          >
            Alex
          </div>
          <div style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(17px, 3vw, 27px)', lineHeight: 1.3, color: 'rgba(243,236,221,.8)', marginTop: 14 }}>
            a birthday by the harbor, under the fireworks
          </div>
        </div>

        <Divider className="fly-reveal" style={{ animationDelay: '.24s', marginTop: 'clamp(26px, 5vw, 40px)' }} />

        <div className="fly-reveal" style={{ animationDelay: '.32s', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'clamp(26px, 5vw, 36px)' }}>
          <div style={{ ...eyebrow, color: 'var(--cream)', fontWeight: 500, fontSize: 'clamp(16px, 2.4vw, 21px)', letterSpacing: '.22em', paddingLeft: '.22em' }}>
            Saturday · July 11 · 6:30 PM
          </div>
          <div style={{ fontWeight: 500, fontSize: 'clamp(20px, 3.6vw, 30px)', color: 'var(--cream)', marginTop: 18 }}>
            261 Three Mile Harbor / Hog Creek Road
          </div>
          <div style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(17px, 2.8vw, 24px)', color: 'var(--accent)', marginTop: 2 }}>
            East Hampton, New York
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 'clamp(12px, 1.6vw, 15px)',
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: 'rgba(243,236,221,.62)',
              marginTop: 16,
              paddingLeft: '.16em',
            }}
          >
            Please park on Gardiners Lane, across the street
          </div>
        </div>

        {/* grand finale */}
        <div
          className="fly-reveal"
          style={{
            animationDelay: '.4s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 'clamp(22px, 4vw, 26px) 0 0',
            borderTop: '1px solid rgba(236,212,163,.32)',
            width: 'min(440px, 100%)',
            marginTop: 'clamp(36px, 7vw, 52px)',
          }}
        >
          <div style={{ ...eyebrow, fontSize: 'clamp(12px, 1.5vw, 14px)', letterSpacing: '.4em', paddingLeft: '.4em' }}>
            The Grand Finale
          </div>
          <div style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(18px, 2.8vw, 26px)', lineHeight: 1.4, color: 'var(--cream)', marginTop: 12 }}>
            Featuring the Clamshell Foundation fireworks over Three Mile Harbor
          </div>
        </div>

        {/* RSVP */}
        <div className="fly-reveal" style={{ animationDelay: '.5s', width: '100%', marginTop: 'clamp(40px, 8vw, 64px)' }}>
          <RsvpForm />
        </div>
      </div>
    </main>
  )
}

function Divider({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 16, ...style }}>
      <div style={{ width: 'clamp(56px, 12vw, 90px)', height: 1, background: 'linear-gradient(90deg, rgba(217,184,122,0), var(--accent))' }} />
      <div style={{ width: 7, height: 7, transform: 'rotate(45deg)', background: 'var(--accent)' }} />
      <div style={{ width: 'clamp(56px, 12vw, 90px)', height: 1, background: 'linear-gradient(90deg, var(--accent), rgba(217,184,122,0))' }} />
    </div>
  )
}

function Firework({
  left, top, size, op, dur, delay, color, coreColor, core,
}: {
  left: string; top: string; size: string; op: number; dur: string; delay: string; color: string; coreColor?: string; core?: boolean
}) {
  return (
    <>
      <div
        data-fly-anim
        style={
          {
            position: 'absolute',
            left,
            top,
            ['--burst-op' as string]: String(op),
            width: size,
            height: size,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `repeating-conic-gradient(from 4deg, ${color} 0deg .38deg, rgba(0,0,0,0) .38deg 11.25deg)`,
            WebkitMask: 'radial-gradient(circle, rgba(0,0,0,0) 5%, #000 7%, #000 45%, rgba(0,0,0,0) 60%)',
            mask: 'radial-gradient(circle, rgba(0,0,0,0) 5%, #000 7%, #000 45%, rgba(0,0,0,0) 60%)',
            animation: `flyPulse ${dur} ease-in-out infinite ${delay}`,
          } as CSSProperties
        }
      />
      {core && (
        <div
          data-fly-anim
          style={{
            position: 'absolute',
            left,
            top,
            width: 12,
            height: 12,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: coreColor,
            boxShadow: `0 0 16px 4px ${color}`,
            animation: `flyCore ${dur} ease-in-out infinite ${delay}`,
          }}
        />
      )}
    </>
  )
}
