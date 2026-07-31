<template>
  <div class="about">
    <h1 class="title">关于本站</h1>

    <!-- 自我介绍 -->
    <div class="card hero">
      <div class="hero-text">
        <p class="greeting">你好，我是</p>
        <h2 class="name">张小性</h2>
        <p class="role">小性工作室 主理人 · 独立开发者</p>
        <p class="desc">
          折腾技术、做小工具、写代码、偶尔也写写博客。
          这个站是我日常折腾的记录地——做过了什么、踩过什么坑、想到了什么。
        </p>
      </div>
    </div>

    <!-- 联系方式 + 站点信息 -->
    <div class="grid two">
      <div class="card">
        <h3 class="card-title">联系方式</h3>
        <ul class="contact">
          <li><strong>邮箱</strong> hello@resc.cn</li>
          <li><strong>GitHub</strong> github.com/zxxstudio</li>
          <li><strong>QQ</strong> 871282523</li>
          <li><strong>B站</strong> b23.tv/67lJluC</li>
        </ul>
      </div>
      <div class="card">
        <h3 class="card-title">站点信息</h3>
        <ul class="contact">
          <li><strong>域名</strong> resc.cn</li>
          <li><strong>备案</strong> 豫ICP备2024084281号-1</li>
          <li><strong>建于</strong> 2024 · 持续更新</li>
          <li><strong>技术栈</strong> VitePress · Vue 3 · TypeScript</li>
        </ul>
      </div>
    </div>

    <!-- 在折腾 -->
    <div class="card">
      <h3 class="card-title">在折腾什么</h3>
      <div class="tags">
        <span class="tag">AI 工具</span>
        <span class="tag">个人网站</span>
        <span class="tag">3D / WebGL</span>
        <span class="tag">自动化脚本</span>
        <span class="tag">色彩设计</span>
        <span class="tag">建站搭子</span>
      </div>
    </div>

    <!-- 为什么做这个站 -->
    <div class="card">
      <h3 class="card-title">为什么做这个站</h3>
      <p>
        想法很简单：折腾过的东西总归要留下点什么。
        不管是一段代码、一个配色、一个小工具——写下来，回头看，比脑子记得牢。
      </p>
      <p>
        如果你路过这里，刚好看到一篇对你有用的文章，那这次折腾就算有了额外的回报。
        谢谢你来逛。
      </p>
    </div>

    <!-- 站点的脚步 -->
    <div class="card">
      <h3 class="card-title">脚步</h3>
      <ul class="timeline">
        <li>
          <span class="time">2024</span>
          <span class="dot"></span>
          <span>注册 resc.cn，开始折腾</span>
        </li>
        <li>
          <span class="time">2025</span>
          <span class="dot"></span>
          <span>搭建 VitePress 博客骨架</span>
        </li>
        <li>
          <span class="time">2026</span>
          <span class="dot"></span>
          <span>改版上线，引入 3D、AI 元素，开始记录折腾日常</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// 简洁的"关于"页 — 不依赖任何外部 API
</script>

<style lang="scss" scoped>
.about {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 1rem 4rem;

  .title {
    font-size: 2.4rem;
    text-align: center;
    border: none;
    margin: 1rem 0 2rem;
  }

  .card {
    background-color: var(--main-card-background);
    border: 1px solid var(--main-card-border);
    border-radius: 12px;
    padding: 1.5rem 1.8rem;
    margin-bottom: 1.2rem;
    box-shadow: 0 4px 12px -6px var(--main-border-shadow);
  }

  .card-title {
    font-size: 1.15rem;
    font-weight: 600;
    margin: 0 0 1rem;
    color: var(--main-color);
  }

  .hero {
    background-image: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
    color: #fff;
    border: none;

    .greeting {
      opacity: 0.85;
      margin: 0;
    }
    .name {
      font-size: 2.4rem;
      margin: 0.3rem 0 0.5rem;
      font-weight: 700;
    }
    .role {
      opacity: 0.9;
      margin: 0 0 1rem;
    }
    .desc {
      margin: 0;
      opacity: 0.92;
      line-height: 1.7;
    }
  }

  .grid.two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.2rem;

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
    }

    > .card {
      margin-bottom: 0;
    }
  }

  .contact {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: 0.5rem 0;
      border-bottom: 1px dashed var(--main-card-border);
      display: flex;
      gap: 0.8rem;
      font-size: 0.95rem;

      &:last-child {
        border-bottom: none;
      }

      strong {
        color: var(--main-font-second-color);
        font-weight: 500;
        min-width: 4.5rem;
      }
    }
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;

    .tag {
      padding: 0.35rem 0.9rem;
      background: var(--main-color-bg);
      color: var(--main-color);
      border-radius: 999px;
      font-size: 0.88rem;
      font-weight: 500;
    }
  }

  p {
    margin: 0 0 0.8rem;
    line-height: 1.75;
    color: var(--main-font-color);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .timeline {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.55rem 0;
      font-size: 0.95rem;

      .time {
        min-width: 4rem;
        font-weight: 600;
        color: var(--main-color);
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--main-color);
      }
    }
  }
}
</style>