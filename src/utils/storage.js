
export const STORAGE_KEYS = {
  CATALOGO: 'catalogo_items',
  CARRITO: 'solicitudes_tmp',
  USUARIOS: 'usuarios_registrados',
  SESION: 'usuario_sesion',
  PRESTAMOS: 'prestamos_registrados'
};

export function getItem(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : (fallback ?? null);
  } catch (e) {
    console.warn('getItem error', e);
    return fallback ?? null;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('setItem error', e);
  }
}

export function seedCatalogIfEmpty() {
  const existing = getItem(STORAGE_KEYS.CATALOGO, null);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    const defaults = [
  {
    "id": "bk-001",
    "titulo": "El Principito",
    "descripcion": "*El Principito* es un cuento sobre un niño que aprende lecciones sobre la vida y lo esencial.",
    "stock": 12,
    "imagen": "Imagenes/El_principito.jpeg"
  },
  {
    "id": "bk-002",
    "titulo": "Misery",
    "descripcion": "Misery es sobre un escritor secuestrado por una fan obsesionada que lo mantiene cautivo.",
    "stock": 7,
    "imagen": "Imagenes/misery.jpg"
  },
  {
    "id": "bk-003",
    "titulo": "Metamorfosis",
    "descripcion": "La metamorfosis cuenta la historia de un hombre que se despierta convertido en insecto y enfrenta el rechazo de su familia.",
    "stock": 4,
    "imagen": "Imagenes/metamorfosis.jpeg"
  },
  {
    "id": "bk-004",
    "titulo": "Cien años de soledad",
    "descripcion": "Cien años de soledad cuenta la saga de la familia Buendía en el pueblo de Macondo, entrelazando amor, destino y soledad.",
    "stock": 15,
    "imagen": "Imagenes/cien_años_de_soledad.jpeg"
  },
  {
    "id": "bk-005",
    "titulo": "Moby Dick",
    "descripcion": "Moby Dick es sobre un capitán obsesionado con cazar una ballena blanca, lo que lleva a su perdición.",
    "stock": 2,
    "imagen": "Imagenes/moby_dick.jpg"
  },
  {
    "id": "bk-006",
    "titulo": "La vuelta al mundo en 80 dias",
    "descripcion": "La vuelta al mundo en 80 días es sobre un hombre que intenta dar la vuelta al mundo en 80 días para ganar una apuesta.",
    "stock": 9,
    "imagen": "Imagenes/la_vuelta_al_mundo.jpg"
  },
  {
    "id": "bk-007",
    "titulo": "Condorito",
    "descripcion": "Condorito es un cómic humorístico sobre un cóndor y sus cómicas aventuras en el pueblo de Pelotillehue.",
    "stock": 10,
    "imagen": "Imagenes/condorito.jpg"
  }
];
    setItem(STORAGE_KEYS.CATALOGO, defaults);
  }
}


// === Helpers de alto nivel para la app ===
export function getUsers(){ return getItem(STORAGE_KEYS.USUARIOS, []) }
export function saveUsers(list){ setItem(STORAGE_KEYS.USUARIOS, list) }

export function getCatalog(){ return getItem(STORAGE_KEYS.CATALOGO, []) }
export function saveCatalog(list){ setItem(STORAGE_KEYS.CATALOGO, list) }

export function getLoans(){ return getItem(STORAGE_KEYS.PRESTAMOS, []) }
export function saveLoans(list){ setItem(STORAGE_KEYS.PRESTAMOS, list) }

export function addLoan({ userId, userNombre, libroId, libroTitulo, fecha = new Date().toISOString() }){
  const loans = getLoans();
  const id = 'ln-' + Math.random().toString(36).slice(2, 9);
  const nuevo = { id, userId, userNombre, libroId, libroTitulo, fecha, devuelto: false };
  saveLoans([nuevo, ...loans]);
  return nuevo;
}

export function toggleReturn(loanId, returned = true){
  const loans = getLoans().map(l => l.id === loanId ? { ...l, devuelto: returned } : l);
  saveLoans(loans);
  return loans.find(l => l.id === loanId);
}

export function deleteLoan(loanId){
  const loans = getLoans().filter(l => l.id !== loanId);
  saveLoans(loans);
}

export function upsertUser(u){
  const list = getUsers();
  const idx = list.findIndex(x => x.id === u.id);
  let result;
  if (idx >= 0){ list[idx] = { ...list[idx], ...u }; result = list[idx]; }
  else { result = { ...u, id: 'usr-' + Math.random().toString(36).slice(2,9) }; list.unshift(result); }
  saveUsers(list);
  return result;
}

