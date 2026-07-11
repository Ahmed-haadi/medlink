import { useEffect, useMemo, useRef, useState } from 'react'
import AppLayout from '../../components/AppLayout'
import { doctors, requestAppointment } from '../../services/modules'

export default function PatientModule() {
  const [list, setList] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [recording, setRecording] = useState(false)
  const recorder = useRef<MediaRecorder | null>(null)

  useEffect(() => {
    doctors().then(setList).catch(error => setMessage(error instanceof Error ? error.message : 'Unable to load doctors.')).finally(() => setLoading(false))
  }, [])

  const visibleDoctors = useMemo(() => {
    const term = search.trim().toLowerCase()
    return term ? list.filter(doctor => `${doctor.full_name} ${doctor.specialization} ${doctor.university}`.toLowerCase().includes(term)) : list
  }, [list, search])

  async function book(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fields = new FormData(form)
    setSubmitting(true)
    try {
      await requestAppointment(String(fields.get('doctor')), String(fields.get('time')), String(fields.get('reason')))
      form.reset(); setSelectedDoctor(''); setMessage('Appointment request sent to the doctor.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to request appointment.') }
    finally { setSubmitting(false) }
  }

  async function record() {
    if (recording) { recorder.current?.stop(); setRecording(false); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream); const chunks: Blob[] = []
      mediaRecorder.ondataavailable = event => chunks.push(event.data)
      mediaRecorder.onstop = () => { stream.getTracks().forEach(track => track.stop()); setMessage(`Voice note recorded (${Math.ceil(new Blob(chunks).size / 1024)} KB). Select a conversation to send it.`) }
      mediaRecorder.start(); recorder.current = mediaRecorder; setRecording(true)
    } catch { setMessage('Microphone permission is required for voice notes.') }
  }

  return <AppLayout role="patient"><main className="feature-page"><p className="eyebrow">PATIENT CARE</p><h1>Find care and manage consultations</h1><p className="feature-note">Choose an approved MedLink doctor and send an appointment request.</p>
    <div className="module-grid doctor-booking-grid"><section className="module-card doctor-directory"><div className="section-heading"><h2>Verified doctors</h2><span>{list.length} available</span></div><input className="doctor-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, specialty, or university" />
      <div className="doctor-list">{loading ? <p className="dashboard-empty">Loading verified doctors…</p> : visibleDoctors.length ? visibleDoctors.map(doctor => <button type="button" className={`doctor-card ${selectedDoctor === doctor.id ? 'selected' : ''}`} key={doctor.id} onClick={() => setSelectedDoctor(doctor.id)}><span className="doctor-avatar">{initials(doctor.full_name)}</span><span><b>{doctor.full_name}</b><small>{doctor.specialization || 'Medical specialist'}</small><em>{doctor.university || 'University not supplied'}</em></span><i>Verified</i></button>) : <p className="dashboard-empty">No approved doctors match your search.</p>}</div>
    </section><section className="module-card appointment-card"><h2>Request appointment</h2><form className="module-form" onSubmit={book}><label>Doctor<select name="doctor" required value={selectedDoctor} onChange={event => setSelectedDoctor(event.target.value)}><option value="">Choose a doctor</option>{list.map(doctor => <option value={doctor.id} key={doctor.id}>{doctor.full_name} — {doctor.specialization}</option>)}</select></label><label>Date and time<input name="time" type="datetime-local" required /></label><label>Reason for consultation<textarea name="reason" placeholder="Briefly describe why you need the consultation" required /></label><button className="primary" disabled={submitting || !list.length}>{submitting ? 'Sending request…' : 'Send request'}</button></form></section></div>
    <div className="module-grid"><section className="module-card"><h2>Secure chat & file sharing</h2><p>Messages and attachments are stored inside your doctor conversation. Files are private and visible only to its participants.</p><button className="outline" onClick={() => setMessage('Open an approved consultation from your dashboard to send chat messages and files.')}>Consultation messaging</button></section><section className="module-card"><h2>Voice & video consultation</h2><button className="primary" onClick={record}>{recording ? '■ Stop voice note' : '● Record voice note'}</button><button className="outline" onClick={() => setMessage('Video consultation requires a configured video provider.')}>▣ Start video consultation</button></section></div>{message && <p className="auth-message">{message}</p>}
  </main></AppLayout>
}

function initials(name?: string) { return String(name || 'DR').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() }
