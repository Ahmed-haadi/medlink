import { supabase } from './supabase'

export type ProfileDetails = {
  id: string; email: string; full_name: string; role: 'patient' | 'doctor' | 'admin'; status: string
  phone: string; date_of_birth: string; gender: string; preferred_language: string; avatar_path: string | null
}
export type ProfileUpdate = Pick<ProfileDetails, 'full_name' | 'phone' | 'date_of_birth' | 'gender' | 'preferred_language'>

async function signedAvatar(path: string | null) {
  if (!path) return ''
  const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function getMyProfile(): Promise<{ profile: ProfileDetails; avatarUrl: string }> {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) throw authError ?? new Error('Please sign in first.')
  const { data, error } = await supabase.from('profiles').select('id, full_name, role, status, phone, date_of_birth, gender, preferred_language, avatar_path').eq('id', authData.user.id).single()
  if (error) throw error
  const profile: ProfileDetails = { ...data, email: authData.user.email ?? '', full_name: data.full_name ?? '', phone: data.phone ?? '', date_of_birth: data.date_of_birth ?? '', gender: data.gender ?? '', preferred_language: data.preferred_language ?? 'en' }
  return { profile, avatarUrl: await signedAvatar(profile.avatar_path) }
}

export async function updateMyProfile(values: ProfileUpdate) {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) throw authError ?? new Error('Please sign in first.')
  const { error } = await supabase.from('profiles').update({ full_name: values.full_name.trim(), phone: values.phone.trim() || null, date_of_birth: values.date_of_birth || null, gender: values.gender || null, preferred_language: values.preferred_language || 'en' }).eq('id', authData.user.id)
  if (error) throw error
}

export async function uploadMyAvatar(file: File, previousPath: string | null) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP image.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Avatar must be smaller than 5 MB.')
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) throw authError ?? new Error('Please sign in first.')
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${authData.user.id}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError
  const { error: updateError } = await supabase.from('profiles').update({ avatar_path: path }).eq('id', authData.user.id)
  if (updateError) { await supabase.storage.from('avatars').remove([path]); throw updateError }
  if (previousPath) await supabase.storage.from('avatars').remove([previousPath])
  return { path, avatarUrl: await signedAvatar(path) }
}

export async function removeMyAvatar(path: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) throw authError ?? new Error('Please sign in first.')
  const { error } = await supabase.from('profiles').update({ avatar_path: null }).eq('id', authData.user.id)
  if (error) throw error
  const { error: removeError } = await supabase.storage.from('avatars').remove([path])
  if (removeError) throw removeError
}

export async function changeMyPassword(password: string) { const { error } = await supabase.auth.updateUser({ password }); if (error) throw error }
export async function getSignedAvatar(path: string | null) { return signedAvatar(path) }
