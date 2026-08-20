import { validateBody } from "./contentCalendar.js"

/**
 * Creative post generator.
 *
 * Template-based, no LLM, no API key. Composes captions from a library of
 * proven post formats (introduction, trend tie-in, behind-the-scenes, client
 * result, pain point) and personalizes them with the client's real profile
 * fields (name, type, description, brand tone, target audience, services,
 * goals) plus the optional campaign theme / recent-work notes supplied per run.
 *
 * The same anti-fabrication guard as the calendar generator applies: every
 * draft passes `validateBody`, so phone numbers, prices, percentages, emails
 * and account numbers are never generated. Candidates that trip the guard are
 * skipped, so user-supplied theme text can never leak a fabricated detail.
 */

export interface GeneratorBusiness {
  id: string
  name: string
  type: string
  description?: string | null
  brand_tone?: string | null
  target_audience?: string | null
  services?: string | null
  goals?: string | null
  brand_colors?: string | null
}

export interface GeneratorOptions {
  theme?: string
  recentWork?: string
  platforms?: string[]
  countPerPlatform?: number
}

export interface GeneratedDraft {
  platform: string
  formatKey: string
  formatName: string
  title: string | null
  body: string
  hashtags: string[]
}

export const GENERATOR_PLATFORMS = ["linkedin", "instagram", "facebook", "x", "threads"] as const
export type GeneratorPlatform = (typeof GENERATOR_PLATFORMS)[number]

interface FormatCtx {
  name: string
  type: string
  description: string
  audience: string
  services: string[]
  goals: string[]
  theme?: string
  recentWork?: string
  platform: GeneratorPlatform
}

type FormatBuild = (ctx: FormatCtx) => { title: string | null; body: string }

