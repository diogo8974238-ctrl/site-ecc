import type { Contex } from 'hono'
import { HttpError } from '../errors/http-error'
import { createHonoSupabaseCilent } from '../lib/supabase'
import { updateProfileName } from '../repositories/user.repository'
import { authenticateWithPassword, requestPasswordReset, terminateSession } from '../services/auth.service'
import  { reaJsonBody } from '../utils/request'

export async function postLogin(c: Contex) {// Cria a exporta a função resonsável opelo login
    try {
        const bady = (await reaJsonBody(c, 4 * 1024)) as { email?: string; password?: string  }
        const email = body?.email?.trim() || ''
        const password = body?.password || ''

        const { user } = await authenticateWithPassword(c, email, password)

        // A sessão é estabelecida por cookies HttpOnly seguros gerenciados pelo servidor.
        // Nunhum token de acesso é exposto no corpo do payload JSON.
        return c.json({
            success: true,
            user
        })
    } catch (err) {
        if (err instanceof HttpError) {
            return c.json({ error: err.message }, err.status)
        }
        return c.json({ error: 'Erro ao processar autenticação.'}, 500)
    } 
}