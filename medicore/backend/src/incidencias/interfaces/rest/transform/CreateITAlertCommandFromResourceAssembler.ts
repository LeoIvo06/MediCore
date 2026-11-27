import type { CreateITAlertCommand } from '../../../domain/model/commands/CreateITAlertCommand.js'

export function toITAlertCommand(body: unknown): CreateITAlertCommand {
  const id = body && typeof body === 'object' && 'stationId' in body ? body.stationId : undefined
  return { stationId: typeof id === 'string' && id.length <= 64 ? id.trim() : '' }
}
