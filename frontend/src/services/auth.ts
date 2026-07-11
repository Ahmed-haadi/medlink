import type { Profile, UserRole } from '../types/auth'
import { supabase } from './supabase'

type PatientSignUp = { fullName: string; email: string; password: string }
type DoctorSignUp = PatientSignUp & { university: string; licenseNumber?: string; specialization: string; certificate: File }

export async function signUpPatient(input: PatientSignUp) {
  return supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.fullName, account_type: 'patient' } },
  })
}

export async function signUpDoctor(input: DoctorSignUp) {
  const result = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        account_type: 'doctor',
        university: input.university,
        license_number: input.licenseNumber,
        specialization: input.specialization,
      },
    },
  })
  if (result.error || !result.data.user) return result

  const certificatePath = `${result.data.user.id}/${crypto.randomUUID()}-${input.certificate.name}`
  const { error: uploadError } = await supabase.storage.from('certificates').upload(certificatePath, input.certificate)
  if (uploadError) throw uploadError
  const { error: verificationError } = await supabase.from('doctor_verifications').insert({
    doctor_id: result.data.user.id,
    certificate_path: certificatePath,
    university: input.university,
    license_number: input.licenseNumber || null,
    specialization: input.specialization,
  })
  if (verificationError) throw verificationError
  return result
}

export async function signIn(email: string, password: string): Promise<Profile> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, status, full_name')
    .eq('id', data.user.id)
    .single()
  if (profileError) throw profileError
  return profile as Profile
}

export function dashboardPathFor(role: UserRole) {
  return `#/${role}/dashboard`
}
