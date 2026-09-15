// 构建前的资源防呆：文章里引用了 public/ 里不存在的图片会导致 VitePress 直接构建失败
// 这里扫描所有 md 引用的站内绝对路径图片，缺失的补一张透明占位图（或直接从上线的站点目录拷回来），保证构建不会因为一张图崩掉
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs'
import path from 'path'

const SRC = '/www/wwwroot/resc-cn-src'
const PUBLIC = path.join(SRC, 'public')
const LIVE = '/www/wwwroot/resc.cn'
const IMG_EXT = /\.(png|jpe?g|gif|svg|webp|ico|bmp|avif)$/i

// 1x1 透明 PNG
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)
const SVG_1PX = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'

function walk(dir, out = []) {
  let entries = []
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch (e) { return out }
  for (const ent of entries) {
    if (ent.name.startsWith('.')) continue
    if (ent.name === 'node_modules' || ent.name === 'dist') continue
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(full, out)
    else if (ent.name.endsWith('.md')) out.push(full)
  }
  return out
}

const mdFiles = walk(SRC)
const missing = []

for (const file of mdFiles) {
  let content
  try { content = readFileSync(file, 'utf-8') } catch (e) { continue }
  // ![alt](/path)  和  <img src="/path">
  const patterns = [/!\[[^\]]*\]\((\/[^)\s]+)\)/g, /<img[^>]+src=["'](\/[^"']+)["']/g]
  const hits = []
  for (const re of patterns) {
    let m
    while ((m = re.exec(content)) !== null) hits.push(m[1])
  }
  for (let p of hits) {
    try { p = decodeURIComponent(p) } catch (e) {}
    if (!IMG_EXT.test(p)) continue
    const target = path.join(PUBLIC, p)
    if (existsSync(target)) continue
    // 优先从已上线的站点目录里找回来
    const liveFile = path.join(LIVE, p)
    if (existsSync(liveFile) && statSync(liveFile).isFile()) {
      mkdirSync(path.dirname(target), { recursive: true })
      copyFileSync(liveFile, target)
      missing.push('RESTORED ' + p + '  <- ' + file.replace(SRC + '/', ''))
      continue
    }
    // 真没有就放占位图，别让构建挂掉
    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(target, p.toLowerCase().endsWith('.svg') ? SVG_1PX : PNG_1PX)
    missing.push('PLACEHOLDER ' + p + '  <- ' + file.replace(SRC + '/', ''))
  }
}

console.log('fix-assets: scanned ' + mdFiles.length + ' md files, patched ' + missing.length + ' missing images')
for (const line of missing.slice(0, 30)) console.log('  ' + line)
