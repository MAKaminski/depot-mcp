import { FinancialDataService } from './financialData.js';
import { NewsIntelligenceService } from './newsIntelligence.js';
import { EconomicDataService } from './economicData.js';
import { CONFIG, COMPETITORS } from '../config.js';

export class InvestmentResearchService {
  private financialService: FinancialDataService;
  private newsService: NewsIntelligenceService;
  private economicService: EconomicDataService;

  constructor() {
    this.financialService = new FinancialDataService();
    this.newsService = new NewsIntelligenceService();
    this.economicService = new EconomicDataService();
  }

  // Get comprehensive investment analysis
  async getInvestmentAnalysis(symbol: string = 'HD') {
    try {
      const [financialData, newsAnalysis, economicAnalysis, competitorAnalysis] = await Promise.all([
        this.financialService.getStockData(symbol),
        this.newsService.getNewsAnalysis(symbol),
        this.economicService.getEconomicAnalysis(),
        this.financialService.getCompetitorAnalysis()
      ]);

      const analysis = {
        symbol,
        timestamp: new Date().toISOString(),
        overview: this.generateCompanyOverview(financialData),
        investmentThesis: this.buildInvestmentThesis(financialData, newsAnalysis, economicAnalysis),
        riskAssessment: this.assessRisks(financialData, newsAnalysis, economicAnalysis),
        competitivePosition: this.analyzeCompetitivePosition(competitorAnalysis),
        technicalAnalysis: this.performTechnicalAnalysis(financialData),
        valuation: this.performValuationAnalysis(financialData),
        summary: this.generateInvestmentSummary(financialData, newsAnalysis, economicAnalysis)
      };

      return analysis;
    } catch (error) {
      throw new Error(`Failed to generate investment analysis: ${error}`);
    }
  }

  // Generate company overview
  private generateCompanyOverview(financialData: any) {
    const overview = financialData.overview;
    if (!overview) return { error: 'No overview data available' };

    return {
      name: overview.Name || 'The Home Depot, Inc.',
      sector: overview.Sector || 'Consumer Discretionary',
      industry: overview.Industry || 'Home Improvement Retail',
      description: overview.Description || 'No description available',
      marketCap: overview.MarketCapitalization ? `$${(parseFloat(overview.MarketCapitalization) / 1000000000).toFixed(2)}B` : 'Unknown',
      employees: overview.Employees || 'Unknown',
      headquarters: overview.Address || 'Unknown',
      website: overview.Website || 'Unknown',
      exchange: overview.Exchange || 'NYSE',
      currency: overview.Currency || 'USD'
    };
  }

  // Build investment thesis
  private buildInvestmentThesis(financialData: any, newsAnalysis: any, economicAnalysis: any) {
    const thesis = {
      bullCase: this.buildBullCase(financialData, newsAnalysis, economicAnalysis),
      bearCase: this.buildBearCase(financialData, newsAnalysis, economicAnalysis),
      neutralCase: this.buildNeutralCase(financialData, newsAnalysis, economicAnalysis),
      consensus: this.determineConsensus(financialData, newsAnalysis, economicAnalysis)
    };

    return thesis;
  }

  // Build bull case
  private buildBullCase(financialData: any, newsAnalysis: any, economicAnalysis: any) {
    const bullPoints = [];

    // Financial strength
    if (financialData.overview) {
      if (parseFloat(financialData.overview.ReturnOnEquityTTM) > 20) {
        bullPoints.push('Strong ROE above 20% indicates efficient capital allocation');
      }
      if (parseFloat(financialData.overview.ProfitMargin) > 10) {
        bullPoints.push('High profit margins show pricing power and operational efficiency');
      }
      if (parseFloat(financialData.overview.DebtToEquityRatio) < 1) {
        bullPoints.push('Conservative debt levels provide financial flexibility');
      }
    }

    // News sentiment
    if (newsAnalysis.sentiment.overall === 'positive') {
      bullPoints.push('Positive news sentiment suggests favorable market perception');
    }

    // Economic factors
    if (economicAnalysis.homeDepotImpact.overallImpact === 'positive') {
      bullPoints.push('Favorable economic environment supports business growth');
    }

    // Market position
    bullPoints.push('Market leader in home improvement retail with strong brand recognition');
    bullPoints.push('Diversified product portfolio serving both DIY and professional customers');
    bullPoints.push('Omnichannel strategy combining physical stores with digital presence');

    return {
      points: bullPoints,
      summary: `Strong financial metrics, positive sentiment, and favorable economic conditions support a bullish outlook for ${financialData.symbol}.`
    };
  }

