#!/usr/bin/env node

import { readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const PROJECT_NAME = 'github-profile-generator'
const CONFIG_PATH = 'src/config/external-links.json'
const REQUIRED_RENDERERS = [
  'src/components/PromotionBanner.astro',
  'src/components/ProductLinks.astro',
]

function fail(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

function parseArgs(argv) {
  const [command, ...tokens] = argv
  const options = {}

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (!token.startsWith('--')) fail(`Unexpected argument: ${token}`)

    const key = token.slice(2)
    if (key === 'dry-run') {
      options[key] = true
      continue
    }

    const value = tokens[index + 1]
    if (!value || value.startsWith('--')) fail(`Missing value for --${key}`)
    options[key] = value
    index += 1
  }

  return { command, options }
}

function normalizeUrl(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    fail(`Invalid URL: ${value}`)
  }

  if (url.protocol !== 'https:') fail('Backlink URLs must use https://')
  if (url.username || url.password) fail('Backlink URLs cannot contain credentials')
  url.hostname = url.hostname.toLowerCase()
  if (url.pathname === '/') url.pathname = ''
  return url.toString().replace(/\/$/, '')
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function validate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) fail('Configuration must be a JSON object')
  if (!data.sites || typeof data.sites !== 'object' || Array.isArray(data.sites)) fail('Configuration must contain a sites object')
  if (!Array.isArray(data.products)) fail('Configuration must contain a products array')
  if (data.promotion !== null && typeof data.promotion !== 'string') fail('promotion must be a site id or null')

  const urls = new Map()
  for (const [id, site] of Object.entries(data.sites)) {
    if (!id || !site || typeof site.name !== 'string' || typeof site.url !== 'string') {
      fail(`Invalid site entry: ${id || '(empty id)'}`)
    }
    const normalized = normalizeUrl(site.url)
    const duplicate = urls.get(normalized)
    if (duplicate) fail(`Sites ${duplicate} and ${id} use the same URL`)
    urls.set(normalized, id)
  }

  if (data.promotion !== null) {
    const site = data.sites[data.promotion]
    if (!site) fail(`promotion references missing site: ${data.promotion}`)
    if (!site.promotionText) fail(`Promoted site ${data.promotion} has no promotionText`)
  }

  const productIds = new Set()
  for (const id of data.products) {
    if (!data.sites[id]) fail(`products references missing site: ${id}`)
    if (productIds.has(id)) fail(`Duplicate products entry: ${id}`)
    productIds.add(id)
  }
}

async function loadProject() {
  const root = process.cwd()
  const packagePath = resolve(root, 'package.json')
  let packageJson

  try {
    packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
  } catch {
    fail('Run this command from the repository root; package.json was not readable')
  }
  if (packageJson.name !== PROJECT_NAME) fail(`Expected project ${PROJECT_NAME}, found ${packageJson.name || 'an unnamed project'}`)

  for (const renderer of REQUIRED_RENDERERS) {
    try {
      await readFile(resolve(root, renderer), 'utf8')
    } catch {
      fail(`Project backlink contract is broken; missing ${renderer}`)
    }
  }

  const configPath = resolve(root, CONFIG_PATH)
  let data
  try {
    data = JSON.parse(await readFile(configPath, 'utf8'))
  } catch {
    fail(`Project backlink contract is broken; ${CONFIG_PATH} was not readable JSON`)
  }
  validate(data)
  return { configPath, data }
}

function resolveSiteId(data, options) {
  if (options.id) return options.id
  if (options.url) {
    const url = normalizeUrl(options.url)
    const match = Object.entries(data.sites).find(([, site]) => normalizeUrl(site.url) === url)
    if (match) return match[0]
  }
  fail('Provide --id or --url')
}

function addSite(data, options) {
  if (!options.url || !options.name) fail('add requires --url and --name')
  const url = normalizeUrl(options.url)
  const placement = options.placement || 'both'
  if (!['both', 'banner', 'footer'].includes(placement)) fail('placement must be both, banner, or footer')

  const existingUrl = Object.entries(data.sites).find(([, site]) => normalizeUrl(site.url) === url)
  const suggestedId = slugify(options.name) || slugify(new URL(url).hostname)
  const id = options.id || existingUrl?.[0] || suggestedId
  if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) fail('Site id must contain only lowercase letters, digits, and hyphens')
  if (existingUrl && existingUrl[0] !== id) fail(`URL already belongs to site ${existingUrl[0]}`)
  if (data.sites[id] && normalizeUrl(data.sites[id].url) !== url) fail(`Site id ${id} already uses another URL`)

  const previous = data.sites[id] || {}
  const site = { ...previous, name: options.name, url }
  if (options.text) site.promotionText = options.text

  if ((placement === 'both' || placement === 'banner') && !site.promotionText) {
    fail('Banner placement requires --text')
  }

  data.sites[id] = site
  if ((placement === 'both' || placement === 'footer') && !data.products.includes(id)) data.products.push(id)
  if (placement === 'both' || placement === 'banner') data.promotion = id
  return `Added or updated ${id} (${placement})`
}

function removeSite(data, options) {
  const id = resolveSiteId(data, options)
  if (!data.sites[id]) fail(`Unknown site: ${id}`)
  delete data.sites[id]
  data.products = data.products.filter((productId) => productId !== id)
  if (data.promotion === id) data.promotion = null
  return `Removed ${id}`
}

function setPromotion(data, options) {
  const id = resolveSiteId(data, options)
  const site = data.sites[id]
  if (!site) fail(`Unknown site: ${id}`)
  if (options.text) site.promotionText = options.text
  if (!site.promotionText) fail('Promoted site requires --text')
  data.promotion = id
  return `Set promotion to ${id}`
}

function printList(data) {
  console.log(`Promotion: ${data.promotion || '(none)'}`)
  console.log('Footer products:')
  for (const id of data.products) console.log(`- ${id}: ${data.sites[id].name} <${data.sites[id].url}>`)
}

function printHelp() {
  console.log(`Usage:
  manage-backlinks.mjs list
  manage-backlinks.mjs add --url URL --name NAME [--id ID] [--text TEXT] [--placement both|banner|footer] [--dry-run]
  manage-backlinks.mjs remove (--id ID | --url URL) [--dry-run]
  manage-backlinks.mjs set-promotion (--id ID | --url URL) [--text TEXT] [--dry-run]
  manage-backlinks.mjs clear-promotion [--dry-run]`)
}

const { command, options } = parseArgs(process.argv.slice(2))
if (!command || command === 'help' || options.help) {
  printHelp()
  process.exit(0)
}

const { configPath, data } = await loadProject()
let message

switch (command) {
  case 'list':
    printList(data)
    process.exit(0)
  case 'add':
    message = addSite(data, options)
    break
  case 'remove':
    message = removeSite(data, options)
    break
  case 'set-promotion':
    message = setPromotion(data, options)
    break
  case 'clear-promotion':
    data.promotion = null
    message = 'Cleared promotion'
    break
  default:
    fail(`Unknown command: ${command}`)
}

validate(data)
const output = `${JSON.stringify(data, null, 2)}\n`
if (options['dry-run']) {
  console.log(output)
  console.log(`Dry run: ${message}`)
} else {
  const temporaryPath = `${configPath}.tmp`
  await writeFile(temporaryPath, output)
  await rename(temporaryPath, configPath)
  console.log(message)
}
