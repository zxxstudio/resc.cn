// 小性工作室 - 个性化主题配置
export const themeConfig = {
  // 站点信息 - cache bust 2026-07-30
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
      { icon: "wechat-pay", link: "/images/qrcode/wechat-mp.jpg", isQRCode: true, title: "微信公众号", subtitle: "扫码关注「小性工作室」", iconSvg: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="m 27.000761,40.600546 c 0,7.454073 7.125772,13.599709 15.9998,13.599709 1.878006,0 3.739512,-0.28 5.498267,-0.82638 -7.5e-4,0 4.387514,3.416008 4.387514,3.416008 0.338251,0.263352 0.807002,0.281515 1.164754,0.04541 0.357751,-0.236109 0.525751,-0.673515 0.417001,-1.088219 l -1.230004,-4.69039 c 3.657011,-2.585087 5.762268,-6.41807 5.762268,-10.456134 0,-7.454072 -7.125772,-13.599709 -15.9998,-13.599709 -8.874028,0 -15.9998,6.145637 -15.9998,13.599709 z m 1.999506,0 c 0,-6.454394 6.31652,-11.600353 14.000294,-11.600353 7.683774,0 14.000294,5.145959 14.000294,11.600353 0,3.608225 -2.032507,6.993963 -5.449517,9.180239 -0.365251,0.233838 -0.537752,0.676542 -0.428252,1.096543 l 0.660753,2.520006 c 0,0 -2.477258,-1.928221 -2.477258,-1.928221 -0.266251,-0.208108 -0.620252,-0.266379 -0.939753,-0.156649 -1.702505,0.587245 -3.525761,0.888435 -5.366267,0.888435 -7.683774,0 -14.000294,-5.145959 -14.000294,-11.600353 z"/><path d="m 20.000463,16.000513 c -2.207623,0 -3.999996,1.792348 -3.999996,3.999975 0,2.207626 1.792373,3.999975 3.999996,3.999975 2.207623,0 3.999996,-1.792349 3.999996,-3.999975 0,-2.207627 -1.792373,-3.999975 -3.999996,-3.999975 z m 0,1.999923 c 1.103874,0 1.999998,0.896175 1.999998,2.000052 0,1.103877 -0.896124,2.000051 -1.999998,2.000051 -1.103874,0 -1.999998,-0.896174 -1.999998,-2.000051 0,-1.103877 0.896124,-2.000052 1.999998,-2.000052 z"/><path d="m 34.000506,16.000513 c -2.207623,0 -3.999996,1.792348 -3.999996,3.999975 0,2.207626 1.792373,3.999975 3.999996,3.999975 2.207623,0 3.999996,-1.792349 3.999996,-3.999975 0,-2.207627 -1.792373,-3.999975 -3.999996,-3.999975 z m 0,1.999923 c 1.103874,0 1.999998,0.896175 1.999998,2.000052 0,1.103877 -0.896124,2.000051 -1.999998,2.000051 -1.103874,0 -1.999998,-0.896174 -1.999998,-2.000051 0,-1.103877 0.896124,-2.000052 1.999998,-2.000052 z"/><path d="m 38.000519,34.000554 c -1.655755,0 -3.000009,1.344258 -3.000009,3.000008 0,1.655749 1.344254,3.000008 3.000009,3.000008 1.655755,0 3.000009,-1.344259 3.000009,-3.000008 0,-1.65575 -1.344254,-3.000008 -3.000009,-3.000008 z m 0,2.000005 c 0.551918,0 1.000003,0.448086 1.000003,1.000003 0,0.551916 -0.448085,1.000002 -1.000003,1.000002 -0.551918,0 -1.000003,-0.448086 -1.000003,-1.000002 0,-0.551917 0.448085,-1.000003 1.000003,-1.000003 z"/><path d="m 48.00055,34.000554 c -1.655755,0 -3.000009,1.344258 -3.000009,3.000008 0,1.655749 1.344254,3.000008 3.000009,3.000008 1.655755,0 3.000009,-1.344259 3.000009,-3.000008 0,-1.65575 -1.344254,-3.000008 -3.000009,-3.000008 z m 0,2.000005 c 0.551918,0 1.000003,0.448086 1.000003,1.000003 0,0.551916 -0.448085,1.000002 -1.000003,1.000002 -0.551918,0 -1.000003,-0.448086 -1.000003,-1.000002 0,-0.551917 0.448085,-1.000003 1.000003,-1.000003 z"/><path d="m 28.909945,44.928998 c -0.630002,0.047 -1.267004,0.071 -1.910006,0.071 -2.658008,0 -5.292016,-0.416002 -7.774024,-1.224004 l -6.304019,5.007015 c -0.336001,0.267001 -0.806003,0.290001 -1.166004,0.056 -0.361001,-0.234001 -0.531002,-0.672003 -0.425001,-1.088004 0,0 1.799005,-6.999022 1.799005,-6.999022 C 7.9818802,37.142974 4.999871,31.723957 4.999871,25.99994 c 0,-10.441033 9.81903,-19.0000592 22.000068,-19.0000592 12.181038,0 22.000068,8.5590262 22.000068,19.0000592 0,1.004003 -0.091,1.991006 -0.266,2.955009 -0.624002,-0.217001 -1.269004,-0.400001 -1.933006,-0.546002 0.131,-0.786002 0.199,-1.591005 0.199,-2.409007 0,-9.42803 -9.001028,-17.000053 -20.000062,-17.000053 -10.999034,0 -20.0000618,7.572023 -20.0000618,17.000053 0,5.295016 2.907009,10.272032 7.8210238,13.481041 0.359002,0.234001 0.528002,0.671003 0.422002,1.086004 0,0 -1.233004,4.798015 -1.233004,4.798015 l 4.399014,-3.494011 c 0.269,-0.214001 0.629002,-0.275001 0.954003,-0.161001 2.423007,0.852003 5.018015,1.290004 7.637023,1.290004 0.425002,0 0.846003,-0.011 1.265004,-0.034 0.153001,0.676002 0.370001,1.332004 0.645002,1.963006 z"/></svg>' },
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
