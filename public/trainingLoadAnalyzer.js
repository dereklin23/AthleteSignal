// Training Load & Recovery Analysis Module
// Calculates ACWR, recovery scores, and provides training recommendations

class TrainingLoadAnalyzer {
  constructor() {
    this.acuteWindow = 7;    // Last 7 days
    this.chronicWindow = 28;  // Last 28 days (4 weeks)
    this.optimalACWR = { min: 0.8, max: 1.3 };
    this.highRiskACWR = 1.5;
  }

  /**
   * Calculate Acute:Chronic Workload Ratio (ACWR)
   * Acute = average daily load over last 7 days
   * Chronic = average daily load over last 28 days
   * Optimal ACWR: 0.8 - 1.3 (safe zone)
   * > 1.5 = high injury risk
   */
  calculateACWR(data) {
    if (!data || data.length < this.acuteWindow) {
      return null;
    }

    const today = new Date();
    const acuteStart = new Date(today);
    acuteStart.setDate(today.getDate() - this.acuteWindow);
    
    const chronicStart = new Date(today);
    chronicStart.setDate(today.getDate() - this.chronicWindow);

    // Filter data for windows
    const acuteData = data.filter(d => {
      const date = new Date(d.date);
      return date >= acuteStart && date <= today;
    });

    const chronicData = data.filter(d => {
      const date = new Date(d.date);
      return date >= chronicStart && date <= today;
    });

    if (chronicData.length === 0) {
      return null;
    }

    // Calculate workload (distance in miles)
    const acuteLoad = acuteData.reduce((sum, d) => sum + (d.distance || 0), 0);
    const chronicLoad = chronicData.reduce((sum, d) => sum + (d.distance || 0), 0);

    const acuteAvg = acuteLoad / this.acuteWindow;
    const chronicAvg = chronicLoad / this.chronicWindow;

    if (chronicAvg === 0) {
      return null;
    }

    const ratio = acuteAvg / chronicAvg;

    return {
      ratio: ratio,
      acuteLoad: acuteLoad,
      chronicLoad: chronicLoad,
      acuteAvg: acuteAvg,
      chronicAvg: chronicAvg,
      riskLevel: this.getRiskLevel(ratio),
      recommendation: this.getACWRRecommendation(ratio)
    };
  }

  /**
   * Determine risk level based on ACWR
   */
  getRiskLevel(ratio) {
    if (ratio === null || ratio === undefined) return 'unknown';
    if (ratio < this.optimalACWR.min) return 'low';
    if (ratio >= this.optimalACWR.min && ratio <= this.optimalACWR.max) return 'optimal';
    if (ratio > this.optimalACWR.max && ratio < this.highRiskACWR) return 'moderate';
    return 'high';
  }

  /**
   * Get ACWR-based recommendation
   */
  getACWRRecommendation(ratio) {
    if (ratio === null || ratio === undefined) {
      return 'Need more data to calculate training load ratio.';
    }

    const level = this.getRiskLevel(ratio);
    
    const recommendations = {
      low: 'Your training load is lower than usual. Consider gradually increasing volume.',
      optimal: 'Your training load is in the optimal range. Great job managing your training!',
      moderate: 'Your training load is elevated. Monitor for fatigue and consider a lighter week.',
      high: '⚠️ High injury risk! Your training load has increased too quickly. Take an easy week.'
    };

    return recommendations[level] || 'Continue monitoring your training load.';
  }

  /**
   * Calculate Recovery Score based on sleep and readiness
   * Score: 0-100
   * > 85 = Excellent recovery, optimal for hard training
   * 70-85 = Good recovery, suitable for moderate training
   * 50-70 = Fair recovery, easy training recommended
   * < 50 = Poor recovery, rest day recommended
   */
  calculateRecoveryScore(sleepScore, readinessScore) {
    if (!sleepScore && !readinessScore) {
      return null;
    }

    // If only one metric available, use it
    if (!sleepScore) return { score: readinessScore, source: 'readiness' };
    if (!readinessScore) return { score: sleepScore, source: 'sleep' };

    // Weighted average: readiness is more important (60%) than sleep (40%)
    const score = (readinessScore * 0.6) + (sleepScore * 0.4);

    return {
      score: Math.round(score),
      source: 'combined',
      sleepScore,
      readinessScore
    };
  }

