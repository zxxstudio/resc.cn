// 小性工作室 - 个性化主题配置
export const themeConfig = {
  // 站点信息
  siteMeta: {
    title: "小性工作室",
    description: "小性工作室 · 张小性的个人作品与随笔",
    logo: "/images/logo/logo.svg",
    site: "https://resc.cn",
    lang: "zh-CN",
    author: {
      name: "张小性",
      cover: "/images/logo/logo.svg",
      email: "go.up@qq.com",
      link: "https://resc.cn",
    },
  },
  // 备案信息
  icp: "豫ICP备2024084281号-1",
  // 建站日期
  since: "2024-01-01",
  // 每页文章数据
  postSize: 8,
  // 导航栏菜单
  nav: [
    {
      text: "文库",
      items: [
        { text: "文章归档", link: "/pages/archives", icon: "article" },
        { text: "全部分类", link: "/pages/categories", icon: "folder" },
        { text: "全部标签", link: "/pages/tags", icon: "hashtag" },
      ],
    },
    {
      text: "专栏",
      items: [
        { text: "技术分享", link: "/pages/categories/技术分享", icon: "code" },
        { text: "我的项目", link: "/pages/project", icon: "code" },
        { text: "效率工具", link: "/pages/categories/效率工具", icon: "tools" },
      ],
    },
    {
      text: "友链",
      items: [
        { text: "友链鱼塘", link: "/pages/friends", icon: "fish" },
        { text: "友情链接", link: "/pages/link", icon: "people" },
      ],
    },
    {
      text: "我的",
      items: [
        { text: "畅所欲言", link: "/pages/message", icon: "message" },
        { text: "致谢名单", link: "/pages/thanks", icon: "heart" },
        { text: "关于本站", link: "/pages/about", icon: "contacts" },
      ],
    },
  ],
  // 侧边栏 - 关掉一些不需要的 widget
  aside: {
    hello: {
      enable: true,
      text: "欢迎来到<strong>小性工作室</strong>，这里是张小性的个人空间，记录想法、分享作品。",
    },
    toc: { enable: true },
    tags: { enable: true },
    countDown: { enable: false },
    siteData: { enable: true },
  },
  // 关闭音乐、评论、Algolia 搜索等需要第三方服务的功能
  music: { enable: false },
  comment: { enable: false },
  search: { enable: false },
  // ===== 以下补充：覆盖默认配置里残留的原作者信息 =====
  // 注入 <head>（RSS 改成 resc.cn）
  inject: {
    header: [
      ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
      ["link", { rel: "apple-touch-icon", href: "/images/logo/logo.png" }],
      [
        "link",
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "RSS",
          href: "https://resc.cn/rss.xml",
        },
      ],
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css",
        },
      ],
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/style.css",
        },
      ],
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://cdn2.codesign.qq.com/icons/g5ZpEgx3z4VO6j2/latest/iconfont.css",
        },
      ],
    ],
  },
  // 左侧“更多”菜单（使用内联 SVG，避免依赖外部 iconfont 字体在亮色模式下不显示）
  navMore: [
    {
      name: "本站",
      list: [
        { name: "主页", url: "/", iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V21H3z"/><path d="M9 21V12h6v9"/></svg>' },
        { name: "文章归档", url: "/pages/archives", iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><path d="M10 12h4"/></svg>' },
        { name: "全部分类", url: "/pages/categories", iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>' },
        { name: "全部标签", url: "/pages/tags", iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41L13.42 20.58a2 2 0 01-2.83 0L3 13V3h10l7.59 7.59a2 2 0 010 2.82z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/></svg>' },
      ],
    },
    {
      name: "页面",
      list: [
        { name: "关于本站", url: "/pages/about", iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>' },
        { name: "友情链接", url: "/pages/link", iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0112 0"/><path d="M14 20a5 5 0 018-4.5"/></svg>' },
        { name: "畅所欲言", url: "/pages/message", iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 01-11.2 7.32L3 21l1.68-6.8A8 8 0 1121 12z"/></svg>' },
      ],
    },
  ],
  // 封面默认图（避免缺失封面时显示 example.com 破图）
  cover: {
    twoColumns: false,
    showCover: {
      enable: true,
      coverLayout: "left",
      defaultCover: ["/images/logo/logo.png"],
    },
  },
  // 页脚社交与站点地图
  footer: {
    social: [
      { icon: "github", link: "https://github.com/zxxstudio/" },
      { icon: "qq", link: "https://wpa.qq.com/msgrd?v=3&uin=871282523&site=qq&menu=yes", title: "QQ" },
      { icon: "wechat-pay", link: "/images/qrcode/wechat-mp.jpg", isQRCode: true, title: "微信公众号", subtitle: "扫码关注「小性工作室」", iconSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.85 1.03 3.5 2.65 4.6L4 17l2.85-1.45c.78.18 1.6.3 2.45.32-.05-.27-.08-.55-.08-.84 0-2.94 2.86-5.32 6.39-5.32.18 0 .35.01.52.03C15.41 6.74 12.74 4 9.5 4zm-2 4.5a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2zM15.5 11c-3.04 0-5.5 1.92-5.5 4.28 0 2.36 2.46 4.28 5.5 4.28.55 0 1.08-.06 1.58-.18L19 20.5l-.45-1.7c1.36-.93 2.25-2.32 2.25-3.91C20.8 12.92 18.54 11 15.5 11zm-1.5 3.5a.75.75 0 110 1.5.75.75 0 010-1.5zm3 0a.75.75 0 110 1.5.75.75 0 010-1.5z"/></svg>' },
      { icon: "bilibili", link: "https://b23.tv/67lJluC" },
      { icon: "email", link: "mailto:hello@resc.cn" },
    ],
    sitemap: [
      {
        text: "博客",
        items: [
          { text: "近期文章", link: "/" },
          { text: "全部分类", link: "/pages/categories" },
          { text: "全部标签", link: "/pages/tags" },
          { text: "文章归档", link: "/pages/archives", newTab: true },
        ],
      },
      {
        text: "页面",
        items: [
          { text: "畅所欲言", link: "/pages/message" },
          { text: "关于本站", link: "/pages/about" },
          { text: "隐私政策", link: "/pages/privacy" },
          { text: "版权协议", link: "/pages/cc" },
        ],
      },
    ],
  },
  // 打赏（暂无二维码，先关闭，避免出现原作者的收款码）
  rewardData: {
    enable: false,
    wechat: "",
    alipay: "",
  },
};
