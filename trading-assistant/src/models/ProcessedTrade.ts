import { TradeAlert } from './TradeAlert';

/**
 * Processed trade setup with computed fields
 */
export interface ProcessedTrade extends TradeAlert {
  /** User ID */
  userId?: string;
  /** Risk/reward ratio */
  rr: number;
  /** Trailing stop suggestion */
  trailingStop?: number;
  /** Confidence score (0-100) */
  confidence: number;
  /** Confidence breakdown */
  confidenceFactors?: Record<string, number | string>;
  /** Timestamp (ms since epoch) */
  timestamp?: number;
  /** Origin or script name */
  origin?: string;
  /** Trade status */
  status?: string;
  /** Delivered flag for push queue */
  delivered?: boolean;
  /** Trade creation time */
  createdAt?: string;
  /** Valid until (expiry) */
  validUntil?: string;
} 