import fs from 'node:fs'
import path from 'node:path'

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.name.endsWith('.jsx')) files.push(full)
  }
  return files
}

const hookMap = {
  useNavigate: 'useRouter',
  useParams: 'useParams',
  useSearchParams: 'useSearchParams',
  usePathname: 'usePathname',
}

function migrateImport(line) {
  const match = line.match(/^import \{ (.+) \} from 'react-router-dom'\s*$/)
  if (!match) return line

  const names = match[1].split(',').map((s) => s.trim())
  const nextHooks = []
  let hasLink = false

  for (const name of names) {
    if (name === 'Link') hasLink = true
    else if (hookMap[name]) nextHooks.push(name)
    else if (name === 'NavLink') {
      // handled separately in NavLinks/LandingNav
    } else {
      console.warn('Unhandled import:', name, 'in', line)
    }
  }

  const lines = []
  if (hasLink) lines.push("import Link from 'next/link'")
  if (nextHooks.length) lines.push(`import { ${nextHooks.join(', ')} } from 'next/navigation'`)
  return lines.join('\n')
}

function migrateFile(content) {
  const lines = content.split('\n')
  const out = []
  let changed = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes("from 'react-router-dom'")) {
      const migrated = migrateImport(line)
      if (migrated !== line) {
        out.push(migrated)
        changed = true
        continue
      }
    }
    out.push(line)
  }

  let result = out.join('\n')
  if (result.includes('useNavigate')) {
    result = result.replace(/\bconst navigate = useNavigate\(\)/g, 'const router = useRouter()')
    result = result.replace(/\bnavigate\((['"`][^'"`]+['"`]), \{ replace: true \}\)/g, 'router.replace($1)')
    result = result.replace(/\bnavigate\(/g, 'router.push(')
    changed = true
  }

  if (result.includes('setSearchParams')) {
    // CommunityPage specific - handled manually
  }

  result = result.replace(/<Link to=/g, '<Link href=')
  if (result !== content) changed = true
  return { result, changed }
}

const skip = new Set(['src\\App.jsx', 'src\\main.jsx'])

for (const file of walk('src')) {
  const rel = path.relative('.', file)
  if (skip.has(rel)) continue
  const content = fs.readFileSync(file, 'utf8')
  if (!content.includes('react-router-dom') && !content.includes('useNavigate')) continue
  const { result, changed } = migrateFile(content)
  if (changed) {
    fs.writeFileSync(file, result)
    console.log('updated:', rel)
  }
}

console.log('done')
