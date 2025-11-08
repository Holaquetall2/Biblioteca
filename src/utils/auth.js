import { STORAGE_KEYS, getItem, setItem } from './storage'

export function getSession(){ return getItem(STORAGE_KEYS.SESION, null) }
export function isLoggedIn(){ return !!getSession() }
export function hasRole(required = []) {
  const s = getSession(); if (!s) return false;
  return required.length ? required.includes(s.rol) : true;
}
export function loginSession(user){ setItem(STORAGE_KEYS.SESION, user) }
export function logoutSession(){ setItem(STORAGE_KEYS.SESION, null) }
export function roleLabel(session){ return session?.rol ?? 'Invitado' }
