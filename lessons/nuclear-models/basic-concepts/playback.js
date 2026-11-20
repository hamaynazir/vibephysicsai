export const playbackProfiles = {
  binding: {limit: 2, step: 1, rate: .65, label: 'Binding walkthrough step'},
  isomers: {limit: 2, step: 1, rate: .65, label: 'Energy-level walkthrough step'},
  beta: {limit: 3000, step: 30, rate: 150, label: 'Free-neutron elapsed time (s)'},
  scattering: {limit: 1, step: .025, rate: .16, label: 'Coulomb timeline'},
  recoil: {limit: 1, step: .025, rate: .16, label: 'Coulomb timeline'},
};

export class LecturePlayback {
  constructor(stage, render) {
    this.render = render;
    this.speed = 1;
    this.visible = false;
    this.playing = false;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.bar = document.createElement('div');
    this.bar.className = 'study-motion nuclear-playback';
    this.bar.innerHTML = `<div class="nuclear-playback-actions" role="group" aria-label="Playback">
      <button type="button" data-motion="play">Play</button>
      <button type="button" data-motion="step" aria-label="Step forward">Step</button>
      <button type="button" data-motion="reset">Reset</button>
      <label>Speed <select aria-label="Simulation speed"><option value=".25">0.25×</option><option value=".5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label>
    </div><label class="nuclear-scrubber"><span id="timeline-caption"></span><input id="nuclear-timeline" type="range" min="0" step="any"></label><p class="study-motion-status" id="nuclear-time"></p>`;
    stage.before(this.bar);
    this.play = this.bar.querySelector('[data-motion=play]');
    this.range = this.bar.querySelector('input');
    this.status = this.bar.querySelector('p');
    this.range.oninput = () => this.seek(+this.range.value);
    // Native range increments for step="any" vary; make keyboard changes explicit.
    this.range.onkeydown = event => {
      const step = this.profile.step;
      const value = {ArrowLeft: this.position-step, ArrowDown: this.position-step,
        ArrowRight: this.position+step, ArrowUp: this.position+step, Home: 0, End: this.profile.limit}[event.key];
      if (value === undefined) return;
      event.preventDefault();
      this.seek(value);
    };
    this.bar.querySelector('select').onchange = event => { this.speed = +event.target.value; };
    this.play.onclick = () => this.toggle();
    this.bar.querySelector('[data-motion=step]').onclick = () => {
      const next = this.position + this.profile.step;
      this.seek(this.profile.limit === 2 ? Math.floor(next + .00001) : next);
    };
    this.bar.querySelector('[data-motion=reset]').onclick = () => this.seek(0);
    this.frame = this.frame.bind(this);
    const usefulVisibility = .3;
    new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting && entry.intersectionRatio >= usefulVisibility;
      this.schedule();
    }, {threshold: usefulVisibility}).observe(stage.querySelector('canvas'));
    document.addEventListener('visibilitychange', () => this.schedule());
    window.addEventListener('pagehide', () => this.pause());
    this.reduced.addEventListener('change', event => { if (event.matches) this.pause(); });
  }

  configure(id) {
    this.pause();
    this.profile = playbackProfiles[id];
    this.position = id === 'binding' || id === 'isomers' ? 2 : 0;
    this.bar.hidden = !this.profile;
    if (!this.profile) return;
    const walkthrough = this.profile.limit === 2;
    this.bar.querySelector('.nuclear-scrubber').hidden = walkthrough;
    this.bar.querySelector('.nuclear-playback-actions label').hidden = walkthrough;
    this.range.max = this.profile.limit;
    this.range.step = walkthrough ? '1' : 'any';
    this.bar.querySelector('#timeline-caption').textContent = this.profile.label;
  }

  update(label) {
    this.play.textContent = this.playing ? 'Pause' : 'Play';
    this.play.setAttribute('aria-label', this.playing ? 'Pause simulation' : 'Play simulation');
    this.range.value = this.profile?.limit === 2 ? Math.floor(this.position + .00001) : this.position;
    if (this.status.textContent !== label) this.status.textContent = label;
    if (this.range.getAttribute('aria-valuetext') !== label) this.range.setAttribute('aria-valuetext', label);
  }

  schedule() {
    const active = this.playing && this.visible && !document.hidden;
    if (active && !this.request) this.request = requestAnimationFrame(this.frame);
    if (!active) {
      if (this.request) cancelAnimationFrame(this.request);
      this.request = this.last = undefined;
    }
  }

  pause() {
    this.playing = false;
    this.schedule();
    this.play.textContent = 'Play';
    this.play.setAttribute('aria-label', 'Play simulation');
  }

  toggle() {
    if (this.playing) this.pause();
    else {
      if (this.position >= this.profile.limit) this.position = 0;
      this.playing = true;
      this.schedule();
    }
    this.render();
  }

  seek(value) {
    this.pause();
    this.position = Math.max(0, Math.min(this.profile.limit, value));
    this.render();
  }

  frame(now) {
    this.request = undefined;
    const dt = this.last === undefined ? 0 : (now - this.last) / 1000;
    this.last = now;
    const speed = this.profile.limit === 2 ? 1 : this.speed;
    this.position = Math.min(this.profile.limit, this.position + dt * this.profile.rate * speed);
    if (this.position >= this.profile.limit) this.pause();
    this.render();
    this.schedule();
  }
}
