//VARIABLES
const formulario = document.querySelector('form');
const puestoInput = document.querySelector('#puesto');
const empresaInput = document.querySelector('#empresa');
const fechaInput = document.querySelector('#fecha');
const estadoSelect = document.querySelector('#estado');
const enlaceInput = document.querySelector('#enlace');
const nextInput = document.querySelector('#next');

const seccionFormulario = document.querySelector('#formulario');

const formTitle = document.querySelector('#form-title');
const guardarBtn = document.querySelector('#guardar-candidatura');
const cancelarEdicionBtn = document.querySelector('#cancelar-edicion');

const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = document.querySelector('#theme-icon');

const listaOportunidades = document.querySelector('#lista-oportunidades');
const buscarInput = document.querySelector('#buscar-oportunidad');
const filtroEstado = document.querySelector('#filtro-estado');
const ordenarSeguimiento = document.querySelector('#ordenar-seguimiento');

const mensajeExito = document.querySelector('#mensaje-exito');

let oportunidades = [];

let idOportunidadEditando = null;

let ordenarPorSeguimiento = false;

//LISTENERS
themeToggle.addEventListener('click', cambiarTema);

cancelarEdicionBtn.addEventListener('click', cancelarEdicion);

buscarInput.addEventListener('input', aplicarFiltros);
filtroEstado.addEventListener('change', aplicarFiltros);
ordenarSeguimiento.addEventListener('click', () => {
    ordenarPorSeguimiento = !ordenarPorSeguimiento;

    if (ordenarPorSeguimiento) {
        ordenarSeguimiento.textContent = 'Restablecer orden';
    } else {
        ordenarSeguimiento.textContent = 'Ordenar por seguimiento';
    }

    aplicarFiltros();
});

document.addEventListener('DOMContentLoaded', () => {
    idOportunidadEditando = null;
    
    oportunidades = cargarOportunidades();

    renderizarOportunidades(oportunidades);

    const temaGuardado = localStorage.getItem('theme');

    if (temaGuardado) {
        aplicarTema(temaGuardado);
    } else {
        aplicarTema('light');
    }
});

formulario.addEventListener('submit', (event) => {
    event.preventDefault();

    const puestoValido = validarCampo(puestoInput);
    const empresaValida = validarCampo(empresaInput);
    const fechaValida = validarCampo(fechaInput);
    const enlaceValido = validarCampo(enlaceInput);
    const nextValido = validarCampo(nextInput);

    const campos = [
        puestoInput,
        empresaInput,
        fechaInput,
        enlaceInput,
        nextInput
    ];

    const primerCampoInvalido = campos.find(
        (input) => input.getAttribute('aria-invalid') === 'true'
    );

    if (primerCampoInvalido) {
        primerCampoInvalido.focus();
    }

    if (puestoValido && empresaValida && fechaValida && enlaceValido && nextValido) {
        
        const puesto = puestoInput.value.trim();
        const empresa = empresaInput.value.trim();
        const fecha = fechaInput.value;
        const estado = estadoSelect.value;
        const enlace = enlaceInput.value.trim();
        const next = nextInput.value;

        const estabaEditando = idOportunidadEditando !== null;

        let nuevasOportunidades;

        if (idOportunidadEditando === null) {
        
            const oportunidad = {
                id: generarId(),
                puesto,
                empresa,
                fecha,
                estado,
                enlace,
                next
            };
        
            nuevasOportunidades = [
                ...oportunidades,
                oportunidad
            ];
        
        } else {
        
            const indice = oportunidades.findIndex(
                (oportunidad) =>
                    oportunidad.id === idOportunidadEditando
            );
        
            if (indice === -1) {
                console.error('Oportunidad no encontrada');
                return;
            }
        
            nuevasOportunidades = [...oportunidades];
        
            nuevasOportunidades[indice] = {
                id: idOportunidadEditando,
                puesto,
                empresa,
                fecha,
                estado,
                enlace,
                next
            };
        }

        const guardadoCorrecto =
        guardarOportunidades(nuevasOportunidades);

        if (!guardadoCorrecto) {
            alert(
                'No se pudieron guardar los cambios. Inténtalo de nuevo.'
            );
        
            return;
        }

        oportunidades = nuevasOportunidades;

        if (estabaEditando) {
            idOportunidadEditando = null;

            seccionFormulario.classList.remove('modo-edicion');
            formTitle.textContent = 'Nueva Oportunidad';
            guardarBtn.textContent = 'Guardar candidatura';
            cancelarEdicionBtn.hidden = true;
        }

        if (estabaEditando) {
            mostrarMensaje(
                'Oportunidad actualizada correctamente.'
            );
        } else {
            mostrarMensaje(
                'Oportunidad guardada correctamente.'
            );
        }

        aplicarFiltros();

        limpiarFormulario();
    }

});