  /**
   * Get recovery level classification
   */
  getRecoveryLevel(score) {
    if (score === null || score === undefined) return 'unknown';
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  /**
   * Determine if today is a good day to run
   */
  isOptimalRunDay(sleepScore, readinessScore) {
    if (!sleepScore && !readinessScore) {
      return { optimal: null, reason: 'No recovery data available' };
    }

    const hasSleep = sleepScore && sleepScore >= 85;
    const hasReadiness = readinessScore && readinessScore >= 80;

    if (hasSleep && hasReadiness) {
      return {
        optimal: true,
        reason: 'Excellent recovery! Great day for quality training.',
        color: '#27ae60'
      };
    }

    if ((sleepScore && sleepScore < 70) || (readinessScore && readinessScore < 65)) {
      return {
        optimal: false,
        reason: 'Low recovery. Consider rest or easy effort.',
        color: '#e74c3c'
      };
    }

    return {
      optimal: null,
      reason: 'Moderate recovery. Light to moderate training okay.',
      color: '#f39c12'
    };
  }

  /**
   * Generate daily recommendation based on all factors
   */
  getDailyRecommendation(data, date) {
    const dayData = data.find(d => d.date === date);
    
    if (!dayData) {
      return {
        date,
        recommendation: 'No data available',
        trainingIntensity: 'unknown',
        color: '#95a5a6'
      };
    }

    const recovery = this.calculateRecoveryScore(dayData.sleepScore, dayData.readinessScore);
    const runStatus = this.isOptimalRunDay(dayData.sleepScore, dayData.readinessScore);
    
    let recommendation;
    let trainingIntensity;
    let color;

    if (!recovery || recovery.score === null) {
      recommendation = 'No recovery data available';
      trainingIntensity = 'unknown';
      color = '#95a5a6';
    } else {
      const recoveryLevel = this.getRecoveryLevel(recovery.score);
      
      switch (recoveryLevel) {
        case 'excellent':
          recommendation = '💪 Perfect day for hard training or long run';
          trainingIntensity = 'hard';
          color = '#27ae60';
          break;
        case 'good':
          recommendation = '✓ Good for moderate training';
          trainingIntensity = 'moderate';
          color = '#3498db';
          break;
        case 'fair':
          recommendation = '⚡ Easy run or cross-training recommended';
          trainingIntensity = 'easy';
          color = '#f39c12';
          break;
        case 'poor':
          recommendation = '🛑 Rest day recommended';
          trainingIntensity = 'rest';
          color = '#e74c3c';
          break;
        default:
          recommendation = 'Monitor your recovery';
          trainingIntensity = 'unknown';
          color = '#95a5a6';
      }
    }

    return {
      date,
      recommendation,
      trainingIntensity,
      color,
      recoveryScore: recovery?.score,
      sleepScore: dayData.sleepScore,
      readinessScore: dayData.readinessScore,
      distance: dayData.distance
    };
  }

  /**
   * Generate calendar view recommendations for date range
   */
  generateCalendarRecommendations(data, startDate, endDate) {
    const calendar = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const recommendation = this.getDailyRecommendation(data, dateStr);
      calendar.push(recommendation);
    }

    return calendar;
  }

  /**
   * Get comprehensive training load analysis
   */
  getFullAnalysis(data) {
    if (!data || data.length === 0) {
      return null;
    }

    const acwr = this.calculateACWR(data);
    
    // Get today's recovery data
    const today = new Date().toISOString().split('T')[0];
    const todayData = data.find(d => d.date === today);
    
    let todayRecovery = null;
    let todayRecommendation = null;
    
    if (todayData) {
      todayRecovery = this.calculateRecoveryScore(todayData.sleepScore, todayData.readinessScore);
      todayRecommendation = this.getDailyRecommendation(data, today);
    }

    // Calculate average recovery for last 7 days
    const last7Days = data.slice(-7);
    const recoveryScores = last7Days
      .map(d => this.calculateRecoveryScore(d.sleepScore, d.readinessScore))
      .filter(r => r && r.score !== null)
      .map(r => r.score);
    
    const avgRecovery = recoveryScores.length > 0 
      ? recoveryScores.reduce((sum, s) => sum + s, 0) / recoveryScores.length
      : null;

    return {
      acwr,
      todayRecovery,
      todayRecommendation,
      avgRecovery: avgRecovery ? Math.round(avgRecovery) : null,
      avgRecoveryLevel: avgRecovery ? this.getRecoveryLevel(avgRecovery) : 'unknown'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrainingLoadAnalyzer;
}

