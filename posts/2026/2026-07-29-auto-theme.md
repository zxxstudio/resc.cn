---
title: 给网站加了"自动换肤"——白天小清新，晚上深邃黑
tags: [折腾, VitePress, Vue]
categories: [技术]
date: 2026-07-29
description: 把网站背景功能简化，新增按时间自动切换浅色/深色主题的功能，18:00 自动变深色，06:00 自动回浅色
cover: /images/covers/cover-2026-07-29-hero.png
articleGPT: 记录了对网站背景系统的重构：删除纹理/图片切换功能，改为纯色背景，新增按当地时间自动切换浅深色主题的完整过程
references:
  - title: VitePress
    url: https://vitepress.dev/
  - title: Pinia
    url: https://pinia.vuejs.org/
---

## 起因

之前网站有个"背景切换"功能——关闭、纹理、图片三种模式。

问题是：
- **纹理模式**：太花哨，和网站整体风格不搭
- **图片模式**：依赖第三方图源，速度不稳定，偶尔黑屏
- **关闭模式**：纯色，太平淡

所以决定：**全部砍掉，换成更实用的自动换肤**。

![日夜切换效果对比](/images/covers/cover-2026-07-29-hero.png)

## 目标

砍掉三个按钮（关闭/纹理/图片），换成两个：
- **浅色背景**
- **深色背景**

再新增一个开关：**自动按时间切换**

规则很简单：
- 🌅 06:00 ~ 17:59 → 浅色
- 🌙 18:00 ~ 05:59 → 深色

## 技术实现

### 1. 自动切换原理

每分钟检查一次当前时间，决定用哪种背景。整个逻辑用一个时钟视角来理解：

![自动切换逻辑图解](/images/covers/cover-2026-07-29-clock.png)

### 2. Store 层

用 Pinia 管理状态，删掉旧字段，保留核心：

```javascript
state: () => ({
  themeType: 'auto', // 'light' | 'dark' | 'auto'
  autoTimeSwitch: true,
}),

actions: {
  getTimeBasedTheme() {
    const hour = new Date().getHours()
    return (hour >= 6 && hour < 18) ? 'light' : 'dark'
  }
}
```

### 3. 自动定时检查

每分钟检查一次时间，决定是否切换：

```javascript
onMounted(() => {
  // 启用自动模式时立即计算一次
  if (autoTimeSwitch.value) {
    themeType.value = store.getTimeBasedTheme()
  }

  // 每 60 秒检查
  autoTimeInterval = setInterval(() => {
    if (autoTimeSwitch.value) {
      themeType.value = store.getTimeBasedTheme()
    }
  }, 60 * 1000)
})
```

### 4. UI 简化

Settings.vue 里，原来三个按钮变成两个 + 一个开关：

![新 UI 设计：浅/深色选择 + 自动切换开关](/images/covers/cover-2026-07-29-ui.png)

开启自动切换时，浅/深按钮显示"已关闭"提示，告诉你别手动调了。

### 5. 背景组件简化

Background.vue 从原来复杂的图片加载+纹理+错误处理，简化为：

```javascript
// 只有两种纯色背景
const bgColor = computed(() =>
  themeType === 'dark' ? '#0f1419' : '#f5f9fc'
)
```

CSS transition 加一行，平滑过渡：

```css
body {
  background-color: var(--bg-color);
  transition: background-color 0.4s ease;
}
```

### 6. localStorage 清理

用户之前保存的旧字段（`backgroundType`、`backgroundUrl`、`backgroundBlur`）在下次访问时自动清除，不污染新系统：

```javascript
try {
  const raw = localStorage.getItem("siteData")
  if (raw) {
    const obj = JSON.parse(raw)
    delete obj.backgroundType
    delete obj.backgroundUrl
    delete obj.backgroundBlur
    localStorage.setItem("siteData", JSON.stringify(obj))
  }
} catch (e) { /* noop */ }
```

## 部署

写了一个自动部署脚本，监听文件变化 → 自动 build → 自动 push → 服务器自动更新：

```bash
# 启动守护进程
./start-deploy.bat

# 手动部署到服务器
./deploy-server.bat
```

改完代码保存，**10 秒内自动上 GitHub，1 分钟内服务器同步**。

## 效果

- ✅ 白天打开网站：浅蓝色背景，清爽
- ✅ 下午 6 点后刷新：自动变深色，不刺眼
- ✅ 手动切换：依然可用，只是和自动互斥
- ✅ 无需任何操作，完全后台自动

## 后续可以继续做的

1. **切换动画**：加点过渡效果，不只是颜色变化
2. **记住用户偏好**：用户手动切换后，临时覆盖自动，下次访问再恢复
3. **太阳升起/落下曲线**：不只是 6/18 点两个硬切，而是渐变过渡
4. **桌面/移动端独立设置**：手机和电脑偏好可能不一样

---

整个改动不大，但让网站"聪明"了不少。自动的东西，用起来无感，才是好自动。
