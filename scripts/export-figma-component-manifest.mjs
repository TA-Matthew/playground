#!/usr/bin/env node
/**
 * Lists every COMPONENT and COMPONENT_SET in a Figma file (walks the document tree).
 * This is step 1 of "installing" a DS: know what exists, then generate or build each one.
 *
 * Usage:
 *   FIGMA_TOKEN=your_personal_access_token npm run figma:manifest
 *
 * Optional:
 *   FIGMA_FILE_KEY=kfEgE1oVxKplDJxEBW9nIT  (defaults to KILIMANJARO file)
 *
 * Output: src/components/kilimanjaro/figma-component-manifest.json
 *
 * Token: https://www.figma.com/developers/api#access-tokens
 * Scope: file read (files:read). Large files may take a few seconds.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'src/components/kilimanjaro/figma-component-manifest.json')

const FILE_KEY = process.env.FIGMA_FILE_KEY || 'kfEgE1oVxKplDJxEBW9nIT'
const token = process.env.FIGMA_TOKEN || process.env.FIGMA_ACCESS_TOKEN

if (!token) {
  console.error(
    'Missing FIGMA_TOKEN. Create a personal access token in Figma and run:\n  FIGMA_TOKEN=… npm run figma:manifest',
  )
  process.exit(1)
}

const res = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}`, {
  headers: { 'X-Figma-Token': token },
})

if (!res.ok) {
  console.error(await res.text())
  process.exit(1)
}

const data = await res.json()

/** @type {{ name: string, id: string, type: string, description?: string }[]} */
const components = []

function walk(node) {
  if (!node) return
  const t = node.type
  if (t === 'COMPONENT' || t === 'COMPONENT_SET') {
    components.push({
      id: node.id,
      type: t,
      name: node.name,
      description: node.description || undefined,
    })
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walk(child)
    }
  }
}

if (data.document) {
  walk(data.document)
}

const payload = {
  fileKey: FILE_KEY,
  fileName: data.name,
  lastModified: data.lastModified,
  componentCount: components.length,
  components,
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8')
console.log(`Wrote ${components.length} components to ${OUT}`)
