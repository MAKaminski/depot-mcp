import axios from 'axios';
import { CONFIG, ECONOMIC_INDICATORS } from '../config.js';

// Cache for economic data
const cache = new Map<string, { data: any; timestamp: number }>();

function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CONFIG.DEFAULTS.CACHE_DURATION_MINUTES * 60 * 1000) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export class EconomicDataService {
  
  // Get comprehensive economic analysis
  async getEconomicAnalysis() {
    const cacheKey = 'economic_analysis';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const [housing, consumer, macro] = await Promise.all([
        this.getHousingMarketData(),
        this.getConsumerData(),
        this.getMacroeconomicData()
      ]);

      const analysis = {
        timestamp: new Date().toISOString(),
        housing,
        consumer,
        macro,
        homeDepotImpact: this.analyzeHomeDepotImpact(housing, consumer, macro),
        summary: this.generateEconomicSummary(housing, consumer, macro)
      };

      setCachedData(cacheKey, analysis);
      return analysis;
    } catch (error) {
      throw new Error(`Failed to fetch economic analysis: ${error}`);
    }
  }

  // Get housing market data
  private async getHousingMarketData() {
    try {
      const [housingStarts, buildingPermits, existingSales, newSales, priceIndex] = await Promise.all([
        this.getFREDData(ECONOMIC_INDICATORS.HOUSING.HOUSING_STARTS),
        this.getFREDData(ECONOMIC_INDICATORS.HOUSING.BUILDING_PERMITS),
        this.getFREDData(ECONOMIC_INDICATORS.HOUSING.EXISTING_HOME_SALES),
        this.getFREDData(ECONOMIC_INDICATORS.HOUSING.NEW_HOME_SALES),
        this.getFREDData(ECONOMIC_INDICATORS.HOUSING.HOUSING_PRICE_INDEX)
      ]);

      return {
        housingStarts: this.processFREDData(housingStarts, 'Housing Starts'),
        buildingPermits: this.processFREDData(buildingPermits, 'Building Permits'),
        existingSales: this.processFREDData(existingSales, 'Existing Home Sales'),
        newSales: this.processFREDData(newSales, 'New Home Sales'),
        priceIndex: this.processFREDData(priceIndex, 'Housing Price Index'),
        analysis: this.analyzeHousingTrends(housingStarts, buildingPermits, existingSales, newSales, priceIndex)
      };
    } catch (error) {
      console.error('Housing market data error:', error);
      return this.getFallbackHousingData();
    }
  }

  // Get consumer data
  private async getConsumerData() {
    try {
      const [sentiment, retailSales, consumption, disposableIncome] = await Promise.all([
        this.getFREDData(ECONOMIC_INDICATORS.CONSUMER.CONSUMER_SENTIMENT),
        this.getFREDData(ECONOMIC_INDICATORS.CONSUMER.RETAIL_SALES),
        this.getFREDData(ECONOMIC_INDICATORS.CONSUMER.PERSONAL_CONSUMPTION),
        this.getFREDData(ECONOMIC_INDICATORS.CONSUMER.DISPOSABLE_INCOME)
      ]);

      return {
        sentiment: this.processFREDData(sentiment, 'Consumer Sentiment'),
        retailSales: this.processFREDData(retailSales, 'Retail Sales'),
        consumption: this.processFREDData(consumption, 'Personal Consumption'),
        disposableIncome: this.processFREDData(disposableIncome, 'Disposable Income'),
        analysis: this.analyzeConsumerTrends(sentiment, retailSales, consumption, disposableIncome)
      };
    } catch (error) {
      console.error('Consumer data error:', error);
      return this.getFallbackConsumerData();
    }
  }

  // Get macroeconomic data
  private async getMacroeconomicData() {
    try {
      const [fedRate, inflation, unemployment, gdp] = await Promise.all([
        this.getFREDData(ECONOMIC_INDICATORS.MACRO.FED_FUNDS_RATE),
        this.getFREDData(ECONOMIC_INDICATORS.MACRO.INFLATION_CPI),
        this.getFREDData(ECONOMIC_INDICATORS.MACRO.UNEMPLOYMENT),
        this.getFREDData(ECONOMIC_INDICATORS.MACRO.GDP)
      ]);

      return {
        fedRate: this.processFREDData(fedRate, 'Federal Funds Rate'),
        inflation: this.processFREDData(inflation, 'Inflation (CPI)'),
        unemployment: this.processFREDData(unemployment, 'Unemployment Rate'),
        gdp: this.processFREDData(gdp, 'GDP'),
        analysis: this.analyzeMacroTrends(fedRate, inflation, unemployment, gdp)
      };
    } catch (error) {
      console.error('Macroeconomic data error:', error);
      return this.getFallbackMacroData();
    }
  }

  // Get FRED data
  private async getFREDData(seriesId: string) {
    try {
      const response = await axios.get(CONFIG.DATA_SOURCES.ECONOMIC.FRED, {
        params: {
          series_id: seriesId,
          api_key: CONFIG.API_KEYS.FRED,
          file_type: 'json',
          sort_order: 'desc',
          limit: 24 // Last 24 observations
        }
      });

      return response.data;
    } catch (error) {
      console.error(`FRED API error for ${seriesId}:`, error);
      return null;
    }
  }

  // Process FRED data
  private processFREDData(fredData: any, name: string) {
    if (!fredData || !fredData.observations) {
      return { name, data: [], trend: 'unknown', latest: null };
    }

    const observations = fredData.observations
      .filter((obs: any) => obs.value !== '.')
      .map((obs: any) => ({
        date: obs.date,
        value: parseFloat(obs.value)
      }))
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (observations.length < 2) {
      return { name, data: observations, trend: 'unknown', latest: observations[0]?.value || null };
    }

    const latest = observations[observations.length - 1].value;
    const previous = observations[observations.length - 2].value;
    const trend = latest > previous ? 'up' : latest < previous ? 'down' : 'stable';

    return {
      name,
      data: observations,
      trend,
      latest,
      change: latest - previous,
      changePercent: ((latest - previous) / previous) * 100
    };
  }

  // Analyze housing trends
  private analyzeHousingTrends(housingStarts: any, buildingPermits: any, existingSales: any, newSales: any, priceIndex: any) {
    const trends = [housingStarts.trend, buildingPermits.trend, existingSales.trend, newSales.trend];
    const upCount = trends.filter(t => t === 'up').length;
    const downCount = trends.filter(t => t === 'down').length;

    let overallTrend = 'mixed';
    if (upCount >= 3) overallTrend = 'positive';
    else if (downCount >= 3) overallTrend = 'negative';

    return {
      overallTrend,
      trendBreakdown: { up: upCount, down: downCount, stable: trends.filter(t => t === 'stable').length },
      homeDepotImpact: this.assessHousingImpactOnHomeDepot(overallTrend, priceIndex.trend),
      summary: `Housing market shows ${overallTrend} trends with ${upCount} indicators up and ${downCount} down.`
    };
  }

  // Analyze consumer trends
  private analyzeConsumerTrends(sentiment: any, retailSales: any, consumption: any, disposableIncome: any) {
    const trends = [sentiment.trend, retailSales.trend, consumption.trend, disposableIncome.trend];
    const upCount = trends.filter(t => t === 'up').length;
    const downCount = trends.filter(t => t === 'down').length;

    let overallTrend = 'mixed';
    if (upCount >= 3) overallTrend = 'positive';
    else if (downCount >= 3) overallTrend = 'negative';

    return {
      overallTrend,
      trendBreakdown: { up: upCount, down: downCount, stable: trends.filter(t => t === 'stable').length },
      homeDepotImpact: this.assessConsumerImpactOnHomeDepot(overallTrend, sentiment.trend),
      summary: `Consumer indicators show ${overallTrend} trends with ${upCount} indicators up and ${downCount} down.`
    };
  }

  // Analyze macro trends
  private analyzeMacroTrends(fedRate: any, inflation: any, unemployment: any, gdp: any) {
    // For macro indicators, interpretation depends on the specific metric
    const fedRateImpact = fedRate.trend === 'up' ? 'negative' : 'positive'; // Higher rates = negative for retail
    const inflationImpact = inflation.trend === 'up' ? 'mixed' : 'positive'; // Moderate inflation can be positive
    const unemploymentImpact = unemployment.trend === 'down' ? 'positive' : 'negative';
    const gdpImpact = gdp.trend === 'up' ? 'positive' : 'negative';

    const positiveCount = [fedRateImpact, inflationImpact, unemploymentImpact, gdpImpact].filter(i => i === 'positive').length;
    const negativeCount = [fedRateImpact, inflationImpact, unemploymentImpact, gdpImpact].filter(i => i === 'negative').length;

    let overallImpact = 'mixed';
    if (positiveCount >= 3) overallImpact = 'positive';
    else if (negativeCount >= 3) overallImpact = 'negative';

    return {
      overallImpact,
      breakdown: { fedRate: fedRateImpact, inflation: inflationImpact, unemployment: unemploymentImpact, gdp: gdpImpact },
      summary: `Macroeconomic environment shows ${overallImpact} impact on Home Depot with ${positiveCount} positive and ${negativeCount} negative factors.`
    };
  }

  // Assess housing market impact on Home Depot
  private assessHousingImpactOnHomeDepot(housingTrend: string, priceTrend: string): string {
    if (housingTrend === 'positive' && priceTrend === 'up') {
      return 'Very Positive - Strong housing market drives home improvement spending';
    } else if (housingTrend === 'positive') {
      return 'Positive - More housing activity increases demand for materials and tools';
    } else if (housingTrend === 'negative') {
      return 'Negative - Weak housing market reduces home improvement projects';
    } else {
      return 'Mixed - Uncertain housing market conditions';
    }
  }

  // Assess consumer impact on Home Depot
  private assessConsumerImpactOnHomeDepot(consumerTrend: string, sentimentTrend: string): string {
    if (consumerTrend === 'positive' && sentimentTrend === 'up') {
      return 'Very Positive - Strong consumer confidence and spending';
    } else if (consumerTrend === 'positive') {
      return 'Positive - Good consumer spending despite sentiment concerns';
    } else if (consumerTrend === 'negative') {
      return 'Negative - Weak consumer spending reduces retail sales';
    } else {
      return 'Mixed - Uncertain consumer environment';
    }
  }

  // Analyze overall impact on Home Depot
  private analyzeHomeDepotImpact(housing: any, consumer: any, macro: any) {
    const housingScore = housing.analysis.homeDepotImpact.includes('Positive') ? 1 : housing.analysis.homeDepotImpact.includes('Negative') ? -1 : 0;
    const consumerScore = consumer.analysis.homeDepotImpact.includes('Positive') ? 1 : consumer.analysis.homeDepotImpact.includes('Negative') ? -1 : 0;
    const macroScore = macro.analysis.overallImpact === 'positive' ? 1 : macro.analysis.overallImpact === 'negative' ? -1 : 0;

    const totalScore = housingScore + consumerScore + macroScore;
    
    let overallImpact = 'neutral';
    if (totalScore >= 2) overallImpact = 'positive';
    else if (totalScore <= -2) overallImpact = 'negative';

    return {
      overallImpact,
      score: totalScore,
      breakdown: { housing: housingScore, consumer: consumerScore, macro: macroScore },
      summary: `Economic environment shows ${overallImpact} impact on Home Depot with a score of ${totalScore}/3.`
    };
  }

  // Generate economic summary
  private generateEconomicSummary(housing: any, consumer: any, macro: any) {
    return {
      housing: housing.analysis.summary,
      consumer: consumer.analysis.summary,
      macro: macro.analysis.summary,
      homeDepot: this.analyzeHomeDepotImpact(housing, consumer, macro).summary
    };
  }

  // Fallback data methods
  private getFallbackHousingData() {
    return {
      housingStarts: { name: 'Housing Starts', data: [], trend: 'unknown', latest: null },
      buildingPermits: { name: 'Building Permits', data: [], trend: 'unknown', latest: null },
      existingSales: { name: 'Existing Home Sales', data: [], trend: 'unknown', latest: null },
      newSales: { name: 'New Home Sales', data: [], trend: 'unknown', latest: null },
      priceIndex: { name: 'Housing Price Index', data: [], trend: 'unknown', latest: null },
      analysis: { overallTrend: 'unknown', trendBreakdown: { up: 0, down: 0, stable: 0 }, homeDepotImpact: 'Unknown', summary: 'Housing data unavailable' }
    };
  }

  private getFallbackConsumerData() {
    return {
      sentiment: { name: 'Consumer Sentiment', data: [], trend: 'unknown', latest: null },
      retailSales: { name: 'Retail Sales', data: [], trend: 'unknown', latest: null },
      consumption: { name: 'Personal Consumption', data: [], trend: 'unknown', latest: null },
      disposableIncome: { name: 'Disposable Income', data: [], trend: 'unknown', latest: null },
      analysis: { overallTrend: 'unknown', trendBreakdown: { up: 0, down: 0, stable: 0 }, homeDepotImpact: 'Unknown', summary: 'Consumer data unavailable' }
    };
  }

  private getFallbackMacroData() {
    return {
      fedRate: { name: 'Federal Funds Rate', data: [], trend: 'unknown', latest: null },
      inflation: { name: 'Inflation (CPI)', data: [], trend: 'unknown', latest: null },
      unemployment: { name: 'Unemployment Rate', data: [], trend: 'unknown', latest: null },
      gdp: { name: 'GDP', data: [], trend: 'unknown', latest: null },
      analysis: { overallImpact: 'unknown', breakdown: { fedRate: 'unknown', inflation: 'unknown', unemployment: 'unknown', gdp: 'unknown' }, summary: 'Macroeconomic data unavailable' }
    };
  }
}