listaOportunidades.addEventListener('click', (event) => {
    //eliminar oportunidad
    if (event.target.classList.contains('eliminar')) {
        const id = event.target.dataset.id;

        const confirmar = confirm('¿Seguro que quieres eliminar esta oportunidad?');

        if (confirmar) {
            eliminarOportunidad(id);
        }else{
            return;
        }
    }

    //editar oportunidad
    if (event.target.classList.contains('editar')) {
        const id = event.target.dataset.id;

        idOportunidadEditando = id;
        editarOportunidad(id);
    }
});

//FUNCIONES

// Validar campos
function validarCampo(input) {
    const valor = input.value.trim();

    const errorId = input.getAttribute('aria-describedby');
    const mensajeError = document.getElementById(errorId);

    if (!valor) {
        input.classList.add('input-error');
        input.setAttribute('aria-invalid', 'true');

        mensajeError.style.display = 'block';

        return false;
    }

    input.classList.remove('input-error');
    input.setAttribute('aria-invalid', 'false');

    mensajeError.style.display = 'none';

    return true;
}

//Renderizar oportunidades
function renderizarOportunidades(lista) {

    // Limpiar listado anterior
    listaOportunidades.textContent = '';


    // ESTADO VACÍO
    if (lista.length === 0) {

        const estadoVacio = document.createElement('div');
        estadoVacio.classList.add('estado-vacio');


        const mensaje = document.createElement('p');
        const descripcion = document.createElement('span');


        if (oportunidades.length === 0) {

            mensaje.textContent =
                'Aún no hay oportunidades guardadas.';

            descripcion.textContent =
                'Añade tu primera oportunidad desde el formulario.';

        } else {

            mensaje.textContent =
                'No se encontraron oportunidades.';

            descripcion.textContent =
                'Prueba a cambiar la búsqueda o los filtros.';
        }


        estadoVacio.appendChild(mensaje);
        estadoVacio.appendChild(descripcion);

        listaOportunidades.appendChild(estadoVacio);

        return;
    }


    // CREAR CARDS
    lista.forEach((oportunidad) => {

        const card = crearCardOportunidad(oportunidad);

        listaOportunidades.appendChild(card);
    });
}

//Limpiar formulario
function limpiarFormulario() {
    formulario.reset();
}

//Generar ID
function generarId() {
    return Math.random().toString(36).substring(2) + Date.now()
}

//Formatear fecha
function formatearFecha(fecha) {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
}

//Tema oscuro/claro
function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);

    if (tema === 'dark') {
        themeIcon.src = 'assets/images/sun.png';
        themeToggle.setAttribute('aria-label', 'Activar modo claro');
    } else {
        themeIcon.src = 'assets/images/moon.png';
        themeToggle.setAttribute('aria-label', 'Activar modo oscuro');
    }
}
function cambiarTema() {
    const temaActual =
        document.documentElement.getAttribute('data-theme');

    const nuevoTema =
        temaActual === 'dark' ? 'light' : 'dark';

    aplicarTema(nuevoTema);

    localStorage.setItem('theme', nuevoTema);
}

