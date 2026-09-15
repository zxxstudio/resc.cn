
const api = '/admin/api'
let S = null, s = null, origAdv = ''

function esc(x){ return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }
function $(s){ return document.querySelector(s) }
function $$(s){ return [...document.querySelectorAll(s)] }

function msg(el, text, ok){
  const m = el || $('#saveMsg')
  m.textContent = text
  m.className = 'msg ' + (ok===false ? 'err' : ok===null ? 'warn' : 'ok')
  m.classList.remove('hidden')
  setTimeout(()=>m.classList.add('hidden'), 6000)
}

/* ---- 标签页切换 ---- */
function showTab(tab){
  $('#tab-basic').classList.toggle('hidden', tab!=='basic')
  $('#tab-adv').classList.toggle('hidden', tab!=='adv')
  $$('.tabs-row>a[href^="#"]').forEach(a => {
    const t = a.getAttribute('href').slice(1)
    a.classList.toggle('active', t===('tab-'+tab))
  })
  const act = document.querySelector('#tab-'+tab+' .sub-tab.active')
  if(act) showSection(act.getAttribute('data-sec'), false)
}
/* 点二级分类 → 只显示那一节并滚过去 */
function showSection(secId, scroll){
  const sec = document.getElementById(secId)
  if(!sec) return
  const container = sec.parentElement
  container.querySelectorAll(':scope > section').forEach(s => {
    s.classList.toggle('hidden', s !== sec)
  })
  const bar = container.querySelector('.sub-tabs')
  if(bar) bar.querySelectorAll('.sub-tab[data-sec]').forEach(x => x.classList.toggle('active', x.getAttribute('data-sec')===secId))
  if(scroll!==false){
    const y = container.getBoundingClientRect().top + window.pageYOffset - 56
    window.scrollTo({top: Math.max(0,y), behavior:'smooth'})
  }
}
function showAllSections(){
  ['tab-basic','tab-adv'].forEach(id=>{
    const c=document.getElementById(id); if(!c) return
    c.querySelectorAll(':scope > section').forEach(s=>s.classList.remove('hidden'))
  })
  window.scrollTo({top:0,behavior:'smooth'})
}
document.querySelectorAll('.sub-tab[data-sec]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault()
    const tab = a.closest('[id^="tab-"]')
    if(tab && tab.classList.contains('hidden')) return
    showSection(a.getAttribute('data-sec'), true)
  })
})

/* ---- 登录 ---- */
async function doLogin(){
  const pwd = $('#pwd').value
  const r = await fetch(api+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pwd})})
  const d = await r.json()
  if(d.ok){ $('#login').classList.add('hidden'); $('#panel').classList.remove('hidden'); load(); loadPosts() }
  else msg($('#loginMsg'), d.error||'登录失败', false)
}

/* ---- 加载配置 ---- */
async function load(){
  const r = await fetch(api+'/settings')
  if(!r.ok){ msg(null,'读取配置失败',false); return }
  S = await r.json()
  s = JSON.parse(JSON.stringify(S))
  fillForm()
}

function fillForm(){
  const set=(k,v)=>{const el=$('[data-k="'+k+'"]');if(el)el.value=v??""}
  const setLines=(k,arr)=>{const el=$('[data-lines="'+k+'"]');if(el)el.value=(arr||[]).join('\n')}
  const setChk=(k,v)=>{const el=$('[data-chk="'+k+'"]');if(el)el.checked=!!v}
  set('siteMeta.title',S.siteMeta.title);set('siteMeta.site',S.siteMeta.site);set('siteMeta.description',S.siteMeta.description)
  set('siteMeta.logo',S.siteMeta.logo);set('siteMeta.author.name',S.siteMeta.author.name);set('siteMeta.author.cover',S.siteMeta.author.cover)
  set('siteMeta.author.email',S.siteMeta.author.email);set('icp',S.icp);set('since',S.since);set('postSize',S.postSize)
  set('about.heroTitle',S.about.heroTitle);set('about.heroSubSuffix',S.about.heroSubSuffix)
  setLines('about.interests',S.about.interests);setLines('about.why',S.about.why)
  set('techshare.title',S.techshare.title);setLines('techshare.categories',S.techshare.categories)
  setChk('rewardData.enable',S.rewardData.enable);set('rewardData.wechat',S.rewardData.wechat);set('rewardData.alipay',S.rewardData.alipay)
  setChk('comment.enable',S.comment.enable);set('comment.type',S.comment.type)
  set('comment.twikoo.js',S.comment.twikoo.js);set('comment.twikoo.envId',S.comment.twikoo.envId);set('comment.twikoo.lang',S.comment.twikoo.lang)
  setChk('aside.hello.enable',S.aside?.hello?.enable);set('aside.hello.text',S.aside?.hello?.text||'')
  setChk('aside.toc.enable',S.aside?.toc?.enable);setChk('aside.tags.enable',S.aside?.tags?.enable)
  setChk('aside.countDown.enable',S.aside?.countDown?.enable);setChk('aside.siteData.enable',S.aside?.siteData?.enable)
  setChk('cover.twoColumns',S.cover?.twoColumns);setChk('cover.showCover.enable',S.cover?.showCover?.enable)
  set('cover.showCover.coverLayout',S.cover?.showCover?.coverLayout||'left')
  set('cover.showCover.defaultCover.0',S.cover?.showCover?.defaultCover?.[0]||'')
  set('banner.title',S.banner?.title||'');set('banner.subtitleMode',S.banner?.subtitleMode||'hitokoto')
  set('banner.subtitle',S.banner?.subtitle||'');set('banner.background',S.banner?.background||'')
  set('banner.height',S.banner?.height||'half')
  set('navBar.siteName',S.navBar?.siteName||'')
  setChk('navBar.menuItems.0.visible',S.navBar?.menuItems?.[0]?.visible!==false)
  setChk('navBar.menuItems.1.visible',S.navBar?.menuItems?.[1]?.visible!==false)
  setChk('navBar.menuItems.2.visible',S.navBar?.menuItems?.[2]?.visible!==false)
  setChk('navBar.menuItems.3.visible',S.navBar?.menuItems?.[3]?.visible!==false)
  setChk('navBar.rightButtons.travellings.visible',S.navBar?.rightButtons?.travellings?.visible!==false)
  set('navBar.rightButtons.travellings.title',S.navBar?.rightButtons?.travellings?.title||'')
  set('navBar.rightButtons.travellings.url',S.navBar?.rightButtons?.travellings?.url||'')
  setChk('navBar.rightButtons.shuffle.visible',S.navBar?.rightButtons?.shuffle?.visible!==false)
  set('navBar.rightButtons.shuffle.title',S.navBar?.rightButtons?.shuffle?.title||'')
  setChk('navBar.rightButtons.search.visible',S.navBar?.rightButtons?.search?.visible!==false)
  set('navBar.rightButtons.search.title',S.navBar?.rightButtons?.search?.title||'')
  setChk('navBar.rightButtons.control.visible',S.navBar?.rightButtons?.control?.visible!==false)
  set('navBar.rightButtons.control.title',S.navBar?.rightButtons?.control?.title||'')
  setChk('navBar.rightButtons.backToTop.visible',S.navBar?.rightButtons?.backToTop?.visible!==false)
  set('navBar.rightButtons.backToTop.title',S.navBar?.rightButtons?.backToTop?.title||'')
  // 音乐 / 搜索
  setChk('music.enable',S.music?.enable)
  set('music.url',S.music?.url||'');set('music.id',S.music?.id??'')
  set('music.server',S.music?.server||'netease');set('music.type',S.music?.type||'playlist')
  setChk('search.enable',S.search?.enable)
  set('search.appId',S.search?.appId||'');set('search.apiKey',S.search?.apiKey||'')
  // 友链圈子
  set('friends.circleOfFriends',S.friends?.circleOfFriends||'')
  set('friends.dynamicLink.server',S.friends?.dynamicLink?.server||'')
  set('friends.dynamicLink.app_token',S.friends?.dynamicLink?.app_token||'')
  set('friends.dynamicLink.table_id',S.friends?.dynamicLink?.table_id||'')
  // 统计 / 灯箱
  set('tongji.51la',S.tongji?.['51la']||'')
  setChk('fancybox.enable',S.fancybox?.enable!==false)
  set('fancybox.js',S.fancybox?.js||'');set('fancybox.css',S.fancybox?.css||'')
  // 外链跳转
  setChk('jumpRedirect.enable',S.jumpRedirect?.enable!==false)
  setLines('jumpRedirect.exclude',S.jumpRedirect?.exclude||[])
  // 列表兜底
  s.about.contact=s.about.contact||[]
  s.linkData=s.linkData||[]
  renderSkills();renderTimeline();renderAboutProjects();renderProjects();renderSocial()
  renderContact();renderLinkData()
  renderNav();renderSitemap();renderInject();renderNavMore()
  origAdv = JSON.stringify(S,null,2); $('#advJson').value = origAdv
}

