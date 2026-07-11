import type { PropsWithChildren } from 'react'
import type { UserRole } from '../types/auth'

const items: Record<UserRole, string[]> = {
  patient: ['Dashboard', 'Find a Doctor', 'Medical Records', 'Consultations', 'Discussions'],
  doctor: ['Dashboard', 'Consultations', 'Medical Records', 'Discussions', 'Admin Tools'],
  admin: ['Dashboard', 'Admin Tools', 'User Management', 'Doctor Verification', 'Analytics', 'Content Moderation'],
}

const routes: Record<UserRole, Record<string, string>> = {
  patient: { Dashboard: '#/patient/dashboard', 'Find a Doctor': '#/patient/care', 'Medical Records': '#/reports', Consultations: '#/patient/care', Discussions: '#/patient/care' },
  doctor: { Dashboard: '#/doctor/dashboard', Consultations: '#/doctor/workspace', 'Medical Records': '#/reports', Discussions: '#/doctor/workspace', 'Admin Tools': '#/doctor/workspace' },
  admin: { Dashboard: '#/admin/dashboard', 'Admin Tools': '#/admin/manage', 'User Management': '#/admin/manage', 'Doctor Verification': '#/admin/manage', Analytics: '#/admin/manage', 'Content Moderation': '#/admin/manage' },
}

export default function AppLayout({ role, children }: PropsWithChildren<{ role: UserRole }>) {
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#/">▣ <span>MedLink</span></a>
      <p className="role-label">{role === 'admin' ? 'Admin Management' : role === 'doctor' ? 'Verified Physician' : 'Patient Portal'}</p>
      <nav>{items[role].map((item, index) => <a href={routes[role][item]} className={index === 0 ? 'nav-item active' : 'nav-item'} key={item}>{item}</a>)}</nav>
      <div className="sidebar-footer"><button className="nav-item">⚙ Settings</button><button className="nav-item danger">↪ Logout</button></div>
    </aside>
    <section className="workspace">{children}</section>
  </div>
}
