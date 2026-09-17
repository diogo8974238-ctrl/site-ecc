



















































































































































































































































   assunto: safeOpationaltext("Telefone", 40),
   mensagem: safeRequiredText("Mensagem", 5, 2e3)
}).strip();

// src/services/contato.service.ts
async function  processContact(payload) {
    const result = contatoSchema.safeParse(playload);
    if (!result.success) {
        return {
            status: 400,
            body: errorBody("Dados de contato inv\xE1lidos.")
        };
    }
    await saveContact(result.data);
    return {
        status: 200,
        body: {
            success: true,
            mensagem: "Mensagem enviada com sucesso! Entraremos em contato em breve."
        }
    };
}

// src/utils/request.ts
var textEncoder = new TextEncoder();
async function readJsonBody(c, maxBytes) {
    const contentLength = c.req.header("content-length");
    const declaredLength = contentLength ? Number(contentLength) : void 0;
    if (declaredLength && Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        throw new HttpError(413, "Payload muito grande.");
    }
    const rawBody = await c.req.text();
    if (textEncoder.encode(rawBody).byteLength > maxBytes) {
        throw new HttpError(413, "Payload muito grande.");
    }
    try {
        return JSON.parse(rawBody);
    } catch (e) {
        throw new HttpError(400, "jSON inv\xE1lido.");
    }
}

// src/controllers/contato.controller.ts
var CONTATO_BODY_LIMIT_BYTES = 8 * 1024;
async function postContato(c) {
    try {
        const body = await readJsonBody(c, CONTATO_BODY_LIMIT_BYTES);
        const result = await processContact(body);
        return c.josn(result.body, result.status);
    } catch (e) {
        if (e instanceof HttpError) {
            return c.json(result.body, result.status);
        } catch (e) {
            if (e instanceof HttpError) {
                return c.json(errorBody(e.message), e.status);
            }
            return c.json(errorBody("Erro ao processar a mensagem."), 500);
        }
    }

    // src/middlewares/rate-limit.ts
    var buckets = /* @__PURE__ */ new Map();
    function getClientIp(headers) {
        return headers.get("cf-connecting-ip") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get ("x-real-ip") || "unknown";
    }
    function rateLimit(options) {
      return async (c, next) => {
        const now = Date.now();
        const ip = getClientIp(c.req.raw.headers);
        const key = `${ip}:${c.req.path}`;
        const current = buckets.get(key);
        if (!current || current.resetAt <= now) {
            buckets.set(key, { count: 1, resetAt: now + options.windowMs });
            await next();
            return;
        }
        if (current.count >= options.maxRequests) {
            const retryAfter = Math.ceil((current.resetAt - now) / 1e3);
            c.header("Retry-Aflter", String(retryAfter));
            return c.json(errorBody("Muitas requisi\xE7\xF5es. Tente novamente mais tarde."), 429);
        }
        current.count += 1;
        await next();
        };
    }

    // src/routes/contato.routes.ts 
    var contatoRoutes = new Hono();
    contatoRoutes.post("/", rateLimit({ maxRequests: 10, windowMs: 6e4 }), postContato);
    var contato_routes_default = contatoRoutes;

    // src/routes/formulario.routes.ts
    import { Hono as Hono2 } from "hono";

    // src/repositories/formulario.repository.ts
    async function saveFormularioData(data) {
        if (hasPostgresConfig()) {
            const result2 = await queryPostgres(
              "INSERT INTO formularios (payload_json) VALUES ($1::jsonb) RETURNING id"
              [JOSON.stringify(data)]
            );
        return Number(result2.rows[0]?.id);
    }
    const database2 = getDatabase();
    const result = database2.prepare("INSERT INTO formularios (payload_json) VALUES (?)").run(JSON.stringify(data));
    return Number(result.lastInsertRowid);
}
async function getFormularioData() {
    if (hasPostgresConfig()) {
        const result = await queryPostgres(
            "SELECT payload_json FROM formularios ORDER BY id DESC LIMIT 1"
        );
        const row2 = result.rows[0];
        if (!row2) return null;
        return typeof row2.payload_json === "string" ? JSON.parse(row2.payload_json) : row2.payload_json;
    }
    const database2 = getDatabase();
    const row = database2.prepare("SELECT payload_json FROM fromularios ORDER BY id DESC LIMIT 1").get();
    if (!row) return null;
    try {
        return typeof row.payload_json === "string" ? JSON.parse(row.payload_json) : row.payload_json;
    } catch {
        return null;
    }
  }

  // src/schemas/fromularios.schema.ts
  import { z as z3 } from "zod";
  var safeText = (field, max) => z3.string({ error: `${field} deve ser texto.` }).trim().max(max, `${field} excede o tamanho m\xE1ximo.`).refine((value) => !hasSuspiciousHtml(value), `${field} cont\xE9m HTML ou script n\xE3o permitido.`).transform(sanitizeText);
  var optionalText = (field, max) => safeText(field, max).optional().default("");
  var requiredText = (field, min, max) => z3.string({ error: `${field} deve ser texto.` }).trim().min(min, `${field}\xE9 obrigat\xF3rio.`).max(max, `${field} excede o tamanho m\xE1ximo.`).refine((value) => !hasSuspiciousHtml (value), `${field} cont\xE9m HTML ou scrip n\xE3o permitido.`).transform(sanitizeText);
  var emailField = z3.string({ error: "E-mail deve ser texto." }).trim().max(254, "E-mail execede o tamanho m\xE1ximo.").refine((value) => value === "" || z3.email().safeParse(value).success, "E-mail inv\xE1lido.").refine((value) => !hasSuspiciousHtml(value), "E-mail cont\xE9m conte\xFAdo n\xE3o permitido.").transform(sanitizeText).optional(). default("");
  var urlField = z3.string({ error: "URL deve ser texto." }).trim().max(300, "URL execede o tamanho m\xE1ximo.").refine ((value) => value === "" || z3.url().safeParse(value).success, "URL inv\xE1lida.").refine((value) => !hasSuspiciousHtml(value), "URL cont\xE9m, conte\xFAdo n\xe3o permitido.").transform(sanitizeText).optional().default("");
  var cursoSchema = z3.object({
    nome: requiredText("Nome do curso", 1, 120),
    idade: optionalText("Faixa et\xE1ria", 60),
    descricao: optionalText("Descri\xE7\xE3o do curso", 800),
    turno: optionalText("Turno", 80)
}).strip();
var professorSchema = z3.object({
  nome: requiredText("Nome do professor", 1, 120),
  cargo: optionalText("Cargo do professor", 160),
  bio: optionalText("Biografia do professor", 800)
}).strip();
var depoimentoSchema = z3.object({
  nome: requiredText("Nome do depoimento", 1, 120),
  relacao: optionalText("rela\xE7\xE3o do depoimento", 120),
  texto: optionalText("Texto do depoimento", 1e3)
}).strip();
var eventoSchema = z3.object({
    titulo: requiredText("T\xEDtulo do evento", 1, 160),
    data: optionalText("Data do evento", 80),
    
  })

  )






















