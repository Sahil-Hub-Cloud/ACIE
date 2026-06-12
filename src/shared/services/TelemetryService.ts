import { AuditRecord } from '../types';

export class TelemetryService {
  static async getHistory(): Promise<AuditRecord[]> {
    throw new Error('Not implemented');
  }
}
