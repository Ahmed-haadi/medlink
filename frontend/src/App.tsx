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
  if (route === '#/patient/care') return <PatientModule />
  if (route === '#/doctor/workspace') return <DoctorModule />
  if (route === '#/admin/manage') return <AdminModule />
  if (route === '#/reports') return <ReportsPage />
  return <AuthPage />
}
