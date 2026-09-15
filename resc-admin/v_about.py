import re
h = open("/www/wwwroot/resc.cn/pages/about.html", encoding="utf-8", errors="ignore").read()
i = h.find("联系我")
j = h.find("站点信息", i)
seg = h[i:j]
print("=== 关于页「联系我」渲染结果 ===")
for m in re.finditer(r"<(a|div)([^>]*?)>(.*?)</\1>", seg, re.S):
    inner = m.group(3)
    if "info-label" not in inner:
        continue
    lab = re.search(r"info-label[^>]*>([^<]*)", inner)
    val = re.search(r"info-value[^>]*>([^<]*)", inner)
    href = re.search("href=[\"']([^\"']*)[\"']", m.group(2))
    print("  %-10s %-20s %s" % (
        lab.group(1) if lab else "?",
        val.group(1) if val else "?",
        href.group(1) if href else "(纯文本)"))
