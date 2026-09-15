#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
resc.cn 自动封面脚本  (小微 2026-09-13)

规则：
1. frontmatter 里已有 cover 且图片还在 -> 不动（尊重手选的封面）
2. 文章正文里有图 -> 取第一张，居中裁成 16:9，压到 1200x675 的 jpg 当封面
3. 文章里一张图都没有 -> 配了 AI 生图就用 AI，否则画一张渐变+标题的占位封面
4. 生成的封面写回 md 的 frontmatter（cover 字段）

用法：python3 /www/wwwroot/resc-admin/make-covers.py
"""
import os
import re
import io
import json
import hashlib
import urllib.request
import urllib.error

from PIL import Image, ImageDraw, ImageFont

SRC = '/www/wwwroot/resc-cn-src'
POSTS = os.path.join(SRC, 'posts')
PUB = os.path.join(SRC, 'public')
SITE = '/www/wwwroot/resc.cn'
COVER_DIR = os.path.join(PUB, 'images', 'covers')
AI_CFG = '/www/wwwroot/resc-admin/ai-cover-config.json'
FONT = '/usr/local/share/fonts/simhei.ttf'
LOG = '/tmp/resc-covers.log'
W, H = 1200, 675

LOG_LINES = []


def log(msg):
    line = '[%s] %s' % (now(), msg)
    LOG_LINES.append(line)
    print(line)


def now():
    import datetime
    return datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')


# ---------- markdown ----------

def split_fm(text):
    lines = text.split('\n')
    if lines and lines[0].strip() == '---':
        for i in range(1, len(lines)):
            if lines[i].strip() == '---':
                return lines[1:i], lines[i + 1:]
    return [], lines


def join_fm(fm, body):
    if fm:
        return '---\n' + '\n'.join(fm) + '\n---\n' + '\n'.join(body)
    return '\n'.join(body)


def fm_get(fm, key):
    for ln in fm:
        m = re.match(r'^%s:\s*(.*)$' % re.escape(key), ln)
        if m:
            return m.group(1).strip().strip('"').strip("'")
    return ''


def fm_set(fm, key, value):
    out = []
    done = False
    for ln in fm:
        if re.match(r'^%s:' % re.escape(key), ln):
            out.append('%s: %s' % (key, value))
            done = True
        else:
            out.append(ln)
    if not done:
        out.append('%s: %s' % (key, value))
    return out


# ---------- 图片 ----------

def first_image(body):
    text = '\n'.join(body)
    m = re.search(r'!\[[^\]]*\]\(([^)\s]+)', text)
    if m:
        return m.group(1)
    m = re.search(r'<img[^>]+src="([^"]+)"', text)
    if m:
        return m.group(1)
    return ''


def resolve(path):
    if not path:
        return ''
    if path.startswith('http://') or path.startswith('https://'):
        try:
            tmp = '/tmp/_cover_dl_%s' % hashlib.md5(path.encode()).hexdigest()[:10]
            urllib.request.urlretrieve(path, tmp)
            return tmp
        except Exception as e:
            log('  下载失败 %s (%s)' % (path, e))
            return ''
    for base in (PUB, SITE):
        cand = os.path.join(base, path.lstrip('/'))
        if os.path.isfile(cand):
            return cand
    return ''


def save_cover(img, dest):
    """横图直接裁 16:9；竖图/手机人像用「模糊背景 + 完整图」的拼版，避免把人头裁掉"""
    from PIL import ImageFilter
    img = img.convert('RGB')
    w, h = img.size
    target = float(W) / H
    ratio = w / float(h)

    if ratio >= 1.0:
        # 横图：居中裁
        if abs(ratio - target) > 0.01:
            if ratio > target:
                nw = int(h * target)
                left = (w - nw) // 2
                img = img.crop((left, 0, left + nw, h))
            else:
                nh = int(w / target)
                top = max(0, (h - nh) // 3)
                img = img.crop((0, top, w, top + nh))
        out = img.resize((W, H), Image.LANCZOS)
    else:
        # 竖图：模糊铺底 + 原图完整居中
        bg = img.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(36))
        shade = Image.new('RGB', (W, H), (0, 0, 0))
        bg = Image.blend(bg, shade, 0.28)
        fg_h = int(H * 0.94)
        fg_w = int(fg_h * ratio)
        if fg_w > int(W * 0.96):
            fg_w = int(W * 0.96)
            fg_h = int(fg_w / ratio)
        fg = img.resize((fg_w, fg_h), Image.LANCZOS)
        bg.paste(fg, ((W - fg_w) // 2, (H - fg_h) // 2))
        out = bg
    out.save(dest, 'JPEG', quality=82, optimize=True, progressive=True)
    return dest


def make_gradient(title, date_str):
    """根据标题生成稳定的配色渐变 + 标题文字"""
    h = int(hashlib.md5(title.encode('utf-8')).hexdigest()[:8], 16)
    hue = 195 + (h % 40)  # 195-235，蓝色系，跟站点主色调一致
    import colorsys
    c1 = colorsys.hsv_to_rgb(hue / 360.0, 0.55, 0.92)
    c2 = colorsys.hsv_to_rgb(((hue + 18) % 360) / 360.0, 0.62, 0.62)
    top = tuple(int(x * 255) for x in c1)
    bottom = tuple(int(x * 255) for x in c2)
    img = Image.new('RGB', (W, H), top)
    d = ImageDraw.Draw(img)
    for y in range(H):
        r = y / float(H)
        col = tuple(int(top[i] + (bottom[i] - top[i]) * r) for i in range(3))
        d.line([(0, y), (W, y)], fill=col)
    # 一点装饰：斜向光带
    for i in range(6):
        x0 = W + i * 90 - 260
        d.polygon([(x0, 0), (x0 + 120, 0), (x0 - 220, H), (x0 - 340, H)],
                  fill=(255, 255, 255, 18))
    # 标题
    try:
        f_title = ImageFont.truetype(FONT, 62)
        f_small = ImageFont.truetype(FONT, 26)
    except Exception:
        return img
    txt = title[:18] + ('…' if len(title) > 18 else '')
    tw, th = d.textsize(txt, font=f_title)
    x = (W - tw) // 2
    y = (H - th) // 2 - 10
    d.text((x + 2, y + 3), txt, font=f_title, fill=(0, 0, 0, 90))
    d.text((x, y), txt, font=f_title, fill=(255, 255, 255))
    if date_str:
        sw, sh = d.textsize(date_str, font=f_small)
        d.text(((W - sw) // 2, y + th + 26), date_str, font=f_small, fill=(255, 255, 255, 210))
    return img


def ai_cover(title, desc, dest):
    """配了 AI 就用 AI 生图；没配就返回 False，交给渐变兜底"""
    if not os.path.isfile(AI_CFG):
        return False
    try:
        cfg = json.load(open(AI_CFG, encoding='utf-8'))
    except Exception as e:
        log('  AI 配置读取失败: %s' % e)
        return False
    if not cfg.get('enabled'):
        return False
    prompt = '%s\n主题：%s\n%s' % (cfg.get('prompt_prefix', '为一篇中文博客文章生成一张封面图，横构图，简洁高级，不要出现文字'),
                               title, desc or '')
    payload = {'model': cfg.get('model', ''), 'prompt': prompt}
    if cfg.get('size'):
        payload['size'] = cfg['size']
    if cfg.get('n'):
        payload['n'] = cfg['n']
    req = urllib.request.Request(
        cfg['endpoint'],
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json',
                 'Authorization': 'Bearer %s' % cfg.get('api_key', '')})
    try:
        raw = urllib.request.urlopen(req, timeout=cfg.get('timeout', 180)).read().decode('utf-8')
        resp = json.loads(raw)
    except Exception as e:
        log('  AI 生图失败: %s' % e)
        return False
    data = resp.get('data') if isinstance(resp, dict) else None
    img_bytes = None
    if isinstance(data, list) and data:
        first = data[0]
        if isinstance(first, dict):
            url = first.get('url') or (first.get('image_url') or {}).get('url')
            if url:
                img_bytes = urllib.request.urlopen(url, timeout=120).read()
            elif first.get('b64_json'):
                import base64
                img_bytes = base64.b64decode(first['b64_json'])
    if not img_bytes:
        log('  AI 返回里没有图片')
        return False
    img = Image.open(io.BytesIO(img_bytes))
    save_cover(img, dest)
    log('  AI 生成封面 -> %s' % os.path.basename(dest))
    return True


# ---------- 主流程 ----------

IMG_BACKUP = '/www/backup/resc-img-orig'


def compress_body_images(max_w=1920, quality=82, min_size=800 * 1024):
    """正文大图压一压：手机拍的图动辄 3MB，压到 1920 宽后手机上打开快很多。
    原图会先备份到 /www/backup/resc-img-orig/，不丢东西。"""
    import shutil
    root = os.path.join(PUB, 'images', 'posts')
    if not os.path.isdir(root):
        return
    for f in sorted(os.listdir(root)):
        p = os.path.join(root, f)
        if not os.path.isfile(p) or not re.search(r'\.jpe?g$', f, re.I):
            continue
        try:
            sz = os.path.getsize(p)
            if sz < min_size:
                continue
            im = Image.open(p)
            w, h = im.size
            if w <= max_w and sz < 2 * 1024 * 1024:
                continue
            os.makedirs(IMG_BACKUP, exist_ok=True)
            bak = os.path.join(IMG_BACKUP, f)
            if not os.path.exists(bak):
                shutil.copy2(p, bak)
            im = im.convert('RGB')
            if w > max_w:
                im = im.resize((max_w, int(h * max_w / float(w))), Image.LANCZOS)
            im.save(p, 'JPEG', quality=quality, optimize=True, progressive=True)
            log('压缩正文图 %s: %.1fMB -> %.1fMB' % (f, sz / 1048576.0, os.path.getsize(p) / 1048576.0))
        except Exception as e:
            log('压缩失败 %s (%s)' % (f, e))


def process(md_path):
    name = os.path.basename(md_path)
    try:
        text = open(md_path, encoding='utf-8').read()
    except Exception as e:
        log('读取失败 %s (%s)' % (name, e))
        return
    fm, body = split_fm(text)
    if not fm:
        log('跳过（没有 frontmatter）: %s' % name)
        return
    title = fm_get(fm, 'title') or os.path.splitext(name)[0]
    date_str = fm_get(fm, 'date')
    cover = fm_get(fm, 'cover')

    slug = os.path.splitext(name)[0]
    dest = os.path.join(COVER_DIR, '%s.jpg' % slug)

    # 1) 已有封面且文件在 -> 不动
    if cover:
        exist = resolve(cover)
        if exist:
            log('已有封面，跳过: %s' % name)
            return
        log('封面字段指向的文件不存在，重新生成: %s (%s)' % (name, cover))

    os.makedirs(COVER_DIR, exist_ok=True)

    # 2) 正文里有图 -> 裁图
    img_path = resolve(first_image(body))
    if img_path:
        try:
            im = Image.open(img_path)
            save_cover(im, dest)
            log('裁出封面 %s <- %s' % (os.path.basename(dest), os.path.basename(img_path)))
        except Exception as e:
            log('裁图失败 %s (%s)' % (name, e))
            img_path = None

    # 3) 没图 -> AI 或渐变
    if not img_path:
        ok = ai_cover(title, fm_get(fm, 'description'), dest)
        if not ok:
            save_cover(make_gradient(title, date_str), dest)
            log('渐变占位封面 -> %s' % os.path.basename(dest))

    # 4) 写回 frontmatter
    rel = '/images/covers/%s.jpg' % slug
    fm = fm_set(fm, 'cover', rel)
    try:
        open(md_path, 'w', encoding='utf-8').write(join_fm(fm, body))
        log('写入 cover: %s -> %s' % (name, rel))
    except Exception as e:
        log('写回失败 %s (%s)' % (name, e))


def main():
    if not os.path.isdir(POSTS):
        log('posts 目录不存在')
        return
    mds = []
    for root, dirs, files in os.walk(POSTS):
        for f in files:
            if f.endswith('.md'):
                mds.append(os.path.join(root, f))
    mds.sort()
    log('==== 开始处理 %d 篇文章 ====' % len(mds))
    for md in mds:
        process(md)
    log('---- 正文大图压缩 ----')
    compress_body_images()
    log('==== 完成 ====')
    try:
        with open(LOG, 'a', encoding='utf-8') as fh:
            fh.write('\n'.join(LOG_LINES) + '\n')
    except Exception:
        pass


if __name__ == '__main__':
    main()
