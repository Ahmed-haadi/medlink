import { FormEvent, useState } from 'react'
import { dashboardPathFor, signIn, signUpDoctor, signUpPatient } from '../services/auth'

type Mode = 'login' | 'patient-signup' | 'doctor-signup'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email'))
    const password = String(data.get('password'))

    try {
      if (mode === 'login') {
        const profile = await signIn(email, password)
        window.location.hash = dashboardPathFor(profile.role)
      } else if (mode === 'patient-signup') {
        await signUpPatient({ fullName: String(data.get('fullName')), email, password })
        setMessage('Patient account created. Please confirm your email before signing in.')
      } else {
        await signUpDoctor({
          fullName: String(data.get('fullName')), email, password,
          university: String(data.get('university')),
          licenseNumber: String(data.get('licenseNumber') || ''),
          specialization: String(data.get('specialization')),
          certificate: data.get('certificate') as File,
        })
        setMessage('Doctor account submitted. It remains pending until an admin verifies it.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    }
  }

  const signingUp = mode !== 'login'
  const doctor = mode === 'doctor-signup'
  return <main className="auth-page">
    <section className="auth-panel">
      <a className="auth-brand" href="#/">▣ <span>MedLink</span></a>
      <div className="auth-copy"><p className="eyebrow">SECURE TELEMEDICINE PORTAL</p><h1>{mode === 'login' ? 'Welcome back.' : doctor ? 'Join as a doctor.' : 'Create your account.'}</h1><p>{mode === 'login' ? 'Sign in to manage your health journey.' : doctor ? 'Submit your details for secure credential verification.' : 'Start connecting with verified healthcare professionals.'}</p></div>
      <form className="auth-form" onSubmit={submit}>
      {signingUp && <label>Full name<input name="fullName" placeholder="e.g. Sarah Mitchell" required /></label>}
      <label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label>
      <label>Password<input name="password" type="password" placeholder="Minimum 8 characters" minLength={8} required /></label>
      {doctor && <>
        <label>University<input name="university" placeholder="University name" required /></label>
        <label>Specialization<input name="specialization" placeholder="e.g. Cardiology" required /></label>
        <label>License number <small>(optional)</small><input name="licenseNumber" placeholder="Medical license number" /></label>
        <label>Degree or certificate<input name="certificate" type="file" accept="application/pdf,image/jpeg,image/png" required /></label>
      </>}
      <button className="auth-submit" type="submit">{mode === 'login' ? 'Sign in securely' : 'Create account'}</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      <div className="auth-switch">{mode !== 'login' && <button onClick={() => setMode('login')}>Already have an account? <b>Login</b></button>}{mode === 'login' && <><button onClick={() => setMode('patient-signup')}>New patient? <b>Create account</b></button><button onClick={() => setMode('doctor-signup')}>Healthcare professional? <b>Join as doctor</b></button></>}</div>
    </section>
    <aside className="auth-visual"><div className="visual-card"><span>MEDLINK CARE</span><h2>Care that feels connected.</h2><p>Find verified specialists, manage your records, and consult securely from anywhere.</p><div className="visual-stats"><b>2,000+<small>Verified doctors</small></b><b>24/7<small>Care access</small></b></div></div></aside>
  </main>
}
