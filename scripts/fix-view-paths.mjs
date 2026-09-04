import fs from 'node:fs'
import path from 'node:path'

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.name === 'page.jsx') files.push(full)
  }
  return files
}

for (const file of walk('src/app')) {
  const rel = path.relative('src/app', path.dirname(file))
  const depth = rel ? rel.split(path.sep).length : 0
  const prefix = '../'.repeat(depth + 1) + 'views/'
  let content = fs.readFileSync(file, 'utf8')
  const updated = content.replace(/from ['"](?:\.\.\/)+views\//g, `from '${prefix}`)
  if (updated !== content) {
    fs.writeFileSync(file, updated)
    console.log(file, '->', prefix)
  }
}

console.log('done')
