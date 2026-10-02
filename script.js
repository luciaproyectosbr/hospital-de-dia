/* ==========================================================================
   Hospital de Día de Psiquiatría · Script
   JavaScript sin librerías. La página funciona igualmente sin JS: este
   archivo solo mejora la experiencia (menú móvil, sección activa, etc.).

   Funciones:
     1. Detección de JavaScript (retira la clase .sin-js)
     2. Menú móvil accesible (aria-expanded, tecla Escape, cierre al navegar)
     3. Marcado de la sección activa en el menú (aria-current)
     4. Ocultar con elegancia imágenes que no se encuentren
     5. Año actual en el pie
   ========================================================================== */

(function () {
  'use strict';

  /* 1. DETECCIÓN DE JAVASCRIPT --------------------------------------------
     El <html> lleva la clase "sin-js", que mantiene el menú siempre visible
     por si JavaScript no está disponible. Como este código sí se ejecuta,
     la retiramos para activar el menú desplegable. */
  document.documentElement.classList.remove('sin-js');


  /* 2. MENÚ MÓVIL ---------------------------------------------------------- */
  var botonMenu = document.querySelector('.menu-boton');
  var navegacion = document.querySelector('.navegacion');
  var enlacesMenu = document.querySelectorAll('.navegacion__lista a');

  // Abre o cierra el menú y actualiza el estado para lectores de pantalla
  function alternarMenu(abrir) {
    botonMenu.setAttribute('aria-expanded', String(abrir));
    navegacion.classList.toggle('abierta', abrir);
  }

  if (botonMenu && navegacion) {
    // Clic (o Enter/Espacio, que los <button> gestionan solos) en el botón
    botonMenu.addEventListener('click', function () {
      var estaAbierto = botonMenu.getAttribute('aria-expanded') === 'true';
      alternarMenu(!estaAbierto);
      // Al abrir, llevamos el foco al primer enlace para seguir con el teclado
      if (!estaAbierto && enlacesMenu.length) {
        enlacesMenu[0].focus();
      }
    });

    // Tecla Escape: cierra el menú y devuelve el foco al botón
    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && botonMenu.getAttribute('aria-expanded') === 'true') {
        alternarMenu(false);
        botonMenu.focus();
      }
    });

    // Al elegir una sección, se cierra el menú (útil en móvil)
    enlacesMenu.forEach(function (enlace) {
      enlace.addEventListener('click', function () {
        alternarMenu(false);
      });
    });

    // Si el foco sale del menú (p. ej. tabulando), se cierra
    navegacion.addEventListener('focusout', function (evento) {
      var destino = evento.relatedTarget;
      if (destino && !navegacion.contains(destino) && destino !== botonMenu) {
        alternarMenu(false);
      }
    });

    // Al pasar a tamaño escritorio, se restablece el estado del menú
    var consultaEscritorio = window.matchMedia('(min-width: 960px)');
    consultaEscritorio.addEventListener('change', function (e) {
      if (e.matches) { alternarMenu(false); }
    });
  }


  /* 3. SECCIÓN ACTIVA EN EL MENÚ ------------------------------------------
     IntersectionObserver detecta qué sección está en pantalla y marca su
     enlace con aria-current="true" (se resalta visualmente desde el CSS). */
  if ('IntersectionObserver' in window) {
    var secciones = document.querySelectorAll('main section[id]');

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) { return; }
        var id = entrada.target.id;
        enlacesMenu.forEach(function (enlace) {
          if (enlace.getAttribute('href') === '#' + id) {
            enlace.setAttribute('aria-current', 'true');
          } else {
            enlace.removeAttribute('aria-current');
          }
        });
      });
    }, {
      // Considera "activa" la sección que ocupa la franja central de la pantalla
      rootMargin: '-45% 0px -50% 0px'
    });

    secciones.forEach(function (seccion) { observador.observe(seccion); });
  }


  /* 4. IMÁGENES NO ENCONTRADAS --------------------------------------------
     Mientras no estén las fotos en la carpeta img/, en lugar de mostrar el
     icono de imagen rota se oculta la imagen y la tarjeta conserva su diseño. */
  function marcarImagenRota(imagen) {
    imagen.classList.add('imagen-no-disponible');
  }

  document.querySelectorAll('.tarjeta img').forEach(function (imagen) {
    // Si ya falló antes de que este script se ejecutara
    if (imagen.complete && imagen.naturalWidth === 0) {
      marcarImagenRota(imagen);
    }
    // Si falla después
    imagen.addEventListener('error', function () {
      marcarImagenRota(imagen);
    });
  });


  // Imagen de portada: si falta, se oculta su marco entero y el texto ocupa todo el ancho
  var imagenPortada = document.querySelector('.portada__imagen img');
  if (imagenPortada) {
    var ocultarPortada = function () {
      imagenPortada.parentElement.classList.add('imagen-no-disponible');
    };
    if (imagenPortada.complete && imagenPortada.naturalWidth === 0) { ocultarPortada(); }
    imagenPortada.addEventListener('error', ocultarPortada);
  }


  /* 5. AÑO ACTUAL EN EL PIE ------------------------------------------------ */
  var anio = document.getElementById('anio-actual');
  if (anio) {
    anio.textContent = new Date().getFullYear();
  }
})();
