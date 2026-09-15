<!-- 2D 互动吉祥物 - 悬浮在页面右下角，可拖动 / 跟随光标 / 点击互动 -->
<template>
  <ClientOnly>
    <div
      v-show="!petHidden"
      ref="petContainer"
      class="pet2d"
      :class="{ dragging: isDragging, happy: isHappy, spin: isSpin }"
      :style="posStyle"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @click="onClick"
      @dblclick="onDbl"
    >
      <svg ref="petSvg" class="pet-svg" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="petBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8ea2ff" />
            <stop offset="100%" stop-color="#667eea" />
          </linearGradient>
          <radialGradient id="petBelly" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- 地面柔影 -->
        <ellipse class="pet-shadow" cx="100" cy="196" rx="52" ry="9" />

        <g class="pet-body">
          <!-- 耳朵 -->
          <path class="ear" d="M58 60 Q50 18 80 42 Z" fill="url(#petBody)" />
          <path class="ear" d="M142 60 Q150 18 120 42 Z" fill="url(#petBody)" />
          <path d="M63 52 Q60 32 74 44 Z" fill="#ffd2dd" />
          <path d="M137 52 Q140 32 126 44 Z" fill="#ffd2dd" />
          <!-- 身体 -->
          <rect x="34" y="46" width="132" height="132" rx="56" fill="url(#petBody)" />
          <ellipse cx="100" cy="120" rx="50" ry="50" fill="url(#petBelly)" />
          <!-- 腮红 -->
          <circle cx="62" cy="116" r="11" fill="#ff9bb3" opacity="0.7" />
          <circle cx="138" cy="116" r="11" fill="#ff9bb3" opacity="0.7" />
          <!-- 眼睛 -->
          <g class="eye eye-l">
            <ellipse cx="76" cy="100" rx="13" ry="16" fill="#fff" />
            <circle class="pupil" cx="76" cy="102" r="7.5" fill="#2b2b3a" />
            <circle class="glint" cx="79" cy="98" r="2.6" fill="#fff" />
          </g>
          <g class="eye eye-r">
            <ellipse cx="124" cy="100" rx="13" ry="16" fill="#fff" />
            <circle class="pupil" cx="124" cy="102" r="7.5" fill="#2b2b3a" />
            <circle class="glint" cx="127" cy="98" r="2.6" fill="#fff" />
          </g>
          <!-- 嘴 -->
          <path class="mouth" d="M88 126 Q100 138 112 126" stroke="#2b2b3a" stroke-width="3.4" fill="none" stroke-linecap="round" />
        </g>
      </svg>

      <!-- 气泡对话框 -->
      <Transition name="bubble">
        <div v-if="bubbleText" class="pet-bubble">{{ bubbleText }}</div>
      </Transition>

      <!-- 关闭按钮 -->
      <div class="pet-close" @click.stop="hidePet" title="隐藏吉祥物">×</div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const petContainer = ref(null);
const petSvg = ref(null);
const bubbleText = ref("");
const petHidden = ref(false);
const isDragging = ref(false);
const isHappy = ref(false);
const isSpin = ref(false);

const pos = ref({ left: 0, top: 0 });
const posStyle = computed(() => ({
  left: pos.value.left + "px",
  top: pos.value.top + "px",
}));

const phrases = [
  "嗨～我是小性工作室的吉祥物团团 🐾",
  "戳我干嘛呀 (｡•́︿•̀｡)",
  "要不要摸摸我的头？",
  "今天也要元气满满哦！",
  "陪你一起看文章吧～",
  "我超可爱的对吧 (◕‿◕)",
  "转个圈圈给你看！",
  "你动鼠标的时候我都在看你哦",
  "晚安，记得早点睡～",
  "喜欢这个站就常来玩嘛",
  "拖动我可以把我挪到别处～",
  "呱，我是 Frog…哦不对我是团团",
];

let bubbleTimer = null;
const showBubble = (text, duration = 3000) => {
  bubbleText.value = text;
  if (bubbleTimer) clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => (bubbleText.value = ""), duration);
};

const hidePet = () => {
  petHidden.value = true;
  localStorage.setItem("pet2d-hidden", "1");
};

/* ---------- 拖动 + 点击 ---------- */
let downX = 0, downY = 0, origLeft = 0, origTop = 0, moved = false, pid = null;
const onDown = (e) => {
  if (e.target.closest(".pet-close")) return;
  moved = false;
  downX = e.clientX;
  downY = e.clientY;
  origLeft = pos.value.left;
  origTop = pos.value.top;
  pid = e.pointerId;
  isDragging.value = true;
  petContainer.value.setPointerCapture?.(pid);
};
const onMove = (e) => {
  if (!isDragging.value) return;
  const dx = e.clientX - downX;
  const dy = e.clientY - downY;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
  const w = petContainer.value.offsetWidth;
  const h = petContainer.value.offsetHeight;
  let nx = origLeft + dx;
  let ny = origTop + dy;
  nx = Math.max(4, Math.min(window.innerWidth - w - 4, nx));
  ny = Math.max(4, Math.min(window.innerHeight - h - 4, ny));
  pos.value = { left: nx, top: ny };
};
const onUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  if (moved) localStorage.setItem("pet2d-pos", JSON.stringify(pos.value));
};
const onClick = () => {
  if (moved) return; // 拖动结束不触发点击
  happy();
  showBubble(phrases[Math.floor(Math.random() * phrases.length)]);
};
const onDbl = () => {
  if (moved) return;
  isSpin.value = true;
  setTimeout(() => (isSpin.value = false), 700);
  showBubble("呼啦——转个圈！", 2200);
};
const happy = () => {
  isHappy.value = true;
  setTimeout(() => (isHappy.value = false), 650);
};

