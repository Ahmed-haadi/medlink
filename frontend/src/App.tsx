import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import PatientDashboard from './pages/patient/PatientDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import PatientModule from './pages/patient/PatientModule'
import DoctorModule from './pages/doctor/DoctorModule'
import AdminModule from './pages/admin/AdminModule'
import ReportsPage from './pages/ReportsPage'
import './styles.css'
import './clinical-theme.css'

export default function App() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const updateRoute = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  if (route === '#/patient/dashboard') return <PatientDashboard />
  if (route === '#/doctor/dashboard') return <DoctorDashboard />
  if (route === '#/admin/dashboard') return <AdminDashboard />
  if (route.startsWith('#/patient/doctors') || route.startsWith('#/patient/consultations') || route.startsWith('#/patient/discussions')) return <PatientModule />
  if (route.startsWith('#/doctor/consultations') || route.startsWith('#/doctor/discussions') || route.startsWith('#/doctor/tools')) return <DoctorModule />
  if (route === '#/admin/tools') return <AdminModule view="tools" />
  if (route === '#/admin/users') return <AdminModule view="users" />
  if (route === '#/admin/verifications') return <AdminModule view="verifications" />
  if (route === '#/admin/analytics') return <AdminModule view="analytics" />
  if (route === '#/admin/moderation') return <AdminModule view="moderation" />
  if (route === '#/patient/reports' || route === '#/reports') return <ReportsPage role="patient" />
  if (route === '#/doctor/reports') return <ReportsPage role="doctor" />
  return <AuthPage />
}
