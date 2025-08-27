#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function formatMCPResponse(response: any): string {
  if (!response || typeof response !== 'object') {
    return 'Invalid response format';
  }

  // Handle different response types
  if (response.result) {
    const result = response.result;
    
    // Resources list
    if (result.resources) {
      return `📚 Available Resources:\n${result.resources.map((r: any) => 
        `  • ${r.name} (${r.uri})\n    ${r.description}`
      ).join('\n')}`;
    }
    
    // Tools list
    if (result.tools) {
      return `🛠️  Available Tools:\n${result.tools.map((t: any) => 
        `  • ${t.name}\n    ${t.description}`
      ).join('\n')}`;
    }
    
    // Resource content
    if (result.contents && result.contents[0]) {
      const content = result.contents[0];
      if (content.uri?.includes('news-releases')) {
        return formatNewsReleases(content.data);
      } else if (content.uri?.includes('events')) {
        return formatEvents(content.data);
      } else if (content.uri?.includes('financial')) {
        return formatFinancialData(content.data);
      } else if (content.uri?.includes('market')) {
        return formatMarketIntelligence(content.data);
      } else if (content.uri?.includes('economic')) {
        return formatEconomicAnalysis(content.data);
      } else if (content.uri?.includes('investment')) {
        return formatInvestmentResearch(content.data);
      }
      return `📄 Resource Content:\n${JSON.stringify(content.data, null, 2)}`;
    }
    
    // Tool call result
    if (response.result.content && response.result.content[0]) {
      const content = response.result.content[0];
      if (content.text) {
        try {
          const parsed = JSON.parse(content.text);
          if (parsed.form) {
            return formatSECFilings(parsed);
          } else if (parsed.symbol) {
            return formatStockAnalysis(parsed);
          } else if (parsed.query) {
            return formatNewsAnalysis(parsed);
          } else if (parsed.housing) {
            return formatEconomicAnalysis(parsed);
          } else if (parsed.overview) {
            return formatInvestmentResearch(parsed);
          }
        } catch (e) {
          return `📊 Tool Result:\n${content.text}`;
        }
      }
    }
  }
  
  return `📋 Response:\n${JSON.stringify(response, null, 2)}`;
}

function formatNewsReleases(data: any): string {
  if (!data?.rss?.channel?.item) return 'No news releases found';
  
  const items = Array.isArray(data.rss.channel.item) ? data.rss.channel.item : [data.rss.channel.item];
  
  return `📰 Latest IR News Releases:\n${items.map((item: any, index: number) => 
    `${index + 1}. ${item.title}\n   📅 ${item.pubDate}\n   🔗 ${item.link}\n   📝 ${item.description}`
  ).join('\n\n')}`;
}

function formatEvents(data: any): string {
  if (!data?.rss?.channel?.item) return 'No events found';
  
  const items = Array.isArray(data.rss.channel.item) ? data.rss.channel.item : [data.rss.channel.item];
  
  return `📅 Upcoming IR Events:\n${items.map((item: any, index: number) => 
    `${index + 1}. ${item.title}\n   📅 ${item.pubDate}\n   🔗 ${item.link}\n   📝 ${item.description}`
  ).join('\n\n')}`;
}

function formatFinancialData(data: any): string {
  if (!data) return 'No financial data available';
  
  let result = '💰 Financial Overview:\n';
  
  if (data.overview) {
    const overview = data.overview;
    result += `📊 Company: ${overview.Name || 'N/A'}\n`;
    result += `🏢 Sector: ${overview.Sector || 'N/A'}\n`;
    result += `💼 Industry: ${overview.Industry || 'N/A'}\n`;
    result += `💵 Market Cap: ${overview.MarketCapitalization ? `$${(parseFloat(overview.MarketCapitalization) / 1000000000).toFixed(2)}B` : 'N/A'}\n`;
    result += `👥 Employees: ${overview.Employees || 'N/A'}\n`;
  }
  
  if (data.quote) {
    const quote = data.quote;
    result += `\n📈 Current Quote:\n`;
    result += `   Price: $${quote.price?.toFixed(2) || 'N/A'}\n`;
    result += `   Change: ${quote.change?.toFixed(2) || 'N/A'} (${quote.changePercent?.toFixed(2) || 'N/A'}%)\n`;
    result += `   Volume: ${quote.volume?.toLocaleString() || 'N/A'}\n`;
  }
  
  return result;
}

