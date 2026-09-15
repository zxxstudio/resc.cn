#!/usr/bin/env node
/**
 * gen-theme-config.mjs
 * ------------------------------------------------------------
 * 把后台保存的 site-settings.json 深合并到主题默认配置上，
 * 生成 .vitepress/themeConfig.mjs。
 *
 * 为什么要这一步：
 *   主题 init.mjs 会 import .vitepress/themeConfig.mjs 并合并到默认配置里（这是主题自带的正规扩展点）。
 *   但后台改的是 site-settings.json，构建时没人和它对接，
 *   导致后台绝大多数开关其实是「死的」（改了不生效），
 *   只有 Nav / Banner / About / Project / TechShare 这几个组件运行时 fetch 了它才有效。
 *   生成这个文件之后，全部配置项都能由后台控制。
 *
 * 合并规则：
 *   - 普通对象：递归深合并，没配的字段保留主题默认值
 *   - 数组：后台数组非空才覆盖，空数组视为「没配」保留默认（避免误清空导航/友链）
 *   - null / undefined：跳过，保留默认
 *
 * 用法：node gen-theme-config.mjs [settingsJsonPath]
 */

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const SRC = "/www/wwwroot/resc-cn-src";
const DEFAULTS = `${SRC}/.vitepress/theme/assets/themeConfig.mjs`;
const OUT = `${SRC}/.vitepress/themeConfig.mjs`;
const SETTINGS = process.argv[2] || "/www/wwwroot/resc-cn-settings/site-settings.json";

const log = (...a) => console.log("[gen-theme-config]", ...a);

const isPlainObj = (v) => v && typeof v === "object" && !Array.isArray(v);

function deepMerge(base, over) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const k of Object.keys(over)) {
    const b = out[k];
    const o = over[k];
    // 后台没填 / 填了 null —— 保留默认
    if (o === undefined || o === null) continue;
    if (Array.isArray(o)) {
      // 空数组视为未配置，避免误清空导航/友链等列表
      if (o.length > 0) out[k] = o;
      continue;
    }
    if (isPlainObj(b) && isPlainObj(o)) {
      out[k] = deepMerge(b, o);
      continue;
    }
    out[k] = o;
  }
  return out;
}

// JS 里 U+2028/U+2029 不能安全出现在字符串字面量中，转义一下
function safeJson(v) {
  return JSON.stringify(v, null, 2).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

async function main() {
  if (!fs.existsSync(SETTINGS)) {
    log("未找到后台配置文件，跳过生成：", SETTINGS);
    return 0;
  }
  if (!fs.existsSync(DEFAULTS)) {
    throw new Error(`找不到主题默认配置：${DEFAULTS}`);
  }

  // 主题默认配置（纯数据，无函数，可安全序列化）
  const defMod = await import(pathToFileURL(DEFAULTS).href);
  const defaults = defMod.themeConfig;
  if (!defaults) throw new Error("默认配置里没有导出 themeConfig");

  const raw = fs.readFileSync(SETTINGS, "utf-8").replace(/^\uFEFF/, "");
  let settings;
  try {
    settings = JSON.parse(raw);
  } catch (e) {
    throw new Error(`后台配置 JSON 解析失败：${e.message}`);
  }

  const merged = deepMerge(defaults, settings);

  const banner = [
    "// 自动生成 —— 请勿手动编辑，改后台设置后重新发布即可覆盖",
    `// 来源: ${SETTINGS}`,
    `// 生成时间: ${new Date().toISOString()}`,
    "",
  ].join("\n");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${banner}export const themeConfig = ${safeJson(merged)};\n`, "utf-8");

  // 友链名单：Link.vue 直接 import 这个文件。后台配过就覆盖，没配就保留主题自带名单。
  if (Array.isArray(settings.linkData) && settings.linkData.length) {
    const LINKDATA_OUT = `${SRC}/.vitepress/theme/assets/linkData.mjs`;
    const origBackup = `${LINKDATA_OUT}.orig.backup`;
    if (fs.existsSync(LINKDATA_OUT) && !fs.existsSync(origBackup)) {
      fs.copyFileSync(LINKDATA_OUT, origBackup);
      log("已备份主题原始友链名单 ->", origBackup);
    }
    const banner2 = [
      "// 自动生成 —— 请勿手动编辑，改「高级设置 → 友链名单」后重新发布即可覆盖",
      `// 来源: ${SETTINGS}`,
      `// 生成时间: ${new Date().toISOString()}`,
      "",
    ].join("\n");
    fs.writeFileSync(
      LINKDATA_OUT,
      `${banner2}const linkData = ${safeJson(settings.linkData)};\n\nexport default linkData;\n`,
      "utf-8",
    );
    log(`已生成 ${LINKDATA_OUT}（${settings.linkData.length} 个分组）`);
  }

  const changed = Object.keys(settings).length;
  log(`已生成 ${OUT}`);
  log(`后台配置 ${changed} 个顶层项，已合并（缺失项沿用主题默认）`);
  return 0;
}

main().catch((e) => {
  console.error("[gen-theme-config] 失败:", e.message);
  process.exit(1);
});
