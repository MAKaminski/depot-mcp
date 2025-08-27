# 🏠 Home Depot MCP Server - Comprehensive Investment Research

A powerful **Model Context Protocol (MCP)** server that provides comprehensive investment research and analysis for The Home Depot, Inc. (HD) and related market intelligence.

## 🚀 **What Makes This Server Significantly More Useful**

### **📊 Comprehensive Financial Data**
- **Real-time stock data** from Alpha Vantage and Yahoo Finance
- **Financial metrics** including P/E ratios, ROE, margins, debt ratios
- **Technical analysis** with moving averages, RSI, and trend signals
- **Valuation analysis** with over/under-valued assessments

### **📰 Market Intelligence & News Analysis**
- **Multi-source news aggregation** from NewsAPI, MarketWatch, Seeking Alpha
- **Sentiment analysis** with positive/negative/neutral scoring
- **Key theme extraction** identifying trends in earnings, housing, retail, etc.
- **Analyst ratings** and price targets

### **🏠 Economic Context & Impact Analysis**
- **Housing market indicators** (starts, permits, sales, prices)
- **Consumer sentiment** and spending patterns
- **Macroeconomic factors** (Fed rates, inflation, unemployment, GDP)
- **Home Depot impact scoring** based on economic environment

### **💼 Investment Research & Thesis Building**
- **Bull/Bear/Neutral case analysis** with supporting points
- **Risk assessment** across financial, operational, market, and regulatory factors
- **Competitive analysis** vs Lowe's and other competitors
- **Investment consensus** with confidence scoring

### **🔧 Advanced Tools & Capabilities**
- **SEC filings analysis** with filtering and document links
- **Competitor benchmarking** across the home improvement sector
- **Technical indicators** for trading decisions
- **Comprehensive reporting** with formatted, actionable insights

## 🛠️ **Available Resources**

| Resource | URI | Description |
|----------|-----|-------------|
| **IR News Releases** | `res://ir/news-releases` | Latest investor relations news |
| **IR Events** | `res://ir/events` | Upcoming presentations and calls |
| **Financial Overview** | `res://financial/overview` | Comprehensive financial data |
| **Market Intelligence** | `res://market/intelligence` | News sentiment and analysis |
| **Economic Analysis** | `res://economic/analysis` | Economic indicators and impact |
| **Investment Research** | `res://investment/research` | Complete investment thesis |

## 🎯 **Available Tools**

| Tool | Description | Parameters |
|------|-------------|------------|
| **`get_sec_filings`** | List SEC filings with filtering | `form`, `start`, `end`, `limit` |
| **`get_stock_analysis`** | Comprehensive stock data | `symbol`, `include_technical` |
| **`get_news_analysis`** | News sentiment analysis | `query`, `days` |
| **`get_economic_analysis`** | Economic indicators | None |
| **`get_competitor_analysis`** | Competitive positioning | None |
| **`get_investment_thesis`** | Investment thesis with cases | `symbol` |
| **`get_technical_analysis`** | Technical indicators | `symbol` |
| **`get_valuation_analysis`** | Valuation metrics | `symbol` |

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Build the Project**
```bash
npm run build
```

### **3. Start the Server**
```bash
npm start
```

### **4. Test All Features**
```bash
npm test
```

## 🔧 **Configuration**

### **API Keys Required**
Set these environment variables for full functionality:

```bash
export ALPHA_VANTAGE_API_KEY="your_key_here"
export NEWS_API_KEY="your_key_here" 
export FRED_API_KEY="your_key_here"
```

### **Free API Alternatives**
- **Alpha Vantage**: Free tier with 500 requests/day
- **NewsAPI**: Free tier with 1,000 requests/day
- **FRED**: Free with registration (unlimited requests)

## 📱 **Cursor Integration**

### **Method 1: Cursor Settings**
1. Go to **Settings → Extensions → MCP**
2. Click **"Add Server"**
3. Use these settings:
   - **Name:** `home-depot`
   - **Command:** `node`
   - **Args:** `dist/index.js`
   - **CWD:** `/path/to/depot-mcp`

### **Method 2: Config File**
Create `~/.cursor/mcp-servers.json`:
```json
{
  "mcpServers": {
    "home-depot": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/depot-mcp"
    }
  }
}
```

## 💡 **Example Queries**

Once connected to Cursor, try these questions:

### **📊 Financial Analysis**
- "Show me Home Depot's current financial metrics"
- "What's the technical analysis for HD stock?"
- "Get Home Depot's valuation analysis"

### **📰 Market Intelligence**
- "What's the latest news sentiment for Home Depot?"
- "Show me recent IR news releases"
- "What upcoming events does Home Depot have?"

### **🏠 Economic Context**
- "How is the housing market affecting Home Depot?"
- "What's the economic impact on HD?"
- "Show me economic indicators relevant to Home Depot"

### **💼 Investment Research**
- "Build me an investment thesis for Home Depot"
- "What are the bull and bear cases for HD?"
- "How does Home Depot compare to competitors?"
- "What are the key risks for Home Depot?"

### **📄 Regulatory & Compliance**
- "Get the last 5 SEC filings for Home Depot"
- "Show me recent 10-K and 10-Q filings"

## 🏗️ **Architecture**

```
src/
├── index.ts                 # Main MCP server
├── config.ts               # Configuration & constants
├── services/
│   ├── financialData.ts    # Stock & financial data
│   ├── newsIntelligence.ts # News & sentiment analysis
│   ├── economicData.ts     # Economic indicators
│   └── investmentResearch.ts # Investment analysis
└── cli.ts                  # Testing & development CLI
```

## 🔄 **Data Flow**

1. **MCP Request** → Server receives JSON-RPC call
2. **Service Layer** → Appropriate service processes request
3. **API Integration** → Fetches data from multiple sources
4. **Analysis Engine** → Processes and analyzes data
5. **Response Formatting** → Returns structured, actionable insights

## 🚨 **Error Handling & Fallbacks**

- **Graceful degradation** when APIs are unavailable
- **Mock data fallbacks** for development and testing
- **Comprehensive error logging** for debugging
- **Cache management** to reduce API calls

## 📈 **Performance Features**

- **Intelligent caching** (15-minute cache duration)
- **Parallel API calls** for faster response times
- **Request batching** to minimize overhead
- **Memory-efficient** data processing

## 🔮 **Future Enhancements**

- **Real-time alerts** for price movements and news
- **Portfolio tracking** and performance analysis
- **Advanced charting** and visualization tools
- **Machine learning** sentiment analysis
- **WebSocket support** for live data streaming

## 🤝 **Contributing**

This server demonstrates how to build a comprehensive MCP server that goes far beyond basic data retrieval. Key principles:

1. **Multiple data sources** for comprehensive coverage
2. **Intelligent analysis** rather than just data display
3. **Actionable insights** with clear recommendations
4. **Robust error handling** and fallback mechanisms
5. **Extensible architecture** for easy enhancement

## 📄 **License**

MIT License - feel free to use this as a template for building your own comprehensive MCP servers!

---

**Transform your MCP server from a simple data fetcher into a powerful investment research platform!** 🚀
