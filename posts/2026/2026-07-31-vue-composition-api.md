---
title: 为什么我越来越喜欢用 Composition API 而不是 Options API
tags: [技术, Vue, 前端]
categories: [技术]
date: 2026-07-31
description: 聊聊从 Vue2 Options API 迁移到 Composition API 后的真实感受，以及几个让代码组织效率翻倍的具体用法
cover: /images/covers/cover-2026-07-31-vue-composition.png
articleGPT: Vue3 Composition API vs Options API，ref/reactive/computed/watch 的实际用法，setup 函数的组织优势
references:
  - title: Vue3 Composition API 文档
    url: https://vuejs.org/api/reactivity-core.html
  - title: Script Setup 语法
    url: https://vuejs.org/api/sfc-script-setup.html
---

## 先说结论

如果你问我"到底用 Options API 还是 Composition API"，我的回答是：**看场景，但如果你的组件超过 80 行，Composition API 在可维护性上几乎没有对手。**

不是 Options API 不好——它是 Vue2 的核心，写起来清晰，对新人友好。但当你的组件逻辑开始变复杂，它的问题就开始暴露。

## Options API 的三个让人头疼的地方

### 1. 相关逻辑被拆得到处都是

假设你要写一个"搜索 + 分页 + 筛选"功能，在 Options API 里：

```js
export default {
  data() { return { keyword: '', page: 1, list: [], filters: {} } },
  computed: { /* 搜索逻辑 */ },  
  watch: { keyword() { this.resetPage() } },
  methods: { /* 搜索、分页、筛选各一堆 */ }
}
```

搜索逻辑的代码被拆到了 `computed`、`watch`、`methods` 里，改一个功能要跳来跳去。

### 2. 复用靠 mixins，mixins 的问题比它解决的多

Vue2 时代复用逻辑的标准方式是 mixins。但 mixins 有个根本缺陷：

```js
// userMixin.js
export default {
  data() { return { userName: 'admin' } }
}

// componentA.vue
import userMixin from '@/mixins/userMixin'
export default { mixins: [userMixin], created() { console.log(this.userName) } }
```

这个 `userName` 到底是从哪来的？不看 mixin 文件你根本不知道。更坑的是，多个 mixin 之间可能有命名冲突，谁覆盖谁要看引入顺序——这是灾难的温床。

### 3. TypeScript 支持是补丁式的

Options API 的 `this` 上下文在 TypeScript 里是黑洞。你没法让 IDE 知道 `this.users` 是什么类型，类型推断基本靠手写注解和运气。

## Composition API 的解法

### 1. 逻辑真的按功能聚合了

```js
import { ref, computed, watch } from 'vue'

// 搜索逻辑——一个函数搞完
function useSearch() {
  const keyword = ref('')
  const page = ref(1)
  const list = ref([])
  
  const filtered = computed(() => /* ... */)
  
  watch(keyword, () => { page.value = 1 })
  
  async function search() { /* ... */ }
  
  return { keyword, page, list, filtered, search }
}

// 组件里——清晰得像读目录
export default {
  setup() {
    const { keyword, page, filtered, search } = useSearch()
    return { keyword, page, filtered, search }
  }
}
```

每个 `useXxx()` 函数是一个**独立的逻辑单元**——变量从哪来、做什么、返回什么，一目了然。

### 2. Composables 取代了 mixins，且没有任何副作用

```js
// useUser.js
export function useUser() {
  const userName = ref('admin')
  const isLoggedIn = computed(() => !!userName.value)
  return { userName, isLoggedIn }
}

// 组件里
import { useUser } from '@/composables/useUser'

export default {
  setup() {
    const { userName, isLoggedIn } = useUser()
    // 变量来源清清楚楚，没有任何命名冲突
    return { userName, isLoggedIn }
  }
}
```

命名冲突？没有。来源不透明？没有。这才是真正的模块化。

### 3. TypeScript 原生友好

```ts
import { ref } from 'vue'

function useCounter(initial: number = 0) {
  const count = ref(initial) // 自动推断为 Ref<number>
  const double = computed(() => count.value * 2) // Ref<number>
  return { count, double }
}
```

IDE 知道 `count.value` 是 `number`，`double.value` 也是 `number`。不需要任何额外注解。

## `<script setup>` 让代码更少

Vue3.2 引入的 `<script setup>` 语法糖是Composition API 的绝配：

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useUser } from '@/composables/useUser'

const { userName, isLoggedIn } = useUser()
const count = ref(0)

function increment() { count.value++ }

onMounted(() => console.log('mounted'))
</script>
```

所有变量直接暴露给模板——不需要 `setup()` 函数，不需要 `return`。代码量和 Options API 差不多，但逻辑是按功能组织的。

## 什么时候仍然选 Options API

Composition API 不是银弹。有几种场景 Options API 更合适：

- **小型/临时组件**：一个简单的按钮、弹窗，用 `<script setup>` 几行搞定，Options API 也不费劲
- **团队里 Vue2 背景深**：学习曲线是真实成本，如果是快速迭代的短期项目，强行迁移不划算
- **文档/教程场景**：Options API 对新人更直观，写入门教程时它更容易解释

## 我的实际经验

项目从 Vue2 迁移到 Vue3 大半年了，Composition API 已经成了团队默认。几个真实感受：

1. **Code Review 变快了**——看一个组件，先看 `setup()` 里引了哪些 composables，就知道它在干什么，不用一行行找分散的 `methods`
2. **Bug 定位变准了**——逻辑聚合后，改一个功能改一个函数，不容易误伤旁边不相关的代码
3. **复用真的变多了**——以前 mixins 时代大家懒得复用，现在 `useXxx()` 随手就能写，随手就能用

---

Composition API 不是 Vue2 的否定，而是对"组件逻辑组织"这个问题更系统的答案。如果你还没系统用过它，建议从一个中等复杂度的组件开始尝试——你大概率会跟我一样回不去。
