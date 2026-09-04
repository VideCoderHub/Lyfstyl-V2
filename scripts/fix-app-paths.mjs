import fs from 'node:fs'
import path from 'node:path'

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.css')) files.push(full)
  }
  return files
}

for (const file of walk('src/app')) {
  let content = fs.readFileSync(file, 'utf8')
  const original = content
  content = content.replace(/src\/pages/g, 'views')
  content = content.replace(/\.\.\/\.\.\/\.\.\/src\/views/g, '../../../views')
  content = content.replace(/\.\.\/\.\.\/src\/views/g, '../../views')
  content = content.replace(/\.\.\/src\/components/g, '../components')
  content = content.replace(/@import '\.\.\/src\/App\.css'/g, "@import '../App.css'")
  if (content !== original) {
    fs.writeFileSync(file, content)
    console.log('fixed:', file)
  }
}

console.log('done')
