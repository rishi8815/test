/**
 * Fraud Detection Service
 * Simulates ML scoring and rule-based checks
 */

// Mock ML Model Inference
const getMLScore = async (transactionData) => {
  // In a real scenario, this would call SageMaker Endpoint or a Python service
  // For now, we simulate a score based on random factors + heuristics
  let score = 0;
  
  // Heuristic 1: High Amount
  if (transactionData.amount > 1000) score += 20;
  if (transactionData.amount > 5000) score += 50;

  // Heuristic 2: Suspicious IP (Mock)
  if (transactionData.ipAddress === '127.0.0.1') score += 0; // Localhost is safe for dev
  
  // Random noise for ML simulation (0-10)
  score += Math.floor(Math.random() * 10);

  return Math.min(score, 100);
};

const evaluateRisk = async (transaction) => {
  const score = await getMLScore(transaction);
  let level = 'low';
  const factors = [];

  if (score > 80) {
    level = 'critical';
    factors.push('ML Model High Confidence Fraud');
  } else if (score > 50) {
    level = 'high';
    factors.push('Abnormal Transaction Value');
  } else if (score > 20) {
    level = 'medium';
  }

  return {
    score,
    level,
    factors
  };
};

module.exports = {
  evaluateRisk
};
