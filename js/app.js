const formulario = document.querySelector('form');
const puestoInput = document.querySelector('#puesto');
const empresaInput = document.querySelector('#empresa');
const fechaInput = document.querySelector('#fecha');
const estadoSelect = document.querySelector('#estado');
const enlaceInput = document.querySelector('#enlace');
const nextInput = document.querySelector('#next');

let oportunidades = [];

document.addEventListener('DOMContentLoaded', () => {
          oportunidades = JSON.parse( localStorage.getItem('oportunidades') ) || []  ;
          console.log(oportunidades);
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
        localStorage.setItem('oportunidades', JSON.stringify(oportunidades));
        console.log('Oportunidades:', oportunidades);

        limpiarFormulario();


    }

});

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

//Limpiar formulario
function limpiarFormulario() {
    formulario.reset();
}

//Generar ID
function generarId() {
    return Math.random().toString(36).substring(2) + Date.now()
}