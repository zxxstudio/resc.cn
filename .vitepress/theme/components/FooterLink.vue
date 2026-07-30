<!-- 页脚 - 链接（居中紧凑版） -->
<template>
  <div class="footer-link">
    <div class="footer-social">
      <a
        v-for="(item, index) in normalSocial"
        :key="`s-${index}`"
        :href="item.link"
        target="_blank"
        class="social-link"
        :title="item.title || item.link"
      >
        <i v-if="item.iconSvg" class="social-svg" v-html="item.iconSvg" />
        <i v-else :class="`iconfont icon-${item.icon}`"></i>
      </a>
      <!-- 微信/公众号：点击弹出二维码 -->
      <button
        v-for="(item, index) in qrcodeSocial"
        :key="`q-${index}`"
        class="social-link social-qrcode-btn"
        type="button"
        :title="item.title || '扫码关注'"
        @click.stop="openQR(item)"
      >
        <i v-if="item.iconSvg" class="social-svg" v-html="item.iconSvg" />
        <i v-else :class="`iconfont icon-${item.icon}`"></i>
      </button>
      <!-- QQ：点击弹出号码提示 -->
      <button
        v-for="(item, index) in copySocial"
        :key="`c-${index}`"
        class="social-link social-qrcode-btn"
        type="button"
        :title="item.title || '复制'"
        @click.stop="copyText(item.copy, item.title)"
      >
        <i v-if="item.iconSvg" class="social-svg" v-html="item.iconSvg" />
        <i v-else :class="`iconfont icon-${item.icon}`"></i>
      </button>
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

    <!-- 二维码弹窗 -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showQR" class="qr-modal-mask" @click="showQR = false">
          <div class="qr-modal" @click.stop>
            <img :src="qrInfo.image" :alt="qrInfo.title" />
            <p class="qr-tip">{{ qrInfo.title }}</p>
            <p v-if="qrInfo.subtitle" class="qr-sub">{{ qrInfo.subtitle }}</p>
            <button class="qr-close" @click="showQR = false">关闭</button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- 复制提示 -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="toastMsg" class="copy-toast">{{ toastMsg }}</div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
const { theme } = useData();
const { footer } = theme.value;
const props = defineProps({
  showBar: { type: Boolean, default: true },
});

// 分类社交项
const normalSocial = computed(() =>
  (footer.social || []).filter((s) => !s.isQRCode && !s.isCopy)
);
const qrcodeSocial = computed(() =>
  (footer.social || []).filter((s) => s.isQRCode)
);
const copySocial = computed(() =>
  (footer.social || []).filter((s) => s.isCopy)
);

// 二维码弹窗状态
const showQR = ref(false);
const qrInfo = ref({ image: "", title: "", subtitle: "" });
function openQR(item) {
  qrInfo.value = {
    image: item.link,
    title: item.title || "扫码关注",
    subtitle: item.subtitle || "",
  };
  showQR.value = true;
}

// 复制 + 提示
const toastMsg = ref("");
function copyText(text, title) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toastMsg.value = `${title || "已复制"}：${text}`;
      setTimeout(() => (toastMsg.value = ""), 2500);
    })
    .catch(() => {
      toastMsg.value = `号码：${text}（请手动复制）`;
      setTimeout(() => (toastMsg.value = ""), 3000);
    });
}

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
    gap: 0.85rem;
  }

  .social-link,
  .social-qrcode-btn {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 42px;
    height: 42px;
    border-radius: 0;
    color: var(--main-color);
    background: transparent;
    border: none;
    padding: 0;
    transition: color 0.3s, transform 0.3s, opacity 0.3s;
    cursor: pointer;
    opacity: 0.85;
  }

  .social-link:hover,
  .social-qrcode-btn:hover {
    color: var(--main-color);
    background: transparent;
    border: none;
    transform: scale(1.12);
    opacity: 1;
  }

  .iconfont,
  .social-svg {
    font-size: 28px;
    width: 28px;
    height: 28px;
    line-height: 1;
  }

  .social-svg :deep(svg) {
    width: 28px;
    height: 28px;
    fill: currentColor;
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

// 二维码弹窗（Teleport 到 body，要用 :global 或不带 scoped）
:global(.qr-modal-mask) {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}
:global(.qr-modal) {
  background: var(--card-color, #fff);
  border-radius: 16px;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 320px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  img {
    width: 240px;
    height: 240px;
    border-radius: 8px;
    background: #fff;
    padding: 8px;
  }
  .qr-tip {
    font-size: 15px;
    font-weight: 600;
    color: var(--main-font-color, #333);
    margin: 4px 0 0;
  }
  .qr-sub {
    font-size: 13px;
    color: var(--main-font-second-color, #888);
    margin: 0;
  }
  .qr-close {
    margin-top: 8px;
    padding: 6px 18px;
    border: none;
    background: var(--main-color, #89cff0);
    color: #fff;
    border-radius: 999px;
    cursor: pointer;
    font-size: 13px;
  }
  .qr-close:hover {
    filter: brightness(1.08);
  }
}
:global(.copy-toast) {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 14px 24px;
  border-radius: 999px;
  z-index: 9999;
  font-size: 14px;
  white-space: nowrap;
  max-width: 90vw;
  text-align: center;
}
:global(.fade-enter-active),
:global(.fade-leave-active) {
  transition: opacity 0.2s;
}
:global(.fade-enter-from),
:global(.fade-leave-to) {
  opacity: 0;
}
</style>