/* ========== 通用增删列表渲染 ========== */
function makeListBox(containerId, makeCard, onChange){
  const box = $(containerId)
  function render(){
    box.innerHTML = ''
    makeCard(box, s)
    const add = document.createElement('button'); add.type='button'; add.className='btn-add'; add.textContent='+ 添加'
    add.onclick = () => { onChange(s); render() }
    box.appendChild(add)
  }
  return render
}

/* ---------- 技能组 ---------- */
function renderSkills(){
  const box = $('#skillsList'); box.innerHTML=''
  s.about.skills.forEach((g,i)=>{
    const card=document.createElement('div');card.className='group-card'
    card.innerHTML=`<div class="group-card-head"><span class="g-label">技能组 #${i+1}</span><button type="button" class="btn small danger">删除</button></div>
      <div class="row2">
        <div class="fld"><label>组名</label><input type="text" class="sk-title" value="${esc(g.title||'')}"></div>
        <div class="fld" style="flex:2"><label>技能（每行一个）</label><textarea class="sk-items" style="min-height:52px">${esc((g.items||[]).join('\n'))}</textarea></div>
      </div>`
    card.querySelector('button').onclick=()=>{s.about.skills.splice(i,1);renderSkills()}
    box.appendChild(card)
  })
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.textContent='+ 添加技能组'
  add.onclick=()=>{s.about.skills.push({title:'',items:[]});renderSkills()}
  box.appendChild(add)
}

/* ---------- 时间线 ---------- */
function renderTimeline(){
  const box=$('#timelineList');box.innerHTML=''
  ;(s.about.timeline||[]).forEach((t,i)=>{
    const card=document.createElement('div');card.className='item-card'
    card.innerHTML=`<div class="item-card-head"><span class="i-label">时间线 #${i+1}</span><button type="button" class="btn small danger">删除</button></div>
      <div class="row2">
        <div class="fld"><label>时间</label><input type="text" class="tl-time" value="${esc(t.time||'')}" placeholder="2024-01"></div>
        <div class="fld"><label>事件</label><input type="text" class="tl-event" value="${esc(t.event||'')}" placeholder="发生了什么…"></div>
      </div>`
    card.querySelector('button').onclick=()=>{s.about.timeline.splice(i,1);renderTimeline()}
    box.appendChild(card)
  })
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.textContent='+ 添加时间线'
  add.onclick=()=>{s.about.timeline.push({time:'',event:''});renderTimeline()}
  box.appendChild(add)
}

/* ---------- 关于页项目 ---------- */
function renderAboutProjects(){
  const box=$('#aboutProjectsList');box.innerHTML=''
  ;(s.about.projects||[]).forEach((p,i)=>{
    const card=document.createElement('div');card.className='item-card'
    card.innerHTML=`<div class="item-card-head"><span class="i-label">项目 #${i+1}</span><button type="button" class="btn small danger">删除</button></div>
      <div class="row2">
        <div class="fld"><label>图标（emoji）</label><input type="text" class="ap-icon" value="${esc(p.icon||'')}"></div>
        <div class="fld"><label>名称</label><input type="text" class="ap-name" value="${esc(p.name||'')}"></div>
      </div>
      <div class="fld"><label>描述</label><textarea class="ap-desc" style="min-height:50px">${esc(p.desc||'')}</textarea></div>
      <div class="fld"><label>标签（每行一个）</label><textarea class="ap-tags" style="min-height:44px">${esc((p.tags||[]).join('\n'))}</textarea></div>
      <div class="fld"><label>颜色</label>
        <select class="ap-color">${['blue','purple','orange','green','red','teal'].map(c=>`<option value="${c}" ${p.color===c?'selected':''}>${c}</option>`).join('')}</select>
      </div>`
    card.querySelector('button').onclick=()=>{s.about.projects.splice(i,1);renderAboutProjects()}
    box.appendChild(card)
  })
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.textContent='+ 添加项目'
  add.onclick=()=>{s.about.projects.push({icon:'',name:'',desc:'',tags:[],color:'blue'});renderAboutProjects()}
  box.appendChild(add)
}

