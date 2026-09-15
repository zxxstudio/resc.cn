# -*- coding: utf-8 -*-
import io, sys

p = '/www/wwwroot/resc-admin/admin.html'
s = io.open(p, encoding='utf-8').read()
orig = s
results = []

def rep(old, new, tag):
    global s
    if old in s:
        s = s.replace(old, new, 1)
        results.append('OK   ' + tag)
    else:
        results.append('MISS ' + tag)

# 1) slug 不再必填（空则由服务端自动兜底生成）
rep(
    "if(!body.title||!body.date||!body.slug){msg(pm,'标题、日期、slug 必填',false);return}",
    "if(!body.title||!body.date){msg(pm,'标题、日期必填',false);return}",
    'slug-not-required'
)

# 2) slug 留空时前端补一个占位，后端还会再兜一次
rep(
    "const body={file:$('#pe-file').value",
    "if(!$('#pe-slug').value.trim())$('#pe-slug').value='p'+Date.now().toString(36)\n  const body={file:$('#pe-file').value",
    'auto-slug'
)

# 3) 轮询同时接受 done 和 error，失败时不再干等到超时
rep(
    "if(st.status&&st.status.state==='done'){",
    "if(st.status&&(st.status.state==='done'||st.status.state==='error')){",
    'poll-error'
)

# 4) 报错提示指向真实日志路径
rep(
    "'⚠️ 发布失败，查看 /tmp/publish.log'",
    "'⚠️ 发布失败，服务器日志：/tmp/resc-deploy.log'",
    'log-path'
)

if s != orig:
    io.open(p, 'w', encoding='utf-8').write(s)

print('\n'.join(results))
print('WRITTEN' if s != orig else 'NO-CHANGE')
