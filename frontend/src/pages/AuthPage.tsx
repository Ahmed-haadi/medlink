import { FormEvent, useState } from 'react'
import { dashboardPathFor, signIn, signUpDoctor, signUpPatient } from '../services/auth'

type Mode = 'login' | 'patient-signup' | 'doctor-signup'
type SuccessState = { title: string; body: string; detail: string } | null

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<SuccessState>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const form = event.currentTarget
    setMessage('')
    setSubmitting(true)
    const data = new FormData(form)
    const email = String(data.get('email'))
    const password = String(data.get('password'))

    try {
      if (mode === 'login') {
        const profile = await signIn(email, password)
        window.location.hash = dashboardPathFor(profile.role)
      } else if (mode === 'patient-signup') {
        const result = await signUpPatient({ fullName: String(data.get('fullName')), email, password })
        if (result.error) throw result.error
        form.reset()
        setSuccess({ title: 'Account created successfully', body: 'Your patient account has been submitted.', detail: 'Please confirm your email address, then return to MedLink to sign in.' })
      } else {
        const result = await signUpDoctor({
          fullName: String(data.get('fullName')), email, password,
          university: String(data.get('university')),
          licenseNumber: String(data.get('licenseNumber') || ''),
          specialization: String(data.get('specialization')),
          certificate: data.get('certificate') as File,
        })
        if (result.error) throw result.error
        form.reset()
        setSuccess({ title: 'Application received', body: 'Thank you for joining MedLink as a healthcare professional.', detail: 'Our admin team will review your credentials. You will receive access to the doctor workspace after your account is verified.' })
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  function changeMode(nextMode: Mode) { setMode(nextMode); setMessage(''); setSuccess(null) }
  function closeSuccess() { setSuccess(null); changeMode('login') }

  const signingUp = mode !== 'login'
  const doctor = mode === 'doctor-signup'
  return <main className="auth-page">
    <section className="auth-panel">
      <a className="auth-brand" href="#/">▣ <span>MedLink</span></a>
      <div className="auth-copy"><p className="eyebrow">SECURE TELEMEDICINE PORTAL</p><h1>{mode === 'login' ? 'Welcome back.' : doctor ? 'Join as a doctor.' : 'Create your account.'}</h1><p>{mode === 'login' ? 'Sign in to manage your health journey.' : doctor ? 'Submit your details for secure credential verification.' : 'Start connecting with verified healthcare professionals.'}</p></div>
      <form className="auth-form" onSubmit={submit}>
      {signingUp && <label>Full name<input name="fullName" placeholder="Enter your full name" required /></label>}
      <label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label>
      <label>Password<input name="password" type="password" placeholder="Minimum 8 characters" minLength={8} required /></label>
      {doctor && <>
        <label>University<input name="university" placeholder="University name" required /></label>
        <label>Specialization<input name="specialization" placeholder="e.g. Cardiology" required /></label>
        <label>License number <small>(optional)</small><input name="licenseNumber" placeholder="Medical license number" /></label>
        <label>Degree or certificate<input name="certificate" type="file" accept="application/pdf,image/jpeg,image/png" required /></label>
      </>}
      <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? <><span className="button-spinner" /> Submitting…</> : mode === 'login' ? 'Sign in securely' : 'Create account'}</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      <div className="auth-switch">{mode !== 'login' && <button onClick={() => changeMode('login')}>Already have an account? <b>Login</b></button>}{mode === 'login' && <><button onClick={() => changeMode('patient-signup')}>New patient? <b>Create account</b></button><button onClick={() => changeMode('doctor-signup')}>Healthcare professional? <b>Join as doctor</b></button></>}</div>
    </section>
    <aside className="auth-visual"><div className="visual-card"><span>MEDLINK CARE</span><h2>Care that feels connected.</h2><p>Find verified specialists, manage your records, and consult securely from anywhere.</p></div></aside>
    {success && <div className="success-modal-backdrop" role="presentation"><section className="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title"><div className="success-check">✓</div><p className="eyebrow">SUBMISSION COMPLETE</p><h2 id="success-title">{success.title}</h2><p>{success.body}</p><div className="verification-notice"><span>⌛</span><div><b>{mode === 'doctor-signup' ? 'Verification in progress' : 'Email confirmation required'}</b><small>{success.detail}</small></div></div><button className="auth-submit" onClick={closeSuccess}>Return to login</button></section></div>}
  </main>
}
