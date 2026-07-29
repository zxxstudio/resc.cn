<!-- 页脚 - 链接（居中紧凑版，参考图2风格） -->
<template>
  <div class="footer-link">
    <div class="footer-social">
      <a
        v-for="(item, index) in footer.social"
        :key="index"
        :href="item.link"
        target="_blank"
        class="social-link"
        :title="item.text"
      >
        <i :class="`iconfont icon-${item.icon}`"></i>
      </a>
    </div>
    <nav class="footer-nav">
      <a
        v-for="(item, index) in flatLinks"
        :key="index"
        :href="item.link"
        :target="item.newTab ? '_blank' : null"
        class="nav-link"
      >
        {{ item.text }}
      </a>
    </nav>
  </div>
</template>

<script setup>
const { theme } = useData();
const { footer } = theme.value;
const props = defineProps({
  showBar: { type: Boolean, default: true },
});

// 拍平 sitemap 所有链接到一个数组
const flatLinks = computed(() => {
  const out = [];
  if (footer.sitemap && Array.isArray(footer.sitemap)) {
    footer.sitemap.forEach((group) => {
      if (group.items && Array.isArray(group.items)) {
        group.items.forEach((l) => out.push(l));
      }
    });
  }
  return out;
});
</script>

<style lang="scss" scoped>
.footer-link {
  width: 100%;
  max-width: 1100px;
  margin: 3rem auto 2rem;
  padding: 0 1.5rem;
  animation: show 0.3s backwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;

  .footer-nav {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    .nav-link {
      display: inline-block;
      padding: 8px 18px;
      font-size: 15px;
      color: var(--main-font-color);
      border-radius: 8px;
      transition: color 0.3s, background-color 0.3s;
      cursor: pointer;
      &:hover {
        color: var(--main-color);
        background-color: var(--main-color-bg);
      }
    }
  }

  .footer-social {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    .social-link {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: var(--main-font-second-color);
      transition: color 0.3s, transform 0.3s;
      cursor: pointer;
      .iconfont {
        font-size: 28px;
      }
      &:hover {
        color: var(--main-color);
        transform: scale(1.1);
      }
    }
  }

  @media (max-width: 640px) {
    .footer-nav {
      gap: 0;
      .nav-link {
        padding: 5px 10px;
        font-size: 13px;
      }
    }
  }
}
</style>