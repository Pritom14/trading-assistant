import { scoreConfidence } from './confidenceScorer';
import { TradeAlert } from '../models/TradeAlert';

describe('scoreConfidence', () => {
  const base: TradeAlert = {
    symbol: 'BTCUSD',
    side: 'long',
    entry: 30000,
    stop: 29500,
    target: 31000,
    type: 'breakout',
  };

  it('gives higher score for higher R:R', () => {
    expect(scoreConfidence(base, 2.5)).toBeGreaterThan(scoreConfidence(base, 1.2));
  });

  it('gives bonus for breakout type', () => {
    const breakout = { ...base, type: 'breakout' };
    const reversal = { ...base, type: 'reversal' };
    expect(scoreConfidence(breakout, 1.5)).toBeGreaterThan(scoreConfidence(reversal, 1.5));
  });

  it('clamps score between 0 and 100', () => {
    expect(scoreConfidence(base, 100)).toBeLessThanOrEqual(100);
    expect(scoreConfidence(base, -100)).toBeGreaterThanOrEqual(0);
  });
}); 