  // Build bear case
  private buildBearCase(financialData: any, newsAnalysis: any, economicAnalysis: any) {
    const bearPoints = [];

    // Financial concerns
    if (financialData.overview) {
      if (parseFloat(financialData.overview.PERatio) > 25) {
        bearPoints.push('High P/E ratio suggests overvaluation relative to earnings');
      }
      if (parseFloat(financialData.overview.DebtToEquityRatio) > 2) {
        bearPoints.push('High debt levels increase financial risk');
      }
    }

    // News sentiment
    if (newsAnalysis.sentiment.overall === 'negative') {
      bearPoints.push('Negative news sentiment indicates market concerns');
    }

    // Economic factors
    if (economicAnalysis.homeDepotImpact.overallImpact === 'negative') {
      bearPoints.push('Unfavorable economic environment poses headwinds');
    }

    // Industry risks
    bearPoints.push('Cyclical business model sensitive to housing market conditions');
    bearPoints.push('Intense competition from online retailers and local competitors');
    bearPoints.push('Supply chain disruptions and inflation pressure on margins');
    bearPoints.push('Labor shortages and wage inflation impact operational costs');

    return {
      points: bearPoints,
      summary: `Valuation concerns, economic headwinds, and industry challenges present risks for ${financialData.symbol}.`
    };
  }

  // Build neutral case
  private buildNeutralCase(financialData: any, newsAnalysis: any, economicAnalysis: any) {
    return {
      points: [
        'Mixed economic indicators create uncertain business environment',
        'Balanced news sentiment reflects market indecision',
        'Valuation metrics are in line with historical averages',
        'Company fundamentals remain solid despite external challenges',
        'Housing market trends are mixed, providing both opportunities and risks'
      ],
      summary: `Balanced factors suggest a neutral outlook with both opportunities and risks for ${financialData.symbol}.`
    };
  }

  // Determine consensus
  private determineConsensus(financialData: any, newsAnalysis: any, economicAnalysis: any) {
    let score = 0;
    let factors = 0;

    // Financial metrics
    if (financialData.overview) {
      if (parseFloat(financialData.overview.ReturnOnEquityTTM) > 20) score += 1;
      if (parseFloat(financialData.overview.ProfitMargin) > 10) score += 1;
      if (parseFloat(financialData.overview.DebtToEquityRatio) < 1) score += 1;
      factors += 3;
    }

    // News sentiment
    if (newsAnalysis.sentiment.overall === 'positive') score += 1;
    else if (newsAnalysis.sentiment.overall === 'negative') score -= 1;
    factors += 1;

    // Economic impact
    if (economicAnalysis.homeDepotImpact.overallImpact === 'positive') score += 1;
    else if (economicAnalysis.homeDepotImpact.overallImpact === 'negative') score -= 1;
    factors += 1;

    const consensusScore = score / factors;
    let consensus = 'neutral';
    let confidence = 'medium';

    if (consensusScore > 0.3) {
      consensus = 'bullish';
      confidence = consensusScore > 0.6 ? 'high' : 'medium';
    } else if (consensusScore < -0.3) {
      consensus = 'bearish';
      confidence = consensusScore < -0.6 ? 'high' : 'medium';
    }

    return {
      consensus,
      confidence,
      score: consensusScore,
      factors: factors,
      summary: `Analysis suggests a ${consensus} outlook with ${confidence} confidence based on ${factors} key factors.`
    };
  }

