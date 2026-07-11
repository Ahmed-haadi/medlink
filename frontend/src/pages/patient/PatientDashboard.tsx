import { useEffect, useState } from 'react'
import AppLayout from '../../components/AppLayout'
import { Topbar } from '../../components/DashboardUi'
import { currentProfile, patientAppointments, reports } from '../../services/modules'

export default function PatientDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [reportRows, setReportRows] = useState<any[]>([])
  const [notice, setNotice] = useState('')

  useEffect(() => {
    Promise.all([currentProfile(), patientAppointments(), reports()])
      .then(([profileRow, appointmentRows, reportsRows]) => { setProfile(profileRow); setAppointments(appointmentRows); setReportRows(reportsRows.slice(0, 3)) })
      .catch(error => setNotice(error instanceof Error ? error.message : 'Unable to load your dashboard.'))
  }, [])

  return <AppLayout role="patient"><Topbar /><main className="dashboard patient-dashboard-v2">
    <header className="patient-hero"><div><p className="eyebrow">YOUR HEALTH OVERVIEW</p><h1>Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}.</h1><p>Your dashboard only shows information saved to your MedLink account.</p></div><a className="primary" href="#/patient/doctors"><span>+</span> Schedule Appointment</a></header>
    <div className="patient-content-grid"><section className="activity-section"><div className="section-title-row"><div><p className="eyebrow">CARE TIMELINE</p><h2>Appointments</h2></div><a href="#/patient/consultations">View all</a></div><div className="timeline">{appointments.length ? appointments.map(item => <TimelineItem key={item.id} icon="▶" label={item.status} title={`Consultation with ${item.doctor?.full_name || 'your doctor'}`} meta={`${new Date(item.scheduled_at).toLocaleString()} · ${item.reason || 'No reason supplied'}`} action="Open" href="#/patient/consultations" />) : <Empty text="No appointments have been saved yet." />}</div></section>
      <aside className="care-rail"><section className="specialist-panel"><span className="panel-kicker">VERIFIED CARE NETWORK</span><h2>Find the right specialist</h2><p>Browse doctors who are verified and active in the MedLink database.</p><a className="specialist-search" href="#/patient/doctors"><span>⌕</span> Specialty or doctor name</a><a className="specialist-button" href="#/patient/doctors">Search doctors <span>→</span></a></section><section className="records-panel"><div className="section-title-row"><div><p className="eyebrow">RECORDS</p><h2>Latest reports</h2></div><a href="#/patient/reports">View all</a></div>{reportRows.length ? reportRows.map(report => <Report key={report.id} title={report.title} date={new Date(report.created_at).toLocaleDateString()} />) : <Empty text="No medical reports have been saved yet." />}</section></aside>
    </div>{notice && <p className="auth-message">{notice}</p>}
  </main></AppLayout>
}

function TimelineItem({ icon, label, title, meta, action, href }: { icon: string; label: string; title: string; meta: string; action: string; href: string }) { return <article className="timeline-item"><span className="timeline-icon">{icon}</span><div><small>{label}</small><h3>{title}</h3><p>{meta}</p></div><a href={href}>{action} <span>→</span></a></article> }
function Report({ title, date }: { title: string; date: string }) { return <a className="report-row-v2" href="#/patient/reports"><span className="report-document">▤</span><div><b>{title}</b><small>{date}</small></div></a> }
function Empty({ text }: { text: string }) { return <p className="dashboard-empty">{text}</p> }
