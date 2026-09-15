// 生成小程序 / 归档 / 标签页使用的索引 JSON
// 由 deploy.sh 在每次构建部署后调用
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import path from 'path'

const SRC = '/www/wwwroot/resc-cn-src'
const POSTS_DIR = path.join(SRC, 'posts')
const SITE = '/www/wwwroot/resc.cn'

function walk(dir, base, out = []) {
  let entries = []
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch (e) { return out }
  for (const ent of entries) {
    if (ent.name.startsWith('.')) continue
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(full, base, out)
    else if (ent.name.endsWith('.md')) out.push(path.relative(base, full).split(path.sep).join('/'))
  }
  return out
}

function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { data: {}, content: md }
  const data = {}
  let key = null
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (kv) {
      key = kv[1]
      let v = kv[2].trim()
      if (/^\[.*\]$/.test(v)) {
        v = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      } else {
        v = v.replace(/^['"]|['"]$/g, '')
      }
      data[key] = v
    } else if (key && Array.isArray(data[key]) && /^\s*-\s+/.test(line)) {
      data[key].push(line.trim().replace(/^-\s*/, '').replace(/^['"]|['"]$/g, ''))
    }
  }
  return { data, content: md.slice(m[0].length) }
}

function toArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean)
  if (typeof v === 'string' && v.trim()) return [v.trim()]
  return []
}

const files = walk(POSTS_DIR, POSTS_DIR)
const posts = []
for (const f of files) {
  const rel = f.replace(/\.md$/, '')
  const isIndexDoc = /index$/.test(rel)
  let md
  try { md = readFileSync(path.join(POSTS_DIR, f), 'utf-8') } catch (e) { continue }
  const { data } = parseFrontmatter(md)
  if (!isIndexDoc && /(^|\/)index$/.test(rel)) continue
  let epoch = Date.now()
  if (data.date) {
    const d = new Date(String(data.date) + 'T00:00:00Z')
    if (!isNaN(d.getTime())) epoch = d.getTime()
  }
  posts.push({
    title: String(data.title || '').trim(),
    date: epoch,
    categories: toArray(data.categories),
    tags: toArray(data.tags),
    desc: String(data.description || '').trim(),
    cover: String(data.cover || '').trim(),
    url: '/posts/' + rel.replace(/\\/g, '/') + '.html',
  })
}

posts.sort((a, b) => (b.date - a.date) || (a.url < b.url ? -1 : a.url > b.url ? 1 : 0))

const categories = {}
const tags = {}
for (const p of posts) {
  for (const c of p.categories) {
    if (!categories[c]) categories[c] = []
    categories[c].push(p.url)
  }
  for (const t of p.tags) {
    if (!tags[t]) tags[t] = { count: 0, posts: [] }
    tags[t].count += 1
    tags[t].posts.push(p.url)
  }
}

const w = (name, obj) => {
  writeFileSync(path.join(SITE, name), JSON.stringify(obj, null, 2), 'utf-8')
}

w('posts.json', posts)
w('categories.json', categories)
w('tags.json', tags)
w('site-stats.json', {
  totalPosts: posts.length,
  totalCategories: Object.keys(categories).length,
  totalTags: Object.keys(tags).length,
})

console.log(`gen-index: ${posts.length} posts / ${Object.keys(categories).length} categories / ${Object.keys(tags).length} tags`)
