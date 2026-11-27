import type { CreateEquipmentIncidentCommand } from '../../../domain/model/commands/CreateEquipmentIncidentCommand.js'

export function toEquipmentIncidentCommand(body: unknown): CreateEquipmentIncidentCommand {
  const resource = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  function readId(field: keyof CreateEquipmentIncidentCommand) {
    const value = resource[field]
    return typeof value === 'string' && value.length <= 64 ? value.trim() : ''
  }

  return { equipmentId: readId('equipmentId'), locationId: readId('locationId'), symptomId: readId('symptomId') }
}
