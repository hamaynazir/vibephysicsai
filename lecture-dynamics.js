// One fixed-size physics step per tick. Render speed and model time are separate.
const models = {
  'emt-vector-analysis/overview': {
    title: 'Watch a pulse meet a boundary',
    control: 'Wave speed on the right', min: .3, max: 1, value: .5,
    hint: 'Compare speed 1 with speed 0.5. This one-dimensional wave model uses normalized units. Stop before the ends send waves back.',
    create(speed) {
      const size = 200;
      const pulse = x => Math.exp(-((x - 38) ** 2) / 55);
      let field = Array.from({length:size}, (_, i) => pulse(i));
      let previous = field.map((_, i) => pulse(i + .8));
      return {
        step() {
          const next = field.map((y,i) => {
            if (i === 0 || i === size - 1) return 0;
            const courant = i < 100 ? .8 : .8 * speed;
            return 2*y - previous[i] + courant ** 2 * (field[i-1] - 2*y + field[i+1]);
          });
          previous = field;
          field = next;
        },
        values: () => field, extent: 1.5, limit: 225
      };
    }
  },
  'crystal-structures/crystalline': {
    title: 'Send a vibration through a lattice',
    control: 'Mass of every second site', min: 1, max: 4, value: 1,
    hint: 'Compare equal and alternating masses. Springs couple neighboring sites. The ends are fixed and will eventually reflect the disturbance.',
    create(mass) {
      const displacement = Array(45).fill(0);
      const velocity = displacement.map((_,i) => .45*Math.exp(-((i-8)**2)/5));
      return {
        step() {
          for (let i=1;i<44;i++) velocity[i] += .16*(displacement[i-1]-2*displacement[i]+displacement[i+1])/(i%2 ? mass : 1);
          for (let i=1;i<44;i++) displacement[i] += .16*velocity[i];
        },
        values: () => displacement, extent: 1, points: true, limit: 420
      };
    }
  },
  'materials-and-bonding/forces': {
    title: 'Watch a displaced bond vibrate',
    control: 'Damping rate', min: 0, max: 1, value: .2,
    hint: 'Compare zero damping with stronger damping. The plot shows relative displacement over time in the small-displacement, harmonic approximation.',
    create(damping) {
      let x=1, v=0;
      const history=[x];
      return {
        step() {
          v += .06*(-x-damping*v);
          x += .06*v;
          history.push(x);
        },
        values: () => history, extent: 1.1, limit: 420, history: true
      };
    }
  },
  'laser-radiation/pumping': {
    title: 'Watch a pumped population build up',
    control: 'Pump rate relative to decay', min: 0, max: 4, value: 2,
    hint: 'This idealized pump feeds the upper state at rate P(1 − n), and decay removes population at rate n. The plot tracks the upper-state fraction n.',
    create(pump) {
      let fraction=0;
      const history=[0];
      return {
        step() {
          fraction += .04*(pump*(1-fraction)-fraction);
          history.push(fraction);
        },
        values: () => history, extent: 1, positive: true, limit: 260, history: true
      };
    }
  },
  'nuclear-basic-concepts/beta': {
    title: 'Run a random radioactive decay trial',
    control: 'Initial nuclei', min: 20, max: 200, value: 80, increment: 20,
    hint: 'Each step lasts one twentieth of a half-life. Restart at the same settings and compare two runs with the smooth expected survival curve.',
    create(total) {
      let count=total;
      const history=[1];
      return {
        step() {
          let survivors=0;
          for(let i=0;i<count;i++) if(Math.random()<2**(-1/20)) survivors++;
          count=survivors;
          history.push(count/total);
        },
        values: () => history, extent: 1, positive: true, limit: 100, history: true,
        expected: step => 2**(-step/20),
        status: step => (step/20).toFixed(2)+' half-lives · '+count+' nuclei remaining'
      };
    }
  }
};

