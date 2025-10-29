import type { ArbitragePath } from "@shared/schema";
import crypto from "crypto";

export function generateOpportunityFingerprint(path: ArbitragePath): string {
  const sortedExchanges = [...path.exchanges].sort();
  const sortedPairs = [...path.pairs].sort();
  
  const effectiveSpread = path.prices.length > 0
    ? Math.abs(path.prices[path.prices.length - 1] - path.prices[0])
    : 0;
  
  const roundedSpread = Math.round(effectiveSpread * 10000) / 10000;
  
  const fingerprintComponents = [
    path.type,
    sortedExchanges.join(','),
    sortedPairs.join(','),
    roundedSpread.toString(),
  ];
  
  const fingerprintString = fingerprintComponents.join('|');
  
  return crypto
    .createHash('sha256')
    .update(fingerprintString)
    .digest('hex')
    .substring(0, 32);
}

export function shouldExecuteRepeatTrade(
  stats: {
    executionCount: number;
    cumulativeExposure: number | string;
    lastExecutedAt: Date | null;
    sequentialExecutions: number;
    lastSequentialResetAt: Date | null;
  } | null,
  settings: {
    enableRepeatAutotrade: boolean;
    maxSequentialExecutions: number;
    maxExecutionsPerOpportunity: number;
    maxExposurePerOpportunity: number | string;
    minCooldownMs: number;
  },
  tradeAmount: number
): { allowed: boolean; reason?: string } {
  if (!settings.enableRepeatAutotrade) {
    return { allowed: false, reason: 'Repeat auto-trade is disabled' };
  }

  if (!stats) {
    return { allowed: true };
  }

  const now = Date.now();
  const maxExposureNum = typeof settings.maxExposurePerOpportunity === 'string'
    ? parseFloat(settings.maxExposurePerOpportunity)
    : settings.maxExposurePerOpportunity;
  const cumulativeExposureNum = typeof stats.cumulativeExposure === 'string'
    ? parseFloat(stats.cumulativeExposure)
    : stats.cumulativeExposure;

  if (stats.executionCount >= settings.maxExecutionsPerOpportunity) {
    return {
      allowed: false,
      reason: `Max executions per opportunity reached (${settings.maxExecutionsPerOpportunity})`
    };
  }

  const newCumulativeExposure = cumulativeExposureNum + tradeAmount;
  if (newCumulativeExposure > maxExposureNum) {
    return {
      allowed: false,
      reason: `Max exposure per opportunity would be exceeded ($${maxExposureNum})`
    };
  }

  const cooldownThreshold = now - settings.minCooldownMs;
  const lastExecutedTime = stats.lastExecutedAt ? stats.lastExecutedAt.getTime() : 0;
  
  if (lastExecutedTime > cooldownThreshold) {
    const remainingCooldown = Math.ceil((settings.minCooldownMs - (now - lastExecutedTime)) / 1000);
    return {
      allowed: false,
      reason: `Cooldown period active (${remainingCooldown}s remaining)`
    };
  }

  const resetThreshold = now - (settings.minCooldownMs * 10);
  const lastResetTime = stats.lastSequentialResetAt ? stats.lastSequentialResetAt.getTime() : 0;
  
  const currentSequentialCount = lastResetTime > resetThreshold
    ? stats.sequentialExecutions
    : 0;

  if (currentSequentialCount >= settings.maxSequentialExecutions) {
    return {
      allowed: false,
      reason: `Max sequential executions reached (${settings.maxSequentialExecutions})`
    };
  }

  return { allowed: true };
}
