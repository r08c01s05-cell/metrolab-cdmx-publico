(() => {
  const root = document.getElementById('corte-electrico-metro');
  const canvas = root.querySelector('[data-scene]');
  const ctx = canvas.getContext('2d');
  const system = root.querySelector('[data-system]');
  const etapas = [...root.querySelectorAll('[data-etapa]')];
  let etapa = 'cfe';
  const detail = root.querySelector('[data-detail]');
  const data = {
    l1: { high:'230 kV CA', medium:'15 kV CA', dc:'750 V CC', seat:'Metro-Energía', secondary:'571 V CA', example:'Grupo de 12 pulsos documentado por el IPN.' },
    l8: { high:'230 kV CA', medium:'23 kV CA', dc:'750 V CC', seat:'SEAT Estrella', secondary:'540 V CA', example:'Grupo documentado por la UNAM.' },
    lb: { high:'230 kV CA', medium:'23 kV CA', dc:'750 V CC', seat:'SEAT Oceanía' },
    la: { high:'23 kV CA', medium:'23 kV CA', dc:'750 V CC', seat:'Cabecera de línea', overhead:true, mediumOnly:true },
    l12: { high:'230 kV CA', medium:'23 kV CA', dc:'1 500 V CC', seat:'SEAT Estrella', overhead:true, secondary:'1 182 V CA', example:'Caso de Mixcoac según el anexo aportado.' },
    hist: { high:'85 kV CA', medium:'15 kV CA', dc:'750 V CC', seat:'Buen Tono histórico', secondary:'571 V CA', example:'Grupo de referencia del anexo aportado.' }
  };
  const inkProbe = document.createElement('span');
  inkProbe.hidden = true;
  root.append(inkProbe);
  const mix = (color, amount) => 'color-mix(in srgb,' + color + ' ' + amount + '%,var(--background))';
  function palette() {
    const fg = 'var(--foreground)';
    const paint = {
      ink:fg, paper:'var(--background)', steel:mix(fg,53), dark:mix(fg,79), light:mix(fg,24),
      concrete:mix(fg,18), cut:mix(fg,34), soil:mix('var(--orange)',30),
      soilDeep:mix('var(--orange)',40), grass:mix('var(--green)',36),
      ac:'var(--cem-ac)', dc:'var(--cem-dc)', ret:'var(--cem-ret)',
      train:mix('var(--cem-dc)',79), glass:mix('var(--cem-ac)',34), insulator:mix('var(--orange)',66)
    };
    return Object.fromEntries(Object.entries(paint).map(([key,color]) => {
      inkProbe.style.color = color;
      return [key,getComputedStyle(inkProbe).color];
    }));
  }
  function draw() {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!ctx || !width || !height) return;
    const dpr = Math.min(devicePixelRatio || 1,2);
    canvas.width = Math.round(width*dpr);
    canvas.height = Math.round(height*dpr);
    ctx.scale(dpr,dpr);
    const paint = palette();
    const s = data[system.value];
    const scale = Math.min((width-10)/43.5,(height-12)/14);
    const originX = (width-43.5*scale)/2;
    const originY = (height+.8*scale)/2;
    const project = ([x,y,z]) => [originX+(x+.39*z)*scale,originY+(.31*z-y)*scale];
    function shape(points, fill, stroke, lineWidth=.75) {
      const pixels=points.map(project);
      ctx.beginPath();
      pixels.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
      ctx.closePath();
      ctx.fillStyle=paint[fill];
      ctx.fill();
      if (stroke) {
        ctx.lineWidth=lineWidth;
        ctx.strokeStyle=paint[stroke];
        ctx.stroke();
      }
    }
    function line(points, color, lineWidth=1.3, dash=[], arrow=false) {
      const pixels=points.map(project);
      ctx.save();
      ctx.lineJoin='round';
      ctx.lineCap='round';
      ctx.lineWidth=lineWidth;
      ctx.strokeStyle=paint[color];
      ctx.fillStyle=paint[color];
      ctx.setLineDash(dash);
      ctx.beginPath();
      pixels.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
      ctx.stroke();
      if (arrow) {
        const [x,y]=pixels.at(-1), [a,b]=pixels.at(-2);
        const angle=Math.atan2(y-b,x-a);
        const size=Math.max(5,lineWidth*2.2);
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x-size*Math.cos(angle-.52),y-size*Math.sin(angle-.52));
        ctx.lineTo(x-size*Math.cos(angle+.52),y-size*Math.sin(angle+.52));
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    function box(x,y,z,w,h,d,front,top='light',side='steel',outline='steel') {
      shape([[x+w,y,z],[x+w,y,z+d],[x+w,y+h,z+d],[x+w,y+h,z]],side,outline);
      shape([[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]],front,outline);
      shape([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]],top,outline);
    }
    function wheel(x,y,z,r) {
      const [px,py]=project([x,y,z]);
      for (const [fraction,color] of [[1,'dark'],[.69,'steel'],[.33,'light']]) {
        ctx.beginPath();
        ctx.ellipse(px,py,r*scale*fraction,r*scale*fraction,0,0,Math.PI*2);
        ctx.fillStyle=paint[color];
        ctx.fill();
      }
    }
    function transformer(x,y,z,w,h,d) {
      box(x-.1,y,z,w+.2,.21,d,'dark','steel');
      box(x,y+.21,z,w,h,d,'steel','light','dark');
      for (let i=0;i<11;i++) box(x+.09+i*(w-.14)/11,y+.35,z+d,.075,h-.25,.13,'dark','light','dark');
      for (const offset of [.2,.5,.8]) {
        const point=x+w*offset;
        line([[point,y+h+.21,z+.45],[point,y+h+.91,z+.45]],'dark',1.7);
        for (let i=0;i<4;i++) box(point-.085,y+h+.31+i*.115,z+.36,.17,.055,.18,'insulator','insulator','dark');
      }
    }
    function cabinet(x,y,z,w,h,d,rectifier) {
      box(x,y,z,w,.19,d,'dark','steel');
      box(x,y+.19,z,w,h,d,'light','concrete');
      if (rectifier) {
        line([[x+w/2,y+.32,z+d+.01],[x+w/2,y+h+.13,z+d+.01]],'steel',.9);
        for (const bank of [.48,h-.38]) for (let i=0;i<5;i++) {
          for (const start of [.13,w*.57]) {
            line([[x+start,y+bank-i*.065,z+d+.01],[x+start+w*.29,y+bank-i*.065,z+d+.01]],'steel',1);
          }
        }
      }
      box(x+w*.37,y+h*.55,z+d,w*.25,.18,.045,'dark','steel','dark');
      const [px,py]=project([x+w*.73,y+h*.54,z+d+.02]);
      ctx.fillStyle=paint.dc;
      ctx.beginPath(); ctx.arc(px,py,2.2,0,Math.PI*2); ctx.fill();
    }
    // Estratos y losas. El frente abierto deja visible el alimentador.
    box(.3,-4.35,.1,40.2,1.45,6.8,'soilDeep','soil','soilDeep','soilDeep');
    box(.3,-2.9,.1,12.65,2.9,6.8,'soil','grass','soilDeep','soilDeep');
    box(.25,0,.08,12.8,.12,6.85,'grass','grass','grass','grass');
    box(13.02,-2.95,.55,27.48,.38,5.9,'cut','concrete');
    for (let i=0;i<158;i++) {
      const x=.54+((i*109)%3970)/100;
      const y=-3.04-((i*59)%110)/100;
      const [px,py]=project([x,y,6.905]);
      ctx.globalAlpha=.23;
      ctx.fillStyle=paint.ink;
      ctx.fillRect(px,py,i%5===0?1.45:1,1);
    }
    ctx.globalAlpha=1;
    // Cuarto eléctrico con fondo, techo seccionado y piso.
    box(13.08,-2.57,.63,10.37,5.7,.25,'concrete','light');
    box(13.08,-2.57,.84,.25,5.7,4.97,'cut','light');
    box(13.08,2.9,.83,10.37,.23,1.43,'cut','concrete');
    for (const x of [14,17.2,20.4]) box(x,2.72,.91,1.4,.12,.35,'paper','light','concrete');
    for (let x=13.5;x<23.4;x+=1.08) line([[x,-2.56,.91],[x,-2.56,6.14]],'light',.7);
    // Cascarón del túnel. Se conserva la mitad posterior de la bóveda.
    const arch = (x, fraction, outer=false) => {
      const a=Math.PI-Math.PI*fraction;
      const shell=outer?.22:0;
      return [x,-2.57+(4.75+shell)*Math.sin(a),3.46+(2.69+shell)*Math.cos(a)];
    };
    const divisions=12;
    for (let n=0;n<divisions;n++) {
      const u=.57*n/divisions, v=.57*(n+1)/divisions;
      shape([arch(23.48,u),arch(40.5,u),arch(40.5,v),arch(23.48,v)],n%2?'light':'concrete','cut',.55);
      shape([arch(23.48,u),arch(23.48,v),arch(23.48,v,true),arch(23.48,u,true)],'cut','steel',.55);
    }
    for (let x=25;x<40.5;x+=2.15) {
      const seam=Array.from({length:13},(_,i)=>arch(x,.57*i/12));
      line(seam,'cut',.7);
    }
    // Torres, cables y patio de recepción.
    box(.78,.12,1.18,3.62,.24,2.72,'cut','concrete');
    if (s.mediumOnly) {
      cabinet(1.72,.36,1.83,1.55,2.45,1.3,false);
    } else {
      const levels=[.37,1.7,3.06,4.43,5.77];
      const spans=[1.48,1.13,.8,.45,.3];
      for (const z of [1.71,2.71]) {
        for (const sign of [-1,1]) line(levels.map((y,i)=>[2.53+sign*spans[i],y,z]),'dark',2);
        for (let i=0;i<levels.length;i++) {
          const left=[2.53-spans[i],levels[i],z], right=[2.53+spans[i],levels[i],z];
          line([left,right],'steel',1.25);
          if (i>0) {
            line([left,[2.53+spans[i-1],levels[i-1],z]],'steel',1.1);
            line([right,[2.53-spans[i-1],levels[i-1],z]],'steel',1.1);
          }
        }
      }
      for (const y of [4.35,5.16]) {
        line([[.99,y,2.7],[4.11,y,2.7]],'dark',1.8);
        line([[3.92,y,2.7],[3.92,y-.3,2.7]],'insulator',2.1);
      }
    }
    box(4.95,.12,1,6.82,.25,4.36,'cut','concrete');
    transformer(6.6,.37,1.58,2.9,2.18,1.73);
    for (const x of [5.44,10.81]) {
      box(x,.37,1.18,.12,3.7,.13,'dark','steel');
      box(x,.37,3.8,.12,3.7,.13,'dark','steel');
      line([[x+.06,3.8,1.24],[x+.06,3.8,3.86]],'dark',1.8);
      line([[x+.06,.55,3.86],[x+.06,3.72,1.24]],'steel',1.15);
    }
    for (const z of [1.23,2.42,3.62]) {
      if (!s.mediumOnly) line([[3.92,4.82,z],[4.4,4.25,z],[4.9,3.94,z],[5.5,3.8,z]],'dark',1);
      line([[5.5,3.8,z],[7.25,3.55,z],[9.07,3.55,z],[10.87,3.8,z]],'steel',.9);
    }
    for (let i=0;i<=10;i++) {
      const x=5.08+i*.65;
      line([[x,.37,5.23],[x,1.12,5.23]],'steel',i%5===0?1.45:.55);
      if (i<10) line([[x,.38,5.23],[x+.65,1.1,5.23]],'steel',.55);
    }
    line([[5.08,1.12,5.23],[11.58,1.12,5.23]],'steel',.85);
    transformer(14.5,-2.56,2.15,2.63,2.85,1.55);
    cabinet(18.06,-2.56,2.18,2.24,3.33,1.57,true);
    cabinet(21.1,-2.56,2.3,1.32,2.75,1.36,false);
    // Vía, captación y tren en sección longitudinal.
    for (let x=23.7;x<40.4;x+=.57) box(x,-2.56,2,.19,.115,3.3,'cut','light','steel');
    for (const z of [2.57,4.48]) box(23.48,-2.44,z,17,.12,.12,'steel','light','dark');
    if (!s.overhead) for (let x=23.65;x<40.45;x+=1.37) box(x,-2.5,5.42,.12,.57,.16,'steel','cut','dark');
    if (s.overhead) for (const x of [24.25,32.32,39.65]) {
      box(x,-2.55,1.12,.105,4.52,.14,'steel','light','dark');
      line([[x,1.86,1.2],[x,1.86,3.32]],'steel',1.35);
    }
    function carriage(x,length,cab) {
      const low=-1.89, high=.91, front=4.84, back=2.28;
      const profile = cab
        ? [[x,low],[x+.03,-1.17],[x+.32,.24],[x+.83,.79],[x+1.33,high],[x+length,high],[x+length,low]]
        : [[x,low],[x,high],[x+length,high],[x+length,low]];
      for (const offset of [1.46,length-1.18]) wheel(x+offset,-1.98,4.78,.32);
      const roof=cab ? [[x+.83,.79],[x+1.33,high],[x+length,high]] : [[x,high],[x+length,high]];
      shape([...roof.map(([a,b])=>[a,b,back]),...roof.toReversed().map(([a,b])=>[a,b,front])],'dark','steel');
      if (cab) {
        shape([[x,low,back],[x+.03,-1.17,back],[x+.83,.79,back],[x+.83,.79,front],[x+.03,-1.17,front],[x,low,front]],'train','dark');
        shape([[x+.27,-.64,back+.18],[x+.69,.45,back+.18],[x+.69,.45,front-.24],[x+.27,-.64,front-.24]],'glass','dark');
      }
      shape(profile.map(([a,b])=>[a,b,front]),'train','dark');
      box(x+.18,-1.89,front,length-.19,.34,.036,'steel','light','dark');
      const start=cab?1.15:.34;
      for(let offset=start;offset+1.07<length;offset+=1.65) {
        const door=Math.round((offset-start)/1.65)%2===1;
        box(x+offset,door?-1.5:-.59,front+.04,1.04,door?1.96:.99,.025,door?'light':'glass','steel','dark');
        if(door) {
          line([[x+offset+.52,-1.49,front+.07],[x+offset+.52,.45,front+.07]],'dark',.95);
          for(const gap of [.085,.6]) box(x+offset+gap,-.53,front+.07,.36,.79,.02,'glass','steel','dark');
        }
      }
    }
    carriage(27.26,6.42,true);
    carriage(33.82,6.57,false);
    // Cada color sigue su conductor hasta el punto de entrega o retorno.
    const flow = Math.max(1.9,scale*.14);
    if (!s.mediumOnly) line([[4.04,4.58,3.28],[4.65,4.04,3.28],[5.48,3.8,3.28]],'ac',flow,[],true);
    line([[10.87,.39,4.34],[11.86,.39,4.34],[12.42,.1,4.34],[12.42,-2.24,4.34],[12.72,-2.46,4.34],[13.93,-2.46,4.34],[14.19,-2.13,4.34],[14.19,-.83,4.34],[14.52,-.67,3.73]],'ac',flow,[],true);
    if (etapa==='aux') line([[12.42,-1.45,4.34],[11.3,-1.45,4.34],[11.3,.1,4.34]],'ac',flow,[2,4],true);
    line([[17.13,-.8,3.74],[18.04,-.8,3.74]],'ac',flow,[],true);
    line([[20.31,-.8,3.77],[21.07,-.8,3.77]],'dc',flow,[],true);
    if (s.overhead) {
      line([[22.45,-.8,3.64],[23.73,-.8,3.25],[23.73,1.86,3.25],[40.46,1.86,3.25]],'dc',flow,[],true);
      line([[29.91,.92,3.25],[30.76,1.39,3.25],[30.31,1.86,3.25],[29.99,1.86,3.25]],'steel',2);
      line([[30.31,1.86,3.25],[30.76,1.39,3.25],[29.91,.92,3.25]],'dc',1.6,[],true);
    } else {
      line([[22.45,-.8,3.64],[23.23,-.8,4.1],[23.83,-1.86,5.48],[40.37,-1.86,5.48]],'dc',flow,[],true);
      line([[27.15,-1.86,5.48],[28.26,-1.86,5.48],[28.48,-1.92,4.88]],'dc',flow,[],true);
    }
    line([[39.36,-2.3,4.55],[24,-2.3,4.55],[23.33,-2.77,5.76],[19.17,-2.77,5.76],[19.17,-2.29,3.78]],'ret',flow,[5,4],true);
    const spots = {
      cfe:[2.54,s.mediumOnly?2.8:5.6,2.7], seat:[8.5,3.45,3.27],
      cable:[12.42,-1.45,4.34], tr:[15.48,1.28,3.7],
      rec:[19.12,.94,3.75], track:s.overhead?[32.4,1.86,3.25]:[31.5,-1.86,5.48],
      return:[26,-2.3,4.55], aux:[11.3,-1.45,4.34]
    };
    const [sx,sy]=project(spots[etapa]);
    ctx.beginPath(); ctx.arc(sx,sy,5,0,Math.PI*2);
    ctx.fillStyle=paint.paper; ctx.fill(); ctx.strokeStyle=paint.ink; ctx.lineWidth=1.7; ctx.stroke();
    if(width>=700) {
      const labels = [
        [spots.cfe,'CFE · '+s.high,2.7,7.26],
        [spots.seat,s.seat+' · '+s.medium,10.05,6.25],
        [[19.4,2.9,1.9],'Cuarto de rectificación',19.4,5.45],
        [spots.track,(s.overhead?'Catenaria':'Barra guía')+' · '+s.dc,33.1,5.1]
      ];
      ctx.font='500 12px system-ui';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      for (const [target,label,x,y] of labels) {
        const [px,py]=project([x,y,0]);
        line([[x,y-.42,0],target],'steel',1);
        ctx.fillStyle=paint.ink;
        ctx.fillText(label,px,py);
      }
    }
  }
  function update() {
    const s = data[system.value];
    const descriptions = {
      cfe:'Acometida de CFE · '+s.high+'. '+(system.value==='l1'?'Las torres y el pórtico ilustran la red externa. El enlace a Metro-Energía es subterráneo.':'La llegada de CFE se muestra de forma esquemática.')+
        (s.mediumOnly?'':' En la vista 3D, las torres tienen una altura ilustrativa de unos 24 m.'),
      seat:s.seat+' · '+(s.mediumOnly?'recepción y distribución en '+s.medium:s.high+' → '+s.medium)+'.',
      cable:'Alimentador enterrado · '+s.medium+' hasta el grupo de tracción.',
      tr:'El transformador de tracción reduce la alimentación de '+s.medium+' antes de la rectificación. '+(s.secondary?'El secundario de referencia es de '+s.secondary+'. '+s.example:'La tensión secundaria queda pendiente de verificar.'),
      rec:'Rectificador y disyuntor · conversión a '+s.dc+' y protección de la salida hacia la vía.',
      track:(s.overhead?'Catenaria y pantógrafo':'Barra guía lateral y zapata')+' · '+s.dc+'.',
      return:'Retorno de tracción · los rieles conducen la corriente hacia el polo negativo del rectificador.',
      aux:'Alumbrado y fuerza · derivación en '+s.medium+' para los servicios de estación.'
    };
    const valores = {
      cfe:s.high, seat:s.mediumOnly?s.medium:s.high+' → '+s.medium, cable:s.medium,
      tr:s.secondary?s.medium+' → '+s.secondary+' (ejemplo)':s.medium, rec:s.dc, track:s.dc, aux:s.medium
    };
    for (const boton of etapas) {
      boton.setAttribute('aria-pressed',String(boton.dataset.etapa===etapa));
      const lectura = boton.querySelector('[data-valor]');
      if (lectura) lectura.textContent=valores[boton.dataset.etapa];
    }
    detail.textContent = descriptions[etapa];
    if (!canvas.hidden) draw();
    root.dispatchEvent(new CustomEvent('maqueta:seleccion',{detail:{sistema:system.value,etapa,...s}}));
  }
  for (const boton of etapas) {
    boton.addEventListener('click',() => {
      etapa=boton.dataset.etapa;
      update();
    });
  }
  system.addEventListener('change',update);
  root.addEventListener('maqueta:consultar',update);
  new ResizeObserver(draw).observe(canvas);
  update();
})();
