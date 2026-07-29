#!/usr/bin/env node
/**
 * 自动部署脚本 - 监听 dist 变化 → build → git push
 * 使用: node auto-deploy.mjs
 */

import { watch } from 'fs';
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const distDir = resolve(projectRoot, '.vitepress/dist');

let isDeploying = false;
let buildTimeout = null;

console.log('🚀 自动部署守护进程启动');
console.log('📁 项目目录:', projectRoot);
console.log('👀 监听目录:', distDir);
console.log('⏳ 等待变化...\n');

// 监听 dist 目录
watch(distDir, { recursive: true }, (eventType, filename) => {
  if (isDeploying) return;

  // 防抖：500ms 内多次变化只触发一次
  clearTimeout(buildTimeout);
  buildTimeout = setTimeout(() => {
    console.log(`📝 检测到变化: ${filename || '(unknown)'}`);
    deploy();
  }, 500);
});

async function deploy() {
  if (isDeploying) return;
  isDeploying = true;

  console.log('🔨 开始构建...');
  const buildStart = Date.now();

  try {
    // 1. 构建
    await run('node', ['node_modules/vitepress/bin/vitepress.js', 'build'], projectRoot);
    console.log(`✅ 构建完成 (${((Date.now() - buildStart) / 1000).toFixed(1)}s)`);

    // 2. Git 操作
    console.log('📦 提交到 Git...');
    await run('git', ['add', '-A'], projectRoot);
    await run('git', ['commit', '-m', `auto: build at ${new Date().toISOString()}`], projectRoot, true); // allow fail

    console.log('🚀 推送到 GitHub...');
    const pushStart = Date.now();
    await run('git', ['push', 'origin', 'main'], projectRoot);
    console.log(`✅ 推送完成 (${((Date.now() - pushStart) / 1000).toFixed(1)}s)`);

    console.log('\n🎉 部署成功！网站已推送到 GitHub');
    console.log('⏳ 等待下次变化...\n');
  } catch (err) {
    console.error('❌ 部署失败:', err.message);
  } finally {
    isDeploying = false;
  }
}

function run(cmd, args, cwd, allowFail = false) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd,
      shell: true,
      stdio: 'inherit',
    });
    proc.on('close', (code) => {
      if (code === 0 || allowFail) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`));
    });
    proc.on('error', reject);
  });
}

// 初始部署（可选）
console.log('🔄 执行初始部署...');
deploy();