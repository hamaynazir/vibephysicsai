import {experimentFor} from './lecture-experiments.js';
import {observations} from './lecture-observations.js';

function element(tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, action) {
  const node = element('button', text);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

function setupReadings() {
  const controls = document.querySelector('#controls');
  const metrics = document.querySelector('#metrics');
  const panel = element('details');
  panel.className = 'reading-comparison';
  const summary = element('summary','Compare two settings');
  const hint = element('p','Save a reading, change one setting in the diagram, then compare.');
  const readings = element('div');
  let first;
  function snapshot() {
    const result = new Map();
    for (const input of controls.querySelectorAll('input,select')) {
      const container = input.closest('label');
      const title = input.getAttribute('aria-label') || (container && [...container.childNodes]
        .filter(node=>node.nodeType===Node.TEXT_NODE || node.nodeName==='SPAN')
        .map(node=>node.textContent).join('').trim()) || input.id;
      const value = input.type === 'checkbox' ? (input.checked?'On':'Off') :
        input.selectedOptions?.[0]?.textContent ?? container?.querySelector('output')?.textContent ?? input.value;
      result.set('Setting · '+title,value);
    }
    for (const pressed of controls.querySelectorAll('button[aria-pressed=true]')) {
      const group = pressed.closest('[role=group]')?.getAttribute('aria-label') || 'Selection';
      result.set('Setting · '+group,pressed.textContent);
    }
    for (const field of metrics.querySelectorAll('.metric')) {
      const title = field.querySelector('small,span')?.textContent;
      const value = field.querySelector('strong')?.textContent;
      if (title && value) result.set(title,value);
    }
    return result;
  }
  const capture = button('Save first reading',()=>{
    const now = snapshot();
    if (!first) {
      first = now;
      capture.textContent = 'Compare current reading';
      reset.hidden = false;
      hint.textContent = 'First reading saved. Change a setting in the diagram, then compare.';
      return;
    }
    const table = element('table');
    table.append(element('caption','Two saved readings'));
    const headings = table.createTHead().insertRow();
    for(const title of ['Quantity','First','Second']) headings.append(element('th',title));
    const rows = table.createTBody();
    for(const name of new Set([...first.keys(),...now.keys()])) {
      const row = rows.insertRow();
      const heading = element('th',name); heading.scope='row'; row.append(heading);
      row.append(element('td',first.get(name)??'—'),element('td',now.get(name)??'—'));
    }
    readings.replaceChildren(table);
    hint.textContent = 'Change another setting and compare again with your first reading.';
  });
  const reset = button('Start over',clear);
  function clear() {
    first = undefined;
    reset.hidden = true;
    capture.textContent = 'Save first reading';
    readings.replaceChildren();
    hint.textContent = 'Save a reading, change one setting in the diagram, then compare.';
  }
  panel.append(summary,hint,capture,reset,readings);
  metrics.after(panel);
  function available() {
    panel.hidden = !controls.querySelector('input,select,button') || !metrics.querySelector('.metric');
  }
  new MutationObserver(available).observe(controls,{childList:true,subtree:true});
  return () => { clear();panel.open = false;available(); };
}

export function installLectureReview(sections, previousAnswer, recordAnswer) {
  const intro = document.querySelector('.study-intro');
  if (!intro) {
    document.addEventListener('study-focus-ready',()=>installLectureReview(sections,previousAnswer,recordAnswer),{once:true});
    return;
  }
  const selector = document.querySelector('#visual-section');
  const course = selector.closest('nav').dataset.lesson;
  const review = element('details');
  review.className = 'lecture-review';
  const summary = element('summary');
  const body = element('div');
  review.append(summary,body);
  const prediction = element('details');
  prediction.className = 'prediction-check';
  const observation = element('p');
  prediction.append(element('summary','Check your prediction'),observation);
  intro.querySelector('p').after(prediction);
  intro.append(review);
  const resetReadings = setupReadings();
  let current, experiment, refreshIndex;
  function updateCount() {
    const passed = sections.filter(s => previousAnswer(s)===true).length;
    summary.textContent = 'Chapter review · '+passed+' of '+sections.length+' checked';
    refreshIndex?.();
  }
  function visit(id) {
    if (selector.value !== id) {
      selector.value = id;
      selector.dispatchEvent(new Event('change',{bubbles:true}));
    }
    render();
  }
  function render() {
    const topic = sections.find(s => s.id === selector.value);
    if (!topic || current === topic.id) return;
    current = topic.id;
    resetReadings();
    observation.textContent = observations[course][current];
    prediction.open = false;
    experiment?.remove();
    experiment = experimentFor(course,current);
    if (experiment) review.before(experiment);
    body.replaceChildren();
    const index = element('select');
    const topicLabel = element('label','Review a topic ');
    topicLabel.append(index);
    const status = result => result === true ? 'Checked' : result === false ? 'Revisit' : 'Unanswered';
    function fillIndex() {
      index.replaceChildren();
      for (const s of sections) {
        const [first,last] = s.pages ?? [s.page,s.end];
        const pages = first===last ? 'p. '+first : 'pp. '+first+'–'+last;
        index.add(new Option(s.title+' · '+pages+' · '+status(previousAnswer(s)),s.id));
      }
      index.value = topic.id;
    }
    refreshIndex = fillIndex;
    fillIndex();
    index.addEventListener('change',()=>{visit(index.value);body.querySelector('select')?.focus();});
    const [q,options,correct,why] = Array.isArray(topic.quiz) ? topic.quiz :
      [topic.quiz.question,topic.quiz.options,topic.quiz.answer,topic.quiz.why??topic.quiz.explanation];
    const question = element('fieldset');
    question.append(element('legend',q));
    const feedback = element('p'); feedback.setAttribute('role','status'); feedback.className='review-feedback';
    for (const [i,choice] of options.entries()) {
      const answer=button(choice,()=>{
        const passed = i === correct;
        recordAnswer(topic,passed);
        updateCount();
        feedback.textContent = (passed?'Correct. ':'Revisit this topic. ')+why;
        for (const other of question.querySelectorAll('button')) other.setAttribute('aria-pressed',String(other===answer));
      });
      answer.setAttribute('aria-pressed','false'); question.append(answer);
    }
    const next = button('Next topic to review',()=>{
      const pos = sections.indexOf(topic);
      const ordered = [...sections.slice(pos+1),...sections.slice(0,pos)];
      const nextTopic = ordered.find(s=>previousAnswer(s)===false) ?? ordered.find(s=>previousAnswer(s)!==true);
      if(nextTopic){visit(nextTopic.id);body.querySelector('fieldset button')?.focus();}
      else feedback.textContent = previousAnswer(topic)===true?'You have checked every topic in this chapter.':'Answer this last question to finish the chapter.';
    });
    const [first,last] = topic.pages ?? [topic.page,topic.end];
    const source = element('a',first===last?'Read lecture page '+first:'Read lecture pages '+first+'–'+last);
    source.href = 'assets/lecture.pdf#page='+first;
    source.target = '_blank';
    source.rel = 'noopener';
    body.append(topicLabel,source,question,feedback,next);
  }
  updateCount();
  render();
  new MutationObserver(updateCount).observe(document.querySelector('#review-count'),{childList:true});
  selector.addEventListener('change',render);
  new MutationObserver(render).observe(intro.querySelector(':scope > p'),{childList:true});
}
