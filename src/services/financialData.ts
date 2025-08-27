import axios from 'axios';
import { CONFIG, ECONOMIC_INDICATORS, COMPETITORS } from '../config.js';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();

// Cache management
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

// Stock and Financial Data Services
export class FinancialDataService {
  
  // Get comprehensive stock data
  async getStockData(symbol: string = 'HD') {
    const cacheKey = `stock_${symbol}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get data from multiple sources
      const [alphaVantage, yahooFinance] = await Promise.all([
        this.getAlphaVantageData(symbol),
        this.getYahooFinanceData(symbol)
      ]);

      const stockData = {
        symbol,
        overview: alphaVantage.overview,
        quote: yahooFinance.quote,
        technical: yahooFinance.technical,
        timestamp: new Date().toISOString()
      };

      setCachedData(cacheKey, stockData);
      return stockData;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw new Error(`Failed to fetch stock data: ${error}`);
    }
  }

  // Get Alpha Vantage data
  private async getAlphaVantageData(symbol: string) {
    try {
      const response = await axios.get(CONFIG.DATA_SOURCES.STOCK.ALPHA_VANTAGE, {
        params: {
          function: 'OVERVIEW',
          symbol,
          apikey: CONFIG.API_KEYS.ALPHA_VANTAGE
        }
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      return {
        overview: response.data,
        quote: await this.getAlphaVantageQuote(symbol),
        earnings: await this.getAlphaVantageEarnings(symbol)
      };
    } catch (error) {
      console.error('Alpha Vantage error:', error);
      return { overview: null, quote: null, earnings: null };
    }
  }

  // Get Alpha Vantage quote data
  private async getAlphaVantageQuote(symbol: string) {
    try {
      const response = await axios.get(CONFIG.DATA_SOURCES.STOCK.ALPHA_VANTAGE, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: CONFIG.API_KEYS.ALPHA_VANTAGE
        }
      });

      return response.data['Global Quote'] || null;
    } catch (error) {
      return null;
    }
  }

  // Get Alpha Vantage earnings data
  private async getAlphaVantageEarnings(symbol: string) {
    try {
      const response = await axios.get(CONFIG.DATA_SOURCES.STOCK.ALPHA_VANTAGE, {
        params: {
          function: 'EARNINGS',
          symbol,
          apikey: CONFIG.API_KEYS.ALPHA_VANTAGE
        }
      });

      return response.data;
    } catch (error) {
      return null;
    }
  }

  // Get Yahoo Finance data
  private async getYahooFinanceData(symbol: string) {
    try {
      const response = await axios.get(CONFIG.DATA_SOURCES.STOCK.YAHOO_FINANCE, {
        headers: { 'User-Agent': CONFIG.USER_AGENT }
      });

      const data = response.data.chart.result[0];
      const quote = data.quote[0];
      const meta = data.meta;

      return {
        quote: {
          price: quote.close[quote.close.length - 1],
          change: quote.close[quote.close.length - 1] - quote.open[0],
          changePercent: ((quote.close[quote.close.length - 1] - quote.open[0]) / quote.open[0]) * 100,
          volume: quote.volume[quote.volume.length - 1],
          high: Math.max(...quote.high),
          low: Math.min(...quote.low),
          open: quote.open[0]
        },
        technical: {
          sma20: this.calculateSMA(quote.close, 20),
          sma50: this.calculateSMA(quote.close, 50),
          sma200: this.calculateSMA(quote.close, 200),
          rsi: this.calculateRSI(quote.close, 14)
        },
        meta: {
          currency: meta.currency,
          exchange: meta.exchangeName,
          timezone: meta.timezone
        }
      };
    } catch (error) {
      console.error('Yahoo Finance error:', error);
      return { quote: null, technical: null, meta: null };
    }
  }

  // Calculate Simple Moving Average
  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  // Calculate RSI
  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 0;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    
    return 100 - (100 / (1 + rs));
  }

  // Get competitor analysis
  async getCompetitorAnalysis() {
    const cacheKey = 'competitor_analysis';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const competitorData = await Promise.all(
        Object.entries(COMPETITORS).map(async ([key, competitor]) => {
          if (competitor.ticker === 'Private') {
            return {
              name: competitor.name,
              ticker: competitor.ticker,
              data: 'Private company - limited data available'
            };
          }

          try {
            const stockData = await this.getStockData(competitor.ticker);
            return {
              name: competitor.name,
              ticker: competitor.ticker,
              data: stockData
            };
          } catch (error) {
            return {
              name: competitor.name,
              ticker: competitor.ticker,
              data: 'Data unavailable'
            };
          }
        })
      );

      const analysis = {
        competitors: competitorData,
        timestamp: new Date().toISOString()
      };

      setCachedData(cacheKey, analysis);
      return analysis;
    } catch (error) {
      throw new Error(`Failed to fetch competitor analysis: ${error}`);
    }
  }

  // Get financial ratios and metrics
  async getFinancialMetrics(symbol: string = 'HD') {
    const cacheKey = `financial_metrics_${symbol}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const stockData = await this.getStockData(symbol);
      const overview = stockData.overview;

      if (!overview) {
        throw new Error('No overview data available');
      }

      const metrics = {
        valuation: {
          peRatio: parseFloat(overview.PERatio) || null,
          pbRatio: parseFloat(overview.PriceToBookRatio) || null,
          psRatio: parseFloat(overview.PriceToSalesRatio) || null,
          pegRatio: parseFloat(overview.PEGRatio) || null
        },
        profitability: {
          roe: parseFloat(overview.ReturnOnEquityTTM) || null,
          roa: parseFloat(overview.ReturnOnAssetsTTM) || null,
          grossMargin: parseFloat(overview.GrossProfitMarginTTM) || null,
          operatingMargin: parseFloat(overview.OperatingMarginTTM) || null,
          netMargin: parseFloat(overview.ProfitMargin) || null
        },
        growth: {
          revenueGrowth: parseFloat(overview.QuarterlyRevenueGrowthYOY) || null,
          epsGrowth: parseFloat(overview.QuarterlyEarningsGrowthYOY) || null,
          dividendGrowth: parseFloat(overview.DividendGrowth) || null
        },
        financialHealth: {
          debtToEquity: parseFloat(overview.DebtToEquityRatio) || null,
          currentRatio: parseFloat(overview.CurrentRatio) || null,
          quickRatio: parseFloat(overview.QuickRatio) || null
        },
        efficiency: {
          assetTurnover: parseFloat(overview.AssetTurnoverTTM) || null,
          inventoryTurnover: parseFloat(overview.InventoryTurnoverTTM) || null
        }
      };

      setCachedData(cacheKey, metrics);
      return metrics;
    } catch (error) {
      throw new Error(`Failed to fetch financial metrics: ${error}`);
    }
  }
}
