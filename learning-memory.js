export const MEMORY_KEY='crystal-learning-v1';
export function loadProgress(storage){try{const data=JSON.parse(storage.getItem(MEMORY_KEY)||'{}');return {records:data.records&&typeof data.records==='object'&&!Array.isArray(data.records)?data.records:{},guide:Number.isInteger(data.guide)?Math.max(0,Math.min(6,data.guide)):0,guideComplete:!!data.guideComplete};}catch{return {records:{},guide:0,guideComplete:false};}}
export function recordAnswer(progress,question,correct){
 const previous=progress.records[question.id]||{misses:0,correct:0};
 progress.records[question.id]={id:question.id,title:question.title,question:question.question,options:[...question.options],answer:question.answer,why:question.why,section:question.section,misses:(Number(previous.misses)||0)+(correct?0:1),correct:(Number(previous.correct)||0)+(correct?1:0),resolved:correct};
 return progress.records[question.id];
}
export function weakPoints(progress){return Object.values(progress.records).filter(q=>q&&q.misses>0&&!q.resolved&&Array.isArray(q.options)&&q.options.length===3&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3).sort((a,b)=>b.misses-a.misses);}
export function saveProgress(storage,progress){try{storage.setItem(MEMORY_KEY,JSON.stringify(progress));return true;}catch{return false;}}