export function dynamicsFor(course, topic) {
  const model=models[course+'/'+topic];
  if(!model)return null;
  const panel=document.createElement('details');
  panel.className='review-experiment lecture-dynamics';
  panel.name='lecture-study-tool';
  const summary=document.createElement('summary');
  summary.textContent=model.title;
  const hint=document.createElement('p');
  hint.textContent=model.hint;
  const canvas=document.createElement('canvas');
  canvas.width=640; canvas.height=220;
  canvas.style.cssText='display:block;width:100%;height:auto';
  canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label',model.title);
  const label=document.createElement('label');
  const input=document.createElement('input');
  input.type='range'; input.min=model.min; input.max=model.max;
  input.step=model.increment??.1; input.value=model.value;
  input.setAttribute('aria-label',model.control);
  const setting=document.createElement('span');
  label.append(setting,input);
  const status=document.createElement('p');
  let simulation, tick=0, timer;
  function draw() {
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,640,220);
    const base=simulation.positive?192:110;
    const values=simulation.values();
    const x=i=>18+i*604/(simulation.history?simulation.limit:values.length-1);
    const y=v=>base-v*(simulation.positive?165:82)/simulation.extent;
    ctx.strokeStyle=getComputedStyle(panel).color;
    ctx.lineWidth=1; ctx.globalAlpha=.35;
    ctx.beginPath(); ctx.moveTo(18,base);ctx.lineTo(622,base);
    if (course==='emt-vector-analysis') {ctx.moveTo(x(100),15);ctx.lineTo(x(100),201);}
    ctx.stroke();
    ctx.globalAlpha=1;
    ctx.fillStyle=ctx.strokeStyle;
    ctx.font='14px system-ui';
    ctx.textAlign='right';
    ctx.fillText(simulation.history?'Time →':'Position →',622,216);
    ctx.globalAlpha=.5;
    function trace(get, color) {
      ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();
      values.forEach((_,i)=>i===0?ctx.moveTo(x(i),y(get(i))):ctx.lineTo(x(i),y(get(i))));
      ctx.stroke();
    }
    if(simulation.expected)trace(simulation.expected,ctx.strokeStyle);
    ctx.globalAlpha=1;
    const accent=getComputedStyle(panel).getPropertyValue('--ui-accent').trim()||'#087c83';
    trace(i=>values[i],accent);
    if(simulation.points){
      ctx.fillStyle=accent;
      values.forEach((v,i)=>{ctx.beginPath();ctx.arc(x(i),y(v),3,0,2*Math.PI);ctx.fill();});
    }
    status.textContent=simulation.status?.(tick) ?? 'Simulation step '+tick+' · '+(simulation.positive?'Upper state '+(values.at(-1)*100).toFixed(1)+'%':'normalized displacement');
  }
  function advance() {
    if(!panel.isConnected || !panel.open || !panel.closest('.lecture-tools')?.open){pause();return;}
    if(tick<simulation.limit){simulation.step();tick++;draw();}
    if(tick>=simulation.limit)pause();
  }
  function makeButton(text,action) {
    const button=document.createElement('button');
    button.type='button';button.textContent=text;button.onclick=action;return button;
  }
  function pause(){clearInterval(timer);timer=undefined;play.textContent='Play';}
  function reset(){pause();tick=0;simulation=model.create(Number(input.value));setting.textContent=model.control+' · '+input.value+' ';draw();}
  const play=makeButton('Play',()=>{
    if(timer){pause();return;}
    if(tick>=simulation.limit)reset();
    play.textContent='Pause';timer=setInterval(advance,32);
  });
  const actions=document.createElement('div');
  actions.className='action-row';
  actions.append(play,makeButton('Step',()=>{pause();advance();}),makeButton('Restart',reset));
  input.oninput=reset;
  panel.addEventListener('toggle',()=>{if(panel.open)draw();else pause();});
  panel.append(summary,hint,canvas,label,actions,status);
  reset();
  return panel;
}
