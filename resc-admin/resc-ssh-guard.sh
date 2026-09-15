#!/bin/bash
# resc.cn 轻量 SSH 防暴力破解
# 逻辑：扫描 /var/log/secure 最近若干条记录，失败次数超阈值的 IP 用 firewalld 临时拉黑
# 安全性说明：
#   - 规则带 --timeout，到期自动解除；执行 firewall-cmd --reload 或重启 firewalld 立即全部解除
#   - 曾经成功登录过的 IP 自动进白名单，永远不会被封
#   - 想彻底停用：crontab -e 删掉 resc-ssh-guard 那行即可
export LANG=C.UTF-8
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

GUARD_LOG=/var/log/resc-ssh-guard.log
ALLOW_FILE=/usr/local/etc/resc-ssh-allow.txt
SCAN_LINES=5000
THRESHOLD=20
BAN_SEC=3600

ALLOW=" 127.0.0.1 "
while read -r ip; do
  [ -n "$ip" ] && case "$ALLOW" in *" $ip "*) ;; *) ALLOW="$ALLOW $ip " ;; esac
done < <(grep "Accepted" /var/log/secure /var/log/secure-* 2>/dev/null | grep -oE 'from [0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | awk '{print $2}' | sort -u)

if [ -f "$ALLOW_FILE" ]; then
  while read -r ip; do
    case "$ip" in ''|\#*) continue ;; esac
    case "$ALLOW" in *" $ip "*) ;; *) ALLOW="$ALLOW $ip " ;; esac
  done < "$ALLOW_FILE"
fi

current_rules=$(firewall-cmd --list-rich-rules 2>/dev/null)

tail -n "$SCAN_LINES" /var/log/secure 2>/dev/null \
  | grep "Failed password" \
  | grep -oE 'from [0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' \
  | awk '{print $2}' \
  | sort | uniq -c | sort -rn \
  | while read -r cnt ip; do
      [ "$cnt" -lt "$THRESHOLD" ] && break
      case "$ALLOW" in *" $ip "*) continue ;; esac
      case "$current_rules" in *"$ip"*) continue ;; esac
      if firewall-cmd --add-rich-rule="rule family='ipv4' source address='$ip' drop" --timeout="$BAN_SEC" >/dev/null 2>&1; then
        echo "$(date -Iseconds) BAN $ip  failures=$cnt  ttl=${BAN_SEC}s" >> "$GUARD_LOG"
      fi
    done

exit 0
