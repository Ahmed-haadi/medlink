import { useEffect, useState, type ReactNode } from 'react'

const heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8s1ZGTQ0N3rxF6Ip67r4kfinqAFuc_LC1HsUQ9JImcPqa4_PLd4Pi_MmaNQwTqycUijbqSzrZO8axH7GaFq2BzsExHc-OdQB2bsVXP8zdvpOsNdmIAgTof2MFRwDRdaa2wW4YTeuWFzYKQf2-HdWOwwQ3NZa-yHyHuM8WWeDt6AV3LFqfYLFKEfyXPsIcNjzOk26baEjzoymdMJJ5MpUGVwMm7_cfOtORRlr4u4sQBfo_exlDm1c'
const aboutImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAfAw8IZvmiwgixe5Io7xeIAIVFDZF3lYfOgwsNycfe-EloT77caHmHeTDaOJhJRz5yB0PTo8BR_BD2T3uBnksrtt4LlkUgo1RbAnqfuQKRkz0LpO11nyYfcX3Yb9T-8vyAn2wmIQry5HBvbKkupsj2kV-4DuKHjQq3AITa1KybSRJtnYx65bE2eqYSHKZ-WWGiAjtxcmd5yo5TDnT2iBspF-GUKJ5oy7TdrodFp-xhDzuBR4ZKqA'
const specialistImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBiSK4RbONA67aUWsbxbFR2v_xFls0HNxPQ5YuY9haDjtIXIoeVVTGoGX4GI1ok4T9kqMcIsPKH2S7nlsuuZL8Xp2ZsAJvv-bmd1uaD6LBgnnGY6B0el1GV6K_nY9rsk5afSeHmDeomQHH3Ti4QyqC-8RDbkfvE-af7g_udG_r88fXPa-K-jyXTm0OyQMz6mHObTMGnzAVeDQ5PCJOn9VdRrfBzyxm2gfRFAPkWAd-L9I3BMdViINU',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDqkfevDtUOQsjXzl7Z6hsALappQctJB7uHU7WgYFbC813B81H_rUGuNbOl_yX3tgOVcQaVVQRJlF82f17t5ZOZlMunhNuqUmYOgqxEryi-8SafVZAFFGtvhn2OnpoLD-e_1Rk1I-QFQMbglObozDv-YU9cmIF5F-Z2JmM6gF8ggDnw0Yi7UZoEZMT2i9GKgfi4FAv_z-jZCJOQt4pEiGCt8QVN1_NZCQNbLyNTMuUMZ4cAN-XcTeU',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBMprH6n075GPZ84fA40wEBMZIV32eHQj2E198w9vIdycJuo5OdcDu7G1Dixk2z0EdJZgxSS7F48dOQXo5kh3pwISoPX8W2Ko02GUps6IBPIeUPlXk6RpbpDAlXhvKcWvKSkMVk4-CpxKqfkGxRA0F5r9Vd24H3MnD6gA3Vj-53OlsuGgKoMvQWjj2Z_LRnNvCg4ikrAnY5LH7kcOr-ViHxq_VjkuRUFN6kHRvBhJOJPYYIj7W7H3s',
]

