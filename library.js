import {subjects,laboratories,collections,allLessons,lessonPosition,lessonURL,searchSubjects} from './catalog.js?v=uos-1';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={
 materials:'<path d="m6 11 12-7 12 7v14l-12 7-12-7Z M6 11l12 7 12-7 M18 18v14 M12 7.5l12 7v14 M24 7.5l-12 7v14"/>',
 laser:'<path d="M3 13h9v10H3z M12 18h16 M26 14l5 4-5 4 M16 10l-3-4 M19 8V3 M23 10l3-4 M16 26l-3 4 M20 27v6 M24 25l4 5"/><path d="M5 16h4 M5 20h4"/>',
 crystal:'<path d="m18 3 13 8v15l-13 8-13-8V11Z M5 11l13 8 13-8 M18 19v15"/><circle cx="18" cy="3" r="1.5"/><circle cx="5" cy="11" r="1.5"/><circle cx="31" cy="11" r="1.5"/><circle cx="18" cy="19" r="1.5"/><circle cx="5" cy="26" r="1.5"/><circle cx="31" cy="26" r="1.5"/><circle cx="18" cy="34" r="1.5"/>',
 nuclear:'<ellipse cx="18" cy="18" rx="16" ry="6" transform="rotate(30 18 18)"/><ellipse cx="18" cy="18" rx="16" ry="6" transform="rotate(90 18 18)"/><ellipse cx="18" cy="18" rx="16" ry="6" transform="rotate(150 18 18)"/><circle cx="18" cy="18" r="2.8"/>',
 fields:'<path d="M3 10c5-9 10 9 15 0s10 9 15 0 M3 18c5-9 10 9 15 0s10 9 15 0 M3 26c5-9 10 9 15 0s10 9 15 0"/><path d="m29 7 4 3-4 3 M29 15l4 3-4 3 M29 23l4 3-4 3"/>'
};
const icon=s=>`<span class="subject-icon" style="--accent:${s.accent};--tint:${s.tint}" aria-hidden="true"><svg viewBox="0 0 36 36">${icons[s.icon]}</svg></span>`;
const currentYear=collections[0].years[0];
let readyOnly=false;
const storage={getItem(key){try{return localStorage.getItem(key)}catch{return null}}};
function renderCards(){
 const results=searchSubjects($('#subject-search').value,readyOnly).filter(s=>currentYear.subjectIds.includes(s.id));
 $('#subjects-grid').innerHTML=results.map(s=>`<article class="subject-card ${s.lessons.length?'available':''}" data-subject="${s.id}"><a href="#subject=${s.id}" aria-label="Open ${s.title}"><div class="card-top">${icon(s)}<span class="card-index">${String(subjects.indexOf(s)+1).padStart(2,'0')}</span></div><h3>${s.title}</h3><div class="card-lecturer"><span>Lecturer</span>${s.lecturer}</div><p>${s.description}</p>${s.lessons.length?`<div class="card-lesson">${s.lessons.map(l=>l.title).join(' · ')}</div>`:''}<div class="card-footer"><span>${s.lessons.length?`<span class="ready-dot"></span>${s.lessons.length} chapter${s.lessons.length===1?'':'s'} ready to explore`:'No chapters added yet'}</span><span class="card-arrow" aria-hidden="true">→</span></div></a></article>`).join('');
 $('#empty-search').hidden=results.length>0;$('#filter-all').setAttribute('aria-pressed',String(!readyOnly));$('#filter-ready').setAttribute('aria-pressed',String(readyOnly));
}
function renderContinue(){
 const lessons=allLessons(),recentId=storage.getItem('study-library-last-lesson'),recent=lessons.find(l=>l.id===recentId)||lessons.find(l=>lessonPosition(l,storage))||lessons[0];
 if(!recent){$('#continue-card').hidden=true;$('#header-resume').hidden=true;return;}
 const position=lessonPosition(recent,storage),url=lessonURL(recent,position||1),resume=position!==null;
 $('#continue-card').hidden=false;$('#continue-card').innerHTML=`<div class="eyebrow">${resume?'PICK UP WHERE YOU LEFT OFF':'YOUR FIRST CHAPTER IS READY'}</div><div class="continue-subject">${recent.subjectTitle}</div><h2>${recent.title}</h2><div class="position-label"><span>${resume?'Reading position':'Interactive lecture'}</span><span>${resume?`Page ${position} of ${recent.pages}`:recent.pages+' pages'}</span></div><div class="position-track" aria-hidden="true"><span style="width:${resume?position/recent.pages*100:0}%"></span></div><a class="continue-link" data-open-lesson="${recent.id}" href="${url}">${resume?'Continue learning':'Start exploring'} <span aria-hidden="true">→</span></a>`;
 $('#header-resume').hidden=!resume;$('#header-resume').href=url;$('#header-resume').dataset.openLesson=recent.id;
 const scopedSubjects=subjects.filter(s=>currentYear.subjectIds.includes(s.id)),chapterCount=scopedSubjects.reduce((sum,s)=>sum+s.lessons.length,0);
 $('#collection-count').textContent=`${scopedSubjects.length} subjects · ${chapterCount} chapters ready`;
 $('#fourth-year .year-count').textContent=`${scopedSubjects.length} subjects · ${laboratories.filter(l=>currentYear.laboratoryIds.includes(l.id)).length} laboratories`;
}
function renderSubject(subject){
 const hasLessons=subject.lessons.length>0;
 $('#subject-view').innerHTML=`<nav class="collection-breadcrumb" aria-label="Collection"><a href="#uos-physics">UOS Physics</a><span> / </span><a href="#fourth-year">Fourth Year</a></nav><a class="back-link" href="#fourth-year">← Fourth Year subjects</a><div class="subject-hero"><div><div class="eyebrow">YOUR SUBJECT LIBRARY</div><h1 id="subject-title" tabindex="-1">${subject.title}</h1><div class="subject-lecturer"><span>Lecturer</span>${subject.lecturer}</div><p>${subject.description}</p></div>${icon(subject)}</div><div class="chapter-heading"><h2>Chapters & lectures</h2><span>${hasLessons?`${subject.lessons.length} available`:'A space for what comes next'}</span></div>${hasLessons?subject.lessons.map(lesson=>{
  const position=lessonPosition(lesson,storage),url=lessonURL(lesson,position||1);
  return `<article class="lesson-row" data-lesson="${lesson.id}"><a href="${url}" data-open-lesson="${lesson.id}"><span class="lesson-number" aria-hidden="true">${lesson.number}</span><div><span class="eyebrow">CHAPTER ${lesson.number} · INTERACTIVE LECTURE</span><h3>${lesson.title}</h3><div class="lesson-lecturer">Lecturer: <strong>${lesson.lecturer||subject.lecturer}</strong></div><p>${lesson.description}</p><div class="lesson-meta"><span>${lesson.pages} original pages</span><span>${lesson.topics} topics</span><span>Diagrams + guided learning</span></div></div><span class="lesson-cta">${position?'Continue':'Open chapter'} <span aria-hidden="true">→</span></span></a>${position?`<div class="lesson-resume"><span>Last reading position: page ${position} of ${lesson.pages}</span><a data-open-lesson="${lesson.id}" href="${lessonURL(lesson,1)}">Start from page 1 ↗</a></div>`:''}</article>`;
 }).join(''):`<div class="subject-empty"><div class="empty-book" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M20 10C16 6 9 5 4 7v24c5-2 12-1 16 3 4-4 11-5 16-3V7c-5-2-12-1-16 3ZM20 10v24"/><path d="M26 15h5 M26 21h5 M9 15h5 M9 21h5"/></svg></div><h2>The next chapter starts here.</h2><p>This space is ready for ${subject.title} lectures. As we build each chapter, its PDF, interactive diagrams and learning tools will appear here.</p><span class="empty-status">No lectures added yet</span></div>`}<p class="subject-footer-note">${hasLessons?'Each chapter keeps its own reading place and practice history on your device.':'Your available lesson is in <a href="#subject=solid-state-principles">Solid State Principles →</a>'}</p>`;
 document.title=subject.title+' · Vibe Physics AI';
}
function route(){
 const params=new URLSearchParams(location.hash.slice(1));if(params.has('page')){const reader=new URL('./reader.html',location.href);reader.search=location.search;reader.hash=location.hash;location.replace(reader.href);return;}
 const id=params.get('subject'),subject=subjects.find(s=>s.id===id),notFound=!!id&&!subject;
 const newsRoute=location.hash==='#news';
 const collectionRoute=location.hash==='#uos-physics'||params.get('collection')==='uos-physics';
 const yearRoute=['#fourth-year','#laboratories','#subjects-grid'].includes(location.hash)||params.get('year')==='fourth-year';
 $('#home-view').hidden=!!id||collectionRoute||yearRoute||newsRoute;
 $('#news-view').hidden=!!id||!newsRoute;$('#news-nav').setAttribute('aria-current',newsRoute?'page':'false');
 $('#collection-view').hidden=!!id||!collectionRoute;
 $('#year-view').hidden=!!id||!yearRoute;
 $('#subject-view').hidden=!subject;$('#not-found').hidden=!notFound;
 $('#subjects-nav').setAttribute('aria-current',!id&&!collectionRoute&&!yearRoute&&!newsRoute?'page':'false');
 if(subject)renderSubject(subject);else document.title=notFound?'Subject not found · Vibe Physics AI':yearRoute?'Fourth Year · UOS Physics · Vibe Physics AI':collectionRoute?'UOS Physics · Vibe Physics AI':'Vibe Physics AI · A place to understand';
 renderContinue();
 if(newsRoute)document.title='News · Vibe Physics AI';
 const anchor=yearRoute&&['#laboratories','#subjects-grid'].includes(location.hash)?document.querySelector(location.hash):null;
 if(anchor)anchor.scrollIntoView({behavior:'instant',block:'start'});else window.scrollTo({top:0,behavior:'instant'});

}
$('#subject-search').addEventListener('input',renderCards);
// A brand click always returns to the first view and top, even from home itself.
$('.library-brand').addEventListener('click',event=>{if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();history.pushState(null,'',new URL('./',location.href).pathname);route();window.scrollTo({top:0,behavior:'instant'});});
window.addEventListener('popstate',route);
$('#filter-all').onclick=()=>{readyOnly=false;renderCards()};$('#filter-ready').onclick=()=>{readyOnly=true;renderCards()};
$('#clear-search').onclick=()=>{$('#subject-search').value='';readyOnly=false;renderCards();$('#subject-search').focus()};
document.addEventListener('click',event=>{const link=event.target.closest('[data-open-lesson]');if(link)try{localStorage.setItem('study-library-last-lesson',link.dataset.openLesson)}catch{}});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&!$('#year-view').hidden){e.preventDefault();$('#subject-search').focus();}});
window.addEventListener('hashchange',route);window.addEventListener('pageshow',()=>{renderContinue();const subject=subjects.find(s=>s.id===new URLSearchParams(location.hash.slice(1)).get('subject'));if(subject)renderSubject(subject)});window.addEventListener('storage',()=>{renderContinue();route()});
function renderLaboratories(){
 $('#laboratories-grid').innerHTML=laboratories.filter(lab=>currentYear.laboratoryIds.includes(lab.id)).map((lab,i)=>`<article class="laboratory-card" data-laboratory="${lab.id}"><div class="card-top">${icon(lab)}<span class="card-index">LAB ${String(i+1).padStart(2,'0')}</span></div><h3>${esc(lab.title)}</h3><p>${esc(lab.description)}</p><details><summary>Explore the six experiments</summary><ol>${lab.experiments.map(e=>`<li><a href="${lab.reader}#page=${e.pages[0]}&experiment=${e.id}">${esc(e.title)}</a></li>`).join('')}</ol></details><div class="card-footer"><span>${lab.pages} original manual pages · ${lab.experiments.length} experiments</span><a class="laboratory-open" href="${lab.reader}">Open laboratory →</a></div></article>`).join('');
}
function renderCollections(){
 $('#collection-cards').innerHTML=collections.map(c=>`<article class="collection-card"><a href="#${esc(c.id)}" aria-label="Open ${esc(c.title)}"><span class="university-logo"><img src="assets/uos-logo.png" alt="University of Sulaimani logo" width="100" height="100"></span><span class="eyebrow">STUDY COLLECTION</span><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><span class="card-footer"><span>${c.years.length} year available</span><span aria-hidden="true">→</span></span></a></article>`).join('');
 $('#year-cards').innerHTML=collections[0].years.map(y=>`<article class="collection-card year-card"><a href="#${esc(y.id)}" aria-label="Open ${esc(y.title)}"><span class="year-emblem" aria-hidden="true">04</span><span class="eyebrow">UNDERGRADUATE</span><h3>${esc(y.title)}</h3><p>${y.subjectIds.length} subjects · ${y.laboratoryIds.length} laboratories</p><span class="card-footer"><span>Explore subjects &amp; experiments</span><span aria-hidden="true">→</span></span></a></article>`).join('');
}
renderCollections();renderCards();renderLaboratories();route();
