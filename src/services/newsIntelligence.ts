import axios from 'axios';
import { CONFIG } from '../config.js';

// Cache for news data
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

export class NewsIntelligenceService {
  
  // Get comprehensive news analysis
  async getNewsAnalysis(query: string = 'Home Depot', days: number = 30) {
    const cacheKey = `news_${query}_${days}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const [newsApi, marketWatch, seekingAlpha] = await Promise.all([
        this.getNewsAPIData(query, days),
        this.getMarketWatchData(),
        this.getSeekingAlphaData()
      ]);

      const newsData = {
        query,
        period: `${days} days`,
        sources: {
          newsApi,
          marketWatch,
          seekingAlpha
        },
        sentiment: this.analyzeSentiment([newsApi, marketWatch, seekingAlpha]),
        summary: this.generateNewsSummary([newsApi, marketWatch, seekingAlpha]),
        timestamp: new Date().toISOString()
      };

      setCachedData(cacheKey, newsData);
      return newsData;
    } catch (error) {
      throw new Error(`Failed to fetch news analysis: ${error}`);
    }
  }

  // Get NewsAPI data
  private async getNewsAPIData(query: string, days: number) {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const response = await axios.get(CONFIG.DATA_SOURCES.NEWS.NEWS_API, {
        params: {
          q: query,
          from: fromDate.toISOString().split('T')[0],
          sortBy: 'publishedAt',
          language: 'en',
          apiKey: CONFIG.API_KEYS.NEWS_API
        }
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message);
      }

      return {
        source: 'NewsAPI',
        totalResults: response.data.totalResults,
        articles: response.data.articles.slice(0, 10).map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name,
          sentiment: this.analyzeArticleSentiment(article.title + ' ' + article.description)
        }))
      };
    } catch (error) {
      console.error('NewsAPI error:', error);
      return { source: 'NewsAPI', totalResults: 0, articles: [], error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Get MarketWatch data
  private async getMarketWatchData() {
    try {
      const response = await axios.get(CONFIG.DATA_SOURCES.NEWS.MARKETWATCH, {
        headers: { 'User-Agent': CONFIG.USER_AGENT }
      });

      // Parse MarketWatch HTML for news
      const newsItems = this.parseMarketWatchNews(response.data);
      
      return {
        source: 'MarketWatch',
        totalResults: newsItems.length,
        articles: newsItems.map((item: any) => ({
          title: item.title,
          description: item.description,
          url: item.url,
          publishedAt: item.publishedAt,
          source: 'MarketWatch',
          sentiment: this.analyzeArticleSentiment(item.title + ' ' + item.description)
        }))
      };
    } catch (error) {
      console.error('MarketWatch error:', error);
      return { source: 'MarketWatch', totalResults: 0, articles: [], error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Get Seeking Alpha data
  private async getSeekingAlphaData() {
    try {
      const response = await axios.get(CONFIG.DATA_SOURCES.NEWS.SEEKING_ALPHA, {
        headers: { 'User-Agent': CONFIG.USER_AGENT }
      });

      // Parse Seeking Alpha HTML for news
      const newsItems = this.parseSeekingAlphaNews(response.data);
      
      return {
        source: 'Seeking Alpha',
        totalResults: newsItems.length,
        articles: newsItems.map((item: any) => ({
          title: item.title,
          description: item.description,
          url: item.url,
          publishedAt: item.publishedAt,
          source: 'Seeking Alpha',
          sentiment: this.analyzeArticleSentiment(item.title + ' ' + item.description)
        }))
      };
    } catch (error) {
      console.error('Seeking Alpha error:', error);
      return { source: 'Seeking Alpha', totalResults: 0, articles: [], error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Parse MarketWatch news from HTML
  private parseMarketWatchNews(html: string) {
    const newsItems = [];
    
    // Simple regex-based parsing (in production, use proper HTML parsing)
    const newsRegex = /<h3[^>]*>([^<]+)<\/h3>/g;
    let match;
    
    while ((match = newsRegex.exec(html)) !== null) {
      if (match[1].includes('Home Depot') || match[1].includes('HD')) {
        newsItems.push({
          title: match[1].trim(),
          description: 'MarketWatch news item',
          url: '#',
          publishedAt: new Date().toISOString()
        });
      }
    }
    
    return newsItems.slice(0, 5); // Limit to 5 items
  }

  // Parse Seeking Alpha news from HTML
  private parseSeekingAlphaNews(html: string) {
    const newsItems = [];
    
    // Simple regex-based parsing
    const newsRegex = /<a[^>]*class="[^"]*sa-article[^"]*"[^>]*>([^<]+)<\/a>/g;
    let match;
    
    while ((match = newsRegex.exec(html)) !== null) {
      if (match[1].includes('Home Depot') || match[1].includes('HD')) {
        newsItems.push({
          title: match[1].trim(),
          description: 'Seeking Alpha analysis',
          url: '#',
          publishedAt: new Date().toISOString()
        });
      }
    }
    
    return newsItems.slice(0, 5); // Limit to 5 items
  }

  // Analyze sentiment of individual articles
  private analyzeArticleSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['growth', 'profit', 'increase', 'positive', 'strong', 'beat', 'exceed', 'up', 'gain', 'rise'];
    const negativeWords = ['decline', 'loss', 'decrease', 'negative', 'weak', 'miss', 'fall', 'down', 'drop', 'risk'];
    
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore++;
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  // Analyze overall sentiment
  private analyzeSentiment(newsSources: any[]) {
    let totalPositive = 0;
    let totalNegative = 0;
    let totalNeutral = 0;
    let totalArticles = 0;
    
    newsSources.forEach(source => {
      if (source.articles) {
        source.articles.forEach((article: any) => {
          totalArticles++;
          switch (article.sentiment) {
            case 'positive': totalPositive++; break;
            case 'negative': totalNegative++; break;
            case 'neutral': totalNeutral++; break;
          }
        });
      }
    });
    
    const total = totalPositive + totalNegative + totalNeutral;
    if (total === 0) return { overall: 'neutral', scores: { positive: 0, negative: 0, neutral: 0 } };
    
    return {
      overall: totalPositive > totalNegative ? 'positive' : totalNegative > totalPositive ? 'negative' : 'neutral',
      scores: {
        positive: Math.round((totalPositive / total) * 100),
        negative: Math.round((totalNegative / total) * 100),
        neutral: Math.round((totalNeutral / total) * 100)
      }
    };
  }

  // Generate news summary
  private generateNewsSummary(newsSources: any[]) {
    const allArticles = newsSources.flatMap(source => source.articles || []);
    
    if (allArticles.length === 0) {
      return 'No recent news articles found.';
    }
    
    const positiveArticles = allArticles.filter(article => article.sentiment === 'positive');
    const negativeArticles = allArticles.filter(article => article.sentiment === 'negative');
    const neutralArticles = allArticles.filter(article => article.sentiment === 'neutral');
    
    return {
      totalArticles: allArticles.length,
      sentimentBreakdown: {
        positive: positiveArticles.length,
        negative: negativeArticles.length,
        neutral: neutralArticles.length
      },
      keyThemes: this.extractKeyThemes(allArticles),
      summary: `Found ${allArticles.length} recent articles with ${positiveArticles.length} positive, ${negativeArticles.length} negative, and ${neutralArticles.length} neutral sentiment.`
    };
  }

  // Extract key themes from articles
  private extractKeyThemes(articles: any[]) {
    const themes = new Map<string, number>();
    
    articles.forEach(article => {
      const text = (article.title + ' ' + article.description).toLowerCase();
      
      // Define key themes relevant to Home Depot
      const keyThemes = [
        'earnings', 'revenue', 'growth', 'dividend', 'stock', 'market',
        'housing', 'construction', 'retail', 'consumer', 'economy',
        'inflation', 'interest rates', 'supply chain', 'inventory'
      ];
      
      keyThemes.forEach(theme => {
        if (text.includes(theme)) {
          themes.set(theme, (themes.get(theme) || 0) + 1);
        }
      });
    });
    
    // Return top themes
    return Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));
  }

  // Get analyst ratings and recommendations
  async getAnalystRatings() {
    const cacheKey = 'analyst_ratings';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // This would typically come from a financial data API
      // For now, providing mock data structure
      const ratings = {
        source: 'Analyst Consensus',
        timestamp: new Date().toISOString(),
        summary: {
          buy: 15,
          hold: 8,
          sell: 2,
          total: 25
        },
        consensus: 'Buy',
        priceTarget: {
          current: 350.00,
          target: 385.00,
          upside: 10.0
        },
        ratings: [
          { firm: 'Goldman Sachs', rating: 'Buy', target: 400, date: '2024-01-15' },
          { firm: 'Morgan Stanley', rating: 'Hold', target: 360, date: '2024-01-10' },
          { firm: 'JP Morgan', rating: 'Buy', target: 390, date: '2024-01-08' }
        ]
      };

      setCachedData(cacheKey, ratings);
      return ratings;
    } catch (error) {
      throw new Error(`Failed to fetch analyst ratings: ${error}`);
    }
  }
}
