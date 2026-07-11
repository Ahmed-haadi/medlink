import AppLayout from '../../components/AppLayout'
import { Card, Metric, Topbar } from '../../components/DashboardUi'

export default function PatientDashboard() {
  return <AppLayout role="patient"><Topbar /><main className="dashboard">
    <div className="welcome-row"><div><p className="eyebrow">YOUR HEALTH OVERVIEW</p><h1>Welcome back, Sarah.</h1><p>Your health journey is looking great today. You have 2 notifications.</p></div><button className="primary">▣ Schedule Appointment</button></div>
    <div className="dashboard-grid patient-grid"><div><Card title="Recent Activities" className="activities"><a>View All</a><div className="two-up"><div className="activity">▣ <b>Upcoming video call</b><span>Dr. Aisha Thorne · 2:00 PM</span><em>Join Meeting →</em></div><div className="activity">▤ <b>New prescription</b><span>Amoxicillin 500mg · Available</span><em>Pharmacy Link ↗</em></div></div></Card><div className="metrics-row"><Metric label="♡ Heart Rate" value="72 bpm" accent="red" /><Metric label="⌁ BP" value="120/80" note="• Normal Range" /><Metric label="☾ Sleep" value="8.5 hrs" note="Deep sleep: 2.5 hrs" /></div></div><aside><Card className="find-card"><h2>Find a Specialist</h2><p>Search from over 2,000 verified doctors worldwide.</p><div className="dark-search">⌕ Specialty or Doctor Name</div><button className="primary">Search Now</button><small>● ● ● ● Available now</small></Card><Card title="Latest Reports"><ul className="report-list"><li><b>Comprehensive Blood Panel</b><span>Updated 2 days ago</span></li><li><b>Annual Physical Summary</b><span>Updated Oct 12, 2023</span></li></ul><button className="outline">View Records Vault</button></Card></aside></div>
  </main></AppLayout>
}

