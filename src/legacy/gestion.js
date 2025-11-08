(() => {
    "use strict";

    /* ====== Datos de ejemplo (seed) ====== */
    const KEY = "gestion_usuarios_v1";

    const seed = {
        solicitudes: [
        { id: "sol-101", rut: "20.111.333-5", nombre: "Carla Rojas", correo: "carla@nacional.cl", rol: "Alumno" },
        { id: "sol-102", rut: "17.999.111-2", nombre: "Mario Pérez", correo: "mario@nacional.cl", rol: "Docente" },
        { id: "sol-103", rut: "13.222.444-7", nombre: "Ana Fuentes", correo: "ana@nac.cl",        rol: "Coordinador" }
        ],
        usuarios: [
        { id: "u-001", rut: "11.111.111-1", nombre: "Esteban Solis",  correo: "esteban@nacional.cl", rol: "Alumno",      activo: true,  bloqueado: false, moroso: false },
        { id: "u-002", rut: "12.222.222-2", nombre: "Paula Díaz",     correo: "paula@nacional.cl",   rol: "Docente",     activo: true,  bloqueado: false, moroso: true  },
        { id: "u-003", rut: "15.333.333-3", nombre: "Luis Torres",    correo: "luis@nac.cl",         rol: "Pañolero",    activo: true,  bloqueado: false, moroso: false },
        { id: "u-004", rut: "16.444.444-4", nombre: "María Romero",   correo: "maria@nac.cl",        rol: "Coordinador", activo: true,  bloqueado: false, moroso: false },
        { id: "u-005", rut: "19.555.555-5", nombre: "Javiera Mella",  correo: "javiera@nacional.cl", rol: "Alumno",      activo: false, bloqueado: true,  moroso: true  }
        ]
    };

    /* ====== Persistencia ====== */
    function loadState() {
        try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return structuredClone(seed);
        const obj = JSON.parse(raw);
        const st = {
            solicitudes: Array.isArray(obj.solicitudes) ? obj.solicitudes : [],
            usuarios:    Array.isArray(obj.usuarios)    ? obj.usuarios    : []
        };
        // Si está vacío (0/0), repoblamos con seed para que siempre haya ejemplos
        if (st.solicitudes.length === 0 && st.usuarios.length === 0) {
            return structuredClone(seed);
        }
        return st;
        } catch {
        return structuredClone(seed);
        }
    }

    function saveState() {
        localStorage.setItem(KEY, JSON.stringify(state));
    }

    let state = loadState();

    /* ====== Utilidades ====== */
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const genId = (pfx = "u-") => pfx + Math.random().toString(16).slice(2, 8);

    function badgeEstado(u) {
        if (u.bloqueado) return `<span class="badge badge--bloqueado">Bloqueado</span>`;
        if (u.moroso)    return `<span class="badge badge--moroso">Moroso</span>`;
        return `<span class="badge badge--activo">Activo</span>`;
    }

    // Validación mínima del correo según rol (opcional, pero útil para demo coherente)
    function correoValidoPorRol(correo, rol) {
        const email = (correo || "").toLowerCase().trim();
        if (!email.includes("@")) return false;
        const adminRoles = ["Pañolero", "Coordinador", "Jefe de Carrera"];
        const dom = email.split("@").pop();
        if (adminRoles.includes(rol)) return dom === "nac.cl";
        // alumnos/docentes
        return dom === "nacional.cl";
    }

    /* ====== Render ====== */
    const $sol = $("#solicitudes-list");
    const $mor = $("#morosos-list");

    function renderSolicitudes() {
        if (!$sol) return;
        if (state.solicitudes.length === 0) {
        $sol.innerHTML = `
            <li class="item">
            <div class="item__main">
                <div class="item__name">Sin solicitudes pendientes</div>
                <div class="item__meta">Cuando lleguen, podrás aprobar o rechazar aquí.</div>
            </div>
            </li>`;
        return;
        }
        $sol.innerHTML = state.solicitudes.map(s => `
        <li class="item" data-id="${s.id}">
            <div class="item__main">
            <div class="item__name">${s.nombre} <span class="badge badge--pendiente">Pendiente</span></div>
            <div class="item__meta">${s.rut} · ${s.correo} · ${s.rol}</div>
            </div>
            <div class="actions">
            <button class="btn btn--primary" data-action="aprobar">Aprobar</button>
            <button class="btn btn--danger"  data-action="rechazar">Rechazar</button>
            </div>
        </li>
        `).join("");
    }

    function renderMorosos() {
        if (!$mor) return;
        const foco = state.usuarios.filter(u => u.moroso || u.bloqueado);
        if (foco.length === 0) {
        $mor.innerHTML = `
            <li class="item">
            <div class="item__main">
                <div class="item__name">No hay morosos ni bloqueados</div>
                <div class="item__meta">Los usuarios con deuda o sanción aparecerán aquí.</div>
            </div>
            </li>`;
        return;
        }
        $mor.innerHTML = foco.map(u => `
        <li class="item" data-id="${u.id}">
            <div class="item__main">
            <div class="item__name">${u.nombre} ${badgeEstado(u)}</div>
            <div class="item__meta">${u.rut} · ${u.correo} · ${u.rol}</div>
            </div>
            <div class="actions">
            ${
                !u.bloqueado
                ? `<button class="btn btn--danger" data-action="bloquear">Bloquear</button>`
                : `<button class="btn btn--primary" data-action="desbloquear">Desbloquear</button>`
            }
            </div>
        </li>
        `).join("");
    }

    function renderKpis() {
        const activos    = state.usuarios.filter(u => u.activo && !u.bloqueado).length;
        const pendientes = state.solicitudes.length;
        const bloqueados = state.usuarios.filter(u => u.bloqueado).length;
        const morosos    = state.usuarios.filter(u => u.moroso).length;

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set("kpi-activos", activos);
        set("kpi-pendientes", pendientes);
        set("kpi-bloqueados", bloqueados);
        set("kpi-morosos", morosos);
    }

    function rerender() {
        renderSolicitudes();
        renderMorosos();
        renderKpis();
    }

    // Primer render
    rerender();

    /* ====== Acciones (delegación en el panel) ====== */
    $(".gestion-panel")?.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;
        const li = btn.closest(".item");
        const id = li?.dataset.id;

        // Aprobar solicitud -> pasa a usuarios activos
        if (action === "aprobar") {
        const s = state.solicitudes.find(x => x.id === id);
        if (!s) return;

        const nuevo = {
            id: genId("u-"),
            rut: s.rut,
            nombre: s.nombre,
            correo: s.correo,
            rol: s.rol,
            activo: true,
            bloqueado: false,
            moroso: false
        };

        state.usuarios.push(nuevo);
        state.solicitudes = state.solicitudes.filter(x => x.id !== id);
        saveState(); rerender();
        return;
        }

        // Rechazar solicitud -> solo borrar
        if (action === "rechazar") {
        state.solicitudes = state.solicitudes.filter(x => x.id !== id);
        saveState(); rerender();
        return;
        }

        // Bloquear usuario (y opcionalmente marcar moroso)
        if (action === "bloquear") {
        const u = state.usuarios.find(x => x.id === id);
        if (!u) return;
        const ok = confirm(`¿Bloquear a ${u.nombre}?`);
        if (!ok) return;
        const motivo = prompt("Motivo del bloqueo (ej.: Moroso por préstamo sin devolver):", "Moroso");
        u.bloqueado = true;
        if (motivo && /moros/i.test(motivo)) u.moroso = true;
        saveState(); rerender();
        return;
        }

        // Desbloquear
        if (action === "desbloquear") {
        const u = state.usuarios.find(x => x.id === id);
        if (!u) return;
        u.bloqueado = false;
        // Nota: mantenemos u.moroso según corresponda (informativo)
        saveState(); rerender();
        return;
        }
    });

    /* ====== Crear usuario ====== */
    $("#form-crear")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);

        const nombres   = (fd.get("nombres")  || "").toString().trim();
        const apellidos = (fd.get("apellidos")|| "").toString().trim();
        const nuevo = {
        id: genId("u-"),
        rut: (fd.get("rut") || "").toString().trim(),
        nombre: `${nombres} ${apellidos}`.trim(),
        correo: (fd.get("correo") || "").toString().trim().toLowerCase(),
        rol: (fd.get("rol") || "").toString(),
        activo: true,
        bloqueado: false,
        moroso: false
        };

        if (!nuevo.rut || !nuevo.nombre || !nuevo.correo || !nuevo.rol) {
        alert("Completa todos los campos.");
        return;
        }

        // Validación simple de correo por rol para mantener coherencia con el proyecto
        if (!correoValidoPorRol(nuevo.correo, nuevo.rol)) {
        const adminRoles = ["Pañolero", "Coordinador", "Jefe de Carrera"];
        const esperado = adminRoles.includes(nuevo.rol) ? "@nac.cl" : "@nacional.cl";
        alert(`El correo no coincide con el rol seleccionado.\nPara ${nuevo.rol} usa un correo que termine en ${esperado}.`);
        return;
        }

        state.usuarios.push(nuevo);
        saveState(); rerender();
        e.currentTarget.reset();
    });

    window.__gestion_dbg = {
        get state() { return state; },
        resetSeed() { localStorage.removeItem(KEY); state = loadState(); rerender(); }
    };
})();