  // Assess risks
  private assessRisks(financialData: any, newsAnalysis: any, economicAnalysis: any) {
    const risks = {
      financial: this.assessFinancialRisks(financialData),
      operational: this.assessOperationalRisks(),
      market: this.assessMarketRisks(newsAnalysis, economicAnalysis),
      regulatory: this.assessRegulatoryRisks(),
      overall: 'medium'
    };

    // Determine overall risk level
    const riskScores = [risks.financial, risks.operational, risks.market, risks.regulatory];
    const highRiskCount = riskScores.filter(r => r === 'high').length;
    const lowRiskCount = riskScores.filter(r => r === 'low').length;

    if (highRiskCount >= 2) risks.overall = 'high';
    else if (lowRiskCount >= 2) risks.overall = 'low';
    else risks.overall = 'medium';

    return risks;
  }

  // Assess financial risks
  private assessFinancialRisks(financialData: any): 'low' | 'medium' | 'high' {
    if (!financialData.overview) return 'medium';

    const debtRatio = parseFloat(financialData.overview.DebtToEquityRatio);
    const currentRatio = parseFloat(financialData.overview.CurrentRatio);
    const quickRatio = parseFloat(financialData.overview.QuickRatio);

    if (debtRatio > 2 || currentRatio < 1 || quickRatio < 0.5) return 'high';
    if (debtRatio < 0.5 && currentRatio > 2 && quickRatio > 1) return 'low';
    return 'medium';
  }

  // Assess operational risks
  private assessOperationalRisks(): 'low' | 'medium' | 'high' {
    return 'medium'; // Based on industry characteristics
  }

  // Assess market risks
  private assessMarketRisks(newsAnalysis: any, economicAnalysis: any): 'low' | 'medium' | 'high' {
    if (newsAnalysis.sentiment.overall === 'negative' && economicAnalysis.homeDepotImpact.overallImpact === 'negative') {
      return 'high';
    }
    if (newsAnalysis.sentiment.overall === 'positive' && economicAnalysis.homeDepotImpact.overallImpact === 'positive') {
      return 'low';
    }
    return 'medium';
  }

  // Assess regulatory risks
  private assessRegulatoryRisks(): 'low' | 'medium' | 'high' {
    return 'low'; // Home improvement retail has relatively low regulatory risk
  }

  // Analyze competitive position
  private analyzeCompetitivePosition(competitorAnalysis: any) {
    const analysis = {
      marketShare: 'Market leader in home improvement retail',
      competitiveAdvantages: [
        'Strong brand recognition and customer loyalty',
        'Extensive store network and distribution',
        'Professional contractor relationships',
        'Omnichannel capabilities',
        'Private label product portfolio'
      ],
      competitiveThreats: [
        'Online competition from Amazon and others',
        'Local hardware store competition',
        'Lowe\'s aggressive expansion',
        'New market entrants with digital focus'
      ],
      moat: 'medium-strong',
      summary: 'Home Depot maintains a strong competitive position through brand power, scale, and omnichannel presence, though faces increasing digital competition.'
    };

    return analysis;
  }

  // Perform technical analysis
  private performTechnicalAnalysis(financialData: any) {
    if (!financialData.technical) return { error: 'No technical data available' };

    const technical = financialData.technical;
    const quote = financialData.quote;

    if (!quote) return { error: 'No quote data available' };

    const analysis = {
      price: quote.price,
      sma20: technical.sma20,
      sma50: technical.sma50,
      sma200: technical.sma200,
      rsi: technical.rsi,
      signals: this.generateTechnicalSignals(quote, technical),
      summary: this.generateTechnicalSummary(quote, technical)
    };

    return analysis;
  }

