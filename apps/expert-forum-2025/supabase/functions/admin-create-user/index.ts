/**
 * Admin Create User Edge Function
 *
 * Server-side function to create users using admin privileges.
 * This is necessary because auth.admin.createUser() requires service role key,
 * which cannot be exposed in client-side code.
 *
 * @see PRD.md Section 9.2.2 (Participant Management - Create)
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateUserRequest {
  name: string
  email: string
  participant_type: 'online' | 'offline'
  company?: string
  division?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get authenticated user from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify the user is authenticated and is an admin
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const body: CreateUserRequest = await req.json()
    const { name, email, participant_type, company, division } = body

    // Validate required fields
    if (!name || !email || !participant_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, participant_type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get default password from env
    const password = Deno.env.get('PARTICIPANT_DEFAULT_PASSWORD') || 'expertforum2025'

    // Create auth user
    const { data: authData, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: name,
        },
      })

    if (createAuthError || !authData.user) {
      return new Response(
        JSON.stringify({
          error: createAuthError?.message || 'Failed to create auth user',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create database record
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_id: authData.user.id,
        name: name,
        email: email,
        role: 'participant',
        participant_type: participant_type,
        company: company || null,
        division: division || null,
        is_checked_in: false,
        is_eligible_to_draw: false,
      })
      .select()
      .single()

    if (dbError) {
      // Rollback: delete auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: dbError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ data: dbUser }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in admin-create-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
