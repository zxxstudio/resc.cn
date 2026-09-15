<!-- 打赏按钮 -->
<template>
  <div v-if="rewardData.enable" class="reward">
    <div class="reward-btn" @click="rewardShow = true">
      <i class="iconfont icon-reward" />
      <span class="text">赞赏博主</span>
    </div>
    <!-- 设置面板 -->
    <Modal
      :show="rewardShow"
      :maxWidth="430"
      title="赞赏博主"
      titleIcon="reward"
      @mask-click="rewardShow = false"
      @modal-close="rewardShow = false"
    >
      <div class="reward-card">
        <span class="thank">🙏 感谢您赐予我前进的力量</span>
        <div class="qr">
          <a v-if="rewardData?.wechat" :href="rewardData.wechat" class="qr-img" target="_blank">
            <img v-if="rewardData?.wechat" :src="rewardData.wechat" alt="微信" />
            <span class="tip">
              <i class="iconfont icon-wechat-pay" />
              微信
            </span>
          </a>
          <a v-if="rewardData?.alipay" :href="rewardData.alipay" class="qr-img" target="_blank">
            <img v-if="rewardData?.alipay" :src="rewardData.alipay" alt="支付宝" />
            <span class="tip">
              <i class="iconfont icon-alipay" />
              支付宝
            </span>
          </a>
        </div>
        <div v-if="showJump" class="all-list s-card hover" @click="toRewardList">
          <span class="title">全部赞赏者名单</span>
          <span class="tip">
            赞赏金额将全部用于开源项目维护，以及服务器、域名及各类云服务的开销
          </span>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
const router = useRouter();
const { theme } = useData();
const { rewardData } = theme.value;

const props = defineProps({
  showJump: {
    type: Boolean,
    default: true,
  },
});

// 赞赏显示
const rewardShow = ref(false);

// 跳转至赞赏名单
const toRewardList = () => {
  rewardShow.value = false;
  router.go("/pages/thanks");
};
</script>

<style lang="scss" scoped>
.reward {
  position: relative;
  display: flex;
  justify-content: center;
  width: max-content;
  margin: 1rem auto;
  user-select: none;
  cursor: pointer;
  .reward-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 120px;
    border-radius: 8px;
    color: #fff;
    background-color: var(--main-color-red);
    transition: box-shadow 0.5s;
    .iconfont {
      color: #fff;
      font-weight: normal;
      margin-right: 6px;
    }
    &:hover {
      box-shadow: 0 0 40px 6px #ff384270;
    }
  }
}
.reward-card {
  .thank {
    display: inline-flex;
    justify-content: center;
    margin-bottom: 1rem;
    width: 100%;
    color: var(--main-color);
    font-weight: bold;
  }
  .qr {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: 1fr 1fr;
    .qr-img {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.9rem;
      background: var(--main-card-background, #fff);
      border: 1px solid var(--main-card-border, #ececec);
      border-radius: 16px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
      transition: transform 0.2s, box-shadow 0.2s;
      img {
        width: 100%;
        max-width: 160px;
        aspect-ratio: 1 / 1;
        object-fit: contain;
        background: #fff;
        border-radius: 10px;
        padding: 6px;
      }
      .tip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 0.8rem;
        padding: 0.3rem 0.9rem;
        border-radius: 999px;
        background: var(--main-color-light, #eef3ff);
        color: var(--main-color, #409eff);
        font-size: 0.85rem;
        font-weight: 500;
        white-space: nowrap;
        .iconfont {
          margin-right: 6px;
          font-size: 18px;
        }
      }
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
        .iconfont {
          color: var(--main-color);
        }
      }
    }
  }
  .all-list {
    margin-top: 20px;
    display: flex;
    align-items: center;
    flex-direction: column;
    background-color: var(--main-card-second-background);
    .title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
      transition: color 0.3s;
    }
    .tip {
      text-align: center;
      font-size: 12px;
      opacity: 0.6;
    }
    &:hover {
      .title {
        color: var(--main-color);
      }
    }
  }
}
</style>
