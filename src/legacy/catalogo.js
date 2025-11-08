/* Catálogo ficticio */
const productos = [
    {
        id: 'bk-001',
        titulo: 'El Principito',
        descripcion: '*El Principito* es un cuento sobre un niño que aprende lecciones sobre la vida y lo esencial.',
        stock: 12,
        imagen: 'Imagenes/El_principito.jpeg'
    },
    {
        id: 'bk-002',
        titulo: 'Misery',
        descripcion: 'Misery es sobre un escritor secuestrado por una fan obsesionada que lo mantiene cautivo.',
        stock: 7,
        imagen: 'Imagenes/misery.jpg'
    },
    {
        id: 'bk-003',
        titulo: 'Metamorfosis',
        descripcion: 'La metamorfosis cuenta la historia de un hombre que se despierta convertido en insecto y enfrenta el rechazo de su familia.',
        stock: 4,
        imagen: 'Imagenes/metamorfosis.jpeg'
    },
    {
        id: 'bk-004',
        titulo: 'Cien años de soledad',
        descripcion: 'Cien años de soledad cuenta la saga de la familia Buendía en el pueblo de Macondo, entrelazando amor, destino y soledad.',
        stock: 15,
        imagen: 'Imagenes/cien_años_de_soledad.jpeg'
    },
    {
        id: 'bk-005',
        titulo: 'Moby Dick',
        descripcion: 'Moby Dick es sobre un capitán obsesionado con cazar una ballena blanca, lo que lleva a su perdición.',
        stock: 2,
        imagen: 'Imagenes/moby_dick.jpg'
    },
    {
        id: 'bk-006',
        titulo: 'La vuelta al mundo en 80 dias',
        descripcion: 'La vuelta al mundo en 80 días es sobre un hombre que intenta dar la vuelta al mundo en 80 días para ganar una apuesta.',
        stock: 9,
        imagen: 'Imagenes/la_vuelta_al_mundo.jpg'
    },
    {
        id: 'bk-007',
        titulo: 'Condorito',
        descripcion: 'Condorito es un cómic humorístico sobre un cóndor y sus cómicas aventuras en el pueblo de Pelotillehue.',
        stock: 10,
        imagen: 'Imagenes/condorito.jpg'
    }
];

/* === SINCRONIZACIÓN CON LOCALSTORAGE (admin) === */
const CAT_KEY = 'catalogo_items';

(function bootstrapCatalog(){
    try {
        // 1) Si ya hay catálogo guardado por el admin, úsalo
        const stored = JSON.parse(localStorage.getItem(CAT_KEY) || 'null');
        if (Array.isArray(stored) && stored.length) {
        // Reemplaza el contenido del arreglo "productos" sin cambiar su referencia
        productos.splice(0, productos.length, ...stored);
        } else {
        // Si no hay nada, inicializa con el seed actual del archivo
        localStorage.setItem(CAT_KEY, JSON.stringify(productos));
        }

        // 2) Migración de stocks antiguos (si existía 'catalogo_stock')
        const old = JSON.parse(localStorage.getItem('catalogo_stock') || '[]');
        if (Array.isArray(old) && old.length) {
        for (const s of old) {
            const it = productos.find(x => x.id === s.id);
            if (it && Number.isFinite(s.stock)) it.stock = s.stock;
        }
        // Persiste el catálogo completo con stocks actualizados
        localStorage.setItem(CAT_KEY, JSON.stringify(productos));
        }
    } catch (e) {
        // si algo falla, deja el seed en memoria y no rompas la UI
    }
})();


/* Restaurar stocks guardados (persistencia local) */
(function restoreStocks() {
    try {
        const saved = JSON.parse(localStorage.getItem('catalogo_stock') || '[]');
        for (const item of saved) {
        const p = productos.find(x => x.id === item.id);
        if (p && Number.isFinite(item.stock)) p.stock = item.stock;
        }
    } catch { /* sin-op */ }
})();

const grid = document.getElementById('catalogo-grid');

function renderCatalogo() {
    if (!grid) return;
    grid.innerHTML = productos.map(p => `
        <article class="card" data-id="${p.id}">
        <img class="card__img" src="${p.imagen}" alt="Portada de ${p.titulo}"
            onerror="this.onerror=null; this.src='https://picsum.photos/seed/${p.id}/400/550';">
        <div class="card__body">
            <h3 class="card__title">${p.titulo}</h3>
            <p class="card__desc">${p.descripcion}</p>
        </div>
        <div class="card__footer">
            <span class="stock-badge">Stock: <strong id="stock-${p.id}">${p.stock}</strong></span>
            <div class="actions">
            <button class="btn btn--minus" data-action="menos" aria-label="Quitar stock">−</button>
            <button class="btn btn--plus"  data-action="mas"   aria-label="Agregar stock">+</button>
            </div>
        </div>
        </article>
    `).join('');
}

function saveStocks() {
    const compact = productos.map(({id, stock}) => ({id, stock}));
    localStorage.setItem('catalogo_stock', JSON.stringify(compact));     // compatibilidad antigua
    localStorage.setItem('catalogo_items', JSON.stringify(productos));   // estado completo sincronizado
}


renderCatalogo();

/* Delegación de eventos para + / - */
grid?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const card = btn.closest('.card');
    const id = card?.dataset.id;
    const p = productos.find(x => x.id === id);
    if (!p) return;

    if (btn.dataset.action === 'mas') p.stock++;
    else p.stock = Math.max(0, p.stock - 1);

    const badge = document.getElementById(`stock-${p.id}`);
    if (badge) badge.textContent = p.stock;

    saveStocks();
});
