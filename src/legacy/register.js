// scripts/register.js
    document.addEventListener('DOMContentLoaded', function () {
    /* ====== Refs ====== */
    const form = document.querySelector('.register__form');

    /* ====== Reglas y mensajes ====== */
    const regex = {
        nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
        identificacion: /^\d{7,8}[0-9Kk]$/,
        telefono: /^(9\d{8}|\+569\d{8})$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        contrsena: /^.{6,20}$/,
    };

    const mensajesError = {
        nombre: 'El nombre debe tener entre 2 y 50 caracteres (solo letras y espacios)',
        identificacion: 'El RUT debe tener 8 o 9 caracteres numéricos más dígito verificador',
        telefono: 'El teléfono debe ser chileno válido: 9 dígitos o +56 seguido de 9 dígitos',
        email: 'Ingrese un correo electrónico válido',
        contrsena: 'La contraseña debe tener entre 6 y 20 caracteres',
    };

    /* ====== Contenedor de error general (arriba del form) ====== */
    const errorGeneral = document.createElement('div');
    errorGeneral.id = 'error-general';
    Object.assign(errorGeneral.style, {
        color: 'white',
        background: 'rgba(255,0,0,0.7)',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '15px',
        display: 'none',
        textAlign: 'center',
    });
    form.prepend(errorGeneral);

    /* ====== Helpers de validación por campo ====== */
    function limpiarError(campo) {
        const viejo = campo.parentNode.querySelector('.error-mensaje');
        if (viejo) viejo.remove();
        campo.classList.remove('error');
        campo.style.borderColor = '';
    }

    function mostrarError(campo, mensaje) {
        limpiarError(campo);
        const error = document.createElement('span');
        error.className = 'error-mensaje';
        error.textContent = mensaje;
        Object.assign(error.style, {
        color: '#ff6961',
        fontSize: '0.85em',
        display: 'block',
        marginTop: '5px',
        });
        campo.parentNode.appendChild(error);
        campo.classList.add('error');
        campo.style.borderColor = '#ff6961';
    }

    function validarCampo(campo) {
        const id = campo.id;
        let valido = true;
        let mensaje = '';

        switch (id) {
        case 'nombre':
            valido = regex.nombre.test(campo.value.trim());
            mensaje = mensajesError.nombre;
            break;
        case 'identificacion':
            valido = regex.identificacion.test(campo.value.trim());
            mensaje = mensajesError.identificacion;
            break;
        case 'telefono':
            valido = regex.telefono.test(campo.value.trim());
            mensaje = mensajesError.telefono;
            break;
        case 'email':
            valido = campo.value.trim() === '' || regex.email.test(campo.value.trim());
            mensaje = mensajesError.email;
            break;
        case 'contrsena':
            valido = regex.contrsena.test(campo.value.trim());
            mensaje = mensajesError.contrsena;
            break;
        }
        if (!valido) mostrarError(campo, mensaje);
        else limpiarError(campo);
        return valido;
    }

    // Listeners por campo
    ['nombre', 'identificacion', 'telefono', 'email', 'contrsena'].forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.addEventListener('blur', () => validarCampo(input));
        input.addEventListener('input', () => limpiarError(input));
    });

    /* ====== Persistencia para enviar solicitud ====== */
    const KEY = 'gestion_usuarios_v1';
    function loadState() {
        try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return { solicitudes: [], usuarios: [] };
        const obj = JSON.parse(raw);
        return {
            solicitudes: Array.isArray(obj.solicitudes) ? obj.solicitudes : [],
            usuarios: Array.isArray(obj.usuarios) ? obj.usuarios : [],
        };
        } catch {
        return { solicitudes: [], usuarios: [] };
        }
    }
    function saveState(st) {
        localStorage.setItem(KEY, JSON.stringify(st));
    }

    /* ====== SUBMIT del formulario (AHORA SÍ) ====== */
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        errorGeneral.style.display = 'none';

        // Valida todos los campos
        let ok = true;
        ['nombre', 'identificacion', 'telefono', 'email', 'contrsena'].forEach((id) => {
        const input = document.getElementById(id);
        if (input && !validarCampo(input)) ok = false;
        });
        if (!ok) {
        errorGeneral.style.display = 'block';
        errorGeneral.textContent = 'Revisa los campos marcados en rojo.';
        return;
        }

        const nombre = document.getElementById('nombre')?.value.trim() || '';
        const rut = document.getElementById('identificacion')?.value.trim() || '';
        const correo = (document.getElementById('email')?.value || '').trim().toLowerCase();

        if (!nombre || !rut || !correo) {
        errorGeneral.style.display = 'block';
        errorGeneral.textContent = 'Completa todos los campos obligatorios.';
        return;
        }

        // Deducimos un rol por dominio (ajústalo si luego agregas selector de rol aquí)
        let rol = 'Alumno';
        if (correo.endsWith('@nac.cl')) rol = 'Coordinador';
        else if (correo.endsWith('@nacional.cl')) rol = 'Alumno';

        const st = loadState();

        // Evitar duplicados por correo
        const existe =
        st.usuarios.some((u) => (u.correo || '').toLowerCase() === correo) ||
        st.solicitudes.some((s) => (s.correo || '').toLowerCase() === correo);

        if (existe) {
        alert('Ya existe una cuenta o solicitud con este correo.');
        return;
        }

        // Crear solicitud pendiente
        const solicitud = {
        id: 'sol-' + Math.random().toString(16).slice(2, 8),
        rut,
        nombre,
        correo,
        rol,
        };
        st.solicitudes.push(solicitud);
        saveState(st);

        alert('¡Solicitud enviada! El administrador la verá en "Solicitudes pendientes".');
        form.reset();
        window.location.href = 'login.html';
    });
    });
