let listaAmigos = [];
let seHaRealizadoSorteo = false;

// Función para escapar HTML y prevenir XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Validación de nombre
function validarNombre(nombre) {
    if (typeof nombre !== 'string') return false;
    const trimmed = nombre.trim();
    return trimmed !== '' && 
           trimmed.length <= 50 && 
           /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(trimmed);
}

// Normalizar nombre (capitalizar)
function normalizarNombre(nombre) {
    return nombre.trim()
                .toLowerCase()
                .split(' ')
                .filter(palabra => palabra.length > 0)
                .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
                .join(' ');
}

// Actualizar estado de los botones
function actualizarBotones() {
    const botonSortear = document.querySelector('.button-draw');
    const botonReset = document.querySelector('.button-reset');
    
    // Botón sortear solo se habilita con 2+ amigos
    if (botonSortear) {
        botonSortear.disabled = listaAmigos.length < 2;
    }
    
    // Botón reset SOLO se habilita después de un sorteo
    if (botonReset) {
        botonReset.disabled = !seHaRealizadoSorteo;
        
        // Cambiar estilo visual cuando está deshabilitado
        if (botonReset.disabled) {
            botonReset.style.opacity = '0.7';
            botonReset.style.cursor = 'not-allowed';
        } else {
            botonReset.style.opacity = '1';
            botonReset.style.cursor = 'pointer';
        }
    }
}

// Agregar amigo a la lista
function agregarAmigo() {
    try {
        const inputAmigo = document.getElementById('amigo');
        if (!inputAmigo) throw new Error('Campo de nombre no encontrado');

        const nombre = inputAmigo.value.trim();
        
        if (!validarNombre(nombre)) {
            throw new Error('Nombre inválido. Solo se permiten letras, espacios y apóstrofes'), inputAmigo.value = '';
        }
        
        const nombreNormalizado = normalizarNombre(nombre);
        
        if (listaAmigos.some(amigo => normalizarNombre(amigo) === nombreNormalizado)) {
            throw new Error('Este nombre ya está en la lista'), inputAmigo.value = '';
        }

        listaAmigos.push(nombreNormalizado);
        
        const lista = document.getElementById('listaAmigos');
        if (!lista) throw new Error('Lista de amigos no encontrada');
        
        const li = document.createElement('li');
        li.className = 'name-item';
        
        const span = document.createElement('span');
        span.textContent = nombreNormalizado;
        li.appendChild(span);
        
        const botonEliminar = document.createElement('button');
        botonEliminar.className = 'button-remove';
        botonEliminar.setAttribute('aria-label', `Eliminar ${nombreNormalizado}`);
        botonEliminar.onclick = () => eliminarAmigo(listaAmigos.length - 1);
        
        const img = document.createElement('img');
        img.src = 'assets/close.png';
        img.alt = 'Eliminar';
        botonEliminar.appendChild(img);
        li.appendChild(botonEliminar);
        
        lista.appendChild(li);
        
        inputAmigo.value = '';
        inputAmigo.focus();
        
        document.getElementById('resultado').innerHTML = '';
        actualizarBotones();
        
    } catch (error) {
        console.error('Error al agregar amigo:', error);
        alert(error.message);
    }
}

// Eliminar amigo de la lista
function eliminarAmigo(index) {
    try {
        if (!Number.isInteger(index) || index < 0 || index >= listaAmigos.length) {
            throw new Error('Índice inválido');
        }
        
        listaAmigos.splice(index, 1);
        
        const lista = document.getElementById('listaAmigos');
        if (!lista) throw new Error('Lista de amigos no encontrada');
        
        lista.innerHTML = '';
        listaAmigos.forEach((amigo, i) => {
            const li = document.createElement('li');
            li.className = 'name-item';
            li.innerHTML = `
                <span>${amigo}</span>
                <button class="button-remove" aria-label="Eliminar ${amigo}" onclick="eliminarAmigo(${i})">
                    <img src="assets/close.png" alt="Eliminar">
                </button>
            `;
            lista.appendChild(li);
        });
        
        actualizarBotones();
        
    } catch (error) {
        console.error('Error al eliminar amigo:', error);
        alert(error.message);
    }
}

// Realizar sorteo
function sortearAmigo() {
    try {
        if (listaAmigos.length < 2) {
            throw new Error('Necesitas al menos 2 amigos para realizar el sorteo');
        }
        
        const resultado = document.getElementById('resultado');
        if (!resultado) throw new Error('Área de resultados no encontrada');
        
        const amigoSecreto = listaAmigos[Math.floor(Math.random() * listaAmigos.length)];
        
        resultado.innerHTML = `
            <li class="result-item">
                <img src="assets/celebration.png" alt="Celebración">
                <p>¡El amigo secreto es: <strong>${escapeHTML(amigoSecreto)}</strong>!</p>
            </li>
        `;
        
        resultado.scrollIntoView({behavior: "smooth"});
        
        // HABILITAR BOTÓN DE REINICIO (solo aquí se activa)
        seHaRealizadoSorteo = true;
        actualizarBotones();
        
    } catch (error) {
        console.error('Error al sortear:', error);
        alert(error.message);
    }
}

// Reiniciar juego
function resetearJuego() {
    try {
        if (!seHaRealizadoSorteo) {
            throw new Error('Debes realizar al menos un sorteo antes de reiniciar');
        }
        
        if (!confirm('¿Estás seguro que quieres reiniciar todo?')) {
            return;
        }
        
        // Resetear todo
        listaAmigos = [];
        seHaRealizadoSorteo = false;
        
        // Limpiar interfaz
        document.getElementById('listaAmigos').innerHTML = '';
        document.getElementById('resultado').innerHTML = '';
        document.getElementById('amigo').value = '';
        
        // Actualizar botones (deshabilitará el de reinicio)
        actualizarBotones();
        document.getElementById('amigo').focus();
        
    } catch (error) {
        console.error('Error al reiniciar:', error);
        alert(error.message);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Configurar eventos
    document.getElementById('amigo').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') agregarAmigo();
    });
    
    // Deshabilitar ambos botones al inicio
    actualizarBotones();
});