// Configuración
const CONFIG = {
    apiUrl: 'https://script.google.com/macros/s/AKfycbyyZJdwiDo6-JTBkOE8H881vChIMVLPsODFqX8iHl5wYFXgPQL6W-y3Be5L3A7UMsly/exec',
    accion: 'consultar'
};

// Elementos del DOM
const formulario = document.getElementById('formulario');
const inputNumero = document.getElementById('numero');
const inputPassword = document.getElementById('password');
const divResultado = document.getElementById('resultado');
const divLoading = document.getElementById('loading');
const btnSubmit = formulario.querySelector('button');

// Eventos
formulario.addEventListener('submit', consultarNumero);

/**
 * Consulta un número en el Google Apps Script
 * @param {Event} e - Evento del formulario
 */
async function consultarNumero(e) {
    e.preventDefault();

    const numero = inputNumero.value.trim();
    const password = inputPassword.value.trim();

    // Validaciones
    if (!numero) {
        mostrarError('Por favor ingresa un número válido');
        return;
    }
    if (!password) {
        mostrarError('La contraseña es obligatoria');
        return;
    }

    // Construir URL con contraseña
    const url = `${CONFIG.apiUrl}?accion=${CONFIG.accion}&num=${encodeURIComponent(numero)}&pass=${encodeURIComponent(password)}`;

    // Mostrar loading
    mostrarCargando(true);
    btnSubmit.disabled = true;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const resultado = data[0];
            // verificar contraseña localmente contra columna2
            const valorCol2 = resultado.columna2 !== undefined ? String(resultado.columna2) : '';
            if (password !== valorCol2) {
                mostrarError('Contraseña incorrecta');
            } else {
                mostrarResultado(resultado);
                // limpiar ambos campos para la próxima consulta
                inputNumero.value = '';
                inputPassword.value = '';
            }
        } else {
            mostrarError('Número no encontrado');
        }
    } catch (error) {
        mostrarError(`Error: ${error.message}`);
    } finally {
        mostrarCargando(false);
        btnSubmit.disabled = false;
        // siempre dejar el rut listo para escribir, contraseña limpia
        inputNumero.focus();
        inputPassword.value = '';
    }
}

/**
 * Muestra el resultado en una tabla
 * @param {Object} datos - Datos del resultado
 */
function mostrarResultado(datos) {
    let html = '<h3>✓ Resultado</h3>';
    html += '<table>';

    // Mapeo de nombres de columnas para mostrar mejor
    const etiquetas = {
        'accion': 'Acción',
        'num': 'Rut',
        'columna2': 'Contraseña',
        'columna3': 'Número',
        'columna4': 'Nombre',
        'columna5': 'Ganado',
        'columna6': 'Descuento',
        'columna7': 'A Pagar',
        'columna8': 'Valor punto',
        'columna9': 'Falla 1',
        'columna10': 'Falla 2',
        'columna11': 'Falla 3',
        'columna12': 'Falla 4',
        'columna13': 'Fecha actualización',
    };

    for (const [key, value] of Object.entries(datos)) {
        // ocultar columnas no deseadas
        if (key === 'accion' || key === 'columna2' || key === 'columna14') {
            continue;
        }

        const etiqueta = etiquetas[key] || key;
        html += `<tr>
                    <td>${etiqueta}</td>
                    <td>${formatearValor(value)}</td>
                </tr>`;
    }

    html += '</table>';

    divResultado.innerHTML = html;
    divResultado.className = 'resultado activo exito';
}

/**
 * Muestra un mensaje de error
 * @param {string} mensaje - Mensaje de error
 */
function mostrarError(mensaje) {
    divResultado.innerHTML = `<h3>✗ Error</h3><p>${mensaje}</p>`;
    divResultado.className = 'resultado activo error';
}

/**
 * Muestra/oculta el indicador de carga
 * @param {boolean} activo - Estado del loading
 */
function mostrarCargando(activo) {
    if (activo) {
        divLoading.classList.add('active');
        divResultado.className = 'resultado';
    } else {
        divLoading.classList.remove('active');
    }
}

/**
 * Formatea un valor para mejor visualización
 * @param {*} valor - Valor a formatear
 * @returns {string} Valor formateado
 */
function formatearValor(valor) {
    if (valor === null || valor === undefined) {
        return '<em>Sin datos</em>';
    }
    
    if (typeof valor === 'number') {
        return valor.toLocaleString('es-ES');
    }
    
    return String(valor);
}

// Permitir consultar con Enter
inputNumero.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        formulario.dispatchEvent(new Event('submit'));
    }
});

