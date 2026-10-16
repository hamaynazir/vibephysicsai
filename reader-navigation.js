import {subjects,allLessons,lessonPosition,lessonURL} from './catalog.js?v=nuclear-1';

export function resumeReaderURL(lesson,storage,rootURL){return new URL(lessonURL(lesson,lessonPosition(lesson,storage)||1),rootURL).href;}
export function preferredChapter(subject,recentId){return subject.lessons.find(l=>l.id===recentId)||subject.lessons[0]||null;}

export function installReaderNavigation(nav){
 const current=allLessons().find(l=>l.id===nav.dataset.lesson);if(!current)return;
 const storage={getItem(key){try{return localStorage.getItem(key)}catch{return null}}};
 const subjectLabel=document.createElement('label');subjectLabel.className='reader-subject-field';subjectLabel.append('Subject');
 const subjectSelect=document.createElement('select');subjectSelect.id='reader-subject';subjectSelect.setAttribute('aria-label','Choose subject');subjectLabel.append(subjectSelect);
 for(const subject of subjects){const option=new Option(subject.title+(subject.lessons.length?'':' — no chapters yet'),subject.id);option.disabled=!subject.lessons.length;subjectSelect.add(option);}subjectSelect.value=current.subjectId;
 const chapterLabel=document.createElement('label');chapterLabel.className='reader-chapter-field';chapterLabel.append('Chapter');
 const chapterSelect=document.createElement('select');chapterSelect.id='reader-chapter';chapterSelect.setAttribute('aria-label','Choose chapter');chapterLabel.append(chapterSelect);
 const populate=subject=>{chapterSelect.replaceChildren(...subject.lessons.map(l=>new Option(l.number+'. '+l.title,l.id)));chapterSelect.value=subject.id===current.subjectId?current.id:preferredChapter(subject,storage.getItem('study-library-last-lesson'))?.id;};
 const open=lesson=>{if(!lesson||lesson.id===current.id)return;const page=Number(document.querySelector('#page-input')?.value);if(Number.isFinite(page)&&page>=1)try{localStorage.setItem(current.storage.page,String(Math.min(current.pages,Math.floor(page))));}catch{}location.assign(resumeReaderURL(lesson,storage,new URL('./',import.meta.url)));};
 populate(subjects.find(s=>s.id===current.subjectId));nav.prepend(subjectLabel,chapterLabel);nav.classList.add('has-reader-switcher');
 subjectSelect.onchange=()=>{const subject=subjects.find(s=>s.id===subjectSelect.value);if(!subject?.lessons.length)return;populate(subject);open(preferredChapter(subject,storage.getItem('study-library-last-lesson')));};
 chapterSelect.onchange=()=>open(allLessons().find(l=>l.id===chapterSelect.value));
}
if(typeof document!=='undefined')document.querySelectorAll('.visual-navigation[data-lesson]').forEach(installReaderNavigation);
