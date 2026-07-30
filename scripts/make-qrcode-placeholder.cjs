const fs = require('fs');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f5f5f7"/>
  <rect x="20" y="20" width="360" height="360" fill="none" stroke="#b4b4be" stroke-width="2" rx="12"/>
  <text x="200" y="170" font-family="Microsoft YaHei,sans-serif" font-size="22" font-weight="bold" fill="#50505a" text-anchor="middle">微信公众号</text>
  <text x="200" y="220" font-family="Microsoft YaHei,sans-serif" font-size="14" fill="#50505a" text-anchor="middle">二维码图占位中</text>
  <text x="200" y="245" font-family="Microsoft YaHei,sans-serif" font-size="14" fill="#50505a" text-anchor="middle">请发送公众号二维码图片</text>
  <text x="200" y="270" font-family="Microsoft YaHei,sans-serif" font-size="14" fill="#50505a" text-anchor="middle">替换此文件</text>
</svg>`;

const target = path.resolve(
  process.argv[2] ||
    "D:/迅雷下载/curve2/vitepress-theme-curve-master/public/images/qrcode/wechat-mp.svg"
);
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, svg, "utf-8");
console.log("ok", target, fs.statSync(target).size, "bytes");