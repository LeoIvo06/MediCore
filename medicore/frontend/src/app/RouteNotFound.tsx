import { Link } from 'react-router-dom'
import { Card, PageTitle } from '../shared/components'

export default function RouteNotFound() {
  return <Card className="p-5 sm:p-6">
    <PageTitle title="Página no encontrada" description="Revisa la dirección o vuelve a tu centro de control." />
    <Link to="/" className="mc-button mc-button-primary">Volver al inicio</Link>
  </Card>
}
