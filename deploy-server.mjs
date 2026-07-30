#!/usr/bin/env node
/**
 * 部署到服务器（通过 SSH）
 * Windows 下用 PowerShell + ssh 命令
 */

import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '.vitepress/dist');
const keyPath = resolve(__dirname, '../deploy_key');
const server = '121.37.183.37';
const serverUser = 'root';
const serverPath = '/www/wwwroot/resc.cn';

console.log('🚀 部署到服务器');
console.log('📁 本地:', distDir);
console.log('🌐 服务器:', `${serverUser}@${server}:${serverPath}`);

if (!existsSync(distDir)) {
  console.error('❌ dist 目录不存在');
  process.exit(1);
}

console.log('\n📦 上传中...');
const start = Date.now();

// Windows 下用 scp（Windows 10/11 自带 OpenSSH）
// 先清空服务器目录，再上传
const cleanAndUpload = spawn('ssh', [
  '-i', keyPath,
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'UserKnownHostsFile=/dev/null',
  `${serverUser}@${server}`,
  `cd ${serverPath} && rm -rf *`
], {
  stdio: 'inherit',
});

cleanAndUpload.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ 清空服务器失败');
    return;
  }

  // 上传 dist 目录内容
  const upload = spawn('scp', [
    '-i', keyPath,
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'UserKnownHostsFile=/dev/null',
    '-r',
    distDir + '/*',
    `${serverUser}@${server}:${serverPath}/`
  ], {
    stdio: 'inherit',
    shell: true,
  });

  upload.on('close', (code) => {
    if (code === 0) {
      console.log(`\n✅ 部署成功 (${((Date.now() - start) / 1000).toFixed(1)}s)`);
      console.log('🌐 访问: https://resc.cn');
    } else {
      console.error(`\n❌ 上传失败 (exit ${code})`);
    }
  });
});