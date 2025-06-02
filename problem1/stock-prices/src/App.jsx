import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, BarChart3, Clock, DollarSign } from 'lucide-react';
import './index.css';
// Mock data generator
const generateMockStockData = (symbol, minutes = 60) => {
  const data = [];
  const basePrices = {
    'AAPL': 180, 'GOOGL': 140, 'MSFT': 380, 'TSLA': 250,
    'AMZN': 150, 'NVDA': 450, 'META': 320, 'NFLX': 400
  };
  const basePrice = basePrices[symbol] || 100;
  const now = new Date();

  for (let i = minutes; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000);
    const volatility = symbol === 'TSLA' ? 25 : 10;
    const price = basePrice + (Math.random() - 0.5) * volatility + Math.sin(i * 0.1) * 5;

    data.push({
      timestamp: timestamp.toISOString(),
      time: timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      price: Math.max(0, price),
      volume: Math.floor(Math.random() * 50000) + 10000
    });
  }
  return data;
};

const STOCK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];

const StockApp = () => {
  const [currentView, setCurrentView] = useState('chart');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [timeInterval, setTimeInterval] = useState(60);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    setLoading(true);
    const data = {};
    STOCK_SYMBOLS.forEach(symbol => {
      data[symbol] = generateMockStockData(symbol, timeInterval);
    });
    setStockData(data);
    setLoading(false);
  }, [timeInterval]);

  const averagePrice = useMemo(() => {
    if (!stockData[selectedStock]) return 0;
    const prices = stockData[selectedStock].map(d => d.price);
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  }, [stockData, selectedStock]);

  const calculateCorrelation = (x, y) => {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;
    const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    let numerator = 0, denomX = 0, denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlationMatrix = useMemo(() => {
    if (!stockData || Object.keys(stockData).length === 0) return {};

    const matrix = {};
    STOCK_SYMBOLS.forEach(symbol1 => {
      matrix[symbol1] = {};
      STOCK_SYMBOLS.forEach(symbol2 => {
        if (symbol1 === symbol2) {
          matrix[symbol1][symbol2] = 1;
        } else {
          const prices1 = stockData[symbol1]?.map(d => d.price) || [];
          const prices2 = stockData[symbol2]?.map(d => d.price) || [];
          matrix[symbol1][symbol2] = calculateCorrelation(prices1, prices2);
        }
      });
    });
    return matrix;
  }, [stockData]);

  const getCorrelationColor = (correlation) => {
    const intensity = Math.abs(correlation).toFixed(2);
    return correlation > 0
      ? `rgba(34, 197, 94, ${intensity})`
      : `rgba(239, 68, 68, ${intensity})`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Time: ${label}`}</p>
          <p className="text-blue-600">{`Price: $${data.price.toFixed(2)}`}</p>
          <p className="text-gray-600">{`Volume: ${data.volume.toLocaleString()}`}</p>
          <p className="text-purple-600">{`Average: $${averagePrice.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Stock Analytics Dashboard</h1>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentView('chart')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'chart'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-800 border border-gray-200'
                }`}
              >
                Stock Chart
              </button>
              <button
                onClick={() => setCurrentView('heatmap')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'heatmap'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-800 border border-gray-200'
                }`}
              >
                Correlation Heatmap
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'chart' ? (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Stock Price Analysis</h2>
                <p className="text-gray-600">Real-time stock price visualization with analytics</p>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {STOCK_SYMBOLS.map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
                <select
                  value={timeInterval}
                  onChange={(e) => setTimeInterval(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={30}>Last 30 minutes</option>
                  <option value={60}>Last 60 minutes</option>
                  <option value={120}>Last 2 hours</option>
                  <option value={240}>Last 4 hours</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Current Price</p>
                    <p className="text-xl font-bold text-blue-800">
                      ${stockData[selectedStock]?.slice(-1)[0]?.price.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Average Price</p>
                    <p className="text-xl font-bold text-green-800">${averagePrice.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Time Interval</p>
                    <p className="text-xl font-bold text-purple-800">{timeInterval}m</p>
                  </div>
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Data Points</p>
                    <p className="text-xl font-bold text-orange-800">
                      {stockData[selectedStock]?.length || 0}
                    </p>
                  </div>
                  <BarChart3 className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockData[selectedStock] || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Stock Price"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={() => averagePrice}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Average Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Correlation Heatmap</h2>
            <div className="grid grid-cols-9 gap-1 text-xs">
              <div></div>
              {STOCK_SYMBOLS.map(symbol => (
                <div key={symbol} className="p-2 text-center font-medium text-gray-700 bg-gray-100">
                  {symbol}
                </div>
              ))}
              {STOCK_SYMBOLS.map(symbol1 => (
                <React.Fragment key={symbol1}>
                  <div className="p-2 text-center font-medium text-gray-700 bg-gray-100">
                    {symbol1}
                  </div>
                  {STOCK_SYMBOLS.map(symbol2 => {
                    const correlation = correlationMatrix[symbol1]?.[symbol2] || 0;
                    return (
                      <div
                        key={`${symbol1}-${symbol2}`}
                        className="p-3 text-center font-medium text-white cursor-pointer transition-all duration-200 hover:scale-105 rounded"
                        style={{ backgroundColor: getCorrelationColor(correlation) }}
                        onMouseEnter={() => setHoveredCell({ symbol1, symbol2, correlation })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {correlation.toFixed(2)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StockApp;
