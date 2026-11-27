import type { ITAlert, ITAlertDraft } from '../model/aggregates/ITAlert.js'

export type ITAlertDiagnosis = Pick<ITAlert, 'diagnosisSummary' | 'diagnosisResponded' | 'diagnosedBy' | 'diagnosedAt'>

export interface ITAlertRepository {
  saveDiagnosis(number: number, data: ITAlertDiagnosis): Promise<ITAlert | null>
  resolve(number: number): Promise<ITAlert | null>
  create(draft: ITAlertDraft): Promise<ITAlert>
  findByNumber(number: number): Promise<ITAlert | null>
  list(reporterId?: string): Promise<ITAlert[]>
  acknowledge(number: number): Promise<ITAlert | null>
}
