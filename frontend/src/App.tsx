import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import PatientDashboard from './pages/patient/PatientDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import PatientModule from './pages/patient/PatientModule'
import DoctorModule from './pages/doctor/DoctorModule'
import AdminModule from './pages/admin/AdminModule'
import ReportsPage from './pages/ReportsPage'
import LandingPage from './pages/LandingPage'
import './styles.css'
import './clinical-theme.css'
import './landing-fixes.css'

export default function App() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const updateRoute = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  if (!route || route === '#' || route === '#/' || ['#hero', '#features', '#about', '#contact'].includes(route) || route.startsWith('#/landing/')) return <LandingPage />
  if (route === '#/login') return <AuthPage initialMode="login" />
  if (route === '#/signup/patient') return <AuthPage initialMode="patient-signup" />
  if (route === '#/signup/doctor') return <AuthPage initialMode="doctor-signup" />
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
