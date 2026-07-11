import { useEffect, useState, type PropsWithChildren, type ReactNode } from 'react'
import type { UserRole } from '../types/auth'
import { supabase } from '../services/supabase'

type IconName = 'dashboard' | 'search' | 'records' | 'consultations' | 'discussions' | 'admin' | 'users' | 'verify' | 'analytics' | 'moderation' | 'profile' | 'theme' | 'logout' | 'brand' | 'menu' | 'close'

function Icon({ name }: { name: IconName }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const paths: Record<IconName, ReactNode> = {
    brand: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M9 5V3h6v2M12 9v7M8.5 12.5h7" /></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    records: <><path d="M6 2h9l4 4v16H6z" /><path d="M15 2v5h5M9 13h6M9 17h6" /></>,
    consultations: <><path d="M4 5h16v13H8l-4 4z" /><path d="M8 9h8M8 13h5" /></>,
    discussions: <><path d="M4 5h14v11H8l-4 4z" /><path d="M9 9h10v10h-8l-3 3" /></>,
    admin: <><path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6z" /><path d="M9 12h6M12 9v6" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c.6-4 3-6 6-6s5.4 2 6 6M16 5a3 3 0 0 1 0 6M17 14c2.3.3 3.8 2.2 4 5" /></>,
    verify: <><path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6z" /><path d="m9 12 2 2 4-4" /></>,
    analytics: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    moderation: <><path d="M12 3 3 7v5c0 4.5 3.8 7.7 9 9 5.2-1.3 9-4.5 9-9V7z" /><path d="m9 9 6 6M15 9l-6 6" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-5 3.6-7 8-7s7.2 2 8 7" /></>,
    theme: <><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /><circle cx="12" cy="12" r="4" /></>,
    logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  }
  return <svg className="nav-icon" {...common}>{paths[name]}</svg>
}

const items: Record<UserRole, Array<{ label: string; icon: IconName }>> = {
  patient: [{ label: 'Dashboard', icon: 'dashboard' }, { label: 'Find a Doctor', icon: 'search' }, { label: 'Medical Records', icon: 'records' }, { label: 'Consultations', icon: 'consultations' }, { label: 'Discussions', icon: 'discussions' }, { label: 'Profile', icon: 'profile' }],
  doctor: [{ label: 'Dashboard', icon: 'dashboard' }, { label: 'Consultations', icon: 'consultations' }, { label: 'Medical Records', icon: 'records' }, { label: 'Discussions', icon: 'discussions' }, { label: 'Admin Tools', icon: 'admin' }, { label: 'Profile', icon: 'profile' }],
  admin: [{ label: 'Dashboard', icon: 'dashboard' }, { label: 'Admin Tools', icon: 'admin' }, { label: 'User Management', icon: 'users' }, { label: 'Doctor Verification', icon: 'verify' }, { label: 'Analytics', icon: 'analytics' }, { label: 'Content Moderation', icon: 'moderation' }, { label: 'Profile', icon: 'profile' }],
}

const routes: Record<UserRole, Record<string, string>> = {
  patient: { Dashboard: '#/patient/dashboard', 'Find a Doctor': '#/patient/doctors', 'Medical Records': '#/patient/reports', Consultations: '#/patient/consultations', Discussions: '#/patient/discussions', Profile: '#/patient/profile' },
  doctor: { Dashboard: '#/doctor/dashboard', Consultations: '#/doctor/consultations', 'Medical Records': '#/doctor/reports', Discussions: '#/doctor/discussions', 'Admin Tools': '#/doctor/tools', Profile: '#/doctor/profile' },
  admin: { Dashboard: '#/admin/dashboard', 'Admin Tools': '#/admin/tools', 'User Management': '#/admin/users', 'Doctor Verification': '#/admin/verifications', Analytics: '#/admin/analytics', 'Content Moderation': '#/admin/moderation', Profile: '#/admin/profile' },
}

export default function AppLayout({ role, children }: PropsWithChildren<{ role: UserRole }>) {
  const [dark, setDark] = useState(() => localStorage.getItem('medlink-theme') === 'dark')
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const currentRoute = window.location.hash

  useEffect(() => { document.documentElement.classList.toggle('theme-dark', dark); localStorage.setItem('medlink-theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => {
    const closeOnRoute = () => setMenuOpen(false)
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('hashchange', closeOnRoute)
    window.addEventListener('keydown', closeOnEscape)
    return () => { window.removeEventListener('hashchange', closeOnRoute); window.removeEventListener('keydown', closeOnEscape) }
  }, [])
  useEffect(() => { document.body.classList.toggle('mobile-menu-locked', menuOpen); return () => document.body.classList.remove('mobile-menu-locked') }, [menuOpen])

  async function logout() {
    if (loggingOut) return
    setLoggingOut(true)
    const { error } = await supabase.auth.signOut()
    if (error) { setLoggingOut(false); window.alert(error.message); return }
    window.location.hash = '#/'
  }

  return <div className={`app-shell ${menuOpen ? 'mobile-nav-open' : ''}`}>
    <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="primary-sidebar" onClick={() => setMenuOpen(value => !value)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
    <button className="sidebar-backdrop" type="button" aria-label="Close navigation menu" aria-hidden={!menuOpen} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} />
    <aside className="sidebar" id="primary-sidebar">
      <a className="brand" href="#/" onClick={() => setMenuOpen(false)}><span className="brand-mark"><Icon name="brand" /></span><span>MedLink</span></a>
      <p className="role-label">{role === 'admin' ? 'Admin Management' : role === 'doctor' ? 'Verified Physician' : 'Patient Portal'}</p>
      <nav>{items[role].map(item => <a href={routes[role][item.label]} onClick={() => setMenuOpen(false)} className={currentRoute === routes[role][item.label] ? 'nav-item active' : 'nav-item'} key={item.label}><Icon name={item.icon} />{item.label}</a>)}</nav>
      <div className="sidebar-footer"><button className="nav-item theme-control" onClick={() => setDark(value => !value)}><Icon name="theme" />{dark ? 'Light mode' : 'Dark mode'}</button><button className="nav-item danger" onClick={logout} disabled={loggingOut}><Icon name="logout" />{loggingOut ? 'Signing out…' : 'Logout'}</button></div>
    </aside>
    <section className="workspace">{children}</section>
  </div>
}
