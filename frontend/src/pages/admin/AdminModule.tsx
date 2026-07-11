import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../../components/AppLayout'
import { adminUsers, changeUserStatus, discussionThreads, pendingVerifications, reviewVerification } from '../../services/modules'

export type AdminView = 'tools' | 'users' | 'verifications' | 'analytics' | 'moderation'

const titles: Record<AdminView, { eyebrow: string; title: string; description: string }> = {
  tools: { eyebrow: 'ADMIN CONTROL', title: 'Admin Tools', description: 'System configuration, access control, and operational status.' },
  users: { eyebrow: 'ACCOUNT CONTROL', title: 'User Management', description: 'Review accounts, roles, and suspension status.' },
  verifications: { eyebrow: 'CLINICAL COMPLIANCE', title: 'Doctor Verification', description: 'Approve or reject submitted medical credentials.' },
  analytics: { eyebrow: 'SYSTEM INSIGHTS', title: 'Analytics', description: 'Live platform activity and role distribution.' },
  moderation: { eyebrow: 'SAFETY & TRUST', title: 'Content Moderation', description: 'Review anonymized clinical discussions and policy status.' },
}

export default function AdminModule({ view }: { view: AdminView }) {
  const [users, setUsers] = useState<any[]>([])
  const [checks, setChecks] = useState<any[]>([])
  const [threads, setThreads] = useState<any[]>([])
  const [notice, setNotice] = useState('')

  async function load() {
    try {
      const [userRows, verificationRows, discussionRows] = await Promise.all([adminUsers(), pendingVerifications(), discussionThreads()])
      setUsers(userRows); setChecks(verificationRows); setThreads(discussionRows)
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Admin access is required.') }
  }

  useEffect(() => { load() }, [])
  const stats = useMemo(() => ({ patients: users.filter(user => user.role === 'patient').length, doctors: users.filter(user => user.role === 'doctor').length, admins: users.filter(user => user.role === 'admin').length, suspended: users.filter(user => user.status === 'suspended').length }), [users])
  const copy = titles[view]

  async function approve(id: string, approved: boolean) {
    try { await reviewVerification(id, approved); await load(); setNotice(approved ? 'Doctor approved.' : 'Doctor verification rejected.') }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to review.') }
  }

  return <AppLayout role="admin"><main className="feature-page admin-page">
    <p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p className="feature-note">{copy.description}</p>

    {view === 'tools' && <><div className="metrics-row"><Metric label="Platform status" value="Operational" note="All core services online" /><Metric label="Access policies" value="Enabled" note="RLS enforced" /><Metric label="Pending actions" value={String(checks.length)} note="Doctor reviews" /></div><div className="module-grid"><section className="module-card"><h2>System Settings</h2><Setting name="Secure authentication" state="Enabled" /><Setting name="Medical file storage" state="Private" /><Setting name="Discussion anonymization" state="Required" /></section><section className="module-card"><h2>Quick Actions</h2><a className="admin-action" href="#/admin/users">Manage user accounts <span>→</span></a><a className="admin-action" href="#/admin/verifications">Review doctor credentials <span>→</span></a><a className="admin-action" href="#/admin/moderation">Open moderation queue <span>→</span></a></section></div></>}

    {view === 'users' && <section className="module-card admin-list"><div className="section-heading"><h2>All Users</h2><span>{users.length} accounts</span></div>{users.length ? users.map(user => <div className="admin-user-row" key={user.id}><span className="initials">{String(user.full_name || 'U').slice(0, 2).toUpperCase()}</span><div><b>{user.full_name}</b><small>{user.role} · Joined {new Date(user.created_at).toLocaleDateString()}</small></div><span className={`status ${user.status}`}>{user.status}</span><button className="outline" onClick={() => changeUserStatus(user.id, user.status === 'suspended' ? 'active' : 'suspended').then(load)}>{user.status === 'suspended' ? 'Restore' : 'Suspend'}</button></div>) : <Empty text="No users found." />}</section>}

    {view === 'verifications' && <section className="module-card verification-page"><div className="section-heading"><h2>Pending Applications</h2><span>{checks.length} awaiting review</span></div>{checks.length ? checks.map(item => <div className="verification-row" key={item.id}><div className="verification-icon">✓</div><div><b>{item.doctor?.full_name || 'Doctor applicant'}</b><small>{item.specialization} · {item.university} · License: {item.license_number || 'Not supplied'}</small></div><div className="verification-actions"><button className="approve" onClick={() => approve(item.id, true)}><span aria-hidden="true">✓</span> Approve</button><button className="reject" onClick={() => approve(item.id, false)}><span aria-hidden="true">×</span> Reject</button></div></div>) : <Empty text="No pending doctor verification records." />}</section>}

    {view === 'analytics' && <><div className="metrics-row"><Metric label="Patients" value={String(stats.patients)} note="Registered accounts" /><Metric label="Doctors" value={String(stats.doctors)} note="Clinical accounts" /><Metric label="Administrators" value={String(stats.admins)} note="Full-access accounts" /></div><section className="module-card analytics-panel"><h2>Account Distribution</h2><Bar label="Patients" value={stats.patients} total={users.length} /><Bar label="Doctors" value={stats.doctors} total={users.length} /><Bar label="Administrators" value={stats.admins} total={users.length} /><Bar label="Suspended" value={stats.suspended} total={users.length} danger /></section></>}

    {view === 'moderation' && <section className="module-card moderation-page"><div className="section-heading"><h2>Clinical Discussions</h2><span>{threads.length} threads</span></div>{threads.length ? threads.map(thread => <div className="moderation-row" key={thread.id}><div><b>{thread.title}</b><small>{thread.specialty || 'General medicine'} · {thread.is_anonymized ? 'Anonymized' : 'Review required'}</small><p>{thread.body}</p></div><span className={thread.is_anonymized ? 'safe-chip' : 'review-chip'}>{thread.is_anonymized ? 'Compliant' : 'Review'}</span></div>) : <Empty text="There are no discussions requiring moderation." />}</section>}

    {notice && <p className="auth-message">{notice}</p>}
  </main></AppLayout>
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <section className="card metric"><span>{label}</span><strong>{value}</strong><small>{note}</small><i /></section> }
function Setting({ name, state }: { name: string; state: string }) { return <div className="setting-row"><span>{name}</span><b>{state}</b></div> }
function Empty({ text }: { text: string }) { return <div className="admin-empty"><span>✓</span><b>{text}</b><small>Nothing needs your attention right now.</small></div> }
function Bar({ label, value, total, danger = false }: { label: string; value: number; total: number; danger?: boolean }) { const width = total ? Math.max(4, Math.round(value / total * 100)) : 4; return <div className="analytics-row"><div><span>{label}</span><b>{value}</b></div><div className="analytics-track"><i className={danger ? 'danger-bar' : ''} style={{ width: `${width}%` }} /></div></div> }
