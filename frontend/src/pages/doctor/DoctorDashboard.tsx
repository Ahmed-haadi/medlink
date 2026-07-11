import AppLayout from '../../components/AppLayout'
import { Card, Metric, Topbar } from '../../components/DashboardUi'

const queue = [['SM', 'Sarah Miller', '5 mins ago', 'Chest Pain'], ['JD', 'John Doe', '12 mins ago', 'General Inquiry'], ['EK', 'Elena Kostic', '20 mins ago', 'Prescription Renewal']]
export default function DoctorDashboard() { return <AppLayout role="doctor"><Topbar search="Search patients or records…" /><main className="dashboard">
  <div className="welcome-row"><div><p className="eyebrow">● VERIFIED PHYSICIAN</p><h1>Good morning, Dr. Ahmed.</h1><p>You have 4 pending consultation requests and 2 new discussion updates.</p></div><button className="primary">▣ Start Consultation</button></div>
  <div className="dashboard-grid doctor-grid"><div><Card title="Patient Queue" className="queue-card"><a>4 Requests Active</a>{queue.map(([initials, name, time, issue]) => <div className="patient-row" key={name}><span className="initials">{initials}</span><div><b>{name}</b><small>◷ {time}　•　{issue}</small></div><button className="outline">Details</button><button className="primary compact">Accept</button></div>)}</Card></div><aside><Card title="Peer Consult"><a>View All</a><div className="consult-card"><small>ACTIVE CASE　2h ago</small><b>New Case: Complex Cardiology</b><p>Seeking second opinion on a 65yo male with recurrent syncope…</p><span>DR　LK　AK　 · 3 doctor replies →</span></div></Card><div className="two-up"><Metric label="Daily Total" value="14" note="↑ 12% vs yesterday" /><Metric label="Rating" value="4.9 ★" note="Top 5% locally" /></div><Card className="alert"><b>△ Board Certification Renewal</b><p>Expires in 14 days. Complete your continuing education requirements today.</p></Card></aside></div>
  <Card title="Patient Health Trends" className="chart-card"><div className="bar-chart">{[34, 58, 85, 52, 39, 67, 94, 62, 43].map((height, i) => <span key={i} style={{ height: `${height}%` }} />)}</div></Card>
</main></AppLayout> }

