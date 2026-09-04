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

const skip = new Set(['src\\App.jsx', 'src\\main.jsx'])

for (const file of walk('src')) {
  const rel = path.relative('.', file)
  if (skip.has(rel)) continue
  let content = fs.readFileSync(file, 'utf8')
  if (!content.includes('react-router-dom')) continue
  const original = content

  content = content.replace(/import \{ Link \} from 'react-router-dom'\n/g, "import Link from 'next/link'\n")
  content = content.replace(/<Link to=/g, '<Link href=')

  if (content !== original) {
    fs.writeFileSync(file, content)
    console.log('updated:', rel)
  }
}

console.log('done')