/* ---------- 眼睛 + 身体跟随光标 ---------- */
// 注意：组件被 <ClientOnly> 包裹，onMounted 时插槽还没渲染，petSvg.value 还是 null，
// 所以不能在 onMounted 里 querySelector。改为在鼠标移动事件里「惰性解析」一次即可。
let pupils = null;
let bodyG = null;
let resolved = false;
const resolveEls = () => {
  if (resolved) return;
  const svg = petSvg.value;
  if (!svg || !svg.querySelector) return;
  pupils = Array.from(svg.querySelectorAll(".pupil"));
  bodyG = svg.querySelector(".pet-body");
  if (pupils && pupils.length) resolved = true;
};
const onMouseMove = (e) => {
  const c = petContainer.value;
  if (!c) return;
  resolveEls();
  if (!pupils || !pupils.length) return;
  const r = c.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height * 0.45;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const ang = Math.atan2(dy, dx);
  const dist = Math.min(6, Math.hypot(dx, dy) / 28);
  const px = Math.cos(ang) * dist;
  const py = Math.sin(ang) * dist;
  pupils.forEach((p) => p.setAttribute("transform", `translate(${px.toFixed(2)} ${py.toFixed(2)})`));
  if (bodyG) {
    const tilt = Math.max(-7, Math.min(7, dx / 26));
    bodyG.setAttribute("transform", `rotate(${tilt.toFixed(2)} 100 112)`);
  }
};

onMounted(() => {
  if (localStorage.getItem("pet2d-hidden") === "1") {
    petHidden.value = true;
  }
  // 读取上次拖动位置，否则默认右下角
  const saved = localStorage.getItem("pet2d-pos");
  if (saved) {
    try {
      pos.value = JSON.parse(saved);
    } catch (e) {}
  }
  if (!pos.value.left && !pos.value.top) {
    pos.value = {
      left: Math.max(8, window.innerWidth - 220),
      top: Math.max(8, window.innerHeight - 290),
    };
  }
  // 只挂监听；SVG 内部元素等首次移动时再惰性解析（绕开 ClientOnly 渲染时序）
  window.addEventListener("mousemove", onMouseMove);
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", onMouseMove);
  if (bubbleTimer) clearTimeout(bubbleTimer);
});
</script>

<style lang="scss" scoped>
.pet2d {
  position: fixed;
  z-index: 99;
  width: 200px;
  height: 210px;
  cursor: grab;
  user-select: none;
  touch-action: none;
  filter: drop-shadow(0 8px 18px rgba(60, 72, 140, 0.28));
  transition: filter 0.2s;

  &.dragging {
    cursor: grabbing;
    filter: drop-shadow(0 14px 26px rgba(60, 72, 140, 0.36));
  }
  &:hover .pet-close {
    opacity: 1;
  }
  &:hover .pet-body {
    animation-play-state: paused;
  }
}

.pet-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  animation: float 3.4s ease-in-out infinite;
}

/* 待机：轻轻呼吸 + 浮动 */
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-7px) scale(1.015); }
}

/* 眨眼 */
.eye {
  transform-box: fill-box;
  transform-origin: center;
  animation: blink 5s infinite;
}
.eye-r { animation-delay: 0.08s; }
@keyframes blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.12); }
}

.pet-shadow {
  fill: rgba(40, 50, 110, 0.16);
  animation: shadow 3.4s ease-in-out infinite;
}
@keyframes shadow {
  0%, 100% { transform: scaleX(1); opacity: 0.5; }
  50% { transform: scaleX(0.86); opacity: 0.32; }
}

/* 点击开心：弹一下 */
.pet2d.happy .pet-svg {
  animation: hop 0.6s ease;
}
@keyframes hop {
  0% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-16px) scale(1.08, 0.92); }
  55% { transform: translateY(0) scale(0.94, 1.08); }
  100% { transform: translateY(0) scale(1); }
}

/* 双击转圈 */
.pet2d.spin .pet-svg {
  animation: spin 0.7s ease;
}
@keyframes spin {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
}

.pet-bubble {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 200px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #e6e9f5;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.35;
  color: #444;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 10px;
    height: 10px;
    background: #fff;
    border-right: 1px solid #e6e9f5;
    border-bottom: 1px solid #e6e9f5;
  }
}

.pet-close {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e6e9f5;
  color: #999;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
  cursor: pointer;

  &:hover { color: #ff5252; }
}

.bubble-enter-active,
.bubble-leave-active { transition: all 0.3s; }
.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
}

@media (max-width: 480px) {
  .pet2d { width: 150px; height: 158px; }
}
</style>
