#!/usr/bin/env node
/**
 * Pulls variables from Figma REST API (GET /v1/files/:file_key/variables/local)
 * and writes src/viator-figma-tokens.colors.css
 *
 * Requires: FIGMA_TOKEN with file_variables:read scope (Tier 2; Enterprise per Figma docs).
 * File key: Viator Token Library — same as in Figma URL.
 *
 * Usage: FIGMA_TOKEN=xxx node scripts/sync-viator-figma-tokens.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'src/viator-figma-tokens.colors.css')
const FILE_KEY = '3joqifxv7LB8aZ0Vgw3EPM'

const token = process.env.FIGMA_TOKEN || process.env.FIGMA_ACCESS_TOKEN
if (!token) {
  console.error(
    'Missing FIGMA_TOKEN (or FIGMA_ACCESS_TOKEN). Cannot fetch variables from Figma API.',
  )
  process.exit(1)
}

const res = await fetch(
  `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`,
  { headers: { 'X-Figma-Token': token } },
)

if (!res.ok) {
  const text = await res.text()
  console.error(`Figma API ${res.status}: ${text}`)
  process.exit(1)
}

const body = await res.json()
if (body.error || body.status === 403) {
  console.error('Figma API error:', JSON.stringify(body, null, 2))
  process.exit(1)
}

const { variables = {}, variableCollections = {} } = body.meta || {}

/** @type {Map<string, string>} */
const modeByCollection = new Map()
for (const col of Object.values(variableCollections)) {
  const def = col.defaultModeId || col.modes?.[0]?.modeId
  if (col.id && def) modeByCollection.set(col.id, def)
}

function figmaNameToCssProp(name) {
  return `--viator-${name
    .trim()
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()}`
}

function colorToCss(c, depth = 0) {
  if (!c || typeof c !== 'object' || depth > 24) return null
  if (c.type === 'VARIABLE_ALIAS') {
    const target = variables[c.id]
    if (!target || target.resolvedType !== 'COLOR') return null
    const modeId = modeByCollection.get(target.variableCollectionId)
    const next = modeId && target.valuesByMode ? target.valuesByMode[modeId] : null
    return colorToCss(next, depth + 1)
  }
  const r = Math.round((c.r ?? 0) * 255)
  const g = Math.round((c.g ?? 0) * 255)
  const b = Math.round((c.b ?? 0) * 255)
  const a = c.a ?? 1
  if (a >= 1) {
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
  }
  return `rgb(${r} ${g} ${b} / ${a})`
}

const lines = [
  '/**',
  ' * AUTO-GENERATED — do not edit by hand.',
  ` * Source: Figma file ${FILE_KEY} (variables/local), default mode per collection.`,
  ' * Regenerate: FIGMA_TOKEN=… npm run tokens:sync',
  ' */',
  '',
  '@theme {',
]

for (const v of Object.values(variables)) {
  if (v.resolvedType !== 'COLOR') continue

  const modeId = modeByCollection.get(v.variableCollectionId)
  const raw = modeId && v.valuesByMode ? v.valuesByMode[modeId] : null
  if (raw == null) continue

  const prop = figmaNameToCssProp(v.name)
  const value = colorToCss(raw)
  if (value != null) {
    lines.push(`  ${prop}: ${value};`)
  }
}

lines.push('}', '')
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, lines.join('\n'), 'utf8')
console.log(`Wrote ${OUT} (${lines.length} lines)`)
