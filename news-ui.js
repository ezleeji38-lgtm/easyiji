/* 소식지 화면을 그리는 코드입니다. 내용은 news.js 또는 연결된 구글 시트에서만 고치면 됩니다. */
(function(){
  function el(t,c,txt){var e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e}
  function fmt(d){var p=String(d).trim().split(/[-./]/);return p.length>2?p[0]+'. '+Number(p[1])+'. '+Number(p[2]):d}
  function norm(d){var p=String(d).trim().split(/[-./]/);return p.length>2?p[0]+'-'+('0'+Number(p[1])).slice(-2)+'-'+('0'+Number(p[2])).slice(-2):String(d)}
  function parseCSV(t){var rows=[],row=[],f='',q=false;t=t.replace(/^﻿/,'');
    for(var i=0;i<t.length;i++){var c=t[i];
      if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
      else if(c==='"')q=true;else if(c===','){row.push(f);f=''}
      else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f=''}
      else f+=c}
    if(f!==''||row.length){row.push(f);rows.push(row)}return rows}
  function fromSheet(text){var r=parseCSV(text);if(r.length<2)return null;
    var h=r[0].map(function(x){return x.trim().toLowerCase()}),k=function(n){return h.indexOf(n.toLowerCase())};
    return r.slice(1).map(function(c){function g(n){var i=k(n);return i<0?'':(c[i]||'').trim()}
      return{id:g('id')||('n'+Math.random().toString(36).slice(2,8)),date:norm(g('date')),category:g('category')||'소식',title:g('title'),summary:g('summary'),
        body:g('body').split(/\n+/).filter(Boolean),link:g('link'),linkLabel:g('linkLabel'),publish:g('publish').toUpperCase()}
    }).filter(function(n){return n.title&&(n.publish==='Y'||n.publish==='YES'||n.publish==='공개')})}
  function draw(opt,data){
    var list=document.getElementById(opt.list),chips=document.getElementById(opt.chips);if(!list)return;
    var items=data.slice().sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:0}),cur='전체';
    var cats=(window.CATEGORIES||[]).slice();items.forEach(function(n){if(cats.indexOf(n.category)<0)cats.push(n.category)});
    cats=cats.filter(function(c){return items.some(function(n){return n.category===c})}); /* 글이 없는 분류는 첫 글이 올라올 때까지 숨깁니다 */
    function paint(){list.innerHTML='';
      var shown=items.filter(function(n){return cur==='전체'||n.category===cur});if(opt.limit)shown=shown.slice(0,opt.limit);
      if(!shown.length){list.appendChild(el('p','nl-empty','아직 이 분류의 소식이 없습니다.'));return}
      shown.forEach(function(n){var a=el('article','nl-item');a.id=n.id;
        if(n.image&&/^img\//.test(n.image)){var f=el('figure','nl-fig'),im=el('img');im.src=n.image;im.alt=n.imageAlt||'';im.loading='lazy';im.width=1600;im.height=900;
          if(n.link&&/^news\//.test(n.link)){var ia=el('a','nl-fig-link');ia.href=n.link;ia.setAttribute('aria-label',n.title+' 전체 글 읽기');ia.appendChild(im);f.appendChild(ia)}else f.appendChild(im);
          if(n.caption)f.appendChild(el('figcaption','',n.caption));a.appendChild(f)}
        var m=el('div','nl-meta');m.appendChild(el('span','nl-cat',n.category));var tm=el('time','',fmt(n.date));tm.setAttribute('datetime',n.date);m.appendChild(tm);
        a.appendChild(m);a.appendChild(el('h3','',n.title));if(n.summary)a.appendChild(el('p','nl-sum',n.summary));
        var d=el('details');d.appendChild(el('summary','','본문 읽기'));var b=el('div','nl-body');
        (n.body||[]).forEach(function(p){b.appendChild(el('p','',p))});
        if(n.link&&/^(https?:\/\/|files\/|news\/)/.test(n.link)){var l=el('a','nl-link',(n.linkLabel||'자세히 보기')+' →');l.href=n.link;if(!/^news\//.test(n.link)){l.target='_blank';l.rel='noopener'}b.appendChild(l)}
        d.appendChild(b);a.appendChild(d);if(location.hash==='#'+n.id)d.open=true;list.appendChild(a)})}
    if(chips){chips.innerHTML='';chips.style.setProperty('--cols',cats.length>4?3:Math.max(cats.length,1));var info=window.CATEGORY_INFO||{};['전체'].concat(cats).forEach(function(c){
      var mine=items.filter(function(n){return c==='전체'||n.category===c}),btn=el('button','nl-catcard'),top=el('span','nl-cc-top');
      btn.type='button';btn.setAttribute('aria-pressed',String(c===cur));btn.setAttribute('data-cat',c);
      top.appendChild(el('b','',c));top.appendChild(el('span','nl-cc-n',mine.length+'건'));btn.appendChild(top);
      if(info[c])btn.appendChild(el('span','nl-cc-desc',info[c]));
      btn.appendChild(el('span','nl-cc-new',mine.length?'최신 · '+mine[0].title:'아직 글이 없습니다'));
      btn.onclick=function(){cur=c;chips.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',String(x.getAttribute('data-cat')===cur))});paint()};chips.appendChild(btn)})}
    paint();
    if(location.hash){var t=document.getElementById(location.hash.slice(1));if(t)setTimeout(function(){t.scrollIntoView({block:'start'})},50)}
  }
  window.renderNews=function(opt){
    var local=window.NEWS||[];draw(opt,local);
    var url=window.NEWS_SHEET_CSV;if(!url)return;
    fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){var s=fromSheet(t);if(s&&s.length)draw(opt,s)}).catch(function(){});
  };
})();
