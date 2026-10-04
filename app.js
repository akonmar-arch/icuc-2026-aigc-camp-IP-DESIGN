(()=>{'use strict';
if('scrollRestoration' in history)history.scrollRestoration='manual';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let original=false,reading=false,idx=0;const KEY='ip-character-scroll-169-v5';
try{let saved=JSON.parse(localStorage.getItem(KEY)||'{}');idx=saved.idx||0;original=false}catch{}
let deck=original?window.ORIGINAL:window.LESSON; if(location.hash.match(/^#\d+$/))idx=Number(location.hash.slice(1))-1;
const initialIndex=idx;let starting=true;
const article=(r,i)=>`<article><span class="num">${String(i+1).padStart(2,'0')}</span><h3>${esc(r[0])}</h3><p>${esc(r[1])}</p></article>`;
function render(s,i){let kind=s.kind;let c='',cls='',footer=`<div class="slide-footer"><span>IP角色设计 / ${esc(s.chapter)}</span><span>${String(i+1).padStart(2,'0')}</span></div>`;
let head=`<div class="eyebrow">${esc(s.chapter)}</div><h2>${esc(s.title)}</h2>${s.lead?`<p class="lead">${esc(s.lead)}</p>`:''}`;
if(kind==='hero'){cls='hero dark';c=`<div class="heroText"><div class="eyebrow">第一节课 / IP设计</div><h1>${esc(s.title)}</h1><p class="lead">${esc(s.lead)}</p><div class="small">从角色内核到视觉表达<br>以《光年正传》为主要案例</div></div><figure><img src="${s.image}" alt="原课件中的光年正传海报"></figure>`}
else if(kind==='chapter'){cls='chapter dark';c=head}
else if(kind==='original'||kind==='gif'){cls='case';c=`<div class="imagezone"><img src="${s.image}" alt="${esc(s.title)}，原PPT第${s.original}页" data-enlarge="${s.image}"></div><div class="caseaside"><div class="eyebrow">${esc(s.chapter)}<br>原课件 ${s.original} / 50</div><h2>${esc(s.title)}</h2><p class="lead">${esc(s.lead)}</p><div class="question"><div class="label">观察与讨论</div>${esc(s.items[0]?.[0]||'')}</div><div class="subtle">点击图片放大<br>按 N 查看讲解备注<br>图像解读为课堂分析</div></div>`;footer=''}
else if(kind==='raw'){cls='raw';c=`<img src="${s.image}" alt="${esc(s.title)}">${s.animation?`<button class="animationOpen" data-enlarge="${s.animation}">查看动态图</button>`:''}`;footer=''}
else if(kind==='method-grid'){c=head+`<div class="method-grid">${s.items.map((r,j)=>`<article>${s.layout==='canvas'?'':`<span class="num">${String(j+1).padStart(2,'0')}</span>`}<h3>${esc(r[0])}</h3><p>${esc(r[1])}</p>${r[2]?`<p class="method-output"><strong>${esc(s.outputLabel||'产出')}：</strong>${esc(r[2])}</p>`:''}</article>`).join('')}</div>`}
else if(kind==='matrix'){c=head+`<table class="matrix"><thead><tr>${s.items[0].map(v=>`<th>${esc(v)}</th>`).join('')}</tr></thead><tbody>${s.items.slice(1).map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
else if(kind==='split'){c=head+`<div class="split"><figure><img src="${s.image}" alt="原课件角色设计参考" data-enlarge="${s.image}"></figure><div>${s.items.map((r,i)=>article(r,i).replace(/<span class="num">.*?<\/span>/,'')).join('')}</div></div>`}
else if(kind==='prompt'){cls='prompt';c=head+`<blockquote>${esc(s.items[0][1])}</blockquote>`}
else if(kind==='exercise'){cls='exercise';c=head+`<div class="exerciseRows">${s.items.map(article).join('')}</div>`}
else if(kind==='compare3'){c=head+`<div class="testlayout"><div><div class="testimage"><img id="testImage-${i}" src="${s.image}" alt="用于灰度与缩小观察的角色设计图"></div><div class="testoptions"><button data-test="color" data-index="${i}">原色</button><button data-test="gray" data-index="${i}">灰度</button><button data-test="small" data-index="${i}">缩小 / 还原</button></div></div><div>${s.items.map((r,j)=>article(r,j).replace(/<span class="num">.*?<\/span>/,'')).join('')}</div></div>`}
else if(kind==='rubric'){c=head+s.items.map((r,j)=>`<div class="rubricRow"><strong>${esc(r[0])}</strong><span>${esc(r[1])}</span><div>${[0,1,2].map(v=>`<button data-score="${v}" data-row="${j}" aria-label="${esc(r[0])}${v}分">${v}</button>`).join('')}</div></div>`).join('')+'<div class="score">已评 <span id="rated">0</span> / 5 项 · 合计 <span id="scoreTotal">0</span> / 10</div>'}
else if(kind==='sources'){c=head+s.items.map(r=>`<div class="sourceRow"><strong>${esc(r[0])}</strong>${r[1].startsWith('https:')?`<a href="${esc(r[1])}" target="_blank" rel="noopener">${esc(r[1])}</a>`:`<p>${esc(r[1])}</p>`}</div>`).join('')}
else{let layout=kind==='flow'?'flow':kind==='compare'?'compare':'columns';cls=kind==='closing'?'closing':'';c=head+`<div class="${layout}">${s.items.map(article).join('')}</div>`}
if(s.source)c+=`<a class="sourceLink" href="${s.source[1]}" target="_blank" rel="noopener">参考：${esc(s.source[0])}</a>`;
if(s.afterOriginal&&!s.methodology)c=c.replace(`<div class="eyebrow">${esc(s.chapter)}</div>`,'');
if(s.afterOriginal)cls+=' ppt-palette';
if(s.methodology){cls+=` methodology method-${s.layout||kind}`;if(s.takeaway)c+=`<p class="method-takeaway">${esc(s.takeaway)}</p>`;}
return `<div class="slideframe"><section class="slide ${cls}" data-screen-label="${i+1} ${esc(s.title)}" data-slide="${i}">${c}${footer}</section></div>`;
}


function save(){try{localStorage.setItem(KEY,JSON.stringify({idx}))}catch{}}
function update(to){idx=Math.max(0,Math.min(deck.length-1,to));history.replaceState(null,'',`#${idx+1}`);save()}
function go(to){update(to);const el=$('canvas').children[idx];if(el)window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'})}
function fit(){$('canvas').style.setProperty('--slide-scale',$('canvas').clientWidth/1920)}
function mount(){$('canvas').innerHTML=deck.map(render).join('');fit()}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.close)$(b.dataset.close).close();if(e.target.dataset.enlarge){$('largeImage').src=e.target.dataset.enlarge;$('lightbox').showModal()}
if(b?.dataset.test){const im=$('testImage-'+b.dataset.index);if(b.dataset.test==='color')im.style.filter='none';if(b.dataset.test==='gray')im.style.filter='grayscale(1)';if(b.dataset.test==='small'){im.dataset.small=im.dataset.small==='yes'?'no':'yes';im.style.transform=im.dataset.small==='yes'?'scale(.24)':'scale(1)'}}});
let pending=false;function track(){pending=false;if(starting)return;const slides=[...$('canvas').children];let active=0;for(let i=0;i<slides.length;i++){if(slides[i].getBoundingClientRect().top<=50)active=i;else break}if(active!==idx)update(active);const max=document.documentElement.scrollHeight-innerHeight;$('progress').style.width=`${max>0?Math.min(100,scrollY/max*100):100}%`}
window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(track)}},{passive:true});window.addEventListener('resize',()=>{fit();track()});
window.addEventListener('hashchange',()=>{if(/^#\d+$/.test(location.hash))go(Number(location.hash.slice(1))-1)});
window.lessonDebug={go,get count(){return deck.length},get index(){return idx},get original(){return false}};
mount();requestAnimationFrame(()=>{go(initialIndex);requestAnimationFrame(()=>{starting=false;track()})});
})();
