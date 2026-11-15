(() => {
  const preguntas = [
    ['¿Qué equipo convierte la corriente alterna en corriente continua?',
      ['El transformador seco','El rectificador','El disyuntor de vía'],1,
      'El rectificador convierte CA en CC. El transformador adapta la tensión alterna antes de esa etapa.'],
    ['¿Qué equipo capta la energía de la catenaria?',
      ['El pantógrafo','La zapata de la barra guía','El rectificador'],0,
      'El pantógrafo toma corriente del conductor aéreo. La zapata realiza la captación en la barra guía lateral.'],
    ['¿Por dónde vuelve la corriente al rectificador en la maqueta?',
      ['Por el alimentador de media tensión','Por el cable de alumbrado y fuerza','Por los rieles de retorno'],2,
      'El circuito de tracción se cierra a través de los rieles de retorno hacia el polo negativo del rectificador.'],
  ];
  const form = document.querySelector('#practica form');
  const pregunta = form.querySelector('[data-pregunta]');
  const opciones = form.querySelector('[data-opciones]');
  const resultado = form.querySelector('[data-resultado]');
  const siguiente = form.querySelector('[data-siguiente]');
  const comprobar = form.querySelector('button[type=submit]');
  let indice = 0;
  function mostrar() {
    const [texto, respuestas] = preguntas[indice];
    pregunta.textContent = texto;
    opciones.replaceChildren(...respuestas.map((respuesta, posicion) => {
      const etiqueta = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'respuesta';
      radio.value = posicion;
      radio.required = true;
      etiqueta.append(radio,respuesta);
      return etiqueta;
    }));
    resultado.textContent = '';
    delete resultado.dataset.acierto;
    comprobar.disabled = false;
    siguiente.hidden = true;
  }
  form.addEventListener('submit',event => {
    event.preventDefault();
    const [, , correcta, explicacion] = preguntas[indice];
    const acertada = Number(new FormData(form).get('respuesta')) === correcta;
    resultado.dataset.acierto = String(acertada);
    resultado.textContent = (acertada ? 'Correcto. ' : 'Revisa tu respuesta. ') + explicacion;
    siguiente.textContent = indice === preguntas.length-1 ? 'Reiniciar práctica' : 'Siguiente pregunta';
    siguiente.hidden = false;
  });
  siguiente.addEventListener('click',() => {
    indice = (indice+1)%preguntas.length;
    mostrar();
    opciones.querySelector('input').focus();
  });
  mostrar();
})();
