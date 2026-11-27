import type { RecordITDiagnosisCommand } from '../../../domain/model/commands/RecordITDiagnosisCommand.js'

export function toRecordITDiagnosisCommand(body: unknown): RecordITDiagnosisCommand {
  if (!body || typeof body !== 'object') return { summary: '', responded: null }
  const data = body as Record<string, unknown>
  return {
    summary: typeof data.summary === 'string' ? data.summary.trim() : '',
    responded: typeof data.responded === 'boolean' ? data.responded : null,
  }
}
