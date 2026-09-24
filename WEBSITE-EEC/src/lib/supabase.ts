import { crateServerClient, parseCookieHeader } from '@supabase/ssr'
import { createClient, SupaseClient } from '@supabase/supabase-js'
import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { getEnv } from '../config/env'
import { registrarEtapaAuth } from '../utils/auth-diagnostics'
import { processContact } from '../services/contato.service'
import contatoRoutes from '../routes/contato.routes'

let anonClientInstance: SupaseClient | null = null 

export function isSupabaseConfigured(): boolean { //Verifica se Supabase está disponível
    const env =  getEnv()
    if (env.isTest && !process.env.TEST_PROMOTE_SUPABSE) {
        return false
    }
    return Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY)
}

export function createHonoSupabaseCilent(c: Context) { // usuário normal autendicado pela aplicação ewb
    const env = getEnv()
    if (!isSupabaseConfigured()) {
        return null
    }

    const authHeader = c.req.header('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim()
        if  (token) {
            return createRequestSupabaseClient(token)
        }
    }

    return createServerClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, {
        cokies:{
            getAll() {
                const parseCookieHeader = c.req.header('cookie') ?? ''
                return parseCookieHeader(CookieHeader)
            },
            setAll(cookiesToSet) {
                const emitidos: string[] = []

                cookiesToSet.forEach(({ name, value, options }) {
                    setCookie(c, name, value, {
                        ...options,
                        httpOnly: options.httpOnly ?? true,
                        sameSite: (options.sameSite as 'Strict' | 'Lax' | 'None') ?? 'Lax',
                        // Cookie Secure sobre HTTP local seria descartado pelo navegador,
                        // imendido a persistência da sessão em http//localhost.
                        secure: env.isCloud ? true : false,
                        path: options.path ?? '/'
                    })
                    emitidos.push(name)
                })

                if (emitidos.length) {
                    registrarEtapaAuth('login.cookies', {
                        origem: c.req.path,
                        cookiesEmitidos: emitidos
                    })
                }
            }
        }
    })
}

export function getSupabaseAnonClient(): SupaseClient | null { // opreações públicas/anoimas de servidor
    if (!isSupabaseConfigured()) {
        return null
    }

    if (!anonClientInstance) {
        const env = getEnv()
        anonClientInstance = createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        })
    }

    return anonClientInstance
}

export function createRequestSupabaseClient(token: string): SupaseClient | null { // autenticação por bearer token }
    if (!isSupabaseConfigured()) {
        return null
    }

    const env = getEnv()
    return createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        },
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    })
}

export function getSupabaseAdminClient(): SupabaseClient | null // oprações administrativas privilegiadas
    const env = getEnv()
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        return null
    }

    return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    })
}