function formatMarketIntelligence(data: any): string {
  if (!data) return 'No market intelligence data available';
  
  let result = '📊 Market Intelligence:\n';
  result += `🔍 Query: ${data.query}\n`;
  result += `📅 Period: ${data.period}\n`;
  result += `⏰ Timestamp: ${data.timestamp}\n\n`;
  
  if (data.sentiment) {
    result += `😊 Sentiment Analysis:\n`;
    result += `   Overall: ${data.sentiment.overall}\n`;
    if (data.sentiment.scores) {
      result += `   Positive: ${data.sentiment.scores.positive}%\n`;
      result += `   Negative: ${data.sentiment.scores.negative}%\n`;
      result += `   Neutral: ${data.sentiment.scores.neutral}%\n`;
    }
  }
  
  if (data.summary) {
    result += `\n📝 Summary: ${data.summary.summary || data.summary}`;
  }
  
  return result;
}

function formatEconomicAnalysis(data: any): string {
  if (!data) return 'No economic analysis data available';
  
  let result = '🏠 Economic Analysis:\n';
  result += `⏰ Timestamp: ${data.timestamp}\n\n`;
  
  if (data.homeDepotImpact) {
    result += `🎯 Home Depot Impact:\n`;
    result += `   Overall: ${data.homeDepotImpact.overallImpact}\n`;
    result += `   Score: ${data.homeDepotImpact.score}/3\n`;
    result += `   Summary: ${data.homeDepotImpact.summary}\n\n`;
  }
  
  if (data.summary) {
    result += `📊 Summary:\n`;
    result += `   Housing: ${data.summary.housing}\n`;
    result += `   Consumer: ${data.summary.consumer}\n`;
    result += `   Macro: ${data.summary.macro}\n`;
    result += `   Home Depot: ${data.summary.homeDepot}\n`;
  }
  
  return result;
}

function formatInvestmentResearch(data: any): string {
  if (!data) return 'No investment research data available';
  
  let result = '📈 Investment Research:\n';
  result += `📊 Symbol: ${data.symbol}\n`;
  result += `⏰ Timestamp: ${data.timestamp}\n\n`;
  
  if (data.summary) {
    result += `🎯 Investment Summary:\n`;
    result += `   Recommendation: ${data.summary.recommendation}\n`;
    result += `   Confidence: ${data.summary.confidence}\n`;
    result += `   Risk Level: ${data.summary.riskLevel}\n`;
    result += `   Summary: ${data.summary.summary}\n\n`;
  }
  
  if (data.investmentThesis) {
    result += `📋 Investment Thesis:\n`;
    result += `   Bull Case: ${data.investmentThesis.bullCase.summary}\n`;
    result += `   Bear Case: ${data.investmentThesis.bearCase.summary}\n`;
    result += `   Neutral Case: ${data.investmentThesis.neutralCase.summary}\n`;
    result += `   Consensus: ${data.investmentThesis.consensus.summary}\n`;
  }
  
  return result;
}

function formatSECFilings(data: any): string {
  if (!Array.isArray(data)) return 'No SEC filings data available';
  
  return `📄 SEC Filings:\n${data.map((filing: any, index: number) => 
    `${index + 1}. ${filing.form} - ${filing.filingDate}\n   📋 ${filing.primaryDoc}\n   🔗 ${filing.filingUrl}`
  ).join('\n\n')}`;
}

