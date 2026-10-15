// Add future chapters here only when their reader and assets are ready.
// Every lesson gets its own reader URL and browser-storage keys.
export const subjects=[
 {id:'materials-science',title:'Materials Science',description:'Explore the relationship between structure, properties and the materials around us.',icon:'materials',accent:'#8b6143',tint:'#faf5ef',lessons:[]},
 {id:'laser-physics',title:'Laser Physics',description:'Make sense of light, stimulated emission and the physics of optical systems.',icon:'laser',accent:'#9c5672',tint:'#fcf3f6',lessons:[]},
 {id:'solid-state-principles',title:'Solid State Principles',description:'Step inside solids, from repeating lattices to the bonds that hold them together.',icon:'crystal',accent:'#277e70',tint:'#f0f8f5',lessons:[
  {id:'crystal-structures',number:'01',title:'Crystal Structures',description:'From lattice points and primitive vectors to crystal planes, bonding and packing. Your complete lecture with interactive diagrams.',reader:'reader.html',pages:40,topics:16,storage:{page:'crystal-page',learning:'crystal-learning-v1'}}
 ]},
 {id:'nuclear-models',title:'Nuclear Models',description:'Build an understanding of the models used to describe the atomic nucleus.',icon:'nuclear',accent:'#6e66a4',tint:'#f5f3fb',lessons:[]},
 {id:'electromagnetic-theory',title:'Electromagnetic Theory',description:'See how electric and magnetic fields connect, interact and travel as waves.',icon:'fields',accent:'#3a7296',tint:'#f0f6fa',lessons:[]}
];
export const allLessons=()=>subjects.flatMap(subject=>subject.lessons.map(lesson=>({...lesson,subjectId:subject.id,subjectTitle:subject.title})));
export function lessonPosition(lesson,storage){
 try{const n=Number(storage.getItem(lesson.storage.page));return Number.isFinite(n)&&n>=1?Math.min(lesson.pages,Math.floor(n)):null;}catch{return null;}
}
export function lessonURL(lesson,page=1){return `${lesson.reader}#page=${Math.max(1,Math.min(lesson.pages,Math.floor(page)||1))}`;}
export function searchSubjects(query,readyOnly=false){const term=query.trim().toLowerCase();return subjects.filter(s=>(!readyOnly||s.lessons.length>0)&&[s.title,s.description,...s.lessons.flatMap(l=>[l.title,l.description])].join(' ').toLowerCase().includes(term));}
