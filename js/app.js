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
    
    oportunidades = JSON.parse( localStorage.getItem('oportunidades') ) || [];

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

    if (puestoValido && empresaValida && fechaValida && enlaceValido && nextValido) {
        
        const puesto = puestoInput.value.trim();
        const empresa = empresaInput.value.trim();
        const fecha = fechaInput.value;
        const estado = estadoSelect.value;
        const enlace = enlaceInput.value.trim();
        const next = nextInput.value;

        const estabaEditando = idOportunidadEditando !== null;

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

            oportunidades.push(oportunidad);

        
        }else{
            const indice = oportunidades.findIndex(oportunidad => oportunidad.id === idOportunidadEditando);

            oportunidades[indice] = {
                id: idOportunidadEditando,
                puesto,
                empresa,
                fecha,
                estado,
                enlace,
                next
            };

            idOportunidadEditando = null;
            seccionFormulario.classList.remove('modo-edicion');
            formTitle.textContent = 'Nueva Oportunidad';
            guardarBtn.textContent = 'Guardar candidatura';
            cancelarEdicionBtn.hidden = true;
        }

        if (estabaEditando) {
            mostrarMensaje('Oportunidad actualizada correctamente.');
        } else {
            mostrarMensaje('Oportunidad guardada correctamente.');
        }

        localStorage.setItem('oportunidades', JSON.stringify(oportunidades));

        renderizarOportunidades(oportunidades);

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

        const confirmar = confirm('¿Seguro que quieres editar esta oportunidad?');

        if (!confirmar) {
            return;
        }

        idOportunidadEditando = id;

        editarOportunidad(id);
    }
});

//FUNCIONES

// Validar campos
function validarCampo(input) {
    const valor = input.value.trim();
    if (!valor) {
        input.classList.add('input-error');
        input.nextElementSibling.style.display = 'block';
        return false;
    }
    input.classList.remove('input-error');
    input.nextElementSibling.style.display = 'none';
    return true;
}

//Renderizar oportunidades
function renderizarOportunidades(lista) {
    if (lista.length === 0) {
        if (oportunidades.length === 0) {
            listaOportunidades.innerHTML = `
                <div class="estado-vacio">
                    <p>Aún no hay oportunidades guardadas.</p>
                    <span>Añade tu primera oportunidad desde el formulario.</span>
                </div>
            `;
        } else {
            listaOportunidades.innerHTML = `
                <div class="estado-vacio">
                    <p>No se encontraron oportunidades.</p>
                    <span>Prueba a cambiar la búsqueda o los filtros.</span>
                </div>
            `;
        }

        return;
    }
    const cardsHTML = lista.map((oportunidad) => {
        let claseEdicion = '';

        if (idOportunidadEditando) {
            if (oportunidad.id === idOportunidadEditando) {
                claseEdicion = 'editando';
            } else {
                claseEdicion = 'atenuada';
            }
        }

        const estaEditando = idOportunidadEditando !== null;
        const esLaEditada = oportunidad.id === idOportunidadEditando;

        const botonesDesactivados =
        estaEditando && !esLaEditada ? 'disabled' : '';
        
        return `
            <article class="oportunidad-card ${claseEdicion}">
                <div class="oportunidad-info">
                    <h3>${oportunidad.puesto}</h3>
                    <p class="empresa">${oportunidad.empresa}</p>
                    <p>Candidatura: <time class="time-info" datetime="${oportunidad.fecha}">${formatearFecha(oportunidad.fecha)}</time></p>
                    <a href="${oportunidad.enlace}" target="_blank" rel="noopener noreferrer">Ver Oferta</a>
                </div>
                <div class="oportunidad-seguimiento">
                    <span class="estado estado-${oportunidad.estado}">${oportunidad.estado}</span>
                    <p>Proximo seguimiento: <time class="time-seguimiento" datetime="${oportunidad.next}">${formatearFecha(oportunidad.next)}</time></p>


                </div>
                <div class="oportunidad-acciones">
                    <button class="editar" data-id="${oportunidad.id}" ${botonesDesactivados}>Editar</button>
                    <button class="eliminar" data-id="${oportunidad.id}" ${botonesDesactivados}>Eliminar</button>
                </div>
            </article>
        `
    }).join('');
    listaOportunidades.innerHTML = cardsHTML;
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
    oportunidades = oportunidades.filter((oportunidad) => oportunidad.id !== id);
    localStorage.setItem('oportunidades', JSON.stringify(oportunidades));
    renderizarOportunidades(oportunidades);
}

//Editar oportunidad
function editarOportunidad(id) {
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

    renderizarOportunidades(oportunidades);
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

    seccionFormulario.classList.remove('modo-edicion');

    formTitle.textContent = 'Nueva Oportunidad';
    guardarBtn.textContent = 'Guardar candidatura';

    cancelarEdicionBtn.hidden = true;

    renderizarOportunidades(oportunidades);
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