//Eliminar oportunidad
function eliminarOportunidad(id) {
    const nuevasOportunidades =
        oportunidades.filter(
            (oportunidad) =>
                oportunidad.id !== id
        );

    const guardadoCorrecto =
        guardarOportunidades(nuevasOportunidades);

    if (!guardadoCorrecto) {
        alert(
            'No se pudo eliminar la oportunidad. Inténtalo de nuevo.'
        );

        return;
    }

    oportunidades = nuevasOportunidades;

    aplicarFiltros();
}

//Editar oportunidad
function editarOportunidad(id) {

    limpiarErrores();

    cancelarEdicionBtn.hidden = false;

    const oportunidadEditar = oportunidades.find((oportunidad) => oportunidad.id === id);

    if (!oportunidadEditar) {
        console.error('Oportunidad no encontrada');
        return;
    }
    puestoInput.value = oportunidadEditar.puesto;
    empresaInput.value = oportunidadEditar.empresa;
    fechaInput.value = oportunidadEditar.fecha;
    estadoSelect.value = oportunidadEditar.estado;
    enlaceInput.value = oportunidadEditar.enlace;
    nextInput.value = oportunidadEditar.next;

    seccionFormulario.classList.add('modo-edicion');
    formTitle.textContent = 'Editar Oportunidad';
    guardarBtn.textContent = 'Guardar cambios';

    aplicarFiltros();

    puestoInput.focus();
}

//Mostrar Pop-up
function mostrarMensaje(texto) {
    mensajeExito.textContent = texto;
    mensajeExito.classList.add('visible');

    setTimeout(() => {
        mensajeExito.classList.remove('visible');
    }, 2500);
}

//Cancelar edición
function cancelarEdicion() {
    idOportunidadEditando = null;

    limpiarFormulario();
    limpiarErrores();

    seccionFormulario.classList.remove('modo-edicion');

    formTitle.textContent = 'Nueva Oportunidad';
    guardarBtn.textContent = 'Guardar candidatura';

    cancelarEdicionBtn.hidden = true;

    aplicarFiltros();
}

//Filtros
function aplicarFiltros() {
    const terminoBusqueda = buscarInput.value.trim().toLowerCase();
    const estadoSeleccionado = filtroEstado.value;

    let oportunidadesFiltradas = oportunidades.filter((oportunidad) => {
        const coincideBusqueda =
            oportunidad.puesto.toLowerCase().includes(terminoBusqueda) ||
            oportunidad.empresa.toLowerCase().includes(terminoBusqueda);

        const coincideEstado =
            estadoSeleccionado === 'todos' ||
            oportunidad.estado === estadoSeleccionado;

        return coincideBusqueda && coincideEstado;
    });

    if (ordenarPorSeguimiento) {
        oportunidadesFiltradas = [...oportunidadesFiltradas].sort((a, b) => {
            const fechaA = new Date(a.next);
            const fechaB = new Date(b.next);

            return fechaA - fechaB;
        });
    }

    renderizarOportunidades(oportunidadesFiltradas);
}

//Limpiar errores
function limpiarErrores() {
    const campos = [
        puestoInput,
        empresaInput,
        fechaInput,
        enlaceInput,
        nextInput
    ];

    campos.forEach((input) => {
        input.classList.remove('input-error');

        if (input.nextElementSibling) {
            input.nextElementSibling.style.display = 'none';
        }
    });
}

