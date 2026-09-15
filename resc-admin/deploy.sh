#!/bin/bash
# resc.cn 服务端自动构建部署脚本
# 触发方式：后台「保存并发布」/「删除文章」，也可以手动执行：bash /www/wwwroot/resc-admin/deploy.sh
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export LANG=C.UTF-8

SRC=/www/wwwroot/resc-cn-src
DIST="$SRC/.vitepress/dist"
SITE=/www/wwwroot/resc.cn
STATUS="$SRC/publish-status.json"
LOCK=/tmp/resc-deploy.lock
LOG=/tmp/resc-deploy.log
MANIFEST=/tmp/resc-deploy-manifest.txt
STOPPED=/tmp/resc-deploy-stopped.txt
NODE=/usr/local/node18/node-v18.20.4-linux-x64-glibc-217/bin/node

writeStatus() {
  printf '{"state":"%s","at":"%s","ok":%s}\n' "$1" "$(date -Iseconds)" "$2" > "$STATUS"
}

exec 9>"$LOCK"
if ! flock -n 9; then
  echo "[$(date -Iseconds)] 已有构建任务在运行，本次跳过" >> "$LOG"
  exit 0
fi

echo "" > "$STOPPED"
writeStatus building false
echo "===== deploy start $(date -Iseconds) =====" >> "$LOG"

cd "$SRC" || { writeStatus error false; exit 1; }

# 1) 把后台保存的最新站点配置同步进构建源
cp -f /www/wwwroot/resc-cn-settings/site-settings.json "$SRC/site-settings.json" 2>/dev/null
cp -f /www/wwwroot/resc-cn-settings/site-settings.json "$SRC/public/site-settings.json" 2>/dev/null

# 1.3) 把后台配置合并生成主题配置 .vitepress/themeConfig.mjs
#      必须生成：主题 init.mjs 只认这个文件，不生成的话后台改的大多数开关都是「死的」，
#      只有 Nav/Banner/About/Project/TechShare 几个运行时 fetch 的组件才认 site-settings.json
$NODE /www/wwwroot/resc-admin/gen-theme-config.mjs >> "$LOG" 2>&1

# 1.2) 自动封面：文章里有图就裁 16:9 当封面，没图就 AI 生图（配了的话）或渐变占位
#      手选过 cover 的文章不会被覆盖
python3 /www/wwwroot/resc-admin/make-covers.py >> "$LOG" 2>&1

# 1.5) 资源防呆：把线上已有但源码里缺的封面图补回来，
#      实在没有的补占位图 —— 否则一篇文章引用了不存在的图片，整个站都发布不了
$NODE /www/wwwroot/resc-admin/fix-assets.mjs >> "$LOG" 2>&1

# 2) 临时停掉吃内存的服务，给构建腾空间（构建完自动拉起）
for svc in mysqld php-fpm-82; do
  if systemctl stop "$svc" >/dev/null 2>&1; then echo "$svc" >> "$STOPPED"; continue; fi
  if [ -x "/etc/init.d/$svc" ] && /etc/init.d/"$svc" stop >/dev/null 2>&1; then
    echo "$svc" >> "$STOPPED"
  fi
done
sleep 2
echo "[mem before build]" >> "$LOG"
free -m | head -2 >> "$LOG"

# 3) 构建
BUILD_OK=0
if $NODE node_modules/vitepress/bin/vitepress.js build >> "$LOG" 2>&1; then
  BUILD_OK=1
fi

# 4) 恢复刚才停掉的服务
while read -r svc; do
  [ -z "$svc" ] && continue
  systemctl start "$svc" >/dev/null 2>&1 || /etc/init.d/"$svc" start >/dev/null 2>&1
done < "$STOPPED"
echo "" > "$STOPPED"

if [ "$BUILD_OK" -ne 1 ]; then
  writeStatus error false
  tail -30 "$LOG" > /tmp/resc-deploy-last-error.log
  echo "===== deploy FAILED $(date -Iseconds) =====" >> "$LOG"
  exit 1
fi

# 5) 部署到站点目录
#    注意：这里刻意不用 --delete —— 站点根目录下的 posts.json / categories.json /
#    tags.json / site-stats.json 是运行时数据，不在构建产物里，删了会搞坏小程序和归档页
rsync -a "$DIST"/ "$SITE"/ >> "$LOG" 2>&1
rsync -a "$SRC/public/" "$SITE"/ >> "$LOG" 2>&1
cp -f /www/wwwroot/resc-cn-settings/site-settings.json "$SITE/site-settings.json"

# 6) 清理上一版遗留的旧哈希资源（只删上次由本脚本写进去、这次没再生成的文件）
if [ -f "$MANIFEST" ]; then
  cd "$DIST" && find . -type f | sort > /tmp/_resc_cur.txt 2>/dev/null
  comm -23 "$MANIFEST" /tmp/_resc_cur.txt > /tmp/_resc_stale.txt
  cd "$SITE"
  n=0
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    case "$f" in
      ./pages/*|./images/*|./fonts/*|./models/*|./posts/*) continue ;;
    esac
    if [ -f "$f" ]; then rm -f -- "$f"; n=$((n+1)); fi
  done < /tmp/_resc_stale.txt
  echo "[cleaned stale files: $n]" >> "$LOG"
fi
cd "$DIST" && find . -type f | sort > "$MANIFEST" 2>/dev/null

# 7) 重建文章索引 json（小程序 / 归档 / 标签页用）
$NODE /www/wwwroot/resc-admin/gen-index.mjs >> "$LOG" 2>&1

# 8) 清理已删除文章残留的页面
#    只处理形如 /posts/年/YYYY-MM-DD-xxx.html 的详情页：源文件 md 没了就把页面移走
#    注意：这里是「移动」到备份目录，不是直接删，误判了随时能捞回来
for ydir in "$SITE"/posts/[0-9][0-9][0-9][0-9]; do
  [ -d "$ydir" ] || continue
  year=$(basename "$ydir")
  for html in "$ydir"/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.html; do
    [ -f "$html" ] || continue
    base=$(basename "$html" .html)
    if [ ! -f "$SRC/posts/$year/$base.md" ]; then
      mkdir -p /www/backup/resc-orphans/"$year"
      mv -f -- "$html" /www/backup/resc-orphans/"$year"/"$base".html
      echo "[moved orphan page] /posts/$year/$base.html -> /www/backup/resc-orphans/$year/" >> "$LOG"
    fi
  done
done

writeStatus done true
echo "===== deploy OK $(date -Iseconds) =====" >> "$LOG"
exit 0
