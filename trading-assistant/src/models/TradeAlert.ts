/**
 * Raw TradingView alert payload
 */
export interface TradeAlert {
  /** e.g. 'BTCUSD' */
  symbol: string;
  /** 'long' or 'short' */
  side: 'long' | 'short';
  /** Entry price */
  entry: number;
  /** Stop loss price */
  stop: number;
  /** Target price */
  target: number;
  /** e.g. 'breakout', 'reversal', etc. */
  type: string;
  /** Optional: origin or script name */
  origin?: string;
  /** Optional: confidence breakdown */
  confidenceFactors?: Record<string, number | string>;
  /** Optional: valid until (expiry) */
  validUntil?: string;
  /** Optional: trade status */
  status?: string;
} 