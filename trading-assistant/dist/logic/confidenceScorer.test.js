"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const confidenceScorer_1 = require("./confidenceScorer");
describe('scoreConfidence', () => {
    const base = {
        symbol: 'BTCUSD',
        side: 'long',
        entry: 30000,
        stop: 29500,
        target: 31000,
        type: 'breakout',
    };
    it('gives higher score for higher R:R', () => {
        expect((0, confidenceScorer_1.scoreConfidence)(base, 2.5)).toBeGreaterThan((0, confidenceScorer_1.scoreConfidence)(base, 1.2));
    });
    it('gives bonus for breakout type', () => {
        const breakout = { ...base, type: 'breakout' };
        const reversal = { ...base, type: 'reversal' };
        expect((0, confidenceScorer_1.scoreConfidence)(breakout, 1.5)).toBeGreaterThan((0, confidenceScorer_1.scoreConfidence)(reversal, 1.5));
    });
    it('clamps score between 0 and 100', () => {
        expect((0, confidenceScorer_1.scoreConfidence)(base, 100)).toBeLessThanOrEqual(100);
        expect((0, confidenceScorer_1.scoreConfidence)(base, -100)).toBeGreaterThanOrEqual(0);
    });
});
