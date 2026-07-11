import type { Profile, UserRole } from '../types/auth'
import { supabase } from './supabase'

type PatientSignUp = { fullName: string; email: string; password: string }
type DoctorSignUp = PatientSignUp & { university: string; licenseNumber?: string; specialization: string; certificate: File }
type SignupOutcome = { error: Error | null }

async function createAccount(input: PatientSignUp & { role: 'patient' | 'doctor'; university?: string; licenseNumber?: string; specialization?: string }) {
  const { data, error } = await supabase.functions.invoke<{ userId?: string; error?: string }>('public-signup', { body: input })
  if (error) throw new Error(data?.error || 'Unable to create your account. Please try again.')
  if (data?.error) throw new Error(data.error)
  return data?.userId
}

export async function signUpPatient(input: PatientSignUp): Promise<SignupOutcome> {
  try {
    await createAccount({ ...input, role: 'patient' })
    const { error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password })
    if (error) throw error
    await supabase.auth.signOut()
    return { error: null }
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Unable to create account.') }
  }
}

export async function signUpDoctor(input: DoctorSignUp): Promise<SignupOutcome> {
  try {
    const { certificate: _certificate, ...accountInput } = input
    let userId: string | undefined
    let accountCreationError: unknown

    try {
      userId = await createAccount({ ...accountInput, role: 'doctor' })
    } catch (error) {
      accountCreationError = error
    }

    const { data: session, error: signInError } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password })
    if (signInError) throw accountCreationError || signInError

    const doctorId = userId || session.user.id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', doctorId)
      .single()

    if (profileError) throw profileError
    if (profile.role !== 'doctor') throw new Error('This email belongs to a non-doctor account.')

    const { data: existingVerification, error: existingVerificationError } = await supabase
      .from('doctor_verifications')
      .select('id')
      .eq('doctor_id', doctorId)
      .maybeSingle()

    if (existingVerificationError) throw existingVerificationError
    if (existingVerification) {
      await supabase.auth.signOut()
      return { error: null }
    }

    const safeName = input.certificate.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const certificatePath = `${doctorId}/${crypto.randomUUID()}-${safeName}`
    const { error: uploadError } = await supabase.storage.from('certificates').upload(certificatePath, input.certificate)
    if (uploadError) throw uploadError
    const { error: verificationError } = await supabase.from('doctor_verifications').insert({ doctor_id: doctorId, certificate_path: certificatePath, university: input.university, license_number: input.licenseNumber || null, specialization: input.specialization })
    if (verificationError) {
      await supabase.storage.from('certificates').remove([certificatePath])
      throw verificationError
    }
    await supabase.auth.signOut()
    return { error: null }
  } catch (error) {
    await supabase.auth.signOut()
    return { error: error instanceof Error ? error : new Error('Unable to submit doctor application.') }
  }
}

export async function signIn(email: string, password: string): Promise<Profile> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  const { data: profile, error: profileError } = await supabase.from('profiles').select('id, role, status, full_name').eq('id', data.user.id).single()
  if (profileError) throw profileError
  return profile as Profile
}

export function dashboardPathFor(role: UserRole) { return `#/${role}/dashboard` }
