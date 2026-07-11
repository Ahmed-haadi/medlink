import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../../components/AppLayout'
import { Card, Metric, Topbar } from '../../components/DashboardUi'
import { adminUsers, pendingVerifications } from '../../services/modules'

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const [checks, setChecks] = useState<any[]>([])
  const [notice, setNotice] = useState('')
  useEffect(() => { Promise.all([adminUsers(), pendingVerifications()]).then(([userRows, verificationRows]) => { setUsers(userRows); setChecks(verificationRows) }).catch(error => setNotice(error instanceof Error ? error.message : 'Admin access is required.')) }, [])
  const stats = useMemo(() => ({ patients: users.filter(user => user.role === 'patient').length, doctors: users.filter(user => user.role === 'doctor' && user.status === 'active').length }), [users])

  return <AppLayout role="admin"><Topbar search="Search systems, users, or records…" /><main className="dashboard admin-dashboard">
    <h1>Admin Management Portal</h1><div className="summary-row"><Metric label="TOTAL PATIENTS" value={String(stats.patients)} note="Database accounts" /><Metric label="ACTIVE DOCTORS" value={String(stats.doctors)} note="Approved accounts" /><Metric label="PENDING VERIFICATIONS" value={String(checks.length)} note="Awaiting review" /></div>
    <div className="dashboard-grid admin-grid"><Card title="User Management" className="table-card"><a className="new-user" href="#/admin/users">View all users</a><div className="user-table"><div className="table-head"><span>USER</span><span>ROLE</span><span>STATUS</span><span>ACTIONS</span></div>{users.slice(0, 6).map(user => <div className="table-row" key={user.id}><span className="initials">{initials(user.full_name)}</span><div><b>{user.full_name}</b><small>Joined {new Date(user.created_at).toLocaleDateString()}</small></div><span>{user.role}</span><span className={`status ${user.status}`}>{user.status}</span><a href="#/admin/users">⋮</a></div>)}</div>{!users.length && <p className="dashboard-empty">No database users are available.</p>}</Card><aside><Card title="Pending Verifications" className="verification">{checks.slice(0, 4).map(item => <div key={item.id}><b>{item.doctor?.full_name || 'Doctor applicant'}</b><small>{item.specialization} · {item.university}</small><a className="outline" href="#/admin/verifications">Review application</a></div>)}{!checks.length && <p className="dashboard-empty">No pending applications.</p>}</Card></aside></div>
    {notice && <p className="auth-message">{notice}</p>}
  </main></AppLayout>
}

function initials(name?: string) { return String(name || 'U').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() }
