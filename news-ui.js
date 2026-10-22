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
  /* 전체 글 페이지가 없는 노트는 카드 안에 숨겨 둔 본문 전체를 이 창에 띄웁니다 */
  var dlg,back;
  function openNote(a){
    if(!dlg){dlg=el('dialog','nl-dialog');dlg.setAttribute('aria-labelledby','nl-note-title');document.body.appendChild(dlg);
      dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
      dlg.addEventListener('close',function(){if(back)back.focus()})}
    if(dlg.open)dlg.close();back=a.querySelector('.nl-read');
    var w=el('div','nl-note'),x=el('button','nl-x','×'),h=el('h2','',a.querySelector('h3').textContent),fg=a.querySelector('figure.nl-fig'),b=a.querySelector('.nl-body').cloneNode(true);
    x.type='button';x.setAttribute('aria-label','닫기');x.onclick=function(){dlg.close()};h.id='nl-note-title';b.hidden=false;
    w.appendChild(x);w.appendChild(a.querySelector('.nl-meta').cloneNode(true));w.appendChild(h);if(fg)w.appendChild(fg.cloneNode(true));w.appendChild(b);
    dlg.innerHTML='';dlg.appendChild(w);if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','')}
  function draw(opt,data){
    var list=document.getElementById(opt.list),chips=document.getElementById(opt.chips);if(!list)return;
    var items=data.slice().sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:0}),cur='전체';
    var cats=(window.CATEGORIES||[]).slice();items.forEach(function(n){if(cats.indexOf(n.category)<0)cats.push(n.category)});
    cats=cats.filter(function(c){return items.some(function(n){return n.category===c})}); /* 글이 없는 분류는 첫 글이 올라올 때까지 숨깁니다 */
    function paint(){list.innerHTML='';
      var shown=items.filter(function(n){return cur==='전체'||n.category===cur});if(opt.limit)shown=shown.slice(0,opt.limit);
      if(!shown.length){list.appendChild(el('p','nl-empty','아직 이 분류의 소식이 없습니다.'));return}
      shown.forEach(function(n){var a=el('article','nl-item');a.id=n.id;
        if(n.image&&/^img\//.test(n.image)){var f=el('figure','nl-fig'),im=el('img');im.src=n.image;im.alt=n.imageAlt||'';im.loading='lazy';im.width=1600;im.height=900;f.appendChild(im);
          if(n.caption)f.appendChild(el('figcaption','',n.caption));a.appendChild(f)}
        else{var cv=el('div','nl-fig nl-cover');cv.setAttribute('aria-hidden','true');cv.appendChild(el('span','',n.category));a.appendChild(cv)} /* 그림이 없는 노트는 분류 이름을 표지로 씁니다 */
        var m=el('div','nl-meta');m.appendChild(el('span','nl-cat',n.category));var tm=el('time','',fmt(n.date));tm.setAttribute('datetime',n.date);m.appendChild(tm);
        a.appendChild(m);a.appendChild(el('h3','',n.title));if(n.summary)a.appendChild(el('p','nl-sum',n.summary));
        /* 노트 읽기: 전체 글 페이지(news/)가 있으면 그 페이지로 가고, 없으면 본문 전체를 창으로 띄웁니다. 카드 어디를 눌러도 같습니다 */
        var page=n.link&&/^news\//.test(n.link),r=el(page?'a':'button','nl-read','노트 읽기 →');r.setAttribute('aria-label',n.title+' 노트 읽기');
        if(page){r.href=n.link;a.appendChild(r)}
        else{r.type='button';r.setAttribute('aria-haspopup','dialog');r.onclick=function(){openNote(a)};a.appendChild(r);
          var b=el('div','nl-body');b.hidden=true;(n.body||[]).forEach(function(p){b.appendChild(el('p','',p))});
          if(n.link&&/^(https?:\/\/|files\/)/.test(n.link)){var l=el('a','nl-link',(n.linkLabel||'자세히 보기')+' →');l.href=n.link;l.target='_blank';l.rel='noopener';b.appendChild(l)}
          a.appendChild(b)}
        list.appendChild(a)})}
    if(chips){chips.innerHTML='';['전체'].concat(cats).forEach(function(c){var btn=el('button','nl-chip',c);btn.type='button';btn.setAttribute('aria-pressed',String(c===cur));btn.setAttribute('data-cat',c);
      btn.onclick=function(){cur=c;chips.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',String(x.getAttribute('data-cat')===cur))});paint()};chips.appendChild(btn)})}
    paint();
    if(location.hash){var t=document.getElementById(location.hash.slice(1));if(t)setTimeout(function(){t.scrollIntoView({block:'start'});if(list.contains(t)&&t.querySelector('button.nl-read'))openNote(t)},50)}
  }
  window.renderNews=function(opt){
    var local=window.NEWS||[];draw(opt,local);
    var url=window.NEWS_SHEET_CSV;if(!url)return;
    fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){var s=fromSheet(t);if(s&&s.length)draw(opt,s)}).catch(function(){});
  };
})();
