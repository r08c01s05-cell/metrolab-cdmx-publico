const TUNELES = {
 cajon: {
  title: 'Túnel tipo cajón', structure: 'Losas y muros de concreto forman una sección rectangular. Puede alojar dos vías en un mismo recinto o en celdas separadas.',
  method: 'Una solución frecuente a poca profundidad es excavar desde la superficie, construir el cajón y restituir la calle. Se coordinan el tránsito, las instalaciones urbanas y el sostenimiento de la excavación.',
  operation: 'Las paredes rectas facilitan distribuir pasarelas y equipos a los costados. Se deben revisar juntas, filtraciones, drenaje y rutas de evacuación.'
 },
 circular: {
  title: 'Túnel circular', structure: 'El revestimiento forma un anillo. Una solera interior crea una superficie plana para la vía y permite reservar espacio inferior para drenaje o instalaciones.',
  method: 'Una tuneladora puede excavar la sección circular y colocar anillos de dovelas. La elección depende del terreno, el agua subterránea, la profundidad y el acceso para construir pozos.',
  operation: 'La curvatura limita parte del espacio lateral. El gálibo, las pasarelas y los ductos se estudian junto con ventilación, drenaje y evacuación.'
 }
};

function createTunnelDialog(doc) {
 const dialog = doc.createElement('dialog');
 dialog.className = 'infra271-dialog';
 dialog.setAttribute('aria-labelledby','infra271-title');
 dialog.innerHTML = `<header><h2 id="infra271-title">Tipos de túnel</h2><button type="button" data-close>Volver</button></header>
 <div class="infra271-choices" aria-label="Sección transversal"><button type="button" data-form="cajon">Tipo cajón</button><button type="button" data-form="circular">Circular</button></div>
 <div class="infra271-grid"><figure><div class="infra271-section" aria-hidden="true"><div class="infra271-duct"></div><div class="infra271-train"></div><div class="infra271-track"></div><div class="infra271-walk"></div><div class="infra271-drain"></div></div>
 <figcaption>Corte transversal esquemático · sin escala<br><span>Gris: revestimiento y vía · naranja: tren · amarillo: pasarela · azul: drenaje</span></figcaption></figure>
 <article aria-live="polite"><h3></h3><dl><dt>Sección y estructura</dt><dd></dd><dt>Construcción</dt><dd></dd><dt>Operación e inspección</dt><dd></dd></dl></article></div>
 <p>La forma y el método constructivo se eligen según el proyecto. Los cortes muestran una sola vía para facilitar la comparación.</p>
 <p><a href="https://highways.dot.gov/sites/fhwa.dot.gov/files/FHWA-IF-05-002.pdf" target="_blank" rel="noopener noreferrer">Fuente técnica · Manual de inspección de túneles carreteros y ferroviarios, FHWA, tabla 2.1</a></p>`;
 const show = form => {
  const data = TUNELES[form];
  dialog.dataset.form = form;
  dialog.querySelector('h3').textContent = data.title;
  dialog.querySelectorAll('dd').forEach((dd,i) => { dd.textContent = [data.structure,data.method,data.operation][i]; });
  dialog.querySelectorAll('[data-form]').forEach(button => button.setAttribute('aria-pressed',String(form===button.dataset.form)));
 };
 dialog.querySelector('[data-close]').onclick = () => dialog.close();
 dialog.querySelectorAll('[data-form]').forEach(button => { button.onclick = () => show(button.dataset.form); });
 show('cajon');
 doc.body.append(dialog);
 return dialog;
}

export function installInfraestructura271(shell, doc, win) {
 const host = doc.createElement('section');
 host.className = 'infra271-network';
 host.innerHTML = `<div class="infra271-actions"><button type="button" data-incident>Simular persona en vía</button><button type="button" data-tunnel>Tipos de túnel</button></div>
 <div class="infra271-report" hidden><p role="status"></p><div class="infra271-actions"><button type="button" data-fault-open217="train">Ver recreación 3D</button><button type="button" data-clear>Finalizar ejercicio</button></div></div>`;
 shell.querySelector('.sim106-follow-card').append(host);
 const incident = host.querySelector('[data-incident]');
 const report = host.querySelector('.infra271-report');
 const status = report.querySelector('[role="status"]');
 const replay = report.querySelector('[data-fault-open217]');
 const clear = report.querySelector('[data-clear]');
 let dialog;
 const update = () => {
  const state = win.metroViewState?.();
  const line = state?.engine.incident271?.line;
  host.hidden = doc.body.dataset.driving === 'true';
  incident.disabled = !state || !!line;
  report.hidden = !line;
  if(!line)return;
  const braking = state.engine.trains.some(t=>t.line===line&&t.speed>0);
  clear.disabled = braking;
  const message = braking ? `Línea ${line} · Persona en vía. Trenes en frenado de emergencia.` : `Línea ${line} · Servicio suspendido. Desenlace del ejercicio: fallecimiento confirmado.`;
  if(status.textContent!==message)status.textContent=message;
 };
 incident.onclick = () => {
  const state = win.metroViewState?.();
  if(!state?.engine.startIncident271(Number(state.currentLine)))return;
  const train = state.engine.trains.find(t=>t.id===state.selectedTrain&&t.line===Number(state.currentLine));
  replay.dataset.faultModel271 = train?.model.replace('-','') || (Number(state.currentLine)===1?'NM22':'MP82');
  if(!state.running)doc.getElementById('play').click();
  update();
 };
 clear.onclick = () => { win.metroViewState?.()?.engine.clearIncident271(); update(); };
 host.querySelector('[data-tunnel]').onclick = () => { dialog ??= createTunnelDialog(doc); dialog.showModal(); };
 return update;
}
