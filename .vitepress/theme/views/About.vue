<template>
  <div class="about-new">
    <!-- 紧凑 banner -->
    <section class="about-hero">
      <div class="about-hero-left">
        <h1 class="about-hero-title">关于我</h1>
        <p class="about-hero-sub">Hey, I'm {{ authorName }} · {{ heroSubSuffix }}</p>
      </div>
      <div class="about-hero-right">
        <span class="about-hero-days">{{ days }}</span>
        <span class="about-hero-days-label">天 · {{ postCount }} 篇文章</span>
      </div>
    </section>

    <!-- 数据卡片：与前台同步 -->
    <section class="stats-grid">
      <div class="stat-card stat-blue">
        <div class="stat-icon">📝</div>
        <div class="stat-value">{{ postCount }}</div>
        <div class="stat-label">篇文章</div>
      </div>
      <div class="stat-card stat-green">
        <div class="stat-icon">📅</div>
        <div class="stat-value">{{ days }}</div>
        <div class="stat-label">天运行</div>
      </div>
      <div class="stat-card stat-orange">
        <div class="stat-icon">🏷️</div>
        <div class="stat-value">{{ tagCount }}</div>
        <div class="stat-label">个标签</div>
      </div>
      <div class="stat-card stat-purple">
        <div class="stat-icon">📂</div>
        <div class="stat-value">{{ categoryCount }}</div>
        <div class="stat-label">个分类</div>
      </div>
    </section>

    <!-- 左 / 右 两列 -->
    <section class="two-col">
      <!-- 左侧：联系方式 + 站点信息（友情提示已删）-->
      <aside class="left-col">
        <div class="info-card">
          <div class="info-card-header">
            <span class="info-icon">📬</span>
            <h3>联系我</h3>
          </div>
          <template v-for="(ct, i) in contactList" :key="'ct-' + i">
            <a
              v-if="ct.link"
              class="info-item"
              :href="ct.link"
              :target="isExternal(ct.link) ? '_blank' : null"
              rel="noopener"
            >
              <span class="info-label">{{ ct.label }}</span>
              <span class="info-value">{{ ct.value }}</span>
            </a>
            <div v-else class="info-item">
              <span class="info-label">{{ ct.label }}</span>
              <span class="info-value">{{ ct.value }}</span>
            </div>
          </template>
        </div>

        <div class="info-card">
          <div class="info-card-header">
            <span class="info-icon">🌐</span>
            <h3>站点信息</h3>
          </div>
          <div class="info-item">
            <span class="info-label">域名</span>
            <span class="info-value">resc.cn</span>
          </div>
          <div class="info-item">
            <span class="info-label">备案</span>
            <span class="info-value">豫ICP备2024084281号-1</span>
          </div>
          <div class="info-item">
            <span class="info-label">建于</span>
            <span class="info-value">{{ sinceDate }} · 持续更新</span>
          </div>
          <div class="info-item">
            <span class="info-label">技术栈</span>
            <span class="info-value">VitePress · Vue 3</span>
          </div>
        </div>
      </aside>

      <!-- 右侧：技能 + 做过什么 -->
      <main class="right-col">
        <!-- 技能 -->
        <div class="block-card">
          <div class="block-header">
            <h3>技能栈</h3>
            <span class="block-subtitle">Technologies I work with</span>
          </div>
          <div class="skills-grid">
            <div class="skill-group" v-for="(group, idx) in skills" :key="idx">
              <h4 class="skill-group-title">{{ group.title }}</h4>
              <div class="skill-tags">
                <span class="skill-tag" v-for="(skill, i) in group.items" :key="i">{{ skill }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目 -->
        <div class="block-card">
          <div class="block-header">
            <h3>做过什么</h3>
            <span class="block-subtitle">Things I've built</span>
          </div>
          <div class="projects-grid">
            <div class="project-card" v-for="(project, idx) in projects" :key="idx" :class="project.color">
              <div class="project-icon">{{ project.icon }}</div>
              <h4 class="project-name">{{ project.name }}</h4>
              <p class="project-desc">{{ project.desc }}</p>
              <div class="project-tags">
                <span class="project-tag" v-for="(tag, i) in project.tags" :key="i">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>

    <!-- 宽屏区：从"在折腾什么"开始，全部满宽 -->
    <section class="fullwidth">
      <!-- 在折腾 -->
      <div class="block-card">
        <div class="block-header">
          <h3>在折腾什么</h3>
          <span class="block-subtitle">Currently exploring</span>
        </div>
        <div class="interests">
          <span class="interest-tag" v-for="(item, idx) in interests" :key="idx">{{ item }}</span>
        </div>
      </div>

      <!-- 为什么做这个站 -->
      <div class="block-card">
        <div class="block-header">
          <h3>为什么做这个站</h3>
          <span class="block-subtitle">Why this site exists</span>
        </div>
        <p class="why-text" v-for="(para, idx) in why" :key="idx">{{ para }}</p>
      </div>

      <!-- 时间线 -->
      <div class="block-card">
        <div class="block-header">
          <h3>站点历史</h3>
          <span class="block-subtitle">Milestones along the way</span>
        </div>
        <ul class="timeline">
          <li v-for="(event, idx) in timeline" :key="idx">
            <div class="timeline-time">{{ event.time }}</div>
            <div class="timeline-dot"></div>
            <div class="timeline-event">{{ event.event }}</div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useData } from 'vitepress'

