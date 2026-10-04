(() => {
  'use strict';
  const lessons=window.COURSE, main=document.getElementById('lesson'), nav=document.getElementById('course-nav');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const asset=n=>`assets/${n}.webp`, slide=n=>`slides/slide-${String(n).padStart(2,'0')}.jpg`;
  const videoForPage={11:['media1'],48:['media2','media3','media4'],49:['media5']};
  let active=0, viewerKind='slide', viewerNumber=1, viewerItems=[], toastTimer;
  const viewer=document.getElementById('viewer');
  nav.innerHTML=lessons.map((l,i)=>`<a class="nav-link" href="#${l.id}"><span>${String(i+1).padStart(2,'0')}</span>${esc(l.short)}</a>`).join('')+'<a class="nav-link" href="#original"><span>↗</span>原课件与视频</a>';
  function section(n,title,extra=''){return `<div class="section-heading"><span class="serial">${n}</span><h2>${esc(title)}</h2>${extra?`<small>${esc(extra)}</small>`:''}</div>`;}
  function gallery(items){if(!items)return '';return `<div class="gallery ${items.length===2?'two':items.length>4?'four':''}">${items.map(([n,label])=>`<figure><button class="image-button" data-image="${n}" data-caption="${esc(label)}" aria-label="放大查看：${esc(label)}"><img src="${asset(n)}" alt="${esc(label)}" loading="lazy"></button><figcaption>${esc(label)}</figcaption></figure>`).join('')}</div>`;}
  function prompts(items){return items.map(([title,text],i)=>`<div class="prompt-block"><div class="prompt-head"><div><h3>${esc(title)}</h3><span>课堂增补 · 复制到你使用的 AI 工具</span></div><button class="copy-button" data-copy="prompt-${i}">复制提示词</button></div><pre id="prompt-${i}">${esc(text)}</pre></div>`).join('');}
  function videos(items){return `<div class="videos">${items.map(([name,label])=>`<figure${name==='media1'?' class="wide"':''}><video controls playsinline preload="none" poster="${name==='media1'?slide(11):name==='media5'?asset('image48'):asset('image'+({media2:45,media3:46,media4:47}[name]))}" aria-label="${esc(label)}"><source src="videos/${name}.mp4" type="video/mp4">浏览器无法播放时，请下载视频查看。</video><figcaption>${esc(label)}</figcaption></figure>`).join('')}</div>`;}
  function readChecklist(){try{return JSON.parse(localStorage.getItem('icuc-ip-part2-checklist')||'{}');}catch{return {};}}
  function homework(items){const saved=readChecklist();return `<div class="assignment-numbers"><div><b>10+</b><span>核心表情</span></div><div><b>4+</b><span>动态姿势</span></div><div><b>2+</b><span>不同服装</span></div></div><ul class="homework-list">${items.map(([t,d],i)=>`<li><label><input type="checkbox" data-check="${i}" ${saved[i]?'checked':''}><div><strong>${esc(t)}</strong><p>${esc(d)}</p></div></label></li>`).join('')}</ul><p class="homework-status" id="homework-status"></p><p class="source-help">勾选仅保存在本机浏览器，用于自查。<button class="source-link" id="download-checklist">下载作业与过程记录模板</button></p>`;}
  function render(){
    pauseVideos(); const id=location.hash.slice(1)||'workflow'; active=lessons.findIndex(l=>l.id===id);if(active<0)active=id==='original'?8:0;
    document.querySelectorAll('.nav-link').forEach(a=>{const hit=a.getAttribute('href')==='#'+(active===8?'original':lessons[active].id);a.classList.toggle('active',hit);if(hit)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.querySelector('.sidebar').classList.remove('open');document.getElementById('mobile-menu').setAttribute('aria-expanded','false');document.querySelector('#mobile-menu span').textContent='展开';
    if(active===8){renderOriginal();}else{
      const l=lessons[active];let order=1;
      main.innerHTML=`<div class="lesson-meta"><span class="eyebrow">${esc(l.en)}</span><span>第二部分 / ${String(active+1).padStart(2,'0')} OF 08</span></div>
        <div class="chapter-top"><div><span class="chapter-number">LESSON ${String(active+1).padStart(2,'0')}</span><h1>${esc(l.title).replace(/\n/g,'<br>')}</h1><p class="chapter-deck">${esc(l.intro)}</p><div class="chapter-output"><span>本节产物</span><p>${esc(l.output)}</p></div></div><div class="hero-visual ${['workflow','expression'].includes(l.id)?'portrait':''}"><img src="${asset(l.image)}" alt="${esc(l.imageLabel)}"><div class="hero-caption"><span>${esc(l.imageLabel)}</span><strong>原课件案例</strong></div></div></div>
        <div class="lesson-body">${section(String(order++).padStart(2,'0'),l.heading,'课程知识')}<p class="intro-text">${esc(l.text)}</p>
        ${l.workflow?`<div class="workflow">${l.workflow.map(([n,t,d])=>`<div><b>${n}</b><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div>`:''}
        ${l.homework?homework(l.homework):''}
        <div class="detail-grid">${l.details.map(([t,d],i)=>`<div><span class="detail-index">${String(i+1).padStart(2,'0')}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div>
        ${l.gallery?section(String(order++).padStart(2,'0'),'课件示范，逐项观察','点击图片放大')+gallery(l.gallery):''}
        ${section(String(order++).padStart(2,'0'),'AI 实操提示词','课堂增补')}${prompts(l.prompts)}
        ${section(String(order++).padStart(2,'0'),'生成之后，如何验收','人工检查')}<ul class="checks">${l.checks.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
        <div class="discussion"><small>课堂讨论</small>${esc(l.question)}</div>
        ${l.video?section(String(order++).padStart(2,'0'),'原课件视频示范')+videos(l.video):''}
        <div class="lesson-note"><strong>教学说明</strong>${esc(l.note)}</div>
        <div class="source-line"><span>原课件出处：</span>${l.pages.map(n=>`<button class="source-link" data-slide="${n}">P${n}</button>`).join('')}<span>· AI 操作步骤与验收方法为课堂增补</span></div>
        <div class="bottom-nav"><p>${active<7?'下一节：'+esc(lessons[active+1].short):'完成自查后，可返回原课件核对示范。'}</p><a class="source-link" href="#original">查看完整原课件</a></div></div>`;
      document.title=`${l.short} · IP角色设计（下） · ICUC`;
    }
    const prev=document.getElementById('previous'),next=document.getElementById('next');prev.disabled=active===0;next.disabled=active===8;next.textContent=active===7?'原课件':'下一节';
    document.getElementById('lesson-count').textContent=active===8?'原课件 / 50 页':'学习模块 '+String(active+1).padStart(2,'0')+' / 08';
    updateHomework();window.scrollTo({top:0,behavior:'instant'});
  }
  function renderOriginal(){
    main.innerHTML=`<div class="lesson-meta"><span class="eyebrow">Source material</span><span>50 页 / 5 段视频</span></div><div style="margin-top:30px"><span class="chapter-number">COURSE ARCHIVE</span><h1>原课件与视频</h1><p class="original-intro">《第二节课_角色设计（下）》完整逐页查看。点击缩略图放大，可用左右方向键翻页。网页课程按知识模块重组，原稿保留原始内容与示范。</p></div>
      <details class="source-accordion"><summary>改编说明与工具入口</summary><p>网站保留原课件知识与案例，新增 AI 输入模板、控制变量的方法、逐项验收和过程记录。课件中的人设探索描述按阶段区分；流程耗时按示意比较处理。</p><p>正文未采用原稿“人工修改 ≥50%”作为授权判断规则。课堂要求核对参考素材和工具的使用条件，并记录创作与人工修订过程。AI 与知识产权背景可参阅 <a class="source-link" href="https://www.wipo.int/en/web/frontier-technologies/artificial-intelligence" target="_blank" rel="noopener noreferrer">WIPO 人工智能与知识产权资料</a>。</p><div class="resource-links"><a href="https://www.lovart.ai/" target="_blank" rel="noopener noreferrer">Lovart 官方入口<small>原课件 P1 提及的设计工具</small></a><a href="https://www.tapnow.ai/" target="_blank" rel="noopener noreferrer">TapNow 官方入口<small>原课件 P1 提及的创作平台</small></a></div><p>这些链接是课件资源入口。课程提示词需要复制到你使用的工具中执行，网站本身不连接图像生成服务。</p></details>
      ${section('01','课件内嵌视频')}${videos([['media1','P11 · 设计流程示范'],['media2','P48 · 角色动画示范一'],['media3','P48 · 角色动画示范二'],['media4','P48 · 角色动画示范三'],['media5','P49 · 服装展示示范']])}
      ${section('02','完整课件','点击放大')}<div class="original-grid">${Array.from({length:50},(_,i)=>`<button data-slide="${i+1}" aria-label="查看原课件第 ${i+1} 页"><img src="${slide(i+1)}" alt="原课件第 ${i+1} 页" loading="lazy"><span>${String(i+1).padStart(2,'0')} / 50</span></button>`).join('')}</div><p class="source-help">来源：用户提供《第二节课_角色设计（下）.pptx》。原稿图片与内嵌视频用于本课程示范；AI 实操模板与教学编排为网页增补。</p>`;
    document.title='原课件与视频 · IP角色设计（下） · ICUC';
  }
  function pauseVideos(){document.querySelectorAll('video').forEach(v=>v.pause());}
  function showSlide(n){viewerKind='slide';viewerNumber=n;viewerItems=[];updateViewer();if(!viewer.open)viewer.showModal();}
  function showImage(n,label){viewerKind='image';viewerItems=Array.from(main.querySelectorAll('[data-image]')).map(b=>[b.dataset.image,b.dataset.caption]);viewerNumber=viewerItems.findIndex(x=>x[0]===n);if(viewerNumber<0){viewerItems=[[n,label]];viewerNumber=0;}updateViewer();viewer.showModal();}
  function updateViewer(){
    const img=document.getElementById('viewer-image'), area=document.getElementById('viewer-video');area.querySelectorAll('video').forEach(v=>v.pause());
    if(viewerKind==='slide'){img.src=slide(viewerNumber);img.alt='原课件第 '+viewerNumber+' 页';document.getElementById('viewer-title').textContent='原课件 · 第 '+viewerNumber+' 页';document.getElementById('viewer-counter').textContent=viewerNumber+' / 50';area.innerHTML=(videoForPage[viewerNumber]||[]).map(n=>`<video controls playsinline preload="none" aria-label="原课件第${viewerNumber}页内嵌视频"><source src="videos/${n}.mp4" type="video/mp4"></video>`).join('');
    }else{const [n,t]=viewerItems[viewerNumber];img.src=asset(n);img.alt=t;document.getElementById('viewer-title').textContent=t;document.getElementById('viewer-counter').textContent=(viewerNumber+1)+' / '+viewerItems.length;area.innerHTML='';}
    const min=viewerKind==='slide'?1:0,max=viewerKind==='slide'?50:viewerItems.length-1;document.getElementById('viewer-prev').disabled=viewerNumber===min;document.getElementById('viewer-next').disabled=viewerNumber===max;
  }
  function moveViewer(d){const min=viewerKind==='slide'?1:0,max=viewerKind==='slide'?50:viewerItems.length-1;viewerNumber=Math.min(max,Math.max(min,viewerNumber+d));updateViewer();}
  function showToast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),2200);}
  async function copyText(text){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}else{const e=document.createElement('textarea');e.value=text;e.style.position='fixed';e.style.opacity='0';document.body.append(e);e.select();const ok=document.execCommand('copy');e.remove();if(!ok)throw new Error('copy');}showToast('提示词已复制');}catch{showToast('暂时无法自动复制，请选中提示词手动复制');}}
  function updateHomework(){const status=document.getElementById('homework-status');if(status){const c=main.querySelectorAll('[data-check]:checked').length;status.textContent=`已核对 ${c} / 9 项 · 请同时检查作品质量与跨图一致性`;}}
  function downloadChecklist(){const l=lessons[7],text='ICUC 2026 AIGC CAMP\nIP角色设计（下）· 作业与过程记录\n\n原课件作业要求\n'+l.homework.map(([a,b],i)=>`${i+1}. □ ${a}\n   ${b}`).join('\n')+'\n\n过程记录\n项目名称：\n人物与风格定位：\n参考图来源与用途：\n固定角色特征：\n使用工具：\n每轮输入：\n输出文件：\n选图理由：\n发现的问题：\n人工修改：\n跨图一致性检查：\n最终交付清单：\n\n注：场景数量与尺寸按 Vincenzo 老师原任务执行。';const u=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='IP角色设计_作业与过程记录.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
  main.addEventListener('click',e=>{const s=e.target.closest('[data-slide]'),im=e.target.closest('[data-image]'),copy=e.target.closest('[data-copy]');if(s)showSlide(Number(s.dataset.slide));if(im)showImage(im.dataset.image,im.dataset.caption);if(copy)copyText(document.getElementById(copy.dataset.copy).textContent);if(e.target.closest('#download-checklist'))downloadChecklist();});
  main.addEventListener('change',e=>{if(e.target.matches('[data-check]')){const saved=readChecklist();saved[e.target.dataset.check]=e.target.checked;try{localStorage.setItem('icuc-ip-part2-checklist',JSON.stringify(saved));}catch{showToast('浏览器未允许保存，本次仍可勾选自查');}updateHomework();}});
  document.getElementById('original-button').onclick=()=>location.hash='original';document.getElementById('previous').onclick=()=>{if(active>0)location.hash=lessons[active-1].id;};document.getElementById('next').onclick=()=>{if(active<8)location.hash=active===7?'original':lessons[active+1].id;};
  document.getElementById('mobile-menu').onclick=()=>{const o=document.querySelector('.sidebar').classList.toggle('open');document.getElementById('mobile-menu').setAttribute('aria-expanded',String(o));document.querySelector('#mobile-menu span').textContent=o?'收起':'展开';};
  document.getElementById('presentation-button').onclick=()=>{const on=document.body.classList.toggle('presenting');document.getElementById('presentation-button').setAttribute('aria-pressed',String(on));document.getElementById('presentation-button').textContent=on?'退出展示':'课堂展示';};
  document.getElementById('close-viewer').onclick=()=>viewer.close();viewer.addEventListener('close',()=>document.querySelectorAll('#viewer video').forEach(v=>v.pause()));document.getElementById('viewer-prev').onclick=()=>moveViewer(-1);document.getElementById('viewer-next').onclick=()=>moveViewer(1);
  viewer.addEventListener('click',e=>{if(e.target===viewer){const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close();}});
  document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(viewer.open){if(e.key==='ArrowLeft'){e.preventDefault();moveViewer(-1);}if(e.key==='ArrowRight'){e.preventDefault();moveViewer(1);}}else{if(e.key==='ArrowLeft'&&active>0)location.hash=lessons[active-1].id;if(e.key==='ArrowRight'&&active<8)location.hash=active===7?'original':lessons[active+1].id;}});
  window.addEventListener('hashchange',render);render();
})();
