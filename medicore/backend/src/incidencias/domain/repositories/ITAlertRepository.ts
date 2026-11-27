import type { ITAlert, ITAlertDraft } from '../model/aggregates/ITAlert.js'

export interface ITAlertRepository {
  create(draft: ITAlertDraft): Promise<ITAlert>
  findByNumber(number: number): Promise<ITAlert | null>
  list(reporterId?: string): Promise<ITAlert[]>
  acknowledge(number: number): Promise<ITAlert | null>
}
