---
title: 为什么AI生成的图总觉得哪里不对：构图篇
tags: [设计, AI, 技术]
categories: [设计]
date: 2026-07-31
description: 从摄影构图法则出发，聊聊为什么AI生图常常"好看但不对"，以及怎么用构图思维写出更好的提示词
cover: /images/covers/2026-07-31-ai-image-composition.png
articleGPT: AI生图的构图问题，三分法、引导线、负空间在AI生图中的应用，提示词中构图的描述方式
references:
  - title: Photography Composition Rules
    url: https://en.wikipedia.org/wiki/Composition_(visual)
  - title: Midjourney V6 Prompt Guide
    url: https://docs.midjourney.com/docs/prompts
---

![三分法构图示意](/images/covers/2026-07-31-ai-image-composition.png)

## 你有没有这种感觉

AI生成的图，颜色漂亮、细节丰富，但看着就是没有"摄影作品"那种味道。

我之前一直以为是渲染质量的问题，换了Midjourney、换Stable Diffusion、调参数，但结果总是差一口气——直到我开始用摄影构图的眼光去看AI生图，才发现真正的问题在构图。

## AI天然缺乏构图意识

AI模型学的是像素层面的统计关联，它知道什么是"好看"的颜色、什么元素该放哪里，但它对"为什么这样放好看"没有真正理解。

所以AI生成的图经常：
- 主体居中，对称得像证件照
- 背景塞满，没有呼吸感
- 多个视觉焦点打架，没有主次
- 引导线随机乱飞，不指向任何有趣的地方

这和人类摄影师有意识地去"组织画面"是本质区别。

## 三个最有效的构图法则，AI也吃

### 1. 三分法（Rule of Thirds）

摄影里最基础也最有效的法则：把画面用两条横线两条竖线切成九宫格，重要的元素放在交叉点上。

![三分法交叉点示意](/images/covers/2026-07-31-ai-image-composition-focus.png)

在人像摄影里，这个点通常是眼睛的位置。在风景摄影里，是地平线和有趣元素（比如树、建筑）的交汇点。

在AI提示词里，这样描述：

```
A lone woman sitting by a rainy window, coffee in hand,
view from slight low angle. She occupies the right third
of the frame, window aligned with the left vertical grid line.
Soft morning light from the left. Shot on 35mm film.
```

关键短语：`occupies the right third of the frame`、`aligned with the left vertical grid line`——AI能理解这种空间指令，并且会真的按你说的方式摆放元素。

### 2. 引导线（Leading Lines）

引导线是画面中那些能引导视线流向的线条：道路、河流、栏杆、建筑边缘……它们天然就是"视觉导游"，把观众的注意力引向主体。

在AI生图里，引导线用好了，画面会一下子有"深度感"：

```
A narrow medieval alley in Lisbon, golden hour light
flooding in from the far end. The cobblestone path
forms a strong leading line from bottom-center
converging to the glowing doorway at the vanishing point.
Vibrant azulejo tiles on the walls. Shot on 50mm f/1.8.
```

注意我明确说了 `from bottom-center converging to the glowing doorway at the vanishing point`——这是引导线的精确描述，让AI知道线从哪来、到哪去。

### 3. 负空间（Negative Space）

负空间是主体周围的"空白"区域。留白足够多，画面才透气，主体才能真正被看见。

AI生图最常见的问题就是主体周围塞得太满——每个角落都有东西，每个缝隙都填了细节。这是互联网图片的审美惯性（最大化信息密度），但跟"高级感"的设计方向是反的。

加负空间的方式：

```
Minimalist product photography of a single ceramic cup
on a textured linen surface. The cup is positioned in
the lower-right quadrant. 70% of the frame is
open white space. Soft north window light.
```

`70% of the frame is open white space`——这句非常具体，AI会真的把白空间当成构图要素，而不是随手画的背景。

## 一个实战练习

假设我要生成一张"程序员深夜加班的桌面"场景。

普通提示词：
```
A programmer working late at night, messy desk with
multiple monitors, code on screens, coffee cups around
```

结果：主体居中，桌面上塞满东西，没有主次，看着像库存图片。

加构图的提示词：
```
Cinematic photo of a programmer working late. Camera
at desk-level, slight low angle. The person sits
at the left third. Three monitors glow in the
right two-thirds of the frame, reflecting blue light
on their face. A single lamp on the far right casts
a warm orange pool of light, contrasting the cool
monitor glow. Cluttered desk but only the keyboard
and one coffee cup are in focus - foreground is
shallow depth of field, deliberately blurred.
```

核心变化：
- **三分法**：`sits at the left third`，人物不在中心
- **引导线**：光就是引导线，把视线从冷色的屏幕引向温暖的角落
- **负空间**：前景虚化制造空间感

## 工具辅助：先想构图，再写提示词

我现在的习惯是：生成之前先在脑子里或者草稿纸上画九宫格，决定主体位置，再动笔写提示词。

如果已经有喜欢的参考图，用describe类似的工具提取构图描述，再把它转成自己的提示词骨架。

AI生图本质上是"用文字绘画"——但绘画需要构图知识，AI生图也一样。不懂构图，再好的模型只是生成"好看的随机"。

下次生图之前，试着先问自己：这张图的主体在哪？视线往哪流？留白够不够？问完这三个问题再动笔，成片质量会明显不一样。
