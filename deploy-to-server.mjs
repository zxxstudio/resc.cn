#!/usr/bin/env node
/**
 * 手动部署到服务器（scp 上传 dist）
 * 使用: node deploy-to-server.mjs
 * 需求: SSH 私钥在 ../deploy_key
 */

import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, chmodSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const distDir = resolve(projectRoot, '.vitepress/dist');
const keyPath = resolve(__dirname, '../deploy_key');
const server = '121.37.183.37';
const serverUser = 'root';
const serverPath = '/www/wwwroot/resc.cn';

console.log('🚀 部署到服务器');
console.log('📁 本地:', distDir);
console.log('🌐 服务器:', `${serverUser}@${server}:${serverPath}`);
console.log('🔑 密钥:', keyPath);

if (!existsSync(distDir)) {
  console.error('❌ dist 目录不存在，请先构建');
  process.exit(1);
}

if (!existsSync(keyPath)) {
  console.error('❌ SSH 密钥不存在:', keyPath);
  process.exit(1);
}

// Windows 下需要给密钥文件权限（或者用 ssh-agent）
// 这里用 -i 参数直接指定密钥

const args = [
  '-i', keyPath,
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'UserKnownHostsFile=/dev/null',
  '-r',
  distDir + '/', // 末尾斜杠 = 上传目录内容而非目录本身
  `${serverUser}@${server}:${serverPath}`
];

console.log('\n📤 上传中...');
const start = Date.now();

const proc = spawn('scp', args, {
  stdio: 'inherit',
  shell: true,
});

proc.on('close', (code) => {
  if (code === 0) {
    console.log(`\n✅ 部署成功 (${((Date.now() - start) / 1000).toFixed(1)}s)`);
    console.log('🌐 访问: https://resc.cn');
  } else {
    console.error(`\n❌ 部署失败 (exit code ${code})`);
    console.error('💡 可能原因:');
    console.error('   - SSH 22 端口未开放（去华为云控制台添加安全组规则）');
    console.error('   - 密钥未添加到服务器 authorized_keys');
    console.error('   - 服务器路径不存在');
  }
});

proc.on('error', (err) => {
  console.error('❌ 启动 scp 失败:', err.message);
  console.error('💡 请确保系统安装了 OpenSSH（Windows 10/11 自带）');
});