export default function LandingPage() {
  const [dark, setDark] = useState(() => localStorage.getItem('medlink-theme') === 'dark')
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { document.documentElement.classList.toggle('theme-dark', dark); localStorage.setItem('medlink-theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => {
    const scrollToSection = () => {
      const section = window.location.hash.startsWith('#/landing/') ? window.location.hash.split('/')[2] : ''
      if (section) window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' }), 0)
    }
    window.addEventListener('hashchange', scrollToSection)
    scrollToSection()
    return () => window.removeEventListener('hashchange', scrollToSection)
  }, [])

  return <div className="landing-page">
    <header className="landing-nav"><a className="landing-brand" href="#/landing/hero"><span>✚</span>MedLink</a><nav className={menuOpen ? 'open' : ''}><a href="#/landing/hero" onClick={() => setMenuOpen(false)}>Home</a><a href="#/landing/features" onClick={() => setMenuOpen(false)}>Features</a><a href="#/landing/about" onClick={() => setMenuOpen(false)}>About</a><a href="#/landing/contact" onClick={() => setMenuOpen(false)}>Resources</a></nav><div className="landing-actions"><button className="landing-theme" aria-label="Toggle color theme" onClick={() => setDark(value => !value)}>{dark ? '☀' : '☾'}</button><a className="landing-login" href="#/login">Login</a><a className="landing-signup" href="#/signup/patient">Sign Up</a><button className="landing-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? '×' : '☰'}</button></div></header>

    <main>
      <section className="landing-hero" id="hero"><div className="landing-shell hero-grid"><div className="hero-copy"><span className="trust-pill"><i /> Trusted by 10,000+ Healthcare Providers</span><h1>Connecting You<br />to <em>Care, Anywhere.</em></h1><p>A seamless bridge between patients and clinicians. Experience the future of telemedicine with real-time diagnostics, secure records, and instant consultations.</p><div className="hero-actions"><a className="hero-primary" href="#/signup/patient">Get Started Now <span>→</span></a><a className="hero-secondary" href="#/landing/features">Watch Demo</a></div><div className="specialist-proof"><div>{specialistImages.map((source, index) => <img src={source} alt="MedLink healthcare specialist" key={index} />)}</div><p>Meet our top-rated specialists online</p></div></div><div className="hero-visual"><img src={heroImage} alt="Patient attending an online medical consultation" /><div className="live-session"><span>▣</span><div><small>Consultation</small><b>Live Session Active</b></div></div></div></div></section>

      <section className="landing-features landing-shell" id="features"><header><h2>Advanced Tools for Better Outcomes</h2><p>Our platform integrates everything you need for comprehensive medical management in one high-performance interface.</p></header><div className="feature-bento"><Feature className="video-feature" icon="▣" title="Crystal Clear Video & Chat">Encrypted, high-definition video calls with integrated real-time chat and document sharing during consultations.</Feature><Feature className="specialist-feature" icon="⌕" title="Specialist Network">Browse through thousands of verified medical professionals filtered by expertise and rating.<a href="#/signup/patient">View Specialist Directory →</a></Feature><Feature className="records-feature" icon="▤" title="Medical Records">Access your entire health history, lab results, and prescriptions in one secure, unified dashboard.</Feature><Feature className="admin-feature" icon="⚙" title="Enterprise Admin Tools">Powerful management tools for clinics to schedule, verify, and monitor patient flows efficiently.<div className="admin-lines"><i /><i /><i /></div></Feature></div></section>

      <section className="landing-about" id="about"><div className="landing-shell about-grid"><div><h2>Designed for<br />Both Sides of Care</h2><p>MedLink was built from the ground up to eliminate the friction in modern healthcare, empowering both doctors and patients through technology.</p><CareSide icon="♡" title="For Patients">Skip the waiting room. Get direct access to verified specialists, secure data, and better health tracking.</CareSide><CareSide icon="✚" title="For Doctors">Streamlined scheduling, credential verification, and secure clinical tools. Spend more time with patients and less time on paperwork.</CareSide></div><div className="about-visual"><img src={aboutImage} alt="Modern digital healthcare dashboard" /><div className="satisfaction"><strong>99%</strong><p>Patient satisfaction rate based on successful sessions.</p></div></div></div></section>

      <section className="landing-cta" id="contact"><div><h2>Ready to prioritize your health?</h2><p>Join the future of healthcare today. Set up your profile in minutes and connect with a verified doctor.</p><div><a href="#/signup/patient">Create Free Account</a><a href="#/signup/doctor">Contact Enterprise Sales</a></div></div></section>
    </main>

    <footer className="landing-footer"><div className="landing-shell footer-grid"><div className="footer-about"><a className="landing-brand" href="#hero"><span>✚</span>MedLink</a><p>Connecting people to world-class healthcare through innovative digital solutions. Secure, private, and professional.</p></div><FooterLinks title="Platform" links={[['Dashboard','#/login'],['Consultations','#features'],['Specialists','#/signup/patient'],['Create account','#/signup/patient']]} /><FooterLinks title="Resources" links={[['Help Center','#contact'],['About','#about'],['Privacy Policy','#contact'],['Terms of Service','#contact']]} /><div><h3>Preferences</h3><label className="language-control">◎<select defaultValue="en"><option value="en">English (US)</option><option value="de">Deutsch</option><option value="it">Italiano</option><option value="ar">العربية</option></select></label><button className="footer-theme" onClick={() => setDark(value => !value)}><span>{dark ? '☀' : '☾'} Theme Selection</span><small>Toggle</small></button></div></div><div className="landing-shell footer-bottom"><p>© {new Date().getFullYear()} MedLink Telemedicine Systems. All rights reserved.</p><span><i /> System Status: Operational</span></div></footer>
  </div>
}

function Feature({ icon, title, className, children }: { icon: string; title: string; className: string; children: ReactNode }) { return <article className={`landing-feature ${className}`}><span>{icon}</span><h3>{title}</h3><div>{children}</div></article> }
function CareSide({ icon, title, children }: { icon: string; title: string; children: ReactNode }) { return <article className="care-side"><span>{icon}</span><div><h3>{title}</h3><p>{children}</p></div></article> }
function FooterLinks({ title, links }: { title: string; links: string[][] }) { return <div><h3>{title}</h3><ul>{links.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul></div> }
