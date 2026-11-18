// All books use the same continuous page strip. Only nearby images are fetched.
export function createScrollReader(count, onPage) {
  const viewport = document.querySelector('#pdf-scroll, .pdf-scroll');
  const status = document.querySelector('#pdf-status');
  const strip = document.querySelector('#pdf-pages') || document.createElement('div');
  strip.classList.add('reading-strip');
  if (!strip.parentNode) viewport.append(strip);
  viewport.tabIndex = 0;
  viewport.setAttribute('aria-label','Scroll through the original pages');
  const progress = document.createElement('progress');
  progress.className='reading-progress';
  progress.max=count;progress.value=1;
  progress.setAttribute('aria-label','Reading position in this document');
  viewport.before(progress);
  let current = 1, frame = 0, width = 0;
  function go(value) {
    current = value;
    progress.value = value;
    const sheet = strip.children[value-1];
    if (sheet && viewport.clientHeight) {
      viewport.scrollTop += sheet.getBoundingClientRect().top - viewport.getBoundingClientRect().top - viewport.clientTop;
    }
  }
  viewport.addEventListener('scroll',()=>{
    if (frame || !viewport.clientHeight) return;
    frame = requestAnimationFrame(()=>{
      frame = 0;
      if (!viewport.clientHeight) return;
      const marker = viewport.getBoundingClientRect().top + Math.min(140, viewport.clientHeight*.25);
      let page = 1;
      for (const sheet of strip.children) {
        if (sheet.getBoundingClientRect().top > marker) break;
        page = Number(sheet.dataset.page);
      }
      if (viewport.scrollTop > 0 && viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2) page=count;
      if (strip.childElementCount && page !== current) {
        current = page;
        progress.value = page;
        onPage(page);
      }
    });
  },{passive:true});
  new ResizeObserver(()=>{
    if (viewport.clientWidth !== width) {
      width = viewport.clientWidth;
      if (width) go(current);
    }
  }).observe(viewport);
  async function load() {
    try {
      const response = await fetch('assets/reading/pages.json');
      if (!response.ok) throw Error();
      const pages = await response.json();
      if (pages.length !== count) throw Error();
      const fragment = document.createDocumentFragment();
      const transcripts = new IntersectionObserver(entries=>{
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const sheet=entry.target;
          transcripts.unobserve(sheet);
          fetch('assets/reading/'+sheet.dataset.page+'.txt').then(async response=>{
            if(response.ok) sheet.querySelector('figcaption').textContent=await response.text();
          }).catch(()=>{});
        }
      },{root:viewport,rootMargin:'400px'});
      pages.forEach(({width,height,hasText},i)=>{
        const sheet = document.createElement('figure');
        sheet.className = 'reading-page'; sheet.dataset.page = i+1;
        const image = new Image();
        image.width = width; image.height = height; image.loading = 'lazy';
        image.decoding = 'async'; image.draggable = false;
        image.alt = 'Page '+(i+1)+' of '+count;
        image.src = 'assets/reading/'+(i+1)+'.webp';
        image.addEventListener('error',()=>{
          const retry = document.createElement('button');
          retry.textContent = 'Reload page '+(i+1);
          retry.onclick = ()=>{retry.remove();image.src = image.src;};
          sheet.append(retry);
        });
        sheet.append(image);
        if (hasText) {
          const transcript = document.createElement('figcaption');
          transcript.className = 'reading-transcript';
          sheet.append(transcript);transcripts.observe(sheet);
        }
        fragment.append(sheet);
      });
      strip.replaceChildren(fragment);
      status.hidden = true; go(current);
    } catch {
      status.replaceChildren('Pages could not load. ');
      const retry=document.createElement('button'); retry.textContent='Try again';retry.onclick=load;
      status.append(retry);status.hidden=false;
    }
  }
  load();
  return {go, zoom(scale){strip.style.width=scale*100+'%';go(current);}};
}
