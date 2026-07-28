/**
 * Pushes src/lib/voice/agent.ts to ElevenLabs.
 *
 *   npm run voice:sync     create or update the agent
 *   npm run voice:voices   list voices so you can pick ELEVENLABS_VOICE_ID
 *
 * The repo is the source of truth. Anything edited in the ElevenLabs dashboard
 * is overwritten the next time this runs.
 */

import { buildAgentConfig, buildToolConfig, AGENT_NAME, TOOL_NAME, APP_URL } from '../src/lib/voice/agent'

const API = 'https://api.elevenlabs.io/v1'
const KEY = process.env.ELEVENLABS_API_KEY

async function call(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'xi-api-key': KEY!, 'Content-Type': 'application/json', ...init.headers },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}\n${text}`)
  return text ? JSON.parse(text) : {}
}

/**
 * There's no "list supported LLMs" endpoint, but the agent PATCH validator
 * enumerates the valid enum values when you send it a bogus one.
 */
async function listModels() {
  const res = await fetch(`${API}/convai/agents/${process.env.ELEVENLABS_AGENT_ID}`, {
    method: 'PATCH',
    headers: { 'xi-api-key': KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_config: { agent: { prompt: { llm: '__invalid__' } } } }),
  })
  const models = [...new Set([...(await res.text()).matchAll(/'([a-zA-Z0-9._-]+)'/g)].map(m => m[1]))]
  console.log(`\n${models.length} models accepted by ElevenLabs:\n`)
  for (const m of models.sort()) console.log(`  ${m}`)
  console.log('\nSet LLM in src/lib/voice/agent.ts, then npm run voice:sync\n')
}

async function listVoices() {
  const { voices } = await call('/voices')
  console.log(`\n${voices.length} voices:\n`)
  for (const v of voices) {
    const labels = Object.values(v.labels ?? {}).join(', ')
    console.log(`  ${v.voice_id}  ${v.name.padEnd(18)} ${labels}`)
  }
  console.log('\nPick one and set ELEVENLABS_VOICE_ID in .env.local, then run npm run voice:sync\n')
}

/** Tools live at workspace level, so reuse ours by name instead of piling up duplicates. */
async function syncTool() {
  const tool_config = buildToolConfig()
  const { tools = [] } = await call('/convai/tools')
  const mine = tools.find((t: { tool_config?: { name?: string } }) => t.tool_config?.name === TOOL_NAME)

  if (mine) {
    await call(`/convai/tools/${mine.id}`, { method: 'PATCH', body: JSON.stringify({ tool_config }) })
    console.log(`  tool  ${TOOL_NAME} updated (${mine.id})`)
    return mine.id as string
  }

  const created = await call('/convai/tools', { method: 'POST', body: JSON.stringify({ tool_config }) })
  console.log(`  tool  ${TOOL_NAME} created (${created.id})`)
  return created.id as string
}

async function sync() {
  const toolId = await syncTool()
  const config = buildAgentConfig([toolId])
  const existing = process.env.ELEVENLABS_AGENT_ID

  if (existing) {
    await call(`/convai/agents/${existing}`, { method: 'PATCH', body: JSON.stringify(config) })
    console.log(`  agent ${AGENT_NAME} updated (${existing})`)
    console.log(`\nTool endpoint: ${buildToolConfig().api_schema.url}\n`)
    return
  }

  const created = await call('/convai/agents/create', { method: 'POST', body: JSON.stringify(config) })
  console.log(`  agent ${AGENT_NAME} created`)
  console.log(`\n  ELEVENLABS_AGENT_ID=${created.agent_id}\n`)
  console.log('Add that to .env.local (and Vercel) so future syncs update rather than duplicate.\n')
}

async function main() {
  if (!KEY) throw new Error('ELEVENLABS_API_KEY is not set')
  if (process.argv.includes('--voices')) return listVoices()
  if (process.argv.includes('--models')) return listModels()
  if (!process.env.VOICE_TOOL_SECRET) throw new Error('VOICE_TOOL_SECRET is not set')
  if (/localhost|127\.0\.0\.1/.test(APP_URL)) {
    throw new Error(
      `Tool URL would be ${APP_URL}, which ElevenLabs cannot reach.\n` +
        'Set VOICE_PUBLIC_URL to your deployed origin (or an ngrok tunnel) and re-run.'
    )
  }
  return sync()
}

main().catch(err => {
  console.error(`\n${err.message}\n`)
  process.exit(1)
})