  // Generate technical signals
  private generateTechnicalSignals(quote: any, technical: any) {
    const signals = [];

    if (quote.price > technical.sma20) signals.push('Price above 20-day SMA (bullish)');
    else signals.push('Price below 20-day SMA (bearish)');

    if (quote.price > technical.sma50) signals.push('Price above 50-day SMA (bullish)');
    else signals.push('Price below 50-day SMA (bearish)');

    if (quote.price > technical.sma200) signals.push('Price above 200-day SMA (bullish)');
    else signals.push('Price below 200-day SMA (bearish)');

    if (technical.rsi > 70) signals.push('RSI above 70 (overbought)');
    else if (technical.rsi < 30) signals.push('RSI below 30 (oversold)');
    else signals.push('RSI in neutral range');

    return signals;
  }

  // Generate technical summary
  private generateTechnicalSummary(quote: any, technical: any) {
    const bullishSignals = [quote.price > technical.sma20, quote.price > technical.sma50, quote.price > technical.sma200].filter(Boolean).length;
    const bearishSignals = 3 - bullishSignals;

    if (bullishSignals >= 2) return 'Technical indicators suggest bullish momentum';
    if (bearishSignals >= 2) return 'Technical indicators suggest bearish momentum';
    return 'Technical indicators are mixed, showing no clear trend';
  }

  // Perform valuation analysis
  private performValuationAnalysis(financialData: any) {
    if (!financialData.overview) return { error: 'No valuation data available' };

    const overview = financialData.overview;
    const valuation = {
      peRatio: parseFloat(overview.PERatio) || null,
      pbRatio: parseFloat(overview.PriceToBookRatio) || null,
      psRatio: parseFloat(overview.PriceToSalesRatio) || null,
      pegRatio: parseFloat(overview.PEGRatio) || null,
      dividendYield: parseFloat(overview.DividendYield) || null,
      assessment: this.assessValuation(overview),
      summary: this.generateValuationSummary(overview)
    };

    return valuation;
  }

  // Assess valuation
  private assessValuation(overview: any): 'undervalued' | 'fairly valued' | 'overvalued' {
    const peRatio = parseFloat(overview.PERatio);
    const pegRatio = parseFloat(overview.PEGRatio);

    if (peRatio < 15 && pegRatio < 1) return 'undervalued';
    if (peRatio > 25 || pegRatio > 1.5) return 'overvalued';
    return 'fairly valued';
  }

  // Generate valuation summary
  private generateValuationSummary(overview: any): string {
    const assessment = this.assessValuation(overview);
    const peRatio = parseFloat(overview.PERatio);
    const dividendYield = parseFloat(overview.DividendYield);

    let summary = `Stock appears ${assessment} based on current metrics. `;
    
    if (peRatio) {
      summary += `P/E ratio of ${peRatio.toFixed(1)} is `;
      if (peRatio < 15) summary += 'below historical averages. ';
      else if (peRatio > 25) summary += 'above historical averages. ';
      else summary += 'in line with historical averages. ';
    }

    if (dividendYield && dividendYield > 2) {
      summary += `Attractive dividend yield of ${dividendYield.toFixed(1)}%. `;
    }

    return summary;
  }

  // Generate investment summary
  private generateInvestmentSummary(financialData: any, newsAnalysis: any, economicAnalysis: any) {
    const consensus = this.determineConsensus(financialData, newsAnalysis, economicAnalysis);
    const risks = this.assessRisks(financialData, newsAnalysis, economicAnalysis);

    return {
      recommendation: consensus.consensus,
      confidence: consensus.confidence,
      riskLevel: risks.overall,
      keyFactors: [
        `Financial metrics: ${this.assessFinancialRisks(financialData)} risk`,
        `News sentiment: ${newsAnalysis.sentiment.overall}`,
        `Economic impact: ${economicAnalysis.homeDepotImpact.overallImpact}`,
        `Overall risk: ${risks.overall}`
      ],
      summary: `Based on comprehensive analysis, ${financialData.symbol} shows a ${consensus.consensus} outlook with ${consensus.confidence} confidence and ${risks.overall} risk level. Consider this analysis alongside your investment goals and risk tolerance.`
    };
  }
}
