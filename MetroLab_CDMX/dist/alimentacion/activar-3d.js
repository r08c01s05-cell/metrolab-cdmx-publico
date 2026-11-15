const estado3d = document.querySelector('[data-estado-3d]');
if (location.protocol === 'file:') {
  estado3d.textContent = 'Abre esta página desde el servidor local para activar la maqueta 3D.';
} else {
  import('./visor-3d.js').catch(error => {
    console.error(error);
    estado3d.textContent = 'WebGL no está disponible. El esquema en corte y las fichas siguen activos.';
  });
}
