import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ChartData } from '../types';
import { BarChart3, LineChart as LineChartIcon, PieChart, Info, Download, Maximize2, Sparkles } from 'lucide-react';

interface InteractiveChartsProps {
  charts: ChartData[];
}

const COLOR_PALETTE = [
  '#A67C52', // Editorial Ochre / Bronze
  '#1A1A1A', // Deep Charcoal
  '#4A6B5D', // Earthy Forest Green
  '#C29B70', // Warm Gold
  '#8C6D46', // Dark Ochre
  '#2D3748', // Charcoal Blue
];

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({ charts }) => {
  const [activeChartIndex, setActiveChartIndex] = useState(0);

  if (!charts || charts.length === 0) {
    return (
      <div className="p-8 text-center bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10">
        <BarChart3 className="w-10 h-10 text-[#A67C52] mx-auto mb-2" />
        <p className="font-serif italic text-sm text-[#1A1A1A]/60">No chart trends available for this paper.</p>
      </div>
    );
  }

  const activeChart = charts[activeChartIndex] || charts[0];

  const renderChartGraphic = (chart: ChartData) => {
    const data = chart.data || [];
    const dataKeys = chart.dataKeys || [];

    switch (chart.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" opacity={0.1} />
              <XAxis dataKey="name" stroke="#1A1A1A" opacity={0.6} fontSize={11} tickLine={false} />
              <YAxis stroke="#1A1A1A" opacity={0.6} fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', borderRadius: '8px', color: '#FFFFFF', fontSize: '12px' }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {dataKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 1.5 }}
                  activeDot={{ r: 7 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <defs>
                {dataKeys.map((key, idx) => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_PALETTE[idx % COLOR_PALETTE.length]} stopOpacity={0.5}/>
                    <stop offset="95%" stopColor={COLOR_PALETTE[idx % COLOR_PALETTE.length]} stopOpacity={0.05}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" opacity={0.1} />
              <XAxis dataKey="name" stroke="#1A1A1A" opacity={0.6} fontSize={11} tickLine={false} />
              <YAxis stroke="#1A1A1A" opacity={0.6} fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', borderRadius: '8px', color: '#FFFFFF', fontSize: '12px' }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {dataKeys.map((key, idx) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                  fillOpacity={1}
                  fill={`url(#grad-${key})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#1A1A1A" opacity={0.15} />
              <PolarAngleAxis dataKey="name" stroke="#1A1A1A" opacity={0.7} fontSize={11} />
              <PolarRadiusAxis stroke="#1A1A1A" opacity={0.5} fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', borderRadius: '8px', color: '#FFFFFF', fontSize: '12px' }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {dataKeys.map((key, idx) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                  fill={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                  fillOpacity={0.3}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" opacity={0.1} />
              <XAxis dataKey="name" stroke="#1A1A1A" opacity={0.6} fontSize={11} tickLine={false} />
              <YAxis stroke="#1A1A1A" opacity={0.6} fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', borderRadius: '8px', color: '#FFFFFF', fontSize: '12px' }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {dataKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-[#F9F7F2] rounded-2xl border border-[#1A1A1A]/10 p-4 sm:p-8 shadow-xs">
      
      {/* Chart Switcher Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#1A1A1A]/10">
        <div>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] block mb-1">
            Empirical Visualizations
          </span>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl sm:text-2xl text-[#1A1A1A]">
              Data Trends & Benchmark Visualizations
            </h3>
          </div>
        </div>

        {charts.length > 1 && (
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-[#1A1A1A]/10 overflow-x-auto max-w-full">
            {charts.map((chart, idx) => (
              <button
                key={chart.id || idx}
                onClick={() => setActiveChartIndex(idx)}
                className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeChartIndex === idx
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                }`}
                id={`chart-btn-${idx}`}
              >
                Chart #{idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Chart Header & Description */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2">
          <h4 className="font-serif text-base sm:text-lg text-[#1A1A1A]">
            {activeChart.chartTitle}
          </h4>
          <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full bg-[#A67C52]/10 text-[#A67C52] border border-[#A67C52]/20 text-[9px] uppercase tracking-widest font-bold">
            {activeChart.chartType} Chart
          </span>
        </div>
        {activeChart.description && (
          <p className="text-xs text-[#1A1A1A]/80 leading-relaxed bg-white p-3 sm:p-4 rounded-xl border border-[#1A1A1A]/10 font-serif italic">
            <Info className="w-3.5 h-3.5 text-[#A67C52] inline mr-1.5 not-italic" />
            {activeChart.description}
          </p>
        )}
      </div>

      {/* Render Chart Graphic */}
      <div className="w-full pt-4 pb-2 bg-white rounded-xl border border-[#1A1A1A]/10 shadow-xs overflow-hidden">
        {renderChartGraphic(activeChart)}
      </div>

      {/* Axis Labels & Data Summary Grid */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[#1A1A1A]/10 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 text-xs text-[#1A1A1A]/60">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {activeChart.xAxisLabel && (
            <span><strong className="text-[#1A1A1A]">X-Axis:</strong> {activeChart.xAxisLabel}</span>
          )}
          {activeChart.yAxisLabel && (
            <span><strong className="text-[#1A1A1A]">Y-Axis:</strong> {activeChart.yAxisLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#A67C52]">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Visualization
          </span>
        </div>
      </div>

    </div>
  );
};