interface Format {
  key: string
  name: string
  build: FormatBuild
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseList(raw: string | null | undefined): string[] {
  if (!raw) return []
  const trimmed = raw.trim()
  if (!trimmed) return []
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
  } catch {}
  return trimmed
    .split(/[,\n;]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function clean(raw: string | null | undefined, fallback: string): string {
  return raw && raw.trim().length > 0 ? raw.trim() : fallback
}

function toLower(raw?: string): string {
  return (raw || "").toLowerCase().replace(/\.$/, "")
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

// ─── Hashtags ─────────────────────────────────────────────────────────────────

const CORE_TAGS = ["#BusinessGrowth", "#SME", "#ClientSuccess"]
const TYPE_TAGS: Record<string, string[]> = {
  export: ["#ExportTrade", "#Logistics", "#InternationalTrade"],
  energy: ["#Energy", "#Reliability", "#SupplyChain"],
  trading: ["#Trade", "#Procurement", "#SME"],
  procurement: ["#Procurement", "#SupplyChain", "#VendorManagement"],
  general: ["#GrowthMindset", "#WorkSmarter"],
}

function typeKey(type: string): string {
  const t = type.toLowerCase()
  if (t.includes("export")) return "export"
  if (t.includes("energy")) return "energy"
  if (t.includes("trade")) return "trading"
  if (t.includes("procurement")) return "procurement"
  return "general"
}

function tagsFor(ctx: FormatCtx, platform: GeneratorPlatform): string[] {
  const base = [...(TYPE_TAGS[typeKey(ctx.type)] ?? TYPE_TAGS.general!), ...CORE_TAGS]
  return platform === "x" || platform === "tiktok" ? base.slice(0, 4) : base
}

// ─── Copy pools ───────────────────────────────────────────────────────────────

const HOOKS = [
  "Most teams don't fail at the big decisions. They fail at the ten small ones that follow.",
  "The best work happens quietly, before anyone is watching.",
  "There's a difference between being busy and making progress. It's worth checking which one you're doing.",
  "Nobody plans to cut corners. It just happens, one shortcut at a time.",
  "Every strong relationship — client or supplier — is built on one thing: follow-through.",
  "The uncomfortable question is usually the one that moves the project forward.",
  "Preparation looks boring from the outside and unbeatable from the inside.",
  "A process you can repeat is worth more than a result you can't explain.",
]

const CLIENT_RESULT_LINES = [
  "When a client says 'that part just worked', what they're describing is good preparation.",
  "The smoothest engagements are the ones where nothing surprising happened, because everything expected was handled.",
  "A client who doesn't have to chase for updates is a client who renews.",
  "A good month is usually not one big win — it's twenty small things done on time.",
  "Clients don't celebrate the process. They celebrate the outcome. Our job is to make the process invisible.",
]

const PAIN_LINES = [
  "If your team is constantly firefighting the same problems, the fix isn't more effort — it's structure.",
  "The cost of unclear expectations is paid twice: once in rework, once in trust.",
  "A partner who only shows up after the deadline has cost you more than the invoice shows.",
  "Most delays aren't caused by the work. They're caused by the handoffs between the work.",
  "When communication breaks down, the project doesn't slow down — it silently changes direction.",
]

const TREND_LINES = [
  "Trends come and go, but the fundamentals of good business don't change: clarity, reliability, and follow-through.",
  "There's always a new tool or trend to chase. The teams that win decide what NOT to chase.",
  "A trend is useful when it helps you serve customers better — not when it distracts you from the basics.",
  "The best response to any industry trend is to double down on the thing you're already good at.",
]

const BTS_LINES = [
  "The unglamorous part of the job — checklists, double-checks, follow-up calls — is where the value gets built.",
  "Behind the scenes, a lot of the work is making sure the obvious things are done properly, in the right order.",
  "Most of what we do is boring on purpose. Boring processes are how you get predictable results.",
  "Before anything goes out, it goes through a checklist. Not glamorous — but it's why things work.",
]

// ─── Formats ──────────────────────────────────────────────────────────────────

const FORMATS: Format[] = [
  {
    key: "introduction",
    name: "Introduction",
    build: (ctx) => {
      const service = ctx.services[0]
      const goal = ctx.goals[0]
      const parts: string[] = []
      if (ctx.platform === "linkedin") {
        parts.push("A quick introduction, in case we haven't properly met.")
        parts.push("")
        parts.push(
          `${ctx.name} works with ${ctx.audience}, focusing on ${service || ctx.type.toLowerCase()}` +
            (goal ? ` — with the goal of ${toLower(goal)}.` : "."),
        )
        if (ctx.description) {
          parts.push("")
          parts.push(ctx.description)
        }
        parts.push("")
        parts.push(
          "We keep things simple: clear expectations, regular updates, and follow-through on the details." +
            (ctx.theme ? ` Right now we're focused on ${toLower(ctx.theme)}.` : ""),
        )
      } else {
        parts.push(`Hi, we're ${ctx.name}.`)
        parts.push("")
        parts.push(
          `We help ${ctx.audience}` +
            (service ? ` with ${toLower(service)}` : "") +
            (goal ? `, so they can ${toLower(goal)}.` : "."),
        )
        if (ctx.description) {
          parts.push("")
          parts.push(ctx.description)
        }
        parts.push("")
        parts.push(
          ctx.theme
            ? `The short version: we're focused on ${toLower(ctx.theme)} right now — and we'd love to talk about how we can help you.`
            : "The short version: we make the important stuff predictable — and we'd love to talk about how we can help you.",
        )
      }
      return { title: ctx.name, body: parts.join("\n") }
    },
  },
  {
    key: "trend-tie-in",
    name: "Trend Tie-In",
    build: (ctx) => {
      const hook = ctx.theme
        ? `Everyone is talking about ${ctx.theme} at the moment — and for good reason.`
        : `There's a lot of chatter about new tools and trends in ${ctx.type.toLowerCase()} right now.`
      const parts: string[] = []
      if (ctx.platform === "linkedin") {
        parts.push(hook, "", `Here's our take: trends only matter when they serve the customer. ${pick(TREND_LINES)}`, "")
        parts.push(
          `At ${ctx.name}, ${
            ctx.theme ? `we're watching ${ctx.theme} closely and testing what actually helps our clients` : "we focus on the fundamentals that survive every trend"
          } — ${ctx.services[0] || "reliability and follow-through"} first.`,
        )
      } else if (ctx.platform === "x" || ctx.platform === "threads") {
        parts.push(hook, "", "Our take: chase the trend only if it helps customers. Otherwise double down on the basics.", "")
        parts.push(
          ctx.theme
            ? `We're tracking ${ctx.theme} for how it serves our clients at ${ctx.name}.`
            : `At ${ctx.name} we build on fundamentals, not hype.`,
        )
      } else {
        parts.push(hook, "", `Our take at ${ctx.name}? Trends are useful only when they help the people we serve. Everything else is noise.`, "")
        parts.push(
          ctx.theme
            ? `So while everyone experiments, we're testing how ${ctx.theme} actually helps clients, then keeping what works.`
            : "So while everyone experiments, we're sticking to the boring, reliable stuff that gets results.",
        )
      }
      return { title: null, body: parts.join("\n") }
    },
  },
  {
    key: "behind-the-scenes",
    name: "Behind-the-Scenes",
    build: (ctx) => {
      const bts = pick(BTS_LINES)
      const parts: string[] = []
      if (ctx.platform === "linkedin") {
        parts.push(`A look behind the scenes at ${ctx.name}.`, "", bts, "")
        if (ctx.recentWork) parts.push(`Recently, that has meant ${toLower(ctx.recentWork)}.`, "")
        parts.push("It's not the most shareable part of the work — but it's the part clients actually feel.")
      } else if (ctx.platform === "x" || ctx.platform === "threads") {
        parts.push(bts, "")
        parts.push(
          `This is most of what happens at ${ctx.name}${ctx.recentWork ? `, especially while we ${toLower(ctx.recentWork)}` : ""}.`,
          "",
          "Not glamorous. Effective.",
        )
      } else {
        parts.push(bts, "")
        parts.push(
          ctx.recentWork
            ? `At ${ctx.name}, that's literally the work right now — ${toLower(ctx.recentWork)}.`
            : `At ${ctx.name}, that's the work, every single day.`,
          "",
          "No glamour. Just results.",
        )
      }
      return { title: null, body: parts.join("\n") }
    },
  },
  {
    key: "client-result",
    name: "Client Result",
    build: (ctx) => {
      const result = pick(CLIENT_RESULT_LINES)
      const parts: string[] = []
      if (ctx.platform === "linkedin") {
        parts.push("We measure success by what our clients stop having to worry about.", "", result, "")
        parts.push(
          ctx.theme
            ? `At ${ctx.name}, our current focus — ${toLower(ctx.theme)} — exists to make ${ctx.services[0] || "our clients' operations"} run that quietly.`
            : `At ${ctx.name}, that's the standard we hold ourselves to in every engagement.`,
        )
      } else if (ctx.platform === "x" || ctx.platform === "threads") {
        parts.push(result, "", `That's the outcome ${ctx.name} exists to create.`)
      } else {
        parts.push(result, "")
        parts.push(
          `This is the kind of experience we build for at ${ctx.name}.` + (ctx.theme ? ` Right now, that means ${toLower(ctx.theme)}.` : ""),
        )
      }
      return { title: null, body: parts.join("\n") }
    },
  },
  {
    key: "pain-point",
    name: "Pain Point",
    build: (ctx) => {
      const pain = pick(PAIN_LINES)
      const parts: string[] = []
      if (ctx.platform === "linkedin") {
        parts.push(`For ${ctx.audience}, a recurring pain is worth naming out loud.`, "", pain, "")
        parts.push(
          `At ${ctx.name}, we treat that as a design constraint: ${ctx.services[0] || ctx.type.toLowerCase()} delivered so the handoffs don't hurt.` +
            (ctx.theme ? ` It's the lens we're using on ${toLower(ctx.theme)} right now.` : ""),
        )
      } else if (ctx.platform === "x" || ctx.platform === "threads") {
        parts.push(pick(HOOKS), "", `If that sounds familiar to ${ctx.audience}, we built ${ctx.name} to fix exactly that.`)
      } else {
        parts.push(pick(HOOKS), "", `${pain} We built ${ctx.name} around fixing that for ${ctx.audience}.`, "")
        parts.push(
          ctx.theme
            ? `Curious where to start? We're currently focused on ${toLower(ctx.theme)}.`
            : "Want to see how a smoother process could help you? Send us a message.",
        )
      }
      return { title: null, body: parts.join("\n") }
    },
  },
]

export const POST_FORMATS: ReadonlyArray<{ key: string; name: string }> = FORMATS.map((f) => ({
  key: f.key,
  name: f.name,
}))

// ─── Generator entrypoint ─────────────────────────────────────────────────────

/**
 * Generate drafts for a business. For each requested platform, produces up to
 * `countPerPlatform` drafts cycling through the format library, seeded with the
 * business profile. Invalid candidates (per `validateBody`) are skipped.
 */
export function generateDrafts(business: GeneratorBusiness, opts: GeneratorOptions = {}): GeneratedDraft[] {
  const ctx: FormatCtx = {
    name: business.name,
    type: business.type,
    description: clean(business.description, ""),
    audience: clean(business.target_audience, "businesses that value reliable execution"),
    services: parseList(business.services),
    goals: parseList(business.goals),
    theme: opts.theme?.trim() || undefined,
    recentWork: opts.recentWork?.trim() || undefined,
    platform: "linkedin",
  }

  const platforms = (opts.platforms && opts.platforms.length > 0 ? opts.platforms : [...GENERATOR_PLATFORMS]).filter(
    (p): p is GeneratorPlatform => (GENERATOR_PLATFORMS as readonly string[]).includes(p),
  )
  const perPlatform = Math.min(Math.max(parseInt(String(opts.countPerPlatform || 3), 10) || 3, 1), 5)
  const drafts: GeneratedDraft[] = []

  for (const platform of platforms) {
    const platformCtx: FormatCtx = { ...ctx, platform }
    for (let i = 0; i < perPlatform; i++) {
      const format = FORMATS[(i + Math.floor(Math.random() * FORMATS.length)) % FORMATS.length]!
      const { title, body } = format.build(platformCtx)
      if (validateBody(body, title).length > 0) continue
      drafts.push({
        platform,
        formatKey: format.key,
        formatName: format.name,
        title,
        body,
        hashtags: tagsFor(platformCtx, platform),
      })
    }
  }

  return drafts
}
