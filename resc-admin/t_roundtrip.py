# -*- coding: utf-8 -*-
"""后台设置 API 往返测试：改一个字段 -> 保存 -> 看生成结果是否带上 -> 还原"""
import json, urllib.request

BASE = "http://127.0.0.1:8899/api"
PW = "Zhanghui123"
TEST = "TESTSTATID9527"


TOKEN = {"v": ""}


def _hdrs():
    h = {"Content-Type": "application/json"}
    if TOKEN["v"]:
        h["Cookie"] = "admin_token=" + TOKEN["v"]
    return h


def post(path, payload):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(payload).encode("utf-8"),
        headers=_hdrs(),
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        setc = r.headers.get("Set-Cookie") or ""
        if "admin_token=" in setc:
            TOKEN["v"] = setc.split("admin_token=")[1].split(";")[0]
        return json.loads(r.read().decode("utf-8"))


def get(path):
    req = urllib.request.Request(BASE + path, headers=_hdrs())
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def main():
    print("1) 登录:", post("/login", {"password": PW}))
    st = get("/settings")
    old = st.get("tongji", {}).get("51la", "")
    print("2) 当前统计 ID =", repr(old))

    st["tongji"] = {"51la": TEST}
    print("3) 保存:", post("/settings", st))

    # 复跑生成器
    import subprocess
    p = subprocess.run(
        ["/usr/local/node18/node-v18.20.4-linux-x64-glibc-217/bin/node",
         "/www/wwwroot/resc-admin/gen-theme-config.mjs"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
    print("4) 生成器:", p.stdout.strip() or p.stderr.strip())

    cfg = open("/www/wwwroot/resc-cn-src/.vitepress/themeConfig.mjs", encoding="utf-8").read()
    hit = TEST in cfg
    print("5) 生成的 themeConfig 里有没有新统计 ID:", "✅ 有" if hit else "❌ 没有")

    # 还原
    st2 = get("/settings")
    st2["tongji"] = {"51la": old}
    post("/settings", st2)
    subprocess.run(["/usr/local/node18/node-v18.20.4-linux-x64-glibc-217/bin/node",
                    "/www/wwwroot/resc-admin/gen-theme-config.mjs"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
    print("6) 已还原为:", repr(old))


main()