export function deleteUser(id){
  const next = getUsers().filter(u => u.id !== id);
  saveUsers(next);
}

export function upsertCatalogItem(item){
  const list = getCatalog();
  const idx = list.findIndex(x => x.id === item.id);
  let result;
  if (idx >= 0){ list[idx] = { ...list[idx], ...item }; result = list[idx]; }
  else { result = { ...item, id: 'bk-' + Math.random().toString(36).slice(2,9) }; list.unshift(result); }
  saveCatalog(list);
  return result;
}

export function deleteCatalogItem(id){
  const next = getCatalog().filter(x => x.id !== id);
  saveCatalog(next);
}

export function adjustStock(id, delta){
  const list = getCatalog().map(x => x.id === id ? { ...x, stock: Math.max(0, (x.stock ?? 0) + delta) } : x);
  saveCatalog(list);
  return list.find(x => x.id === id);
}


export function seedDemoIfEmpty(){
  // usuarios demo
  const users = getUsers();
  if (!users || users.length === 0){
    const demo = [
      { id: 'usr-alex', nombre: 'Alex Rojas', email: 'alex@demo.com', clave: '1234', rol: 'Alumno' },
      { id: 'usr-cami', nombre: 'Camila Pérez', email: 'camila@demo.com', clave: '1234', rol: 'Alumno' },
      { id: 'usr-admin', nombre: 'Admin', email: 'admin@demo.com', clave: 'admin', rol: 'Admin' },
    ];
    saveUsers(demo);
  }
  // prestamos demo (si no hay)
  const loans = getLoans();
  if (!loans || loans.length === 0){
    const cat = getCatalog();
    const find = (t) => cat.find(x => x.titulo.toLowerCase().includes(t.toLowerCase()));
    const now = Date.now();
    const demoLoans = [
      { userId:'usr-alex', userNombre:'Alex Rojas', libro: find('Principito') || cat[0] },
      { userId:'usr-cami', userNombre:'Camila Pérez', libro: find('Metamorfosis') || cat[1] },
      { userId:'usr-cami', userNombre:'Camila Pérez', libro: find('Moby Dick') || cat[2] },
    ].filter(Boolean).map((x, i) => ({
      id: 'ln-demo-' + i,
      userId: x.userId,
      userNombre: x.userNombre,
      libroId: x.libro.id,
      libroTitulo: x.libro.titulo,
      fecha: new Date(now - (i+1)*86400000).toISOString(),
      devuelto: i === 0 ? true : false
    }));
    saveLoans(demoLoans);
  }
}


// ====== DEMO: si no hay préstamos, sembrar 2 alumnos y ejemplos ======
export function seedDemoLoansIfEmpty(){
  const loans = getItem(STORAGE_KEYS.PRESTAMOS, []);
  if (loans && loans.length) return;

  // dos alumnos de ejemplo
  const alumnos = [
    { id:'usr-al1', nombre:'Ana Pérez', email:'ana@example.com', clave:'1234', rol:'Alumno' },
    { id:'usr-al2', nombre:'Luis Gómez', email:'luis@example.com', clave:'1234', rol:'Alumno' },
  ];

  // fusionar si no existen
  const existing = getItem(STORAGE_KEYS.USUARIOS, []);
  const merged = [...alumnos.filter(a => !existing.some(e => e.id === a.id)), ...existing];
  setItem(STORAGE_KEYS.USUARIOS, merged);

  // catálogo por si acaso
  seedCatalogIfEmpty();
  const cat = getItem(STORAGE_KEYS.CATALOGO, []);

  function pick(id){ return cat.find(x => x.id === id) || cat[0]; }

  const now = new Date();
  const fmt = (d) => new Date(d).toISOString();

  const ej = [
    { userId: alumnos[0].id, userNombre: alumnos[0].nombre, libro: pick(cat[0]?.id), fecha: fmt(now) },
    { userId: alumnos[1].id, userNombre: alumnos[1].nombre, libro: pick(cat[1]?.id), fecha: fmt(now.getTime() - 1000*60*60*24*2) },
    { userId: alumnos[0].id, userNombre: alumnos[0].nombre, libro: pick(cat[2]?.id), fecha: fmt(now.getTime() - 1000*60*60*24*5), devuelto: true },
  ].filter(Boolean).map(e => ({
    id: 'ln-' + Math.random().toString(36).slice(2,9),
    userId: e.userId, userNombre: e.userNombre,
    libroId: e.libro?.id, libroTitulo: e.libro?.titulo,
    fecha: e.fecha, devuelto: !!e.devuelto
  }));

  setItem(STORAGE_KEYS.PRESTAMOS, ej);
}
