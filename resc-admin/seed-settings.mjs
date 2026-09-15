#!/usr/bin/env node
/**
 * seed-settings.mjs
 * 把主题默认配置里「新暴露到后台」的几项，补进 site-settings.json，
 * 避免后台表单显示空白、保存后把默认值覆盖成空串。
 * 只补齐缺失的顶层键，已有的一律不动。
 */
import fs from "fs";
import { pathToFileURL } from "url";

const SRC = "/www/wwwroot/resc-cn-src";
const SETTINGS = "/www/wwwroot/resc-cn-settings/site-settings.json";
const DEFAULTS = `${SRC}/.vitepress/theme/assets/themeConfig.mjs`;
const LINKDATA = `${SRC}/.vitepress/theme/assets/linkData.mjs`;

const log = (...a) => console.log("[seed-settings]", ...a);
const clone = (v) => JSON.parse(JSON.stringify(v));

// 关于页联系方式兜底（与 About.vue 里的默认值保持一致）
const DEFAULT_CONTACT = [
  { label: "邮箱", value: "hello@resc.cn", link: "mailto:hello@resc.cn" },
  { label: "GitHub", value: "zxxstudio", link: "https://github.com/zxxstudio" },
  { label: "QQ", value: "871282523", link: "" },
  { label: "B站", value: "67lJluC", link: "https://b23.tv/67lJluC" },
];

async function main() {
  const defMod = await import(pathToFileURL(DEFAULTS).href);
  const def = defMod.themeConfig;
  const settings = JSON.parse(fs.readFileSync(SETTINGS, "utf-8").replace(/^\uFEFF/, ""));

  const added = [];
  const put = (key, val) => {
    if (!(key in settings)) {
      settings[key] = val;
      added.push(key);
    }
  };

  put("music", clone(def.music));
  put("search", clone(def.search));
  put("friends", clone(def.friends));
  put("tongji", clone(def.tongji));
  put("fancybox", clone(def.fancybox));
  put("jumpRedirect", clone(def.jumpRedirect));
  put("linkData", clone(def.linkData || []));

  // 联系我：写进 about 分组
  settings.about = settings.about || {};
  if (!Array.isArray(settings.about.contact) || !settings.about.contact.length) {
    settings.about.contact = clone(DEFAULT_CONTACT);
    added.push("about.contact");
  }

  // 友链名单：优先用主题自带的 linkData.mjs（可能是被改过的真实名单）
  if (!settings.linkData || !settings.linkData.length) {
    if (fs.existsSync(LINKDATA)) {
      try {
        const mod = await import(pathToFileURL(LINKDATA).href);
        const data = mod.default || mod.linkData;
        if (Array.isArray(data) && data.length) {
          settings.linkData = clone(data);
          added.push("linkData(来自 linkData.mjs)");
        }
      } catch (e) {
        log("读取 linkData.mjs 失败：", e.message);
      }
    }
  }

  if (added.length) {
    fs.copyFileSync(SETTINGS, `${SETTINGS}.bak.seed.${Date.now()}`);
    fs.writeFileSync(SETTINGS, JSON.stringify(settings, null, 2), "utf-8");
    log("已补齐：", added.join(", "));
  } else {
    log("无需补齐，配置里已有这些项");
  }
  log("linkData 分组数：", (settings.linkData || []).length);
}

main().catch((e) => {
  console.error("[seed-settings] 失败:", e.message);
  process.exit(1);
});
