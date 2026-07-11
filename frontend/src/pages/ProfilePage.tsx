import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import AppLayout from '../components/AppLayout'
import { changeMyPassword, getMyProfile, removeMyAvatar, updateMyProfile, uploadMyAvatar, type ProfileDetails } from '../services/profile'
import type { UserRole } from '../types/auth'

const emptyProfile: ProfileDetails = { id: '', email: '', full_name: '', role: 'patient', status: '', phone: '', date_of_birth: '', gender: '', preferred_language: 'en', avatar_path: null }

export default function ProfilePage({ role }: { role: UserRole }) {
  const [profile, setProfile] = useState(emptyProfile)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [passwords, setPasswords] = useState({ password: '', confirmation: '' })
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => { getMyProfile().then(result => { setProfile(result.profile); setAvatarUrl(result.avatarUrl) }).catch(error => setNotice({ kind: 'error', text: error.message })).finally(() => setLoading(false)) }, [])
  const initials = profile.full_name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U'

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice(null)
    try { await updateMyProfile(profile); setNotice({ kind: 'success', text: 'Your profile information has been updated.' }) }
    catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Unable to update profile.' }) }
    finally { setBusy(false) }
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return
    setAvatarBusy(true); setNotice(null)
    try { const uploaded = await uploadMyAvatar(file, profile.avatar_path); setProfile(value => ({ ...value, avatar_path: uploaded.path })); setAvatarUrl(uploaded.avatarUrl); setNotice({ kind: 'success', text: 'Profile photo updated.' }) }
    catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Unable to upload photo.' }) }
    finally { setAvatarBusy(false); event.target.value = '' }
  }

  async function removeAvatar() {
    if (!profile.avatar_path) return
    setAvatarBusy(true); setNotice(null)
    try { await removeMyAvatar(profile.avatar_path); setProfile(value => ({ ...value, avatar_path: null })); setAvatarUrl(''); setNotice({ kind: 'success', text: 'Profile photo removed.' }) }
    catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Unable to remove photo.' }) }
    finally { setAvatarBusy(false) }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(null)
    if (passwords.password.length < 8) return setNotice({ kind: 'error', text: 'Password must contain at least 8 characters.' })
    if (passwords.password !== passwords.confirmation) return setNotice({ kind: 'error', text: 'The new passwords do not match.' })
    setBusy(true)
    try { await changeMyPassword(passwords.password); setPasswords({ password: '', confirmation: '' }); setNotice({ kind: 'success', text: 'Your password has been changed securely.' }) }
    catch (error) { setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Unable to change password.' }) }
    finally { setBusy(false) }
  }

  return <AppLayout role={role}><main className="feature-page profile-page">
    <p className="eyebrow">ACCOUNT SETTINGS</p><h1>Profile</h1><p className="feature-note">Manage your personal information, profile photo, and account security.</p>
    {notice && <div className={`profile-notice ${notice.kind}`} role="status">{notice.text}</div>}
    {loading ? <section className="module-card profile-loading">Loading your profile…</section> : <>
      <section className="module-card profile-identity">
        <div className="profile-avatar">{avatarUrl ? <img src={avatarUrl} alt={`${profile.full_name || 'User'} avatar`} /> : <span>{initials}</span>}</div>
        <div className="profile-identity-copy"><h2>{profile.full_name || 'MedLink user'}</h2><p>{profile.email}</p><div><span className="profile-chip">{profile.role}</span><span className={`profile-chip ${profile.status}`}>{profile.status}</span></div></div>
        <div className="avatar-actions"><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} hidden /><button className="primary" type="button" disabled={avatarBusy} onClick={() => fileInput.current?.click()}>{avatarBusy ? 'Working…' : avatarUrl ? 'Change photo' : 'Upload photo'}</button>{avatarUrl && <button className="outline" type="button" disabled={avatarBusy} onClick={removeAvatar}>Remove</button>}<small>JPG, PNG, or WebP · maximum 5 MB</small></div>
      </section>
      <div className="profile-grid">
        <section className="module-card"><div className="profile-section-heading"><span>01</span><div><h2>Personal information</h2><p>Update the details shown across MedLink.</p></div></div>
          <form className="profile-form" onSubmit={saveProfile}>
            <label className="field-wide">Full name<input required value={profile.full_name} onChange={event => setProfile(value => ({ ...value, full_name: event.target.value }))} /></label>
            <label className="field-wide">Email address<input type="email" value={profile.email} disabled /><small>Email changes require support verification.</small></label>
            <label>Phone number<input type="tel" value={profile.phone} onChange={event => setProfile(value => ({ ...value, phone: event.target.value }))} placeholder="+39 000 000 0000" /></label>
            <label>Date of birth<input type="date" value={profile.date_of_birth} onChange={event => setProfile(value => ({ ...value, date_of_birth: event.target.value }))} /></label>
            <label>Gender<select value={profile.gender} onChange={event => setProfile(value => ({ ...value, gender: event.target.value }))}><option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></label>
            <label>Preferred language<select value={profile.preferred_language} onChange={event => setProfile(value => ({ ...value, preferred_language: event.target.value }))}><option value="en">English</option><option value="it">Italiano</option><option value="de">Deutsch</option><option value="ar">العربية</option></select></label>
            <button className="primary field-wide" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
          </form>
        </section>
        <section className="module-card"><div className="profile-section-heading"><span>02</span><div><h2>Password & security</h2><p>Use at least 8 characters for your new password.</p></div></div>
          <form className="profile-form password-form" onSubmit={changePassword}>
            <label className="field-wide">New password<input type="password" minLength={8} autoComplete="new-password" value={passwords.password} onChange={event => setPasswords(value => ({ ...value, password: event.target.value }))} required /></label>
            <label className="field-wide">Confirm new password<input type="password" minLength={8} autoComplete="new-password" value={passwords.confirmation} onChange={event => setPasswords(value => ({ ...value, confirmation: event.target.value }))} required /></label>
            <button className="primary field-wide" disabled={busy}>{busy ? 'Updating…' : 'Change password'}</button>
          </form>
          <div className="security-note"><b>Protected account</b><p>Your password is updated through Supabase Auth and is never stored in the MedLink profile table.</p></div>
        </section>
      </div>
    </>}
  </main></AppLayout>
}
