# -*- coding: utf-8 -*-
import json, urllib.request, subprocess

BASE = "http://127.0.0.1:8899/api"
TOKEN = [""]


def hdrs():
    h = {"Content-Type": "application/json"}
    if TOKEN[0]:
        h["Cookie"] = "admin_token=" + TOKEN[0]
    return h


def post(path, payload):
    req = urllib.request.Request(BASE + path, data=json.dumps(payload).encode("utf-8"), headers=hdrs())
    with urllib.request.urlopen(req, timeout=20) as r:
        c = r.headers.get("Set-Cookie") or ""
        if "admin_token=" in c:
            TOKEN[0] = c.split("admin_token=")[1].split(";")[0]
        return json.loads(r.read().decode("utf-8"))


def get(path):
    req = urllib.request.Request(BASE + path, headers=hdrs())
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


NODE = "/usr/local/node18/node-v18.20.4-linux-x64-glibc-217/bin/node"
GEN = "/www/wwwroot/resc-admin/gen-theme-config.mjs"


def regen():
    p = subprocess.Popen([NODE, GEN], stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
    out, err = p.communicate()
    return (out or err).strip()


print("login:", post("/login", {"password": "Zhanghui123"}))
st = get("/settings")
print("before:", repr(st.get("tongji")))
st["tongji"] = {"51la": ""}
print("save:", post("/settings", st))
regen()
cfg = open("/www/wwwroot/resc-cn-src/.vitepress/themeConfig.mjs", encoding="utf-8").read()
print("TEST 值是否还在:", "TESTSTATID9527" in cfg)
import re

m = re.search(r'"51la":\s*"([^"]*)"', cfg)
print("51la 现在 =", repr(m.group(1) if m else None))