/* ---------- 我的项目 ---------- */
function renderProjects(){
  const box=$('#projectsList');box.innerHTML=''
  ;(s.projects||[]).forEach((p,i)=>{
    const card=document.createElement('div');card.className='item-card'
    const linksHtml=(p.links||[]).map((l,j)=>`<div class="links-row"><input type="text" class="pr-lt" placeholder="文字" value="${esc(l.text||'')}"><input type="text" class="pr-lu" placeholder="https://..." value="${esc(l.url||'')}"><button type="button" class="pr-ldel">×</button></div>`).join('')
    card.innerHTML=`<div class="item-card-head"><span class="i-label">项目 #${i+1}</span><button type="button" class="btn small danger">删除</button></div>
      <div class="row2">
        <div class="fld"><label>图标（emoji）</label><input type="text" class="pr-icon" value="${esc(p.icon||'')}"></div>
        <div class="fld"><label>名称</label><input type="text" class="pr-name" value="${esc(p.name||'')}"></div>
      </div>
      <div class="fld"><label>描述</label><textarea class="pr-desc" style="min-height:50px">${esc(p.desc||'')}</textarea></div>
      <div class="fld"><label>标签（每行一个）</label><textarea class="pr-tags" style="min-height:44px">${esc((p.tags||[]).join('\n'))}</textarea></div>
      <div class="row2">
        <div class="fld"><label>状态</label>
          <select class="pr-status">${[['live','已上线'],['dev','开发中'],['maint','维护中'],['oss','开源']].map(o=>`<option value="${o[0]}" ${p.status===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select>
        </div>
        <div class="fld"><label>链接</label>
          <div class="pr-links-box">${linksHtml||'<div class="links-row" style="color:var(--muted);font-size:.78rem;padding:.2rem 0">暂无链接</div>'}</div>
          <button type="button" class="btn small" style="margin-top:.3rem">+ 添加链接</button>
        </div>
      </div>`
    const linksBox=card.querySelector('.pr-links-box')
    function renderLinks(){
      linksBox.innerHTML=''
      ;(p.links||[]).forEach((l,j)=>{
        const row=document.createElement('div');row.className='links-row'
        row.innerHTML=`<input type="text" class="pr-lt" placeholder="文字" value="${esc(l.text||'')}"><input type="text" class="pr-lu" placeholder="https://..." value="${esc(l.url||'')}"><button type="button" class="pr-ldel">×</button>`
        row.querySelector('.pr-ldel').onclick=()=>{p.links.splice(j,1);renderLinks()}
        linksBox.appendChild(row)
      })
      if(!(p.links&&p.links.length)) linksBox.innerHTML='<div style="color:var(--muted);font-size:.78rem;padding:.2rem 0">暂无链接</div>'
    }
    card.querySelector('.btn.small:last-child').onclick=()=>{p.links=p.links||[];p.links.push({text:'',url:''});renderLinks()}
    card.querySelector('button.danger').onclick=()=>{s.projects.splice(i,1);renderProjects()}
    box.appendChild(card)
  })
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.textContent='+ 添加项目'
  add.onclick=()=>{s.projects.push({name:'',icon:'',desc:'',tags:[],status:'live',links:[]});renderProjects()}
  box.appendChild(add)
}

/* ---------- 社交 ---------- */
function renderSocial(){
  const box=$('#socialList');box.innerHTML=''
  ;(s.footer.social||[]).forEach((x,i)=>{
    const card=document.createElement('div');card.className='item-card'
    card.innerHTML=`<div class="item-card-head"><span class="i-label">社交 #${i+1}</span><button type="button" class="btn small danger">删除</button></div>
      <div class="row2">
        <div class="fld"><label>图标名</label><input type="text" class="so-icon" value="${esc(x.icon||'')}" placeholder="github / qq / bilibili / email…"></div>
        <div class="fld"><label>链接</label><input type="text" class="so-link" value="${esc(x.link||'')}" placeholder="https://..."></div>
      </div>
      <div class="row2">
        <div class="fld"><label>标题（可选）</label><input type="text" class="so-title" value="${esc(x.title||'')}"></div>
        <div class="fld"><label>副标题（可选）</label><input type="text" class="so-sub" value="${esc(x.subtitle||'')}"></div>
      </div>
      <div class="fld"><label class="chk-row"><input type="checkbox" class="so-qr" ${x.isQRCode?'checked':''}> 是二维码图片</label></div>`
    card.querySelector('button.danger').onclick=()=>{s.footer.social.splice(i,1);renderSocial()}
    box.appendChild(card)
  })
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.textContent='+ 添加社交项'
  add.onclick=()=>{s.footer.social.push({icon:'',link:''});renderSocial()}
  box.appendChild(add)
}

/* ---------- 联系我 ---------- */
function renderContact(){
  const box=$('#contactList'); if(!box) return
  box.innerHTML=''
  ;(s.about.contact||[]).forEach((c,i)=>{
    const card=document.createElement('div');card.className='item-card'
    card.innerHTML=`<div class="item-card-head"><span class="i-label">联系方式 #${i+1}</span><button type="button" class="btn small danger">删除</button></div>
      <div class="row2">
        <div class="fld"><label>标签</label><input type="text" class="ct-label" value="${esc(c.label||'')}" placeholder="邮箱 / GitHub / QQ / 微信…"></div>
        <div class="fld"><label>显示的值</label><input type="text" class="ct-value" value="${esc(c.value||'')}" placeholder="871282523"></div>
      </div>
      <div class="fld"><label>链接（留空则只显示文字）</label><input type="text" class="ct-link" value="${esc(c.link||'')}" placeholder="https://… 或 mailto:xxx@xx.com"></div>`
    card.querySelector('button.danger').onclick=()=>{s.about.contact.splice(i,1);renderContact()}
    box.appendChild(card)
  })
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.textContent='+ 添加联系方式'
  add.onclick=()=>{s.about.contact=s.about.contact||[];s.about.contact.push({label:'',value:'',link:''});renderContact()}
  box.appendChild(add)
}

/* ---------- 友链名单 ---------- */
function renderLinkData(){
  const box=$('#linkDataList'); if(!box) return
  box.innerHTML=''
  ;(s.linkData||[]).forEach((g,i)=>{
    const card=document.createElement('div');card.className='group-card'
    const itemsHtml=(g.typeList||[]).map((l,j)=>`<div class="item-card">
      <div class="item-card-head"><span class="i-label">站点 #${j+1}</span><button type="button" class="ld-i-del">删除</button></div>
      <div class="row2">
        <div class="fld"><label>名称</label><input type="text" class="ld-i-name" value="${esc(l.name||'')}" placeholder="站名"></div>
        <div class="fld"><label>网址</label><input type="text" class="ld-i-url" value="${esc(l.url||'')}" placeholder="https://…"></div>
      </div>
      <div class="row2">
        <div class="fld"><label>头像图片地址</label><input type="text" class="ld-i-avatar" value="${esc(l.avatar||'')}" placeholder="https://…/avatar.png"></div>
        <div class="fld"><label>简介</label><input type="text" class="ld-i-desc" value="${esc(l.desc||'')}" placeholder="一句话介绍"></div>
      </div>
    </div>`).join('')
    card.innerHTML=`<div class="group-card-head"><span class="g-label">分组 #${i+1}</span><button type="button" class="btn small danger ld-g-del">删除分组</button></div>
      <div class="row2">
        <div class="fld"><label>分组标识（英文）</label><input type="text" class="ld-type" value="${esc(g.type||'')}" placeholder="rec / friends"></div>
        <div class="fld"><label>分组名</label><input type="text" class="ld-name" value="${esc(g.typeName||'')}" placeholder="推荐 / 小伙伴们"></div>
      </div>
      <div class="fld"><label>分组说明</label><input type="text" class="ld-desc" value="${esc(g.typeDesc||'')}" placeholder="都是大佬，推荐关注"></div>
      <div class="ld-items">${itemsHtml||'<div style="color:var(--muted);font-size:.78rem;padding:.2rem 0">该分组还没有站点</div>'}</div>
      <button type="button" class="btn small ld-add-item">+ 添加站点</button>`
    card.querySelector('.ld-g-del').onclick=()=>{s.linkData.splice(i,1);renderLinkData()}
    card.querySelector('.ld-add-item').onclick=()=>{g.typeList=g.typeList||[];g.typeList.push({name:'',avatar:'',desc:'',url:''});renderLinkData()}
    card.querySelectorAll('.ld-i-del').forEach((b,j)=>{
      b.onclick=()=>{g.typeList=g.typeList||[];g.typeList.splice(j,1);renderLinkData()}
    })
    box.appendChild(card)
  })
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.textContent='+ 添加分组'
  add.onclick=()=>{s.linkData=s.linkData||[];s.linkData.push({type:'friends',typeName:'',typeDesc:'',typeList:[]});renderLinkData()}
  box.appendChild(add)
}

/* ---------- 导航菜单（nav） ---------- */
function renderNav(){
  const box=$('#navList');box.innerHTML=''
  ;(s.nav||[]).forEach((g,i)=>{
    const card=document.createElement('div');card.className='group-card'
    card.innerHTML=`<div class="group-card-head"><span class="g-label">分组 #${i+1}</span><button type="button" class="btn small danger">删除分组</button></div>
      <div class="fld"><label>分组名称（文库 / 专栏 / 友链 / 我的）</label><input type="text" class="nav-g-name" value="${esc(g.text||'')}"></div>
      <div class="items-box nav-items-box"></div>`
    const itemsBox=card.querySelector('.nav-items-box')
    function renderNavItems(){
      itemsBox.innerHTML=''
      ;(g.items||[]).forEach((item,j)=>{
        const row=document.createElement('div');row.className='item-card'
        row.innerHTML=`<div class="item-card-head" style="margin-bottom:.35rem"><span class="i-label">项目 #${j+1}</span><button type="button" class="btn small danger" style="padding:.2rem .5rem;font-size:.72rem">删除</button></div>
          <div class="row2">
            <div class="fld"><label>文字</label><input type="text" class="ni-text" value="${esc(item.text||'')}"></div>
            <div class="fld"><label>链接</label><input type="text" class="ni-link" value="${esc(item.link||'')}"></div>
          </div>
          <div class="fld"><label>图标名（可选）</label><input type="text" class="ni-icon" value="${esc(item.icon||'')}" placeholder="article / code / heart / settings…"></div>`
        row.querySelector('button').onclick=()=>{g.items.splice(j,1);renderNavItems()}
        itemsBox.appendChild(row)
      })
      const add2=document.createElement('button');add2.type='button';add2.className='btn-add';add2.textContent='+ 添加导航项'
      add2.onclick=()=>{g.items=g.items||[];g.items.push({text:'',link:'',icon:''});renderNavItems()}
      itemsBox.appendChild(add2)
    }
    renderNavItems()
    card.querySelector('button.danger').onclick=()=>{s.nav.splice(i,1);renderNav()}
    box.appendChild(card)
  })
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.textContent='+ 添加导航分组'
  add.onclick=()=>{s.nav=s.nav||[];s.nav.push({text:'',items:[]});renderNav()}
  box.appendChild(add)
}

/* ---------- 站点地图（sitemap） ---------- */
function renderSitemap(){
  const box=$('#sitemapList');box.innerHTML=''
  ;(s.footer.sitemap||[]).forEach((g,i)=>{
    const card=document.createElement('div');card.className='group-card'
    card.innerHTML=`<div class="group-card-head"><span class="g-label">分组 #${i+1}</span><button type="button" class="btn small danger">删除</button></div>
      <div class="fld"><label>分组标题</label><input type="text" class="sm-title" value="${esc(g.text||'')}"></div>
      <div class="sm-items-box"></div>`
    const itemsBox=card.querySelector('.sm-items-box')
    function renderSmItems(){
      itemsBox.innerHTML=''
      ;(g.items||[]).forEach((item,j)=>{
        const row=document.createElement('div');row.className='item-card'
        row.innerHTML=`<div class="item-card-head"><span class="i-label">链接 #${j+1}</span><button type="button" class="btn small danger" style="padding:.2rem .5rem;font-size:.72rem">删除</button></div>
          <div class="row2">
            <div class="fld"><label>文字</label><input type="text" class="sm-i-text" value="${esc(item.text||'')}"></div>
            <div class="fld"><label>链接</label><input type="text" class="sm-i-link" value="${esc(item.link||'')}"></div>
          </div>
          <div class="fld"><label class="chk-row" style="margin-top:.2rem"><input type="checkbox" class="sm-i-newtab" ${item.newTab?'checked':''}> 新窗口打开</label></div>`
        row.querySelector('button').onclick=()=>{g.items.splice(j,1);renderSmItems()}
        itemsBox.appendChild(row)
      })
      const add2=document.createElement('button');add2.type='button';add2.className='btn-add';add2.textContent='+ 添加链接'
      add2.onclick=()=>{g.items=g.items||[];g.items.push({text:'',link:''});renderSmItems()}
      itemsBox.appendChild(add2)
    }
    renderSmItems()
    card.querySelector('button.danger').onclick=()=>{s.footer.sitemap.splice(i,1);renderSitemap()}
    box.appendChild(card)
  })
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.textContent='+ 添加站点地图分组'
  add.onclick=()=>{s.footer.sitemap=s.footer.sitemap||[];s.footer.sitemap.push({text:'',items:[]});renderSitemap()}
  box.appendChild(add)
}

/* ---------- 头部注入（inject.header） ---------- */
function renderInject(){
  const box=$('#injectList');box.innerHTML=''
  const items = s.inject?.header || []
  items.forEach((item,i)=>{
    const tag=item[0]||'link'
    const attrs=item[1]||{}
    const card=document.createElement('div');card.className='item-card'
    card.innerHTML=`<div class="item-card-head"><span class="i-label">注入项 #${i+1}</span><button type="button" class="btn small danger">删除</button></div>
      <div class="row2">
        <div class="fld"><label>HTML 标签</label><input type="text" class="in-tag" value="${esc(tag)}" placeholder="link / script / meta…"></div>
        <div class="fld"><label>属性 JSON</label><textarea class="in-attrs" style="min-height:44px;font-family:ui-monospace,monospace;font-size:.82rem">${esc(JSON.stringify(attrs,null,2))}</textarea></div>
      </div>
      <div style="margin-top:.3rem;font-size:.72rem;color:var(--muted)">预览：&lt;${esc(tag)} ${Object.keys(attrs).slice(0,3).map(k=>esc(k)+'="…"+').join(' ')}&gt;</div>`
    card.querySelector('button.danger').onclick=()=>{s.inject.header.splice(i,1);renderInject()}
    box.appendChild(card)
  })
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.textContent='+ 添加注入项'
  add.onclick=()=>{s.inject=s.inject||{header:[]};s.inject.header=s.inject.header||[];s.inject.header.push(['link',{}]);renderInject()}
  box.appendChild(add)
}

/* ---------- 更多导航（navMore） ---------- */
function renderNavMore(){
  const box=$('#navMoreList');box.innerHTML=''
  ;(s.navMore||[]).forEach((g,i)=>{
    const card=document.createElement('div');card.className='group-card'
    card.innerHTML=`<div class="group-card-head"><span class="g-label">分组 #${i+1}</span><button type="button" class="btn small danger">删除</button></div>
      <div class="fld"><label>分组名称（下拉菜单标题）</label><input type="text" class="nm-name" value="${esc(g.name||'')}"></div>
      <div class="nm-items-box"></div>`
    const itemsBox=card.querySelector('.nm-items-box')
    function renderNmItems(){
      itemsBox.innerHTML=''
      ;(g.list||[]).forEach((item,j)=>{
        const row=document.createElement('div');row.className='item-card'
        row.innerHTML=`<div class="item-card-head"><span class="i-label">项 #${j+1}</span><button type="button" class="btn small danger" style="padding:.2rem .5rem;font-size:.72rem">删除</button></div>
          <div class="row2">
            <div class="fld"><label>名称</label><input type="text" class="nm-i-name" value="${esc(item.name||'')}"></div>
            <div class="fld"><label>URL</label><input type="text" class="nm-i-url" value="${esc(item.url||'')}"></div>
          </div>
          <div class="fld"><label>SVG 图标（可选，完整 SVG 代码）</label><textarea class="nm-i-icon" style="min-height:44px;font-family:ui-monospace,monospace;font-size:.82rem">${esc(item.iconSvg||'')}</textarea></div>`
        row.querySelector('button').onclick=()=>{g.list.splice(j,1);renderNmItems()}
        itemsBox.appendChild(row)
      })
      const add2=document.createElement('button');add2.type='button';add2.className='btn-add';add2.textContent='+ 添加子项'
      add2.onclick=()=>{g.list=g.list||[];g.list.push({name:'',url:'',iconSvg:''});renderNmItems()}
      itemsBox.appendChild(add2)
    }
    renderNmItems()
    card.querySelector('button.danger').onclick=()=>{s.navMore.splice(i,1);renderNavMore()}
    box.appendChild(card)
  })
  const add=document.createElement('button');add.type='button';add.className='btn-add';add.textContent='+ 添加分组'
  add.onclick=()=>{s.navMore=s.navMore||[];s.navMore.push({name:'',list:[]});renderNavMore()}
  box.appendChild(add)
}

/* ---------- 收集表单 ---------- */
function collectForm(){
  const g=k=>{const el=$('[data-k="'+k+'"]');return el?el.value:''}
  const gLines=k=>{const el=$('[data-lines="'+k+'"]');return el?el.value.split('\n').map(x=>x.trim()).filter(Boolean):[]}
  const gChk=k=>{const el=$('[data-chk="'+k+'"]');return el?el.checked:false}
  s.siteMeta.title=g('siteMeta.title');s.siteMeta.site=g('siteMeta.site');s.siteMeta.description=g('siteMeta.description')
  s.siteMeta.logo=g('siteMeta.logo');s.siteMeta.author.name=g('siteMeta.author.name');s.siteMeta.author.cover=g('siteMeta.author.cover')
  s.siteMeta.author.email=g('siteMeta.author.email');s.icp=g('icp');s.since=g('since')
  s.postSize=Number(g('postSize'))||8
  s.about.heroTitle=g('about.heroTitle');s.about.heroSubSuffix=g('about.heroSubSuffix')
  s.about.interests=gLines('about.interests');s.about.why=gLines('about.why')
  s.techshare.title=g('techshare.title');s.techshare.categories=gLines('techshare.categories')
  s.rewardData.enable=gChk('rewardData.enable');s.rewardData.wechat=g('rewardData.wechat');s.rewardData.alipay=g('rewardData.alipay')
  s.comment.enable=gChk('comment.enable');s.comment.type=g('comment.type')
  s.comment.twikoo.js=g('comment.twikoo.js');s.comment.twikoo.envId=g('comment.twikoo.envId');s.comment.twikoo.lang=g('comment.twikoo.lang')
  // aside
  s.aside=s.aside||{};s.aside.hello=s.aside.hello||{};s.aside.hello.enable=gChk('aside.hello.enable');s.aside.hello.text=g('aside.hello.text')
  s.aside.toc=s.aside.toc||{};s.aside.toc.enable=gChk('aside.toc.enable')
  s.aside.tags=s.aside.tags||{};s.aside.tags.enable=gChk('aside.tags.enable')
  s.aside.countDown=s.aside.countDown||{};s.aside.countDown.enable=gChk('aside.countDown.enable')
  s.aside.siteData=s.aside.siteData||{};s.aside.siteData.enable=gChk('aside.siteData.enable')
  // cover
  s.cover=s.cover||{};s.cover.twoColumns=gChk('cover.twoColumns')
  s.cover.showCover=s.cover.showCover||{};s.cover.showCover.enable=gChk('cover.showCover.enable')
  s.cover.showCover.coverLayout=g('cover.showCover.coverLayout')
  s.cover.showCover.defaultCover=[g('cover.showCover.defaultCover.0')].filter(Boolean)
  // 页眉
  s.banner=s.banner||{};s.banner.title=g('banner.title');s.banner.subtitleMode=g('banner.subtitleMode')||'hitokoto'
  s.banner.subtitle=g('banner.subtitle');s.banner.background=g('banner.background');s.banner.height=g('banner.height')||'half'
  // 导航栏
  s.navBar=s.navBar||{}
  s.navBar.siteName=g('navBar.siteName')
  // 菜单项可见性（仅覆盖第 0~3 个分组的 visible；新增分组走高级设置）
  s.navBar.menuItems=s.navBar.menuItems||[]
  for(let i=0;i<4;i++){
    s.navBar.menuItems[i]=s.navBar.menuItems[i]||{}
    s.navBar.menuItems[i].visible=gChk('navBar.menuItems.'+i+'.visible')
  }
  // 右侧按钮
  s.navBar.rightButtons=s.navBar.rightButtons||{}
  const rbKeys=['travellings','shuffle','search','control','backToTop']
  rbKeys.forEach(k=>{
    s.navBar.rightButtons[k]=s.navBar.rightButtons[k]||{}
    s.navBar.rightButtons[k].visible=gChk('navBar.rightButtons.'+k+'.visible')
    const t=g('navBar.rightButtons.'+k+'.title');if(t)s.navBar.rightButtons[k].title=t;else delete s.navBar.rightButtons[k].title
    if(k==='travellings'){const u=g('navBar.rightButtons.'+k+'.url');if(u)s.navBar.rightButtons[k].url=u;else delete s.navBar.rightButtons[k].url}
  })
  // 音乐 / 搜索
  s.music=s.music||{}
  s.music.enable=gChk('music.enable');s.music.url=g('music.url')
  const mid=g('music.id');s.music.id=(mid!==''&&/^-?\d+$/.test(mid))?Number(mid):mid
  s.music.server=g('music.server')||'netease';s.music.type=g('music.type')||'playlist'
  s.search=s.search||{}
  s.search.enable=gChk('search.enable');s.search.appId=g('search.appId');s.search.apiKey=g('search.apiKey')
  // 友链圈子
  s.friends=s.friends||{}
  s.friends.circleOfFriends=g('friends.circleOfFriends')
  s.friends.dynamicLink={server:g('friends.dynamicLink.server'),app_token:g('friends.dynamicLink.app_token'),table_id:g('friends.dynamicLink.table_id')}
  // 统计 / 灯箱
  s.tongji={'51la':g('tongji.51la')}
  s.fancybox=s.fancybox||{}
  s.fancybox.enable=gChk('fancybox.enable');s.fancybox.js=g('fancybox.js');s.fancybox.css=g('fancybox.css')
  // 外链跳转
  s.jumpRedirect=s.jumpRedirect||{}
  s.jumpRedirect.enable=gChk('jumpRedirect.enable');s.jumpRedirect.exclude=gLines('jumpRedirect.exclude')
  // 联系我
  s.about.contact=[...$$('#contactList .item-card')].map(c=>({
    label:c.querySelector('.ct-label').value,value:c.querySelector('.ct-value').value,link:c.querySelector('.ct-link').value
  })).filter(x=>x.label||x.value||x.link)
  // 友链名单
  s.linkData=[...$$('#linkDataList .group-card')].map(c=>({
    type:c.querySelector('.ld-type').value,typeName:c.querySelector('.ld-name').value,typeDesc:c.querySelector('.ld-desc').value,
    typeList:[...c.querySelectorAll('.ld-items .item-card')].map(r=>({
      name:r.querySelector('.ld-i-name').value,avatar:r.querySelector('.ld-i-avatar').value,
      desc:r.querySelector('.ld-i-desc').value,url:r.querySelector('.ld-i-url').value
    })).filter(x=>x.name||x.url)
  }))
  // 技能组
  s.about.skills=[...$$('#skillsList .group-card')].map(c=>({title:c.querySelector('.sk-title').value,items:c.querySelector('.sk-items').value.split('\n').map(x=>x.trim()).filter(Boolean)}))
  // 时间线
  s.about.timeline=[...$$('#timelineList .item-card')].map(c=>({time:c.querySelector('.tl-time').value,event:c.querySelector('.tl-event').value}))
  // 关于页项目
  s.about.projects=[...$$('#aboutProjectsList .item-card')].map(c=>({icon:c.querySelector('.ap-icon').value,name:c.querySelector('.ap-name').value,desc:c.querySelector('.ap-desc').value,tags:c.querySelector('.ap-tags').value.split('\n').map(x=>x.trim()).filter(Boolean),color:c.querySelector('.ap-color').value}))
  // 我的项目
  s.projects=[...$$('#projectsList .item-card')].map(c=>{
    const links=[...c.querySelectorAll('.links-row')].map(r=>({text:r.querySelector('.pr-lt').value,url:r.querySelector('.pr-lu').value})).filter(l=>l.text||l.url)
    return{name:c.querySelector('.pr-name').value,icon:c.querySelector('.pr-icon').value,desc:c.querySelector('.pr-desc').value,tags:c.querySelector('.pr-tags').value.split('\n').map(x=>x.trim()).filter(Boolean),status:c.querySelector('.pr-status').value,links}
  })
  // 社交
  s.footer.social=[...$$('#socialList .item-card')].map(c=>{
    const o={icon:c.querySelector('.so-icon').value,link:c.querySelector('.so-link').value}
    const t=c.querySelector('.so-title').value;if(t)o.title=t
    const sb=c.querySelector('.so-sub').value;if(sb)o.subtitle=sb
    if(c.querySelector('.so-qr').checked)o.isQRCode=true
    return o
  })
  // 导航
  s.nav=[...$$('#navList .group-card')].map(c=>({text:c.querySelector('.nav-g-name').value,items:[...c.querySelectorAll('.item-card')].map(r=>({text:r.querySelector('.ni-text').value,link:r.querySelector('.ni-link').value,icon:r.querySelector('.ni-icon').value}))}))
  // 站点地图
  s.footer.sitemap=[...$$('#sitemapList .group-card')].map(c=>({text:c.querySelector('.sm-title').value,items:[...c.querySelectorAll('.item-card')].map(r=>({text:r.querySelector('.sm-i-text').value,link:r.querySelector('.sm-i-link').value,newTab:!!r.querySelector('.sm-i-newtab').checked}))}))
  // 头部注入
  s.inject=s.inject||{header:[]};s.inject.header=[...$$('#injectList .item-card')].map(c=>{
    try{return[c.querySelector('.in-tag').value,JSON.parse(c.querySelector('.in-attrs').value)]}catch(e){return[c.querySelector('.in-tag').value,{}]}
  })
  // navMore
  s.navMore=[...$$('#navMoreList .group-card')].map(c=>({name:c.querySelector('.nm-name').value,list:[...c.querySelectorAll('.item-card')].map(r=>({name:r.querySelector('.nm-i-name').value,url:r.querySelector('.nm-i-url').value,iconSvg:r.querySelector('.nm-i-icon').value}))}))
}

/* ---------- 保存 ---------- */
async function doSave(){
  const cur=$('#advJson').value
  let payload
  if(cur!==origAdv){
    try{payload=JSON.parse(cur)}catch(e){msg(null,'高级 JSON 格式错误：'+e.message,false);return}
  }else{
    try{collectForm();payload=s}catch(e){
      msg(null,'表单收集出错（'+e.message+'），请按 F12 查看控制台红色报错',false)
      console.error(e);return
    }
  }
  try{
    const r=await fetch(api+'/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload,null,2)})
    const d=await r.json()
    if(d.ok){
      msg(null,'✅ 已保存，刷新前台页面即可生效',true)
      origAdv=JSON.stringify(payload,null,2);$('#advJson').value=origAdv;S=JSON.parse(JSON.stringify(payload))
    }else msg(null,'❌ '+(d.error||'保存失败'),false)
  }catch(e){msg(null,'❌ 网络错误：'+e.message,false)}
}

/* ---------- 文章管理 ---------- */
let POST_POOL=[]
/* ---- 分类 / 标签：点选式 ---- */
function chipInput(kind){ return kind==='categories'?$('#pe-categories'):$('#pe-tags') }
function chipList(kind){ return chipInput(kind).value.split(/[,，]/).map(x=>x.trim()).filter(Boolean) }
function setChipList(kind,arr){ chipInput(kind).value=arr.join(', '); renderChips() }
function collectPool(){
  const c=[],t=[]
  ;(POST_POOL||[]).forEach(p=>{
    (p.categories||[]).forEach(x=>{x=String(x||'').trim(); if(x&&!c.includes(x))c.push(x)})
    ;(p.tags||[]).forEach(x=>{x=String(x||'').trim(); if(x&&!t.includes(x))t.push(x)})
  })
  return {cats:c,tags:t}
}
function renderChips(){
  if(!$('#pe-cat-box')) return
  const pool=collectPool()
  renderOneBox('categories',pool.cats)
  renderOneBox('tags',pool.tags)
}
function renderOneBox(kind,pool){
  const box=$(kind==='categories'?'#pe-cat-box':'#pe-tag-box')
  if(!box) return
  const cur=chipList(kind)
  let h=''
  cur.forEach(v=>{h+='<span class="chip on" data-kind="'+kind+'" data-v="'+esc(v)+'">'+esc(v)+' <b>&times;</b></span>'})
  pool.filter(v=>!cur.includes(v)).forEach(v=>{h+='<span class="chip" data-kind="'+kind+'" data-v="'+esc(v)+'">'+esc(v)+' <b>+</b></span>'})
  box.innerHTML = h || '<span class="note" style="margin:0">还没有可选项，直接在下面输入后回车即可</span>'
  box.querySelectorAll('.chip').forEach(el=>{
    el.onclick=()=>{
      const k=el.getAttribute('data-kind'), v=el.getAttribute('data-v')
      let arr=chipList(k)
      if(arr.includes(v)) arr=arr.filter(x=>x!==v); else arr.push(v)
      setChipList(k,arr)
    }
  })
}
function commitChipInput(kind){
  const el=chipInput(kind); if(!el||!el.value.trim()) return
  let arr=chipList(kind)
  chipList(kind).forEach(v=>{ if(!arr.includes(v)) arr.push(v) })
  el.value=arr.join(', ')
  renderChips()
}
async function loadPosts(){
  const r=await fetch(api+'/posts')
  if(!r.ok)return
  const d=await r.json()
  const posts=d.posts||[];POST_POOL=posts;const tb=$('#postRows');tb.innerHTML=''
  renderChips()
  $('#postEmpty').style.display=posts.length?'none':'block'
  posts.forEach(p=>{
    const tr=document.createElement('tr');tr.style.borderTop='1px solid var(--border)'
    tr.innerHTML=`<td style="padding:.5rem">${esc(p.title||'')}</td>
      <td style="padding:.5rem;color:var(--muted);font-size:.82rem">${esc(p.date||'')}</td>
      <td style="padding:.5rem;font-size:.82rem">${esc((p.categories||[]).join(' / '))}</td>
      <td style="padding:.5rem;font-size:.82rem;color:var(--muted)">${esc((p.tags||[]).join(', '))}</td>
      <td style="padding:.5rem;white-space:nowrap">
        <button class="btn small" onclick="editPost('${p.file}')">编辑</button>
        <button class="btn small danger" onclick="deletePost('${p.file}')">删除</button>
      </td>`
    tb.appendChild(tr)
  })
}
async function editPost(file){
  const r=await fetch(api+'/post?file='+encodeURIComponent(file));const d=await r.json()
  if(!d.ok){msg($('#postMsg'),'读取文章失败',false);return}
  const p=d.post
  $('#pe-file').value=p.file||'';$('#pe-title').value=p.title||'';$('#pe-date').value=p.date||''
  $('#pe-slug').value=(p.file||'').split('/').pop().replace(/^\d{4}-\d{2}-\d{2}-/,'').replace(/\.md$/,'')
  $('#pe-cover').value=p.cover||'';$('#pe-categories').value=(p.categories||[]).join(', ');$('#pe-tags').value=(p.tags||[]).join(', ')
  renderChips()
  $('#pe-desc').value=p.description||'';$('#pe-content').value=p.content||''
  $('#postEditTitle').textContent='编辑：'+(p.title||'')
  $('#post-list-view').classList.add('hidden');$('#post-edit-view').classList.remove('hidden')
}
function newPost(){
  $('#pe-file').value='';$('#pe-title').value='';$('#pe-date').value=new Date().toISOString().slice(0,10)
  $('#pe-slug').value='';$('#pe-cover').value='';$('#pe-categories').value='';$('#pe-tags').value='';$('#pe-desc').value='';$('#pe-content').value=''
  renderChips()
  $('#postEditTitle').textContent='新建文章'
  $('#post-list-view').classList.add('hidden');$('#post-edit-view').classList.remove('hidden')
}
function backToPosts(){
  $('#post-edit-view').classList.add('hidden');$('#post-list-view').classList.remove('hidden')
}
async function savePost(){
  const pm=$('#postMsg');pm.classList.add('hidden')
  if(!$('#pe-slug').value.trim())$('#pe-slug').value='p'+Date.now().toString(36)
  commitChipInput('categories');commitChipInput('tags')
  if(!$('#pe-desc').value.trim())autoDesc(true)
  const body={file:$('#pe-file').value,title:$('#pe-title').value.trim(),date:$('#pe-date').value.trim(),slug:$('#pe-slug').value.trim(),cover:$('#pe-cover').value.trim(),categories:$('#pe-categories').value.split(/[,，]/).map(x=>x.trim()).filter(Boolean),tags:$('#pe-tags').value.split(/[,，]/).map(x=>x.trim()).filter(Boolean),description:$('#pe-desc').value.trim(),content:$('#pe-content').value}
  if(!body.title||!body.date){msg(pm,'标题、日期必填',false);return}
  try{
    const r=await fetch(api+'/post',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    const d=await r.json()
    if(!d.ok){msg(pm,'❌ '+(d.error||'保存失败'),false);return}
    msg(pm,'✅ 已保存，正在发布…',true)
    await publishAndWait(pm)
  }catch(e){msg(pm,'❌ 网络错误：'+e.message,false)}
}
async function publishAndWait(pm){
  try{await fetch(api+'/publish',{method:'POST'})}catch(e){}
  for(let i=0;i<60;i++){
    await new Promise(r=>setTimeout(r,3000))
    try{
      const st=await (await fetch(api+'/publish-status')).json()
      if(st.status&&(st.status.state==='done'||st.status.state==='error')){
        msg(pm,st.status.ok?'🚀 已上线，刷新前台查看新文章':'⚠️ 发布失败，服务器日志：/tmp/resc-deploy.log',st.status.ok)
        return
      }
    }catch(e){}
  }
  msg(pm,'⏳ 发布超时，请稍后查看线上',null)
}
async function rebuildSite(){
  msg(null,'🔄 正在重新构建站点，通常需要 1-2 分钟…',null)
  try{await fetch(api+'/publish',{method:'POST'})}catch(e){}
  for(let i=0;i<60;i++){
    await new Promise(r=>setTimeout(r,3000))
    try{
      const st=await (await fetch(api+'/publish-status')).json()
      if(st.status&&(st.status.state==='done'||st.status.state==='error')){
        msg(null,st.status.ok?'🚀 已重新上线，刷新前台页面即可看到':'⚠️ 构建失败，服务器日志：/tmp/resc-deploy.log',st.status.ok)
        return
      }
    }catch(e){}
  }
  msg(null,'⏳ 构建超时，请稍后刷新看看',null)
}
async function deletePost(file){
  if(!confirm('确定删除这篇文章？不可恢复。'))return
  const r=await fetch(api+'/post?file='+encodeURIComponent(file),{method:'DELETE'});const d=await r.json()
  if(!d.ok){msg($('#postMsg'),'❌ 删除失败',false);return}
  const pm=$('#postMsg');msg(pm,'🔄 正在发布…',true);await publishAndWait(pm);backToPosts()
}

/* ---------- 摘要提取 ---------- */
function autoDesc(silent){
  let text=$('#pe-content').value.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/,'').replace(/!\[.*?\]\(.*?\)/g,'').replace(/\[.*?\]\(.*?\)/g,'').replace(/#{1,6}\s+/g,'').replace(/[*_`~]/g,'').replace(/```[\s\S]*?```/g,'').replace(/`[^`]+`/g,'').replace(/^>\s+/gm,'').replace(/^[-*+]\s+/gm,'').replace(/^\d+\.\s+/gm,'').replace(/\n+/g,' ').replace(/\s{2,}/g,' ').trim()
  const desc=text.length>150?text.slice(0,150)+'…':text
  $('#pe-desc').value=desc
  if(silent)return
  if(desc) msg($('#postMsg'),'✅ 摘要已提取（可手动修改）',true)
  else msg($('#postMsg'),'正文为空，无法提取',false)
}

/* ---------- 图片上传 ---------- */
function uploadImage(){$('#imgFile').click()}
async function doUploadImg(input){
  const file=input.files[0];if(!file)return
  if(file.size>5*1024*1024){msg($('#postMsg'),'图片不能超过 5MB',false);return}
  const reader=new FileReader()
  reader.onload=async function(e){
    try{
      const r=await fetch(api+'/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:file.name,data:e.target.result})})
      const d=await r.json()
      if(!d.ok){msg($('#postMsg'),'上传失败：'+(d.error||''),false);return}
      const ta=$('#pe-content'),pos=ta.selectionStart
      const md='\n![]('+d.url+')\n'
      ta.value=ta.value.slice(0,pos)+md+ta.value.slice(pos)
      ta.selectionStart=ta.selectionEnd=pos+md.length;ta.focus()
      msg($('#postMsg'),'✅ 图片已插入，请调整位置',true)
    }catch(e){msg($('#postMsg'),'上传失败：'+e.message,false)}
  }
  reader.readAsDataURL(file);input.value=''
}

/* ---------- 登出 ---------- */
async function doLogout(){await fetch(api+'/logout',{method:'POST'});location.reload()}

/* ---------- 初始化 ---------- */
window.addEventListener('DOMContentLoaded',function(){
  ['categories','tags'].forEach(function(kind){
    var el=chipInput(kind); if(!el) return
    el.addEventListener('keydown',function(e){ if(e.key==='Enter'){e.preventDefault();commitChipInput(kind)} })
    el.addEventListener('blur',function(){ commitChipInput(kind) })
  })
  showSection('sec-site', false)
})
