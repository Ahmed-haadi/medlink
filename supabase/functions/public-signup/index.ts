import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await request.json();
    const { role, email, password, fullName, university, specialization, licenseNumber } = body;
    if (!["patient", "doctor"].includes(role)) throw new Error("Invalid account type");
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address");
    if (typeof password !== "string" || password.length < 8) throw new Error("Password must contain at least 8 characters");
    if (typeof fullName !== "string" || fullName.trim().length < 2) throw new Error("Full name is required");
    if (role === "doctor" && (!university?.trim() || !specialization?.trim())) throw new Error("University and specialization are required");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await admin.auth.admin.createUser({ email: email.trim().toLowerCase(), password, email_confirm: true, user_metadata: { full_name: fullName.trim(), account_type: role, university: university?.trim() || null, specialization: specialization?.trim() || null, license_number: licenseNumber?.trim() || null } });
    if (error) return json({ error: /already|registered|exists/i.test(error.message) ? "An account with this email already exists." : error.message }, /already|registered|exists/i.test(error.message) ? 409 : 400);
    return json({ userId: data.user.id }, 201);
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Unable to create account" }, 400); }
});
function json(body: unknown, status: number) { return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } }); }
