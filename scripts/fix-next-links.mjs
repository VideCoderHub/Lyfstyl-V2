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

function fixFile(content) {
  const lines = content.split('\n')
  let inLinkTag = false
  const out = []

  for (const line of lines) {
    let next = line

    if (line.includes('<Link')) {
      inLinkTag = !line.includes('/>') && !line.match(/<Link[^>]*>/)
      if (line.match(/<Link[^>]*>/)) inLinkTag = false
      if (line.includes('<Link') && line.includes(' to=')) {
        next = line.replace(/\sto=/, ' href=')
      }
    } else if (inLinkTag) {
      if (/^\s+to=/.test(line)) {
        next = line.replace(/\sto=/, ' href=')
      }
      if (line.includes('>') || line.includes('/>')) {
        inLinkTag = false
      }
    }

    out.push(next)
  }

  return out.join('\n')
}

for (const file of walk('src')) {
  const original = fs.readFileSync(file, 'utf8')
  const updated = fixFile(original)
  if (updated !== original) {
    fs.writeFileSync(file, updated)
    console.log('fixed:', file)
  }
}

console.log('done')