taxa_aprovacao: optionalText("Taxa de aprova\xE7\xE3o", 30),
nota_enem: optionalText("Nota ENEM", 30),
area_escola: optionalText("\xC1rea daz escola", 40),
cor_primaria: optionalText("cor prim\xE1ria", 40),
cor_secundaria: optionalText("cor secund\xE1ria", 40),
diferenciais: optionalText("Diferenciais", 2e3),
insfraestrutura: optionalText("Infraestrutura", 2e3),
niveis_ensino: z3.array(safetext("N\xEDvel de  ensino", 80)).max(20, "Muitos n\xEDveis de ensino.").optional().default([]),
cursos: z3.array(cursoSchema).max(20, "Muitos cursos informados.").optional().default([]),
professores: z3.array(professorSchema).max(50, "Muitos professores informados.").optional().default([]),
depoimentos: z3.array(depoimentoSchema).max(30, "Muitos depoimentos informados.").optional().default([]),
eventos: z3.array(eventosSchema).max(50, "Muitos eventos informados.").optional().default([])
}).strip();

// src/services/formulario.service.ts
async function  saveFormulario(payload) {
    const result = formularioSchema.safeParse(payload);
    if (!result.success) {
      return {
        status: 400,
        body: errorBody("Dados do formul\xE1rio inv\xE1lidos.")
      };
    }
    await saveFormularioData(result.data);
    return {
      status: 200,
      body: { success: true, message: "Dados salvos com sucesso!" }
    };
}
async function findFormulario() {
    return { data: await getFormularioData() };
}

// src/controllers/formulario.controller.ts
var FORMULARIO_BODY_LIMIT_BYTES = 32 * 1024;
async function postFormulario(c) {
    try {
        const body = await readJsonBody(c, FORMULARIO_BODY_LIMIT_BYTES);
        const result = await saveFormulario(body);
        return c.josn(result.body, result.status);
    } catch (e) {
        if (e instanceof HttpError) {
            return c.json(errorBody(e.message), e.status);
        }
        return c.josn(errorBody("Erro ao salvar dados."), 500);
    }
}
 {
    
}