"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreConfidence = scoreConfidence;
exports.explainConfidence = explainConfidence;
/**
 * Simple confidence scoring based on R:R and type
 * - R:R > 2: +30
 * - R:R > 1.5: +20
 * - R:R > 1: +10
 * - type === 'breakout': +20
 * - type === 'reversal': +10
 * - else: +0
 * - Clamp 0-100
 */
function scoreConfidence(alert, rr) {
    let score = 50;
    if (rr > 2)
        score += 30;
    else if (rr > 1.5)
        score += 20;
    else if (rr > 1)
        score += 10;
    if (alert.type === 'breakout')
        score += 20;
    else if (alert.type === 'reversal')
        score += 10;
    return Math.max(0, Math.min(100, score));
}
/**
 * Returns a breakdown of confidence factors for transparency
 */
function explainConfidence(alert, rr) {
    const factors = {};
    if (rr > 2)
        factors.rrRatio = '+30';
    else if (rr > 1.5)
        factors.rrRatio = '+20';
    else if (rr > 1)
        factors.rrRatio = '+10';
    else
        factors.rrRatio = '+0';
    if (alert.type === 'breakout')
        factors.pattern = '+20';
    else if (alert.type === 'reversal')
        factors.pattern = '+10';
    else
        factors.pattern = '+0';
    factors.base = '+50';
    return factors;
}
