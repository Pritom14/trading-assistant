import { TradeAlert } from '../models/TradeAlert';
import { ProcessedTrade } from '../models/ProcessedTrade';
import { scoreConfidence, explainConfidence } from './confidenceScorer';

export function processTradeAlert(alert: TradeAlert): ProcessedTrade {
  // R:R: For long: (target-entry)/abs(entry-stop), for short: (entry-target)/abs(entry-stop)
  const rr = alert.side === 'long'
    ? (alert.target - alert.entry) / Math.abs(alert.entry - alert.stop)
    : (alert.entry - alert.target) / Math.abs(alert.entry - alert.stop);
  // Simple trailing stop: halfway between entry and target
  const trailingStop = alert.entry + 0.5 * (alert.target - alert.entry);
  const confidence = scoreConfidence(alert, rr);
  const confidenceFactors = explainConfidence(alert, rr);

  return {
    ...alert,
    rr,
    trailingStop,
    confidence,
    confidenceFactors,
    createdAt: new Date().toISOString(),
    status: alert.status || 'active',
    delivered: false,
    validUntil: alert.validUntil,
    origin: alert.origin,
  };
} 