const { site, theme } = useData()

// 直接从 useData() 拿与前台同步的数据
const postCount = computed(() => {
  const pd = theme.value?.postData || []
  return pd.length || (theme.value?.postSize ?? 0)
})

const tagCount = computed(() => {
  const td = theme.value?.tagsData || {}
  return Object.keys(td).length
})

const categoryCount = computed(() => {
  const cd = theme.value?.categoriesData || {}
  return Object.keys(cd).length
})

const sinceDate = computed(() => {
  return theme.value?.since || '2024-01-01'
})

const days = computed(() => {
  const start = new Date(sinceDate.value)
  const today = new Date()
  return Math.floor((today - start) / (1000 * 60 * 60 * 24))
})

const authorName = computed(() => {
  return site.value?.author?.name || '张小性'
})

const avatar = computed(() => {
  return site.value?.author?.cover || ''
})

const liveSettings = ref(null)
onMounted(async () => {
  try {
    const r = await fetch('/site-settings.json', { cache: 'no-store' })
    if (r.ok) liveSettings.value = await r.json()
  } catch (e) {}
})
const aboutCfg = computed(() => liveSettings.value?.about || theme.value?.about || {})
const heroSubSuffix = computed(() => aboutCfg.value.heroSubSuffix || '做网站、写工具、折腾 AI')
const skills = computed(() => aboutCfg.value.skills || [])
const projects = computed(() => aboutCfg.value.projects || [])
const interests = computed(() => aboutCfg.value.interests || [])
const timeline = computed(() => aboutCfg.value.timeline || [])
const why = computed(() => aboutCfg.value.why || [])

// 联系我：后台「基础设置 → 联系我」可增删，没配就用下面这份兜底
const DEFAULT_CONTACT = [
  { label: "邮箱", value: "hello@resc.cn", link: "mailto:hello@resc.cn" },
  { label: "GitHub", value: "zxxstudio", link: "https://github.com/zxxstudio" },
  { label: "QQ", value: "871282523", link: "" },
  { label: "B站", value: "67lJluC", link: "https://b23.tv/67lJluC" },
]
const contactList = computed(() => {
  const arr = aboutCfg.value.contact
  return Array.isArray(arr) && arr.length ? arr : DEFAULT_CONTACT
})
const isExternal = (u) => /^https?:\/\//i.test(u || "")
</script>

<style lang="scss" scoped>
.about-new {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

// ===== 紧凑 banner =====
.about-hero {
  position: relative;
  width: 100%;
  padding: 1.3rem 1.8rem;
  border-radius: 14px;
  margin: 1rem 0 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.10) 0%, rgba(118, 75, 162, 0.10) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.about-hero-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  min-width: 0;
}

.about-hero-title {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #3d4451;
}

.about-hero-sub {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.about-hero-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  flex-shrink: 0;
}

.about-hero-days {
  font-size: 1.6rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1.1;
}

.about-hero-days-label {
  font-size: 0.8rem;
  color: #8b95a7;
}

// ===== 数据卡片 =====
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-card {
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
    color: #fff;
    transition: transform 0.2s;

    &:hover { transform: translateY(-4px); }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    .stat-value {
      font-size: 2.2rem;
      font-weight: 700;
      line-height: 1;
    }
    .stat-label {
      font-size: 0.85rem;
      opacity: 0.9;
      margin-top: 0.3rem;
    }

    &.stat-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    &.stat-green { background: linear-gradient(135deg, #10b981, #047857); }
    &.stat-orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
    &.stat-purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
  }
}

// ===== 两列布局 =====
.two-col {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.left-col, .right-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

// ===== 信息卡片（左侧） =====
.info-card {
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  border-radius: 12px;
  padding: 1.2rem;
  box-shadow: 0 4px 12px -6px var(--main-border-shadow);

  .info-card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid var(--main-card-border);

    .info-icon { font-size: 1.2rem; }
    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--main-color);
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    text-decoration: none;
    color: inherit;
    transition: color 0.2s;

    &:hover { color: var(--main-color); }

    .info-label {
      width: 4rem;
      flex-shrink: 0;
      color: var(--main-font-second-color);
      font-size: 0.85rem;
    }
    .info-value {
      flex: 1;
      word-break: break-all;
    }
  }
}