function formatStockAnalysis(data: any): string {
  if (!data) return 'No stock analysis data available';
  
  let result = '📊 Stock Analysis:\n';
  result += `📈 Symbol: ${data.symbol}\n`;
  result += `⏰ Timestamp: ${data.timestamp}\n\n`;
  
  if (data.overview) {
    result += `🏢 Company Overview:\n`;
    result += `   Name: ${data.overview.Name || 'N/A'}\n`;
    result += `   Sector: ${data.overview.Sector || 'N/A'}\n`;
    result += `   Market Cap: ${data.overview.MarketCapitalization ? `$${(parseFloat(data.overview.MarketCapitalization) / 1000000000).toFixed(2)}B` : 'N/A'}\n`;
  }
  
  if (data.technical) {
    result += `\n📈 Technical Analysis:\n`;
    result += `   SMA 20: ${data.technical.sma20?.toFixed(2) || 'N/A'}\n`;
    result += `   SMA 50: ${data.technical.sma50?.toFixed(2) || 'N/A'}\n`;
    result += `   SMA 200: ${data.technical.sma200?.toFixed(2) || 'N/A'}\n`;
    result += `   RSI: ${data.technical.rsi?.toFixed(2) || 'N/A'}\n`;
  }
  
  return result;
}

function formatNewsAnalysis(data: any): string {
  if (!data) return 'No news analysis data available';
  
  let result = '📰 News Analysis:\n';
  result += `🔍 Query: ${data.query}\n`;
  result += `📅 Period: ${data.period}\n`;
  result += `⏰ Timestamp: ${data.timestamp}\n\n`;
  
  if (data.sentiment) {
    result += `😊 Sentiment:\n`;
    result += `   Overall: ${data.sentiment.overall}\n`;
    if (data.sentiment.scores) {
      result += `   Positive: ${data.sentiment.scores.positive}%\n`;
      result += `   Negative: ${data.sentiment.scores.negative}%\n`;
      result += `   Neutral: ${data.sentiment.scores.neutral}%\n`;
    }
  }
  
  return result;
}

async function testMCPServer() {
  console.log('🧪 Testing Enhanced Home Depot MCP Server...\n');
  
  const serverPath = join(__dirname, '..', 'dist', 'index.js');
  const serverProcess = spawn('node', [serverPath], {
    cwd: join(__dirname, '..'),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverOutput = '';
  serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('Server stderr:', data.toString());
  });

  // Test all resources and tools
  const tests = [
    { method: 'resources/list', params: {} },
    { method: 'tools/list', params: {} },
    { method: 'resources/read', params: { uri: 'res://ir/news-releases' } },
    { method: 'resources/read', params: { uri: 'res://ir/events' } },
    { method: 'resources/read', params: { uri: 'res://financial/overview' } },
    { method: 'resources/read', params: { uri: 'res://market/intelligence' } },
    { method: 'resources/read', params: { uri: 'res://economic/analysis' } },
    { method: 'resources/read', params: { uri: 'res://investment/research' } },
    { method: 'tools/call', params: { name: 'get_sec_filings', arguments: { limit: 5 } } },
    { method: 'tools/call', params: { name: 'get_stock_analysis', arguments: { symbol: 'HD' } } },
    { method: 'tools/call', params: { name: 'get_news_analysis', arguments: { query: 'Home Depot', days: 30 } } },
    { method: 'tools/call', params: { name: 'get_economic_analysis', arguments: {} } },
    { method: 'tools/call', params: { name: 'get_competitor_analysis', arguments: {} } },
    { method: 'tools/call', params: { name: 'get_investment_thesis', arguments: { symbol: 'HD' } } },
    { method: 'tools/call', params: { name: 'get_technical_analysis', arguments: { symbol: 'HD' } } },
    { method: 'tools/call', params: { name: 'get_valuation_analysis', arguments: { symbol: 'HD' } } }
  ];

  console.log('📤 Sending test requests...\n');
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const request = {
      jsonrpc: '2.0',
      id: i + 1,
      method: test.method,
      params: test.params
    };
    
    console.log(`📋 Test ${i + 1}: ${test.method} ${test.params.uri || test.params.name || ''}`);
    serverProcess.stdin.write(JSON.stringify(request) + '\n');
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Wait for responses
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('\n📤 Server Responses:');
  const responses = serverOutput.split('\n').filter(line => line.trim());
  
  responses.forEach((response, index) => {
    try {
      const parsed = JSON.parse(response);
      console.log(`\n📋 Response ${index + 1}:`);
      console.log(formatMCPResponse(parsed));
    } catch (e) {
      // Skip non-JSON lines
    }
  });

  serverProcess.kill();
  console.log('\n✅ Enhanced test completed!');
}

testMCPServer().catch(console.error);
