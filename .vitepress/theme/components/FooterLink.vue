<!-- 页脚 - 链接 -->
<template>
  <div class="footer-link">
    <div v-if="showBar" class="footer-bar">
      <span class="site-title">{{ site.title }}</span>
      <span class="site-desc">{{ site.description }}</span>
      <a href="/" class="to-home">了解更多</a>
    </div>
    <div class="footer-social">
      <a
        v-for="(item, index) in socialLinkData.first"
        :key="index"
        :href="item.link"
        target="_blank"
        class="social-link"
      >
        <i :class="`iconfont icon-${item.icon}`"></i>
      </a>
      <div class="logo-center" title="返回顶部" @click="smoothScrolling">
        <img :src="siteMeta.logo" alt="logo" class="logo-img" />
        <span class="logo-text">{{ site.title }}</span>
      </div>
      <a
        v-for="(item, index) in socialLinkData.second"
        :key="index"
        :href="item.link"
        target="_blank"
        class="social-link"
      >
        <i :class="`iconfont icon-${item.icon}`"></i>
      </a>
    </div>
    <div class="footer-quote">
      <p class="quote-text">{{ footerQuote }}</p>
    </div>
    <div class="footer-sitemap">
      <div v-for="(item, index) in footer.sitemap" :key="index" class="sitemap-item">
        <span class="title">{{ item.text }}</span>
        <div class="links">
          <a
            v-for="(link, linkIndex) in item.items"
            :key="linkIndex"
            :href="link.link"
            :target="link.newTab ? '_blank' : null"
            class="link-text"
          >
            {{ link.text }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { smoothScrolling } from "@/utils/helper";

const { theme, site } = useData();
const { footer, siteMeta } = theme.value;
const props = defineProps({
  // 显示底栏
  showBar: {
    type: Boolean,
    default: true,
  },
});

// 社交链接数据
const socialLinkData = computed(() => {
  const halfLength = Math.ceil(footer.social.length / 2);
  const firstHalf = footer.social.slice(0, halfLength);
  const secondHalf = footer.social.slice(halfLength);
  return { first: firstHalf, second: secondHalf };
});

// 随机展示一句标语
const footerQuotes = [
  "保持好奇，保持热爱",
  "简单即美，少即是多",
  "记录思考，分享成长",
  "代码之外，生活之中",
];
const footerQuote = footerQuotes[Math.floor(Math.random() * footerQuotes.length)];
</script>

<style lang="scss" scoped>
.footer-link {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  flex-direction: row;
  margin: 1rem auto;
  margin-bottom: 3rem;
  padding: 0 1rem;
  animation: show 0.3s backwards;
  .footer-bar {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2rem;
    .site-title {
      font-weight: bold;
      font-size: 22px;
    }
    .site-desc {
      margin: 0.6rem 0;
      font-weight: bold;
      font-size: 18px;
      color: var(--main-font-second-color);
    }
    .to-home {
      padding: 8px 16px;
      border-radius: 25px;
      margin-top: 8px;
      font-size: 14px;
      color: var(--main-font-color);
      background-color: var(--main-card-second-background);
      border: 1px solid var(--main-card-border);
      transition:
        color 0.3s,
        transform 0.3s,
        border-color 0.3s,
        background-color 0.3s;
      cursor: pointer;
      &:hover {
        color: var(--main-card-background);
        background-color: var(--main-color);
        transform: scale(1.1);
        border-color: var(--main-color);
      }
    }
  }
  .footer-social {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
    gap: 2rem;
    .social-link {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background-color: var(--main-font-color);
      transition:
        transform 0.3s,
        background-color 0.3s;
      .iconfont {
        font-size: 22px;
        color: var(--main-card-background);
      }
      &:hover {
        transform: scale(1.15);
        background-color: var(--main-color);
      }
      &:active {
        transform: scale(1);
      }
    }
    .logo-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--main-card-background) 0%, var(--main-card-second-background) 100%);
      border: 1px solid var(--main-card-border);
      transition: all 0.3s ease;
      cursor: pointer;
      .logo-img {
        width: 80px;
        height: 80px;
        object-fit: contain;
        transition: transform 0.3s;
      }
      .logo-text {
        font-size: 14px;
        font-weight: 600;
        color: var(--main-font-color);
        letter-spacing: 2px;
      }
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        .logo-img {
          transform: scale(1.05);
        }
      }
    }
    @media (max-width: 768px) {
      gap: 1rem;
      .logo-center {
        padding: 0.8rem 1.5rem;
        .logo-img {
          width: 60px;
          height: 60px;
        }
        .logo-text {
          font-size: 12px;
        }
      }
      .social-link {
        width: 40px;
        height: 40px;
      }
    }
  }
  .footer-quote {
    width: 100%;
    text-align: center;
    margin: 1.5rem 0 1rem;
    .quote-text {
      font-size: 14px;
      color: var(--main-font-second-color);
      font-style: italic;
      letter-spacing: 1px;
      opacity: 0.8;
    }
  }
  .footer-sitemap {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 1rem 0;
    .sitemap-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 120px;
      .title {
        display: inline-block;
        margin: 1rem 0;
        font-size: 16px;
        font-weight: bold;
        color: var(--main-font-second-color);
      }
      .links {
        display: flex;
        flex-direction: column;
        align-items: center;
        .link-text {
          color: var(--main-font-color);
          display: inline-block;
          max-width: 120px;
          width: max-content;
          margin: 4px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow-wrap: break-word;
          padding: 8px;
          border-radius: 12px;
          transition:
            color 0.3s,
            background-color 0.3s;
          cursor: pointer;
          &:hover {
            color: var(--main-color);
            background-color: var(--main-color-bg);
          }
        }
      }
    }
  }
}
</style>
