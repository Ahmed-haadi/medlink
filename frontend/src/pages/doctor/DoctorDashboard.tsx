import { useEffect, useState } from 'react'
import AppLayout from '../../components/AppLayout'
import { Card, Topbar } from '../../components/DashboardUi'
import { currentProfile, discussionThreads, doctorAppointments } from '../../services/modules'

export default function DoctorDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [queue, setQueue] = useState<any[]>([])
  const [threads, setThreads] = useState<any[]>([])
  const [notice, setNotice] = useState('')

  useEffect(() => {
    Promise.all([currentProfile(), doctorAppointments(), discussionThreads()])
      .then(([profileRow, appointmentRows, threadRows]) => { setProfile(profileRow); setQueue(appointmentRows); setThreads(threadRows.slice(0, 3)) })
      .catch(error => setNotice(error instanceof Error ? error.message : 'Unable to load your dashboard.'))
  }, [])

  return <AppLayout role="doctor"><Topbar search="Search patients or records…" /><main className="dashboard">
    <div className="welcome-row"><div><p className="eyebrow">VERIFIED PHYSICIAN</p><h1>Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}.</h1><p>You have {queue.filter(item => item.status === 'requested').length} pending consultation requests.</p></div><a className="primary" href="#/doctor/consultations">Start Consultation</a></div>
    <div className="dashboard-grid doctor-grid"><div><Card title="Patient Queue" className="queue-card"><a>{queue.length} appointments</a>{queue.length ? queue.map(item => <div className="patient-row" key={item.id}><span className="initials">{initials(item.patient?.full_name)}</span><div><b>{item.patient?.full_name || 'Patient'}</b><small>{new Date(item.scheduled_at).toLocaleString()} · {item.reason || 'No reason supplied'}</small></div><span className={`status ${item.status}`}>{item.status}</span><a className="outline" href="#/doctor/consultations">Open</a></div>) : <p className="dashboard-empty">No patient appointments are assigned to you.</p>}</Card></div><aside><Card title="Peer Consult"><a href="#/doctor/discussions">View All</a>{threads.length ? threads.map(thread => <div className="consult-card" key={thread.id}><small>{thread.specialty || 'General medicine'} · {new Date(thread.created_at).toLocaleDateString()}</small><b>{thread.title}</b><p>{thread.body}</p></div>) : <p className="dashboard-empty">No peer discussions are available.</p>}</Card></aside></div>
    {notice && <p className="auth-message">{notice}</p>}
  </main></AppLayout>
}

function initials(name?: string) { return String(name || 'P').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() }
