// Configuration for financial data APIs and data sources
export const CONFIG = {
  // Company Information
  COMPANY: {
    TICKER: 'HD',
    CIK: '0000354950',
    NAME: 'The Home Depot, Inc.',
    SECTOR: 'Consumer Discretionary',
    INDUSTRY: 'Home Improvement Retail'
  },

  // API Keys (you'll need to get these)
  API_KEYS: {
    ALPHA_VANTAGE: process.env.ALPHA_VANTAGE_API_KEY || 'demo',
    NEWS_API: process.env.NEWS_API_KEY || 'demo',
    FRED: process.env.FRED_API_KEY || 'demo'
  },

  // Data Sources
  DATA_SOURCES: {
    // Stock & Financial Data
    STOCK: {
      ALPHA_VANTAGE: 'https://www.alphavantage.co/query',
      YAHOO_FINANCE: 'https://query1.finance.yahoo.com/v8/finance/chart/HD',
      SEC_EDGAR: 'https://data.sec.gov'
    },

    // News & Market Intelligence
    NEWS: {
      NEWS_API: 'https://newsapi.org/v2/everything',
      MARKETWATCH: 'https://www.marketwatch.com/investing/stock/hd',
      SEEKING_ALPHA: 'https://seekingalpha.com/symbol/HD',
      BENZINGA: 'https://www.benzinga.com/stock/HD'
    },

    // Economic Data
    ECONOMIC: {
      FRED: 'https://api.stlouisfed.org/fred/series/observations',
      HOUSING_STARTS: 'https://api.stlouisfed.org/fred/series/observations?series_id=HOUST',
      CONSUMER_SENTIMENT: 'https://api.stlouisfed.org/fred/series/observations?series_id=UMCSENT',
      INTEREST_RATES: 'https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS'
    },

    // Company Intelligence
    COMPANY_INTEL: {
      OPENCORPORATES: 'https://api.opencorporates.com',
      CLEARBIT: 'https://company.clearbit.com/v2/companies/find',
      CRUNCHBASE: 'https://api.crunchbase.com/api/v4'
    }
  },

  // Default Parameters
  DEFAULTS: {
    STOCK_LOOKBACK_DAYS: 365,
    NEWS_LOOKBACK_DAYS: 30,
    MAX_RESULTS: 50,
    CACHE_DURATION_MINUTES: 15
  },

  // User Agent for API requests
  USER_AGENT: 'home-depot-mcp/1.0 (investment-research-tool)'
};

// Economic indicators relevant to Home Depot
export const ECONOMIC_INDICATORS = {
  HOUSING: {
    HOUSING_STARTS: 'HOUST',           // New housing starts
    BUILDING_PERMITS: 'PERMIT',        // Building permits
    EXISTING_HOME_SALES: 'EXHOSLUSQ156N', // Existing home sales
    NEW_HOME_SALES: 'HSN1F',          // New home sales
    HOUSING_PRICE_INDEX: 'USSTHPI'    // Housing price index
  },
  CONSUMER: {
    CONSUMER_SENTIMENT: 'UMCSENT',     // Consumer sentiment
    RETAIL_SALES: 'RSAFS',            // Retail sales
    PERSONAL_CONSUMPTION: 'PCE',      // Personal consumption
    DISPOSABLE_INCOME: 'DSPIC96'      // Disposable income
  },
  MACRO: {
    FED_FUNDS_RATE: 'FEDFUNDS',       // Federal funds rate
    INFLATION_CPI: 'CPIAUCSL',        // Consumer price index
    UNEMPLOYMENT: 'UNRATE',           // Unemployment rate
    GDP: 'GDP'                        // Gross domestic product
  }
};

// Competitor analysis
export const COMPETITORS = {
  LOWES: { ticker: 'LOW', name: 'Lowe\'s Companies, Inc.' },
  MENARDS: { ticker: 'Private', name: 'Menards' },
  ACE_HARDWARE: { ticker: 'Private', name: 'Ace Hardware' },
  TRUE_VALUE: { ticker: 'Private', name: 'True Value' }
};

// Financial ratios and metrics to track
export const FINANCIAL_METRICS = {
  VALUATION: ['P/E', 'P/B', 'P/S', 'EV/EBITDA', 'PEG'],
  PROFITABILITY: ['ROE', 'ROA', 'ROIC', 'Gross Margin', 'Operating Margin', 'Net Margin'],
  GROWTH: ['Revenue Growth', 'EPS Growth', 'Dividend Growth', 'Book Value Growth'],
  FINANCIAL_HEALTH: ['Debt/Equity', 'Current Ratio', 'Quick Ratio', 'Interest Coverage'],
  EFFICIENCY: ['Asset Turnover', 'Inventory Turnover', 'Receivables Turnover']
};