// ===== 块卡片 =====
.block-card {
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  border-radius: 12px;
  padding: 1.5rem 1.8rem;
  box-shadow: 0 4px 12px -6px var(--main-border-shadow);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px -8px var(--main-border-shadow);
  }

  .block-header {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    margin-bottom: 1.2rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid var(--main-card-border);

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--main-color);
    }
    .block-subtitle {
      font-size: 0.8rem;
      color: var(--main-font-second-color);
    }
  }
}

// ===== 技能 =====
.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }

  .skill-group-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--main-font-second-color);
    margin: 0 0 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;

    .skill-tag {
      padding: 0.3rem 0.7rem;
      background: var(--main-color-bg);
      color: var(--main-color);
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 500;
      transition: all 0.15s;

      &:hover { transform: scale(1.05); }
    }
  }
}

// ===== 项目 =====
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }

  .project-card {
    padding: 1.2rem;
    border-radius: 10px;
    background: var(--main-color-bg);
    border-left: 3px solid var(--main-color);
    transition: all 0.2s;
    position: relative;

    &.blue { border-left-color: #3b82f6; }
    &.purple { border-left-color: #8b5cf6; }
    &.orange { border-left-color: #f59e0b; }
    &.green { border-left-color: #10b981; }

    &:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px -6px var(--main-border-shadow);
    }

    .project-icon {
      font-size: 1.8rem;
      margin-bottom: 0.4rem;
    }
    .project-name {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.4rem;
      color: var(--main-color);
    }
    .project-desc {
      font-size: 0.85rem;
      color: var(--main-font-second-color);
      margin: 0 0 0.6rem;
      line-height: 1.5;
    }
    .project-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;

      .project-tag {
        padding: 0.15rem 0.5rem;
        background: var(--main-card-background);
        color: var(--main-font-second-color);
        border-radius: 4px;
        font-size: 0.75rem;
        border: 1px solid var(--main-card-border);
      }
    }
  }
}

// ===== 宽屏区 =====
.fullwidth {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1200px;
}

// ===== 在折腾 =====
.interests {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .interest-tag {
    padding: 0.4rem 0.9rem;
    background: linear-gradient(135deg, var(--main-color-bg), transparent);
    color: var(--main-color);
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 500;
    border: 1px solid var(--main-card-border);
    transition: all 0.15s;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px -4px var(--main-border-shadow);
    }
  }
}

// ===== 为什么做这个站 =====
.why-text {
  margin: 0 0 0.8rem;
  line-height: 1.8;
  color: var(--main-font-color);
  font-size: 0.95rem;

  &:last-child { margin-bottom: 0; }
}

// ===== 时间线 =====
.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 5rem;
    top: 0.5rem;
    bottom: 0.5rem;
    width: 2px;
    background: var(--main-color-bg);
  }

  li {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    position: relative;

    .timeline-time {
      width: 4.5rem;
      flex-shrink: 0;
      font-weight: 600;
      color: var(--main-color);
      font-size: 0.85rem;
    }
    .timeline-dot {
      width: 12px; height: 12px;
      border-radius: 50%;
      background: var(--main-color);
      flex-shrink: 0;
      position: relative;
      z-index: 1;
      box-shadow: 0 0 0 3px var(--main-card-background);
    }
    .timeline-event {
      flex: 1;
      color: var(--main-font-color);
    }
  }
}

// ===== 移动端 =====
@media (max-width: 720px) {
  .about-new {
    padding: 0 0.6rem 3rem;
  }
  .about-hero {
    padding: 1rem 1.1rem;
    flex-direction: column;
    align-items: flex-start;
    .about-hero-left { align-items: flex-start; }
    .about-hero-right { align-items: flex-start; text-align: left; }
    .about-hero-title { font-size: 1.3rem; }
    .about-hero-days { font-size: 1.4rem; }
    .about-hero-sub { font-size: 0.85rem; }
  }
  .stats-grid {
    gap: 0.6rem;
    margin-bottom: 1.2rem;
    .stat-card {
      padding: 1rem 0.5rem;
      .stat-value { font-size: 1.7rem; }
      .stat-icon { font-size: 1.6rem; }
      .stat-label { font-size: 0.75rem; }
    }
  }
  .two-col {
    gap: 1rem;
  }
  .left-col .info-card,
  .right-col .block-card {
    padding: 1rem;
  }
  .block-header {
    flex-direction: column;
    gap: 0.2rem;
    .block-subtitle { font-size: 0.72rem; }
  }
  .skills-grid,
  .projects-grid {
    grid-template-columns: 1fr;
  }
  .timeline::before {
    left: 1rem;
  }
  .timeline li {
    gap: 0.6rem;
    .timeline-time { width: 3rem; font-size: 0.75rem; }
    .timeline-dot { width: 10px; height: 10px; }
  }
  .interests .interest-tag {
    font-size: 0.8rem;
    padding: 0.3rem 0.7rem;
  }
}
</style>