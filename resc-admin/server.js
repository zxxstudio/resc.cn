const http = require('http')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawn } = require('child_process')

const PORT = 8899
const SETTINGS_FILE = '/www/wwwroot/resc-cn-settings/site-settings.json'
const SRC_DIR = '/www/wwwroot/resc-cn-src'
const POSTS_DIR = path.join(SRC_DIR, 'posts')
const POSTS_IMG_DIR = path.join(SRC_DIR, 'public', 'images', 'posts')
const PUBLISH_STATUS_FILE = path.join(SRC_DIR, 'publish-status.json')
const DEPLOY_SCRIPT = '/www/wwwroot/resc-admin/deploy.sh'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Zhanghui123'
const sessions = new Set()

// 每次请求现读 admin.html，改完刷新即生效（不再常驻内存，避免部署后需重启）
function getAdminHtml(){
  try { return fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf-8') } catch(e){ return '<h1>admin.html load error</h1>' }
}

// 登录爆破保护：同一 IP 连续失败 6 次后锁定 15 分钟
const loginFails = new Map()
const MAX_FAIL = 6
const LOCK_MS = 15 * 60 * 1000

// 构建进行中标记 + 陈旧状态兜底
let buildRunning = false
let buildChild = null

const NO_CACHE_HEADERS = { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }
function send(res, code, body, headers) {
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, NO_CACHE_HEADERS, headers || {}))
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
}
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').toString().split(',')[0].trim()
}
function loginLocked(req) {
  const ip = clientIp(req)
  const rec = loginFails.get(ip)
  if (!rec) return false
  if (rec.lockedUntil && Date.now() < rec.lockedUntil) return true
  if (rec.lockedUntil && Date.now() >= rec.lockedUntil) loginFails.delete(ip)
  return false
}
function noteLoginFail(req) {
  const ip = clientIp(req)
  const rec = loginFails.get(ip) || { count: 0, lockedUntil: 0 }
  rec.count += 1
  if (rec.count >= MAX_FAIL) rec.lockedUntil = Date.now() + LOCK_MS
  loginFails.set(ip, rec)
  return MAX_FAIL - rec.count
}
function resetLoginFail(req) {
  loginFails.delete(clientIp(req))
}
function readSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')) } catch (e) { return null }
}
function writeSettings(obj) {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true })
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(obj, null, 2), 'utf-8')
  // 同步到构建源与站点根目录（前端运行时 fetch /site-settings.json 读取，保存后刷新即生效）
  const mirrors = ['/www/wwwroot/resc-cn-src/site-settings.json', '/www/wwwroot/resc.cn/site-settings.json']
  for (const m of mirrors) {
    try { fs.writeFileSync(m, JSON.stringify(obj, null, 2), 'utf-8') }
    catch (e) { console.error('sync settings to ' + m + ' failed:', e.message) }
  }
}
function getCookie(req, name) {
  const m = (req.headers.cookie || '').match(new RegExp(name + '=([^;]+)'))
  return m ? m[1] : null
}
function readBody(req) {
  return new Promise((resolve) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => resolve(b))
  })
}
function isAuthed(req) {
  const token = getCookie(req, 'admin_token')
  return !!(token && sessions.has(token))
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
  return { data, content: md.slice(m[0].length).replace(/^\r?\n/, '') }
}
function walkMd(dir, base, out) {
  let entries = []
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch (e) { return out }
  for (const ent of entries) {
    if (ent.name.startsWith('.')) continue
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walkMd(full, base, out)
    else if (ent.name.endsWith('.md')) out.push(path.relative(base, full).split(path.sep).join('/'))
  }
  return out
}
function listPosts() {
  const files = walkMd(POSTS_DIR, POSTS_DIR, [])
  const posts = []
  for (const f of files.sort().reverse()) {
    try {
      const md = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8')
      const { data } = parseFrontmatter(md)
      posts.push({
        file: 'posts/' + f,
        title: data.title || '',
        date: data.date || '',
        tags: data.tags || [],
        categories: data.categories || [],
        description: data.description || '',
        cover: data.cover || '',
      })
    } catch (e) {}
  }
  return posts
}
// 允许中文、字母、数字、下划线、中划线
function safePostFile(file) {
  if (typeof file !== 'string') return null
  const norm = path.normalize(file).split(path.sep).join('/')
  if (!/^posts\/[0-9]{4}\/[^/\\:*?"<>|.]+\.md$/.test(norm)) return null
  const full = path.join(SRC_DIR, norm)
  if (!full.startsWith(SRC_DIR + path.sep)) return null
  return full
}
function makeSlug(input) {
  let s = String(input || '').trim().toLowerCase()
  // 保留中文/字母/数字/_/-，其余压成中划线
  s = s.replace(/[\s/\\:*?"<>|.]+/g, '-').replace(/[^一-龥A-Za-z0-9_-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '')
  if (!s) s = 'post-' + Date.now().toString(36)
  return s
}
function buildMarkdown(fm, content) {
  const lines = ['---']
  for (const k of Object.keys(fm)) {
    const v = fm[k]
    if (Array.isArray(v)) lines.push(k + ': [' + v.join(', ') + ']')
    else if (typeof v === 'boolean') lines.push(k + ': ' + v)
    else if (v !== undefined && v !== null && String(v) !== '') lines.push(k + ': ' + String(v))
  }
  lines.push('---', '')
  return lines.join('\n') + (content || '').replace(/^\r?\n+/, '').trim() + '\n'
}

/* ---- 真正的服务端构建部署 ---- */
function writeStatus(obj) {
  try { fs.writeFileSync(PUBLISH_STATUS_FILE, JSON.stringify(obj), 'utf-8') } catch (e) {}
}
function readStatus() {
  try { return JSON.parse(fs.readFileSync(PUBLISH_STATUS_FILE, 'utf-8')) } catch (e) { return null }
}
// 卡住的构建超过 8 分钟判定为异常，允许再次触发
function clearStaleBuildLock() {
  const s = readStatus()
  if (s && s.state === 'building' && s.at) {
    const age = Date.now() - new Date(s.at).getTime()
    if (age > 8 * 60 * 1000) {
      buildRunning = false
      if (buildChild) { try { buildChild.kill('SIGKILL') } catch (e) {} }
      buildChild = null
      writeStatus({ state: 'error', at: new Date().toISOString(), ok: false, note: '上次构建超时未完成' })
    }
  }
}
function triggerPublish() {
  clearStaleBuildLock()
  if (buildRunning) {
    writeStatus({ state: 'building', at: new Date().toISOString(), ok: false, note: '上一次构建还在进行中，别急' })
    return
  }
  writeStatus({ state: 'building', at: new Date().toISOString(), ok: false, note: '服务器正在重新构建整站，约 1 分钟' })
  buildRunning = true
  const child = spawn('/bin/bash', [DEPLOY_SCRIPT], {
    detached: true,
    stdio: 'ignore',
    env: Object.assign({}, process.env, {
      PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:' + (process.env.PATH || ''),
      LANG: 'C.UTF-8',
    }),
  })
  buildChild = child
  child.on('exit', () => { buildRunning = false; buildChild = null })
  child.on('error', (e) => {
    buildRunning = false
    buildChild = null
    writeStatus({ state: 'error', at: new Date().toISOString(), ok: false, note: '构建启动失败：' + e.message })
  })
  child.unref()
}
function publishStatus() {
  clearStaleBuildLock()
  return readStatus() || { state: 'idle' }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const p = url.pathname
  const q = url.searchParams

  if (p === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
    return res.end(getAdminHtml())
  }
  if (p === '/api/settings' && req.method === 'GET') {
    const s = readSettings()
    return send(res, s ? 200 : 404, s || { error: 'not found' })
  }
  if (p === '/api/login' && req.method === 'POST') {
    if (loginLocked(req)) {
      return send(res, 429, { ok: false, error: '密码错误次数过多，请 15 分钟后再试' })
    }
    const body = await readBody(req)
    let pwd = ''
    try { pwd = JSON.parse(body).password || '' } catch (e) {}
    if (pwd === ADMIN_PASSWORD) {
      resetLoginFail(req)
      const token = crypto.randomBytes(16).toString('hex')
      sessions.add(token)
      res.writeHead(200, {
        'Set-Cookie': `admin_token=${token}; Path=/admin; HttpOnly; SameSite=Strict`,
        'Content-Type': 'application/json',
      })
      return res.end(JSON.stringify({ ok: true }))
    }
    const left = noteLoginFail(req)
    return send(res, 401, { ok: false, error: left > 0 ? `密码错误，还可尝试 ${left} 次` : '密码错误次数过多，已锁定 15 分钟' })
  }
  if (p === '/api/settings' && req.method === 'POST') {
    if (!isAuthed(req)) return send(res, 401, { ok: false, error: '未登录' })
    const body = await readBody(req)
    try {
      const obj = JSON.parse(body)
      if (typeof obj !== 'object' || obj === null) throw new Error('invalid')
      writeSettings(obj)
      return send(res, 200, { ok: true, note: '站点设置已保存，刷新前台即可看到；若改动了导航等需要重建的部分，请点一次「发布」' })
    } catch (e) {
      return send(res, 400, { ok: false, error: 'JSON 解析失败' })
    }
  }
  if (p === '/api/logout' && req.method === 'POST') {
    const token = getCookie(req, 'admin_token')
    if (token) sessions.delete(token)
    return send(res, 200, { ok: true })
  }

  /* ---- 文章管理 ---- */
  if (p === '/api/posts' && req.method === 'GET') {
    if (!isAuthed(req)) return send(res, 401, { ok: false, error: '未登录' })
    return send(res, 200, { ok: true, posts: listPosts() })
  }
  if (p === '/api/post' && req.method === 'GET') {
    if (!isAuthed(req)) return send(res, 401, { ok: false, error: '未登录' })
    const full = safePostFile(q.get('file'))
    if (!full || !fs.existsSync(full)) return send(res, 404, { ok: false, error: '文章不存在' })
    const md = fs.readFileSync(full, 'utf-8')
    const { data, content } = parseFrontmatter(md)
    return send(res, 200, { ok: true, post: Object.assign({ file: q.get('file') }, data, { content }) })
  }
  if (p === '/api/post' && req.method === 'POST') {
    if (!isAuthed(req)) return send(res, 401, { ok: false, error: '未登录' })
    const body = await readBody(req)
    let obj = null
    try { obj = JSON.parse(body) } catch (e) { return send(res, 400, { ok: false, error: 'JSON 解析失败' }) }
    const date = String(obj.date || '').trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return send(res, 400, { ok: false, error: '日期格式应为 YYYY-MM-DD' })
    // slug 可以空、可以中文，这里兜底生成
    const slug = makeSlug(obj.slug)
    const year = date.slice(0, 4)
    const dir = path.join(POSTS_DIR, year)
    fs.mkdirSync(dir, { recursive: true })
    const target = path.join(dir, date + '-' + slug + '.md')
    const fm = {
      title: String(obj.title || '').trim(),
      tags: Array.isArray(obj.tags) ? obj.tags.map(String).filter(Boolean) : [],
      categories: Array.isArray(obj.categories) ? obj.categories.map(String).filter(Boolean) : [],
      date: date,
      description: String(obj.description || '').trim(),
      cover: String(obj.cover || '').trim(),
    }
    if (obj.file) {
      const oldFull = safePostFile(obj.file)
      if (oldFull && oldFull !== target && fs.existsSync(oldFull)) fs.unlinkSync(oldFull)
    }
    fs.writeFileSync(target, buildMarkdown(fm, obj.content || ''), 'utf-8')
    return send(res, 200, { ok: true, file: 'posts/' + year + '/' + date + '-' + slug + '.md' })
  }
  if (p === '/api/post' && req.method === 'DELETE') {
    if (!isAuthed(req)) return send(res, 401, { ok: false, error: '未登录' })
    const full = safePostFile(q.get('file'))
    if (!full || !fs.existsSync(full)) return send(res, 404, { ok: false, error: '文章不存在' })
    fs.unlinkSync(full)
    return send(res, 200, { ok: true })
  }
  if (p === '/api/publish' && req.method === 'POST') {
    if (!isAuthed(req)) return send(res, 401, { ok: false, error: '未登录' })
    triggerPublish()
    return send(res, 200, { ok: true, state: 'building', note: '服务器正在重新构建整站，约 1 分钟' })
  }
  if (p === '/api/publish-status' && req.method === 'GET') {
    return send(res, 200, { ok: true, status: publishStatus() })
  }

  /* ---- 图片上传 ---- */
  if (p === '/api/upload' && req.method === 'POST') {
    if (!isAuthed(req)) return send(res, 401, { ok: false, error: '未登录' })
    const body = await readBody(req)
    let obj = null
    try { obj = JSON.parse(body) } catch (e) { return send(res, 400, { ok: false, error: 'JSON 解析失败' }) }
    const data = obj.data || ''
    const name = (obj.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_')
    const ext = name.split('.').pop() || 'png'
    const filename = Date.now() + '_' + Math.random().toString(36).slice(2, 7) + '.' + ext
    if (!data.startsWith('data:image/')) return send(res, 400, { ok: false, error: '仅支持图片' })
    const mime = data.match(/^data:([^;]+)/)?.[1] || 'image/png'
    const b64 = data.replace(/^data:[^;]+;base64,/, '')
    let buf = null
    try { buf = Buffer.from(b64, 'base64') } catch (e) { return send(res, 400, { ok: false, error: 'base64 解码失败' }) }
    if (buf.length > 5 * 1024 * 1024) return send(res, 400, { ok: false, error: '图片不超过 5MB' })
    fs.mkdirSync(POSTS_IMG_DIR, { recursive: true })
    fs.writeFileSync(path.join(POSTS_IMG_DIR, filename), buf)
    return send(res, 200, { ok: true, url: '/images/posts/' + filename })
  }

  send(res, 404, { error: 'not found' })
})

server.listen(PORT, () => console.log('resc-admin listening on ' + PORT))
