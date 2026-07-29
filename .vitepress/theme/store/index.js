import { defineStore } from "pinia";

export const mainStore = defineStore("main", {
  state: () => {
    return {
      // 主题类别
      themeType: "auto",
      themeValue: "light",
      // 按时间自动切浅深色
      autoTimeSwitch: false,
      // banner
      bannerType: "half",
      // 加载状态
      loadingStatus: true,
      // 滚动高度
      scrollData: {
        height: 0,
        percentage: 0,
        direction: "down",
      },
      // 页脚可见性
      footerIsShow: false,
      // 中控台显示
      controlShow: false,
      // 搜索框显示
      searchShow: false,
      // 个性化配置显示
      showSeetings: false,
      // 播放器数据
      playState: false,
      playerShow: true,
      playerVolume: 0.7,
      playerData: {
        name: "未知曲目",
        artist: "未知艺术家",
      },
      // 移动端菜单显示
      mobileMenuShow: false,
      // 使用自定义右键菜单
      useRightMenu: true,
      // 全站字体
      fontFamily: "hmos",
      // 全站字体大小
      fontSize: 16,
      // 信息显示位置
      infoPosition: "fixed",
      // 上次滚动位置
      lastScrollY: 0,
    };
  },
  getters: {},
  actions: {
    // 切换应用状态
    changeShowStatus(value, blur = true) {
      this[value] = !this[value];
      document.body.style.overflowY = this[value] ? "hidden" : "";
    },
    // 更改字体大小
    changeFontSize(isAdd = false) {
      if (isAdd) {
        if (this.fontSize < 20) this.fontSize++;
      } else {
        if (this.fontSize > 14) this.fontSize--;
      }
      document.documentElement.style.fontSize = this.fontSize + "px";
    },
    // 切换明暗模式
    changeThemeType() {
      // 按时间自动切换模式下，不允许手动切换
      if (this.autoTimeSwitch) {
        if (typeof $message !== "undefined") {
          $message.warning("按时间切换模式下，请先关闭自动切换", { duration: 1500 });
        }
        return false;
      }
      this.themeType === "auto"
        ? (this.themeType = "dark")
        : this.themeType === "dark"
          ? (this.themeType = "light")
          : (this.themeType = "auto");
      if (typeof $message !== "undefined") {
        const text =
          this.themeType === "light" ? "浅色模式"
          : this.themeType === "dark" ? "深色模式"
          : "跟随系统";
        $message.info("当前主题为" + text, { duration: 1500 });
      }
    },
    // 根据当前时间获取应该的主题（白天浅，夜间深）
    getTimeBasedTheme() {
      const h = new Date().getHours();
      return (h >= 18 || h < 6) ? "dark" : "light";
    },
  },
  // 数据持久化
  persist: [
    {
      key: "siteData",
      paths: [
        "themeType",
        "autoTimeSwitch",
        "bannerType",
        "useRightMenu",
        "playerShow",
        "playerVolume",
        "fontFamily",
        "fontSize",
        "infoPosition",
      ],
    },
  ],
});