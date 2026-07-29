<template>
  <Teleport to="body">
    <!-- 站点纯色背景：跟随主题浅/深 -->
    <div :class="['bg-color', themeValue]" />
  </Teleport>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";

const store = mainStore();
const { themeValue } = storeToRefs(store);
</script>

<style lang="scss" scoped>
.bg-color {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2;
  transition: background-color 0.4s ease;
  // 亮色：浅蓝实底
  background-color: #f5f9fc;
  &.dark {
    background-color: #0f1419;
  }
}
</style>