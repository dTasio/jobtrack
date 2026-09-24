//VARIABLES
const formulario = document.querySelector('form');
const puestoInput = document.querySelector('#puesto');
const empresaInput = document.querySelector('#empresa');
const fechaInput = document.querySelector('#fecha');
const estadoSelect = document.querySelector('#estado');
const enlaceInput = document.querySelector('#enlace');
const nextInput = document.querySelector('#next');

const formTitle = document.querySelector('#form-title');
const guardarBtn = document.querySelector('#guardar-candidatura');

const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = document.querySelector('#theme-icon');

const listaOportunidades = document.querySelector('#lista-oportunidades');

let oportunidades = [];

let idOportunidadEditando = null;

//LISTENERS
themeToggle.addEventListener('click', cambiarTema);

document.addEventListener('DOMContentLoaded', () => {
    idOportunidadEditando = null;
    
    oportunidades = JSON.parse( localStorage.getItem('oportunidades') ) || [];

    renderizarOportunidades();

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
            formTitle.textContent = 'Nueva Oportunidad';
            guardarBtn.textContent = 'Guardar candidatura';
        }

        localStorage.setItem('oportunidades', JSON.stringify(oportunidades));

        renderizarOportunidades();

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
function renderizarOportunidades() {
    if (oportunidades.length === 0) {
        listaOportunidades.innerHTML = `
            <div class="estado-vacio">
                <p>Aún no hay oportunidades guardadas.</p>
                <span>Añade tu primera oportunidad desde el formulario.</span>
            </div>
        `;

        return;
    }
    const cardsHTML = oportunidades.map((oportunidad) => {
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
    renderizarOportunidades();
}

//Editar oportunidad
function editarOportunidad(id) {
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

    formTitle.textContent = 'Editar Oportunidad';
    guardarBtn.textContent = 'Guardar cambios';

    renderizarOportunidades();
}