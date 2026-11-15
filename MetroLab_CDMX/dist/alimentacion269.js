export function abrirAlimentacion() {
  if (document.getElementById('alimentacion-dialog')) return;

  const dialogo = document.createElement('dialog');
  dialogo.id = 'alimentacion-dialog';
  dialogo.setAttribute('aria-labelledby', 'alimentacion-titulo');
  dialogo.innerHTML = `
    <div class="alimentacion-barra">
      <h2 id="alimentacion-titulo">Alimentación eléctrica</h2>
      <button type="button" autofocus>Volver al menú</button>
    </div>
    <iframe title="Maqueta interactiva de alimentación eléctrica"></iframe>`;

  const entrada = document.activeElement;
  const visor = dialogo.querySelector('iframe');
  dialogo.querySelector('button').addEventListener('click', () => dialogo.close());
  visor.addEventListener('load', () => {
    visor.contentDocument?.addEventListener('keydown', evento => {
      if (evento.key !== 'Escape' || evento.defaultPrevented) return;
      evento.preventDefault();
      dialogo.close();
    });
  });
  dialogo.addEventListener('close', () => {
    dialogo.remove();
    entrada?.focus();
  }, {once: true});

  visor.src = new URL('./alimentacion/index.html', import.meta.url);
  document.body.append(dialogo);
  dialogo.showModal();
}
