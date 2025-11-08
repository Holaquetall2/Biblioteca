// --------- Utils ----------
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[m]));
}    

function showConfirmSolicitud(items){
    const overlay = document.getElementById('confirm-solicitud');
    const listEl  = document.getElementById('confirm-list');
    const btnOk   = document.getElementById('confirm-ok');
    if(!overlay || !listEl) return;

    listEl.innerHTML = items.map(i =>
        `<li><span>${escapeHtml(i.titulo)}</span><strong>x${i.cantidad}</strong></li>`
    ).join('');

    overlay.hidden = false;

    const close = () => { overlay.hidden = true; document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if(e.key === 'Escape') close(); };

    btnOk?.addEventListener('click', close, { once:true });
    overlay.addEventListener('click', (e)=>{ if(e.target === overlay) close(); }, { once:true });
    document.addEventListener('keydown', onKey);
}

// Refresca badges "Disponible / Sin stock" y deshabilita botones al alcanzar tope
function refreshCatalogBadges(){
    const catalogo = lsGet('catalogo_items', []);
    const cart = (typeof getSolicitud === 'function') ? getSolicitud()
                : (typeof getCarritoSolicitud === 'function') ? getCarritoSolicitud()
                : [];
    const qtyMap = new Map(cart.map(x => [String(x.id), Number(x.qty || 0)]));

    document.querySelectorAll('.stock-btn[data-id]').forEach(btn => {
        const id = btn.getAttribute('data-id');
        const libro = catalogo.find(it => String(it.id) === String(id));
        const stock = Number(libro?.stock || 0);
        const enCarrito = qtyMap.get(String(id)) || 0;
        const remaining = Math.max(0, stock - enCarrito);

        // Actualiza botón
        btn.disabled = remaining <= 0;

        // Actualiza badge
        const badge = btn.parentElement ? btn.parentElement.querySelector('.stock-badge') : null;
        if (badge) {
        badge.textContent = remaining > 0 ? 'Disponible' : 'Sin stock';
        badge.classList.toggle('ok',   remaining > 0);
        badge.classList.toggle('zero', remaining <= 0);
        }
    });
}


    document.addEventListener('DOMContentLoaded', () => {
    const GRID = document.getElementById('catalogo-grid');
    const CART_KEY = 'solicitud_panol'; // [{ id, qty }]


    init();

    async function init() {
        const items = await loadProductos();
        render(items);
    }

    // --------- DATA ----------
    async function loadProductos() {
        // 1) Intentar leer el catálogo completo que guarda el admin
        try {
            const base = JSON.parse(localStorage.getItem('catalogo_items') || 'null');
            if (Array.isArray(base) && base.length) {
            // Si además existiera un viejo 'catalogo_stock', actualiza por si acaso
            const stock = JSON.parse(localStorage.getItem('catalogo_stock') || '[]');
            if (Array.isArray(stock) && stock.length) {
                const map = new Map(stock.map(s => [s.id, s.stock]));
                base.forEach(it => {
                if (map.has(it.id)) it.stock = map.get(it.id);
                });
            }
            return base;
            }
        } catch {}

        // 2) Fallback (si aún no hay nada guardado): usa el seed embebido en esta página
        //    (si no tienes seed aquí, podrías devolver [] o construir uno mínimo)
        return [];
    }


    // --------- RENDER ----------
    function render(items) {
        if (!GRID) return;
        GRID.innerHTML = '';

        if (!items || !items.length) {
        GRID.innerHTML = '<p style="opacity:.7;padding:14px;">No hay productos disponibles.</p>';
        return;
        }

        for (const it of items) GRID.appendChild(card(it));
    }

    // Estructura de la CARD igual a admin (clases compatibles con tu admin.css)
    function card(p) {
        const cart = getSolicitud ? getSolicitud() : [];
        const enCarrito = Number((cart.find(x => String(x.id) === String(p.id))?.qty) || 0);
        const remaining = Math.max(0, Number(p.stock || 0) - enCarrito);
        const disponible = remaining > 0;
        const titulo = p.titulo || p.nombre || p.id;
        const desc   = p.descripcion || '';

        const el = document.createElement('article');
        el.className = 'card';

        el.innerHTML = `
        <div class="card__cover">
            <img class="card__img"
                src="${p.imagen || ''}"
                alt="Portada de ${escapeHtml(titulo)}"
                onerror="this.onerror=null; this.src='https://picsum.photos/seed/${p.id}/400/600';">
        </div>

        <div class="card__content">
            <h3 class="card__title">${escapeHtml(titulo)}</h3>
            <p class="card__desc">${escapeHtml(desc)}</p>

            <div class="card__footer">
            <span class="stock-badge ${disponible ? 'ok' : 'zero'}">
                ${disponible ? 'Disponible' : 'Sin stock'}
            </span>

            <button class="btn stock-btn" ${disponible ? '' : 'disabled'} data-id="${p.id}">
                Agregar a solicitud
            </button>
            </div>
        </div>
        `;

        el.querySelector('.stock-btn')?.addEventListener('click', () => {
            addToSolicitud(p.id);
            // Extra por si en algún momento cambias addToSolicitud:
            if (typeof renderCarritoList === 'function') renderCarritoList();
            if (typeof updateCarritoCountUI === 'function') updateCarritoCountUI();
            refreshCatalogBadges && refreshCatalogBadges();
        });

        return el;
    }

    function addToSolicitud(id) {
        const list = getSolicitud();
        const i = list.findIndex(x => String(x.id) === String(id));

        // Lee el stock real desde el catálogo
        const catalogo = lsGet('catalogo_items', []);
        const libro = catalogo.find(it => String(it.id) === String(id));
        const maxStock = Number(libro?.stock || 0);

        // Si no hay stock, avisa y detén
        if (maxStock <= 0) {
            if (typeof toast === 'function') toast('Sin stock disponible');
            return;
        }

        // Cantidad actual en carrito
        const actual = i > -1 ? Number(list[i].qty || 0) : 0;

        // Si ya alcanzaste el stock, avisa y detén
        if (actual >= maxStock) {
            if (typeof toast === 'function') toast('Ya alcanzaste el stock disponible');
            return;
        }

        // Suma sin pasarte del stock
        const nueva = Math.min(maxStock, actual + 1);
        if (i > -1) list[i].qty = nueva; else list.push({ id, qty: nueva });

        localStorage.setItem(CART_KEY, JSON.stringify(list));

        // Repinta carrito y contador
        if (typeof renderCarritoList === 'function') renderCarritoList();
        if (typeof updateCarritoCountUI === 'function') updateCarritoCountUI();
        }

    function getSolicitud() {
        try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
        catch { return []; }
    }

    let tt;
    function toast(msg) {
        let t = document.getElementById('toast');
        if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.className = 'toast';
        document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.display = 'block';
        t.style.transform = 'translateY(0)';
        t.style.opacity = '1';
        clearTimeout(tt);
        tt = setTimeout(() => {
        t.style.transform = 'translateY(16px)';
        t.style.opacity = '0';
        }, 1400);
    }
    // Refrescar automáticamente si el admin actualiza el catálogo en otra pestaña
    window.addEventListener('storage', (e) => {
        if (e.key === 'catalogo_items' || e.key === 'catalogo_stock') {
            loadProductos().then(render);
        }
    });

    });

    /* ======= EXTENSIÓN: Enviar carrito como “préstamo activo” para Admin ======= */

    // Helpers locales muy pequeños (no chocan con lo que ya tienes)
    function lsGet(key, fb){ try{ return JSON.parse(localStorage.getItem(key)) ?? fb; }catch(_){ return fb; } }
    function lsSet(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

    // Reutilizamos tu carrito existente
    function getCarritoSolicitud(){
    return lsGet('solicitud_panol', []); // [{ id, qty }]
    }
    function setCarritoSolicitud(list){
        lsSet('solicitud_panol', list);
    }

    // Resuelve items del carrito contra el catálogo para obtener título/stock
    function resolverItemsConCatalogo(items){
        const catalogo = lsGet('catalogo_items', []);
        const map = new Map(catalogo.map(it => [String(it.id), it]));
        const resueltos = [];

        for(const it of items){
            const libro = map.get(String(it.id));
            if(!libro) continue;
            const stock = Number(libro.stock || 0);
            const qty = Math.max(1, Math.min(Number(it.qty||1), stock || Number(it.qty||1)));
            resueltos.push({
                id: libro.id,
                titulo: libro.titulo || `Libro #${libro.id}`,
                cantidad: qty,
                stock
            });
        }
        return resueltos.filter(x => x.cantidad > 0);
    }

    function generarIdPrestamo(){
        const d = new Date();
        const id = `PRE-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}-${Math.floor(Math.random()*1000)}`;
        return id;
    }

    // Si tu login guarda info de usuario en LS, intenta rescatarla (no rompe si no existe)
    function getUsuarioActual(){
        return lsGet('usuario_actual', null) || lsGet('sesion_activa', null) || { id:'anon', nombre:'Estudiante' };
    }

    // Actualiza contador del carrito en UI (si existe el span)
    function updateCarritoCountUI(){
        const el = document.getElementById('carrito-count');
        if(!el) return;
        const total = getCarritoSolicitud().reduce((acc, it) => acc + Number(it.qty||0), 0);
        el.textContent = total;
        const btn = document.getElementById('carrito-enviar');
        if(btn) btn.disabled = total === 0;
    }

    // Disminuye stock del catálogo (opcional pero útil para reflejarlo en el estudiante)
    function descontarStockCatalogo(items){
        const catalogo = lsGet('catalogo_items', []);
        const mapSolic = new Map(items.map(i => [String(i.id), Number(i.cantidad)]));
        const actualizado = catalogo.map(lib => {
            const restar = mapSolic.get(String(lib.id)) || 0;
            return { ...lib, stock: Math.max(0, Number(lib.stock||0) - restar) };
        });
        lsSet('catalogo_items', actualizado);
    }

    // Botón “Enviar solicitud” -> Empuja en prestamos_activos y limpia el carrito
    document.addEventListener('DOMContentLoaded', () => {
        updateCarritoCountUI();

        const btnEnviar = document.getElementById('carrito-enviar');
        if(!btnEnviar) return;

        btnEnviar.addEventListener('click', () => {
            const carrito = getCarritoSolicitud();
            if(!carrito.length){
                if (typeof toast === 'function') toast('El carrito está vacío'); else alert('El carrito está vacío');
                return;
            }

            // Resolver contra catálogo (para títulos y cantidades)
            const items = resolverItemsConCatalogo(carrito);
            if(!items.length){
                if (typeof toast === 'function') toast('No hay ítems válidos'); else alert('No hay ítems válidos');
                return;
            }

            // Construir y guardar préstamo activo
            const prestamos = lsGet('prestamos_activos', []);
            const nuevo = {
                id: generarIdPrestamo(),
                fechaISO: new Date().toISOString(),
                estado: 'activo',
                usuario: getUsuarioActual(),
                items: items.map(i => ({ id: i.id, titulo: i.titulo, cantidad: i.cantidad }))
            };
            prestamos.push(nuevo);
            lsSet('prestamos_activos', prestamos);

            // (Opcional) descontar stock en la vista del estudiante
            descontarStockCatalogo(items);

            // Limpiar carrito y repintar
            setCarritoSolicitud([]);
            renderCarritoList && renderCarritoList();
            updateCarritoCountUI && updateCarritoCountUI();
            refreshCatalogBadges && refreshCatalogBadges();

            // 🟢 Mostrar el modal de confirmación con lo solicitado
            showConfirmSolicitud(items.map(i => ({ titulo: i.titulo, cantidad: i.cantidad })));
            });


        // Si se modifica LS en otra pestaña, actualiza contador
        window.addEventListener('storage', (e) => {
            if (e.key === 'solicitud_panol') updateCarritoCountUI();
        });
    });

    /* ====== Render de carrito con lista ====== */
    function renderCarritoList(){
        const ul = document.getElementById('carrito-list');
        if(!ul) return;

        const items = resolverItemsConCatalogo(getCarritoSolicitud()); // [{id,titulo,cantidad,stock}]
        if(!items.length){
            ul.innerHTML = `<li class="carrito__item"><span class="carrito__title">No hay libros en el carrito.</span></li>`;
            updateCarritoCountUI();
            return;
        }

        ul.innerHTML = items.map(i => `
            <li class="carrito__item" data-id="${i.id}">
            <span class="carrito__title">${escapeHtml(i.titulo)}</span>
            <div class="carrito__qty">
                <button class="carrito__btn" data-action="dec" aria-label="Disminuir">−</button>
                <span class="carrito__n">${i.cantidad}</span>
                <button class="carrito__btn" data-action="inc" aria-label="Aumentar">+</button>
                <button class="carrito__btn carrito__rm" data-action="rm" aria-label="Quitar">&times;</button>
            </div>
            </li>
        `).join('');

        updateCarritoCountUI();
    }

    // Delegación de eventos sobre la lista (inc/dec/remove)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.carrito__btn');
        if(!btn) return;

        const li = btn.closest('.carrito__item');
        if(!li) return;

        const id = li.dataset.id;
        const action = btn.dataset.action;
        let cart = getCarritoSolicitud();
        const idx = cart.findIndex(x => String(x.id) === String(id));
        if(idx < 0) return;

        // Respetar stock máximo
        const catalogo = lsGet('catalogo_items', []);
        const map = new Map(catalogo.map(it => [String(it.id), Number(it.stock || 0)]));
        const maxStock = map.get(String(id)) ?? Infinity;

        if(action === 'inc'){
            cart[idx].qty = Math.min(maxStock, Number(cart[idx].qty || 1) + 1);
        } else if(action === 'dec'){
            cart[idx].qty = Math.max(1, Number(cart[idx].qty || 1) - 1);
        } else if(action === 'rm'){
            cart.splice(idx, 1);
        }

        setCarritoSolicitud(cart);
        renderCarritoList();
        refreshCatalogBadges && refreshCatalogBadges();
    });

    // Pintar la lista al cargar
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof renderCarritoList === 'function') renderCarritoList();
        if (typeof updateCarritoCountUI === 'function') updateCarritoCountUI();
    });

