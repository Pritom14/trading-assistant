"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTradeAlert = processTradeAlert;
const confidenceScorer_1 = require("./confidenceScorer");
function processTradeAlert(alert) {
    // R:R: For long: (target-entry)/abs(entry-stop), for short: (entry-target)/abs(entry-stop)
    const rr = alert.side === 'long'
        ? (alert.target - alert.entry) / Math.abs(alert.entry - alert.stop)
        : (alert.entry - alert.target) / Math.abs(alert.entry - alert.stop);
    // Simple trailing stop: halfway between entry and target
    const trailingStop = alert.entry + 0.5 * (alert.target - alert.entry);
    const confidence = (0, confidenceScorer_1.scoreConfidence)(alert, rr);
    const confidenceFactors = (0, confidenceScorer_1.explainConfidence)(alert, rr);
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
