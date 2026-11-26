// Contrato de lectura consumido por el contexto de incidencias.
// La fuente actual son fixtures locales; en la integración se conectará al API de referencias.
import { equipment, equipmentOptions, locations, stations, symptoms } from '../data/references'

export const getEquipmentOptions = () => equipmentOptions
export const getLocations = () => locations
export const getSymptoms = () => symptoms
export const getStations = () => stations
export const getEquipmentById = (id: string) => equipment.find((item) => item.id === id)