// Crear card de oportunidad
function crearCardOportunidad(oportunidad) {

    // CARD
    const article = document.createElement('article');
    article.classList.add('oportunidad-card');


    // ESTADO VISUAL DE EDICIÓN
    if (idOportunidadEditando) {
        if (oportunidad.id === idOportunidadEditando) {
            article.classList.add('editando');
        } else {
            article.classList.add('atenuada');
        }
    }


    // INFORMACIÓN PRINCIPAL
    const info = document.createElement('div');
    info.classList.add('oportunidad-info');


    const titulo = document.createElement('h3');
    titulo.textContent = oportunidad.puesto;


    const empresa = document.createElement('p');
    empresa.classList.add('empresa');
    empresa.textContent = oportunidad.empresa;


    const candidatura = document.createElement('p');
    candidatura.textContent = 'Candidatura: ';


    const fecha = document.createElement('time');
    fecha.classList.add('time-info');
    fecha.dateTime = oportunidad.fecha;
    fecha.textContent = formatearFecha(oportunidad.fecha);

    candidatura.appendChild(fecha);


    // ENLACE
    const enlace = document.createElement('a');
    enlace.textContent = 'Ver oferta';
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';

    try {
        const url = new URL(oportunidad.enlace);

        if (url.protocol === 'http:' || url.protocol === 'https:') {
            enlace.href = url.href;
        } else {
            enlace.textContent = 'Enlace no válido';
            enlace.removeAttribute('target');
        }

    } catch {
        enlace.textContent = 'Enlace no válido';
        enlace.removeAttribute('target');
    }


    info.appendChild(titulo);
    info.appendChild(empresa);
    info.appendChild(candidatura);
    info.appendChild(enlace);


    // SEGUIMIENTO
    const seguimiento = document.createElement('div');
    seguimiento.classList.add('oportunidad-seguimiento');


    const estado = document.createElement('span');
    estado.classList.add(
        'estado',
        `estado-${oportunidad.estado}`
    );

    estado.textContent = oportunidad.estado;


    const proximoSeguimiento = document.createElement('p');
    proximoSeguimiento.textContent = 'Próximo seguimiento: ';


    const fechaSeguimiento = document.createElement('time');
    fechaSeguimiento.classList.add('time-seguimiento');
    fechaSeguimiento.dateTime = oportunidad.next;
    fechaSeguimiento.textContent = formatearFecha(oportunidad.next);

    proximoSeguimiento.appendChild(fechaSeguimiento);


    seguimiento.appendChild(estado);
    seguimiento.appendChild(proximoSeguimiento);


    // ACCIONES
    const acciones = document.createElement('div');
    acciones.classList.add('oportunidad-acciones');


    const botonEditar = document.createElement('button');
    botonEditar.classList.add('editar');
    botonEditar.dataset.id = oportunidad.id;
    botonEditar.textContent = 'Editar';


    const botonEliminar = document.createElement('button');
    botonEliminar.classList.add('eliminar');
    botonEliminar.dataset.id = oportunidad.id;
    botonEliminar.textContent = 'Eliminar';


    // Mientras haya una oportunidad en edición,
    // bloqueamos las acciones de todas las cards.
    const estaEditando = idOportunidadEditando !== null;

    botonEditar.disabled = estaEditando;
    botonEliminar.disabled = estaEditando;


    acciones.appendChild(botonEditar);
    acciones.appendChild(botonEliminar);


    // CONSTRUIR CARD
    article.appendChild(info);
    article.appendChild(seguimiento);
    article.appendChild(acciones);


    return article;
}

// Validar datos de localStorage
function esOportunidadValida(oportunidad) {
    return (
        oportunidad &&
        typeof oportunidad === 'object' &&
        typeof oportunidad.id === 'string' &&
        typeof oportunidad.puesto === 'string' &&
        typeof oportunidad.empresa === 'string' &&
        typeof oportunidad.fecha === 'string' &&
        typeof oportunidad.estado === 'string' &&
        typeof oportunidad.enlace === 'string' &&
        typeof oportunidad.next === 'string'
    );
}
function cargarOportunidades() {
    try {
        const datosGuardados = localStorage.getItem('oportunidades');

        if (!datosGuardados) {
            return [];
        }

        const datos = JSON.parse(datosGuardados);

        if (!Array.isArray(datos)) {
            console.error('Los datos guardados no tienen un formato válido.');
            return [];
        }

        const datosValidos = datos.every(esOportunidadValida);

        if (!datosValidos) {
            console.error('Hay oportunidades guardadas con datos no válidos.');
            return [];
        }

        return datos;

    } catch (error) {
        console.error('Error al cargar las oportunidades:', error);
        return [];
    }
}
function guardarOportunidades(lista) {
    try {
        localStorage.setItem(
            'oportunidades',
            JSON.stringify(lista)
        );

        return true;

    } catch (error) {
        console.error(
            'Error al guardar las oportunidades:',
            error
        );

        return false;
    }
}