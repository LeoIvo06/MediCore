import { ArrowDown, ArrowRight, BellRing, ClipboardCheck, ClipboardPlus, Stethoscope } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MediCoreBrand } from '../../shared/MediCoreBrand'
import './landing.css'

const workflows = [
  { Icon: ClipboardPlus, title: 'Reporta una falla', text: 'Enfermería registra el equipo, la ubicación y el síntoma. Biomédica recibe el reporte y puede consultar la ficha del equipo.' },
  { Icon: BellRing, title: 'Alerta a Soporte TI', text: 'Admisión envía una alerta con la ubicación y la IP de la estación. TI confirma la recepción y Admisión puede consultar ese acuse.' },
  { Icon: Stethoscope, title: 'Prioriza la atención', text: 'Servicios Generales consulta su bandeja por piso y prioridad. El área responsable revisa el detalle y marca la incidencia como resuelta.' },
]

const steps = [
  { title: 'Registrar', text: 'Describe la falla desde el perfil que la detectó.' },
  { title: 'Coordinar', text: 'El área responsable recibe el aviso y revisa el contexto.' },
  { title: 'Resolver', text: 'El equipo de atención registra el cierre en el incidente.' },
  { title: 'Revisar', text: 'Consulta la prioridad, el estado y las fechas disponibles.' },
]

export default function LandingPage() {
  useEffect(() => { document.title = 'MediCore | Gestión de incidencias hospitalarias' }, [])

  return (
    <div className="mc-landing">
      <a href="#contenido" className="mc-landing-skip">Saltar al contenido</a>
      <div className="mc-landing-masthead">
        <header className="mc-landing-wrap mc-landing-header">
          <Link to="/" aria-label="MediCore, inicio"><MediCoreBrand /></Link>
          <nav aria-label="Navegación pública">
            <a href="#solucion">Solución</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#preguntas">Preguntas</a>
          </nav>
          <Link to="/demo" className="mc-landing-header-cta">Explorar demo <ArrowRight size={16} aria-hidden="true" /></Link>
        </header>

      </div>
      <main id="contenido" tabIndex={-1}>
        <section className="mc-landing-masthead" aria-labelledby="landing-title">
          <div className="mc-landing-wrap mc-landing-hero">
          <div className="mc-landing-hero-copy">
            <div className="mc-landing-pulse" aria-hidden="true">
              <svg viewBox="0 0 88 16" fill="none">
                <path pathLength="1" d="M1 9h26l5-5 6 10 7-13 7 12 5-4h30" />
              </svg>
            </div>
            <h1 id="landing-title">Coordina las incidencias que afectan la operación hospitalaria</h1>
            <p>Centraliza los reportes, avisa al área responsable y sigue la atención desde el registro hasta la resolución.</p>
            <div className="mc-landing-actions">
              <Link to="/demo" className="mc-button mc-landing-primary">Explorar demo <ArrowRight size={18} aria-hidden="true" /></Link>
              <a href="#solucion" className="mc-landing-text-link">Conocer MediCore <ArrowDown size={17} aria-hidden="true" /></a>
            </div>
          </div>
          <figure className="mc-landing-preview">
            <img src="/medicore-bandeja-demo.jpg" alt="Bandeja real de MediCore con filtros y reportes de demostración de Servicios Generales" width="976" height="494" fetchPriority="high" />
          </figure>
          </div>
        </section>

      <section id="solucion" className="mc-landing-wrap mc-landing-section mc-landing-solution" aria-labelledby="solucion-title">
        <div>
          <h2 id="solucion-title">Cada área recibe lo que necesita para actuar</h2>
          <p>Una falla puede pasar por varias manos. MediCore conserva el identificador, la ubicación y el estado del incidente a medida que cambia de equipo.</p>
        </div>
        <ul className="mc-landing-workflows">
          {workflows.map(({ Icon, title, text }) => (
            <li key={title}>
              <Icon size={24} strokeWidth={1.6} aria-hidden="true" />
              <div><h3>{title}</h3><p>{text}</p></div>
            </li>
          ))}
        </ul>
      </section>

      <section id="como-funciona" className="mc-landing-process" aria-labelledby="flujo-title">
        <div className="mc-landing-wrap mc-landing-section">
          <h2 id="flujo-title">Del reporte a la resolución</h2>
          <ol>
            {steps.map(({ title, text }) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}
          </ol>
        </div>
      </section>

      <section id="preguntas" className="mc-landing-wrap mc-landing-section mc-landing-faq" aria-labelledby="preguntas-title">
        <div><h2 id="preguntas-title">Preguntas frecuentes</h2></div>
        <div>
          <details><summary>¿Cómo pruebo MediCore?</summary><p>Entra a la demo y usa Perfil demo para recorrer el flujo como Enfermería, Admisión, Ingeniería Biomédica, Soporte TI o Servicios Generales.</p></details>
          <details><summary>¿Qué datos se usan en la demo?</summary><p>La demostración usa datos ficticios. Los registros de prueba se guardan en la base compartida del entorno de demostración.</p></details>
          <details><summary>¿Qué puedo hacer desde el celular?</summary><p>Puedes registrar fallas, revisar avisos y consultar los incidentes disponibles para el perfil que selecciones.</p></details>
        </div>
      </section>

      <section className="mc-landing-cta">
        <div className="mc-landing-wrap mc-landing-section">
          <div><ClipboardCheck size={28} aria-hidden="true" /><h2>Prueba el recorrido de un incidente</h2></div>
          <Link to="/demo" className="mc-button mc-landing-primary">Explorar demo <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
      </main>
      <footer className="mc-landing-wrap mc-landing-footer">
        <Link to="/" aria-label="MediCore, inicio"><MediCoreBrand compact /></Link>
        <p>Proyecto académico de Ingeniería de Software · Universidad de Lima</p>
      </footer>
    </div>
  )
}
