(function () {
    const INCLUDE_ACTIVOS_EN_TODOS = false;
    const DIAS_PRESTAMO = 7;

    const TBODY_ACTIVOS = document.getElementById('tbodyActivos');
    const EMPTY_ACTIVOS = document.getElementById('emptyActivos');
    const TBODY_TODOS   = document.getElementById('tbodyTodos');
    const EMPTY_TODOS   = document.getElementById('emptyTodos');

    function lsGet(key, fb) { try { return JSON.parse(localStorage.getItem(key)) ?? fb; } catch { return fb; } }

    // ====== NORMALIZACIÓN ======
    function normalizePrestamo(p) {
        // Soporta viejo (fechaISO) y nuevo (retiroISO/vencimientoISO)
        const retiroISO = p.retiroISO || p.fechaISO || new Date().toISOString();
        const vencimientoISO = p.vencimientoISO || addDaysISO(retiroISO, DIAS_PRESTAMO);
        const usuario = p.usuario || { id: 'N/A', nombre: 'N/A' };
        const estado = p.estado || 'activo';
        return { ...p, retiroISO, vencimientoISO, usuario, estado };
    }

    function addDaysISO(iso, days) {
        const d = new Date(iso);
        d.setDate(d.getDate() + Number(days || 0));
        return d.toISOString();
    }

    function dedupById(arr) {
        const map = new Map();
        for (const x of arr) if (x && x.id && !map.has(x.id)) map.set(x.id, x);
        return [...map.values()];
    }

    // ====== RENDER ======
    function render() {
        const activosRaw     = lsGet('prestamos_activos', []);
        const historicosRaw  = lsGet('prestamos_historicos', []);

        // Normaliza y deduplica
        const activos = dedupById(activosRaw.map(normalizePrestamo)).filter(p => p.estado === 'activo');
        const todos   = dedupById([...activosRaw, ...historicosRaw].map(normalizePrestamo));

        // ACTIVOS -> tabla 1
        if (TBODY_ACTIVOS) {
        if (!activos.length) {
            TBODY_ACTIVOS.innerHTML = '';
            if (EMPTY_ACTIVOS) EMPTY_ACTIVOS.style.display = 'block';
        } else {
            if (EMPTY_ACTIVOS) EMPTY_ACTIVOS.style.display = 'none';
            TBODY_ACTIVOS.innerHTML = activos.sort(sortByRetiroDesc).map(rowHtml).join('');
        }
        }

        // TODOS -> tabla 2 (sin activos para no duplicar, a menos que config lo pida)
        if (TBODY_TODOS) {
        const base = INCLUDE_ACTIVOS_EN_TODOS ? todos : todos.filter(p => p.estado !== 'activo');
        if (!base.length) {
            TBODY_TODOS.innerHTML = '';
            if (EMPTY_TODOS) EMPTY_TODOS.style.display = 'block';
        } else {
            if (EMPTY_TODOS) EMPTY_TODOS.style.display = 'none';
            TBODY_TODOS.innerHTML = base.sort(sortByRetiroDesc).map(rowHtml).join('');
        }
        }
    }

    function sortByRetiroDesc(a, b) {
        return new Date(b.retiroISO).getTime() - new Date(a.retiroISO).getTime();
    }

    function rowHtml(p) {
        return `
        <tr>
            <td>${escapeHtml(p.usuario?.nombre ?? 'N/A')}</td>
            <td>${escapeHtml(p.id ?? '')}</td>
            <td>${formatDT(p.retiroISO)}</td>
            <td>${formatDT(p.vencimientoISO)}</td>
            <td>${badgeForEstado(p.estado)}</td>
        </tr>
        `;
    }

    // ====== UTILIDADES UI ======
    function badgeForEstado(estado) {
        let cls = 'muted', label = 'Desconocido';
        if (estado === 'activo')   { cls = 'ok';   label = 'Activo'; }
        else if (estado === 'vencido')  { cls = 'warn'; label = 'Vencido'; }
        else if (estado === 'devuelto') { cls = 'muted'; label = 'Devuelto'; }
        return `<span class="badge ${cls}">${label}</span>`;
    }

    function formatDT(iso) {
        try { return new Date(iso).toLocaleString(); } catch { return '—'; }
    }

    function escapeHtml(s) {
        return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
    }

    // ====== AUTO-REFRESCO POR CAMBIOS EN OTRA PESTAÑA ======
    window.addEventListener('storage', (e) => {
        if (e.key === 'prestamos_activos' || e.key === 'prestamos_historicos') render();
    });

    document.addEventListener('DOMContentLoaded', render);
})();
