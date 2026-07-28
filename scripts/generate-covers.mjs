#!/usr/bin/env node
/**
 * 自动生成文章封面图（SVG 格式）
 * 使用纯 JavaScript 生成精美的几何图案 SVG
 *
 * 运行方式：node scripts/generate-covers.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  postsDir: path.resolve(__dirname, '../posts'),
  outputDir: path.resolve(__dirname, '../public/images/covers'),
  width: 1200,
  height: 630,
  // 浅蓝系配色方案
  colorSchemes: [
    { bg: ['#5B9BD5', '#87CEEB', '#B0E0E6'], accent: '#ffffff' },  // 天空蓝
    { bg: ['#4A90E2', '#7FB3D5', '#A9CCE3'], accent: '#ffffff' },  // 科技蓝
    { bg: ['#3498DB', '#5DADE2', '#85C1E9'], accent: '#ffffff' },  // 清爽蓝
    { bg: ['#2980B9', '#5499C7', '#7FB3D5'], accent: '#ffffff' },  // 深蓝
    { bg: ['#1ABC9C', '#48C9B0', '#76D7C4'], accent: '#ffffff' },  // 青绿
  ],
};

// 确保输出目录存在
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

/**
 * 从标题生成一个稳定的颜色索引
 */
function getColorIndex(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % CONFIG.colorSchemes.length;
}

/**
 * 生成几何图案装饰元素
 */
function generateDecorations(colors, width, height) {
  const decorations = [];

  // 随机圆形
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = 50 + Math.random() * 150;
    decorations.push(
      `<circle cx="${x}" cy="${y}" r="${radius}" fill="${colors.accent}" opacity="0.15"/>`
    );
  }

  // 随机矩形
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const w = 100 + Math.random() * 200;
    const h = 100 + Math.random() * 200;
    const rotate = Math.random() * 45;
    decorations.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${colors.accent}" opacity="0.15" transform="rotate(${rotate} ${x + w / 2} ${y + h / 2})"/>`
    );
  }

  // 线条装饰
  for (let i = 0; i < 8; i++) {
    const y1 = Math.random() * height;
    const y2 = Math.random() * height;
    decorations.push(
      `<line x1="0" y1="${y1}" x2="${width}" y2="${y2}" stroke="${colors.accent}" stroke-width="2" opacity="0.1"/>`
    );
  }

  return decorations.join('\n    ');
}

/**
 * 生成 SVG 封面
 */
function generateSVG(title, colors) {
  const width = CONFIG.width;
  const height = CONFIG.height;

  // 计算标题换行（如果太长）
  const maxCharsPerLine = 12;
  let titleLines = [title];
  if (title.length > maxCharsPerLine) {
    const words = title.split('');
    titleLines = [];
    let currentLine = '';
    for (const char of words) {
      if (currentLine.length >= maxCharsPerLine) {
        titleLines.push(currentLine);
        currentLine = char;
      } else {
        currentLine += char;
      }
    }
    if (currentLine) {
      titleLines.push(currentLine);
    }
  }

  // 计算标题 Y 位置
  const lineHeight = 80;
  const totalHeight = titleLines.length * lineHeight;
  const startY = (height - totalHeight) / 2 + lineHeight / 2;

  // 生成标题文字元素
  const titleTexts = titleLines.map((line, i) => {
    const y = startY + i * lineHeight;
    return `
      <text x="${width / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle"
            font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="72" font-weight="bold"
            fill="${colors.accent}" filter="url(#shadow)">
        ${escapeXml(line)}
      </text>`;
  }).join('\n');

  // 底部装饰线
  const lineWidth = Math.min(200, title.length * 30);
  const lineY = startY + titleLines.length * lineHeight / 2 + 40;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <!-- 渐变背景 -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg[0]}"/>
      <stop offset="50%" style="stop-color:${colors.bg[1]}"/>
      <stop offset="100%" style="stop-color:${colors.bg[2]}"/>
    </linearGradient>
    <!-- 文字阴影 -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>

  <!-- 背景 -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>

  <!-- 几何装饰 -->
  ${generateDecorations(colors, width, height)}

  <!-- 标题 -->
  <g>${titleTexts}
  </g>

  <!-- 底部装饰线 -->
  <line x1="${(width - lineWidth) / 2}" y1="${lineY}" x2="${(width + lineWidth) / 2}" y2="${lineY}"
        stroke="${colors.accent}" stroke-width="3" opacity="0.8"/>
</svg>`;
}

/**
 * XML 转义
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 为一篇文章生成封面
 */
function generateCover(postPath) {
  const content = fs.readFileSync(postPath, 'utf-8');

  // 解析 frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.log(`跳过 ${postPath}：没有 frontmatter`);
    return null;
  }

  const frontmatter = frontmatterMatch[1];
  const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (!titleMatch) {
    console.log(`跳过 ${postPath}：没有 title`);
    return null;
  }

  const title = titleMatch[1].trim();
  const colorIndex = getColorIndex(title);
  const colors = CONFIG.colorSchemes[colorIndex];

  // 生成 SVG
  const svg = generateSVG(title, colors);

  // 生成文件名
  const hash = Buffer.from(title).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  const filename = `cover-${hash}.svg`;
  const outputPath = path.join(CONFIG.outputDir, filename);

  // 保存 SVG
  fs.writeFileSync(outputPath, svg, 'utf-8');

  console.log(`✓ 生成封面：${filename} (标题: ${title})`);

  return {
    title,
    filename,
    coverPath: `/images/covers/${filename}`,
    relativePath: path.relative(path.resolve(__dirname, '..'), postPath)
  };
}

/**
 * 扫描所有文章并生成封面
 */
function main() {
  console.log('开始生成文章封面...\n');

  const results = [];

  // 递归扫描 posts 目录
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.md')) {
        const result = generateCover(fullPath);
        if (result) {
          results.push(result);
        }
      }
    }
  }

  scanDir(CONFIG.postsDir);

  console.log(`\n完成！共生成 ${results.length} 张封面`);
  console.log(`输出目录：${CONFIG.outputDir}\n`);

  // 输出 cover 配置信息
  console.log('文章封面映射：');
  console.log('---');
  for (const r of results) {
    console.log(`标题: ${r.title}`);
    console.log(`文件: ${r.relativePath}`);
    console.log(`封面: ${r.coverPath}`);
    console.log('');
  }
}

main();
