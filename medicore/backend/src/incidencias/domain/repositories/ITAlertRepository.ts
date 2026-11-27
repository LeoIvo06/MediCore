import type { ITAlert, ITAlertDraft } from '../model/aggregates/ITAlert.js'

export interface ITAlertRepository {
  resolve(number: number): Promise<ITAlert | null>
  create(draft: ITAlertDraft): Promise<ITAlert>
  findByNumber(number: number): Promise<ITAlert | null>
  list(reporterId?: string): Promise<ITAlert[]>
  acknowledge(number: number): Promise<ITAlert | null>
}
