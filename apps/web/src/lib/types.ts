// Re-export shared types from @acie/shared
export * from '@acie/shared';

// Web-specific types that extend shared types
import type { BlastRadiusResult as SharedBlastRadiusResult } from '@acie/shared';

// Extended BlastRadiusResult for web with trafficPerHour
export interface BlastRadiusResult extends SharedBlastRadiusResult {
  impactedServices: Array<{
    name: string;
    entryPoints: string[];
    trafficPerHour: number;
  }>;
}