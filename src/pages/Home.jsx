import { useEffect } from 'react'
import { seedCatalogIfEmpty, seedDemoIfEmpty } from '../utils/storage'
import '../styles/home.css'

export default function Home() {
  useEffect(() => { seedCatalogIfEmpty, seedDemoIfEmpty() }, [])
  return (
    <section>
      <h1 className='bienvenido'>Bienvenido a la Biblioteca 📚</h1>
    </section>
  )
}