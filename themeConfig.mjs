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
  // 左侧“更多”菜单（去掉原作者的导航/热榜/状态站）
  navMore: [
    {
      name: "本站",
      list: [
        { icon: "/images/logo/logo.png", name: "主页", url: "/" },
        { icon: "/images/logo/logo.png", name: "文章归档", url: "/pages/archives" },
        { icon: "/images/logo/logo.png", name: "全部分类", url: "/pages/categories" },
        { icon: "/images/logo/logo.png", name: "全部标签", url: "/pages/tags" },
      ],
    },
    {
      name: "页面",
      list: [
        { icon: "/images/logo/logo.png", name: "关于本站", url: "/pages/about" },
        { icon: "/images/logo/logo.png", name: "友情链接", url: "/pages/link" },
        { icon: "/images/logo/logo.png", name: "畅所欲言", url: "/pages/message" },
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
      { icon: "email", link: "mailto:hello@resc.cn" },
      { icon: "github", link: "https://github.com/zxxstudio/" },
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
