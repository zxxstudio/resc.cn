<!-- 3D AI 宠物 - 悬浮在页面右下角 -->
<template>
  <ClientOnly>
    <div
      v-show="!petHidden"
      ref="petContainer"
      class="pet3d-container"
      :class="{ dragging: isDragging }"
      @click="onPetClick"
      @mousedown="onDragStart"
      @touchstart="onDragStart"
    >
      <canvas ref="petCanvas" class="pet3d-canvas" />
      <!-- 气泡对话框 -->
      <Transition name="bubble">
        <div v-if="bubbleText" class="pet3d-bubble">{{ bubbleText }}</div>
      </Transition>
      <!-- 关闭按钮 -->
      <div class="pet3d-close" @click.stop="hidePet" title="隐藏宠物">×</div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const petContainer = ref(null);
const petCanvas = ref(null);
const bubbleText = ref("");
const petHidden = ref(false);
const isDragging = ref(false);

// 宠物说的话
const phrases = [
  "嗨，我是站长的 3D 宠物 😎",
  "欢迎来到小性工作室！",
  "点我干嘛？",
  "别戳了，墨镜要掉了",
  "今天也要酷酷的",
  "有什么想看的内容吗？",
  "转一圈给你看！",
  "996？不存在的",
];

let bubbleTimer = null;
const showBubble = (text, duration = 3000) => {
  bubbleText.value = text;
  if (bubbleTimer) clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => (bubbleText.value = ""), duration);
};

// three.js 相关（动态导入，避免 SSR 报错）
let renderer = null;
let scene = null;
let camera = null;
let petModel = null;
let animFrameId = null;
let spinVelocity = 0;
let targetRotY = 0;
let mouseX = 0;

const hidePet = () => {
  petHidden.value = true;
  localStorage.setItem("pet3d-hidden", "1");
};

const onPetClick = () => {
  // 点击：随机说话 + 转圈
  showBubble(phrases[Math.floor(Math.random() * phrases.length)]);
  spinVelocity = 0.3;
};

// 拖拽（预留，目前固定右下角）
const onDragStart = () => {};

onMounted(async () => {
  if (localStorage.getItem("pet3d-hidden") === "1") {
    petHidden.value = true;
    return;
  }
  // 手机端不加载（省流量，26MB 模型太大）
  if (window.innerWidth < 768) {
    petHidden.value = true;
    return;
  }

  const THREE = await import("three");
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");

  const W = 220;
  const H = 260;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
  camera.position.set(0, 0.6, 3.2);

  renderer = new THREE.WebGLRenderer({
    canvas: petCanvas.value,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // 灯光
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(2, 4, 3);
  scene.add(dirLight);
  const fillLight = new THREE.DirectionalLight(0x88aaff, 0.6);
  fillLight.position.set(-2, 1, -2);
  scene.add(fillLight);

  // 加载模型
  const loader = new GLTFLoader();
  loader.load(
    "/models/pet.glb",
    (gltf) => {
      petModel = gltf.scene;
      // 自动居中 + 缩放
      const box = new THREE.Box3().setFromObject(petModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.8 / maxDim;
      petModel.scale.setScalar(scale);
      petModel.position.sub(center.multiplyScalar(scale));
      petModel.position.y -= 0.1;
      scene.add(petModel);
      showBubble("嗨！我上线啦 😎", 4000);
    },
    undefined,
    (err) => console.warn("[Pet3D] 模型加载失败", err),
  );

  // 鼠标跟随（宠物看向鼠标方向）
  const onMouseMove = (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetRotY = mouseX * 0.6;
  };
  window.addEventListener("mousemove", onMouseMove);

  // 动画循环
  const clock = new THREE.Clock();
  const animate = () => {
    animFrameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (petModel) {
      // 待机：轻微上下浮动
      petModel.position.y = -0.1 + Math.sin(t * 1.5) * 0.05;
      // 点击后的旋转衰减
      if (Math.abs(spinVelocity) > 0.001) {
        petModel.rotation.y += spinVelocity;
        spinVelocity *= 0.95;
      } else {
        // 平滑看向鼠标
        petModel.rotation.y += (targetRotY - petModel.rotation.y) * 0.05;
      }
    }
    renderer.render(scene, camera);
  };
  animate();

  // 清理函数存到组件实例
  onBeforeUnmount(() => {
    window.removeEventListener("mousemove", onMouseMove);
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (renderer) renderer.dispose();
  });
});
</script>

<style lang="scss" scoped>
.pet3d-container {
  position: fixed;
  right: 16px;
  bottom: 80px;
  width: 220px;
  height: 260px;
  z-index: 99;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.03);

    .pet3d-close {
      opacity: 1;
    }
  }

  .pet3d-canvas {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .pet3d-bubble {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 200px;
    padding: 8px 14px;
    background: var(--main-card-background, #fff);
    border: 1px solid var(--main-card-border, #eee);
    border-radius: 12px;
    font-size: 13px;
    color: var(--main-font-color, #333);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &::after {
      content: "";
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      width: 10px;
      height: 10px;
      background: var(--main-card-background, #fff);
      border-right: 1px solid var(--main-card-border, #eee);
      border-bottom: 1px solid var(--main-card-border, #eee);
    }
  }

  .pet3d-close {
    position: absolute;
    top: 20px;
    right: 10px;
    width: 22px;
    height: 22px;
    line-height: 20px;
    text-align: center;
    border-radius: 50%;
    background: var(--main-card-background, #fff);
    border: 1px solid var(--main-card-border, #eee);
    color: var(--main-font-second-color, #999);
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.2s;

    &:hover {
      color: #ff5252;
    }
  }
}

.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.3s;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
}

// 移动端隐藏
@media (max-width: 768px) {
  .pet3d-container {
    display: none;
  }
}
</style>
