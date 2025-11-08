'use strict';

(() => {
    /* ===== Mostrar/ocultar contraseña ===== */
    function showHiddenPass(inputId, eyeId) {
        const input = document.getElementById(inputId);
        const eye   = document.getElementById(eyeId);
        if (!input || !eye) return;
        eye.addEventListener('click', () => {
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        eye.classList.toggle('ri-eye-line',  isPass);
        eye.classList.toggle('ri-eye-off-line', !isPass);
        });
    }
    showHiddenPass('Login-pass', 'Login-eye');

    /* ===== Estado en localStorage ===== */
    const KEY = 'gestion_usuarios_v1';
    const load = () => {
        try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return { solicitudes: [], usuarios: [] };
        const obj = JSON.parse(raw);
        return {
            solicitudes: Array.isArray(obj.solicitudes) ? obj.solicitudes : [],
            usuarios:    Array.isArray(obj.usuarios)    ? obj.usuarios    : [],
        };
        } catch { return { solicitudes: [], usuarios: [] }; }
    };

    const form = document.querySelector('.login__form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailInput = form.querySelector('input[type="email"]');
        const passInput  = document.getElementById('Login-pass');
        const emailVal = (emailInput?.value || '').trim().toLowerCase();
        const passVal  = (passInput?.value  || '');

        if (!emailVal) { alert('Ingresa tu correo.'); return; }
        if (passVal.length < 6) { alert('La contraseña debe tener al menos 6 caracteres.'); return; }

        // Rol: por querystring (?role=admin|student) o por defecto "student"
        const qs   = new URLSearchParams(location.search);
        const role = (qs.get('role') || 'student').toLowerCase();

        // Regla de dominio por rol
        const okDomain = role === 'admin'
        ? emailVal.endsWith('@nac.cl')
        : emailVal.endsWith('@nacional.cl');

        if (!okDomain) {
        alert(role === 'admin'
            ? 'Para administración usa un correo que termine en @nac.cl'
            : 'Para alumnos/docentes usa un correo que termine en @nacional.cl'
        );
        return;
        }

        const st = load();

        // 1) ¿Está pendiente?
        const pend = st.solicitudes.find(s => (s.correo || '').toLowerCase() === emailVal);
        if (pend) {
        alert('Tu cuenta está PENDIENTE de aprobación por el administrador.');
        return;
        }

        // 2) ¿Existe usuario activo?
        const u = st.usuarios.find(u => (u.correo || '').toLowerCase() === emailVal);
        if (!u) {
        alert('No encontramos tu cuenta. Regístrate primero.');
        return;
        }
        if (u.bloqueado) {
        alert('Tu cuenta está BLOQUEADA. Contacta a administración.');
        return;
        }

        // 3) OK → Redirige según rol
        const destByRole = { admin: 'admin.html', student: 'estudiantes.html' };
        const dest = destByRole[role] || 'estudiantes.html';
        window.location.href = `${dest}?role=${role}&email=${encodeURIComponent(emailVal)}`;
    });
})();
