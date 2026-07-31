from PIL import Image, ImageDraw
import math, random

w, h = 1344, 768
img = Image.new('RGB', (w, h), color=(10, 12, 20))
d = ImageDraw.Draw(img)

# Sky gradient
for y in range(h // 2):
    ratio = y / (h // 2)
    r = int(15 + ratio * (220 - 15))
    g = int(12 + ratio * (90 - 12))
    b = int(32 + ratio * (80 - 32))
    d.line([(0, y), (w, y)], fill=(r, g, b))

# Water
for y in range(h // 2, h):
    ratio = (y - h // 2) / (h - h // 2)
    r = int(20 + ratio * (30 - 20))
    g = int(70 + ratio * (100 - 70))
    b = int(100 + ratio * (130 - 100))
    d.line([(0, y), (w, y)], fill=(r, g, b))

# Mountains
def draw_mountain(draw, pts, fill):
    draw.polygon(pts, fill=fill)

draw_mountain(d, [(300, h//2), (500, h//2-180), (700, h//2)], (60, 55, 90))
draw_mountain(d, [(550, h//2), (780, h//2-240), (1010, h//2)], (45, 40, 75))
draw_mountain(d, [(800, h//2), (1000, h//2-120), (1200, h//2)], (70, 65, 100))

# Reflection columns
for y in range(h // 2, h):
    mirror_y = h - 1 - y
    px = img.getpixel((w // 3, mirror_y))
    for col_off in range(-1, 2):
        img.putpixel((w // 3 + col_off, y), px)
    px2 = img.getpixel((2 * w // 3, mirror_y))
    for col_off in range(-1, 2):
        img.putpixel((2 * w // 3 + col_off, y), px2)

# Tree silhouette at rule-of-thirds intersection
tree_x, tree_y = w // 3, h // 2 - 50
d.ellipse([(tree_x - 14, tree_y - 22), (tree_x + 14, tree_y + 12)], fill=(18, 15, 28))
d.rectangle([(tree_x - 5, tree_y + 12), (tree_x + 5, h // 2 + 30)], fill=(22, 18, 32))
for i in range(4):
    bx = tree_x + (i % 2) * 22 - 11
    d.line([(tree_x, tree_y - 5), (bx, tree_y - 28 - i * 6)], fill=(18, 15, 28), width=3)

# Rule of thirds grid lines
grid_color = (255, 200, 80)
d.line([(w//3, 0), (w//3, h//2)], fill=grid_color, width=1)
d.line([(2*w//3, 0), (2*w//3, h//2)], fill=grid_color, width=1)
d.line([(0, h//3), (w, h//3)], fill=grid_color, width=1)
d.line([(0, 2*h//3), (w, 2*h//3)], fill=grid_color, width=1)

# Intersection dots
dot_color = (255, 220, 60)
for gx in [w//3, 2*w//3]:
    for gy in [h//3, 2*h//3]:
        d.ellipse([(gx-4, gy-4), (gx+4, gy+4)], fill=dot_color)

# Sun / light source
cx, cy = 2*w//3, h//3 - 30
for r in range(60, 0, -1):
    a = int(80 * (1 - r / 60))
    d.ellipse([(cx-r, cy-r), (cx+r, cy+r)], fill=(255, 160 + a, 60 + a//2))
d.ellipse([(cx-20, cy-20), (cx+20, cy+20)], fill=(255, 230, 150))

# Leading lines converging to sun
for i in range(-3, 4):
    x1, y1 = w // 3 + i * 70, h
    d.line([(x1, y1), (cx, cy)], fill=(255, 220, 120), width=1)

# Stars
random.seed(42)
for _ in range(120):
    sx = random.randint(0, w)
    sy = random.randint(0, h // 2 - 50)
    sr = random.randint(1, 2)
    brightness = random.randint(150, 255)
    d.ellipse([(sx-sr, sy-sr), (sx+sr, sy+sr)], fill=(brightness, brightness, 255))

# Golden ratio spiral (bottom right area)
phi = (1 + math.sqrt(5)) / 2
def draw_spiral(draw, ox, oy, scale, steps=240):
    pts = []
    for t in range(steps):
        angle = t * math.pi / 30
        r = scale * (phi ** (t / (math.pi * 2)))
        x = ox + r * math.cos(angle)
        y = oy + r * math.sin(angle)
        pts.append((int(x), int(y)))
    if len(pts) > 1:
        draw.line(pts, fill=(255, 180, 60), width=2)

draw_spiral(d, w * 3 // 4, h * 3 // 4, 15)

# Dark bottom bar
d.rectangle([(0, h-60), (w, h)], fill=(8, 10, 18))

img.save(r'D:\迅雷下载\curve2\vitepress-theme-curve-master\public\images\covers\2026-07-31-composition.png')
print("saved ok")
