import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Listing, Currency } from '../types';
import { formatCurrency } from '../lib/formatters';
import { TrendingUp, Sparkles, Calendar } from 'lucide-react';

interface AiMarketForecastChartProps {
  listings: Listing[];
  currency: Currency;
}

interface DataPoint {
  period: string;
  price: number;
  type: 'actual' | 'predicted';
  minRange?: number;
  maxRange?: number;
}

export default function AiMarketForecastChart({ listings, currency }: AiMarketForecastChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 280 });
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Calculate some aggregate values from listings to base the starting trends on
  const averageListingPrice = listings.length > 0 
    ? listings.reduce((sum, item) => sum + parseFloat(item.price), 0) / listings.length 
    : 1800000;

  // Generate historical trend + future prediction relative to our listings average
  const chartData: DataPoint[] = [
    { period: 'Q2 2025', price: averageListingPrice * 0.85, type: 'actual' },
    { period: 'Q3 2025', price: averageListingPrice * 0.90, type: 'actual' },
    { period: 'Q4 2025', price: averageListingPrice * 0.93, type: 'actual' },
    { period: 'Q1 2026', price: averageListingPrice * 0.97, type: 'actual' },
    { period: 'Q2 2026', price: averageListingPrice, type: 'actual' },
    { 
      period: 'Q3 2026', 
      price: averageListingPrice * 1.08, 
      type: 'predicted',
      minRange: averageListingPrice * 1.02,
      maxRange: averageListingPrice * 1.15
    }
  ];

  // Observe container size to enforce absolute fluidity
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 280),
          height: Math.max(height || 260, 260)
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Render D3 Graphic
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 25, right: 30, bottom: 40, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create main chart drawing container
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define Scales
    const xScale = d3.scalePoint<string>()
      .domain(chartData.map(d => d.period))
      .range([0, width]);

    // Compute min/max for scale with some breathing room
    const minVal = d3.min(chartData, d => d.minRange || d.price) || 0;
    const maxVal = d3.max(chartData, d => d.maxRange || d.price) || 3000000;
    const yScale = d3.scaleLinear()
      .domain([minVal * 0.92, maxVal * 1.08])
      .range([height, 0]);

    // Create defs for gradients and filters
    const defs = svg.append('defs');

    // Gridline horizontal projection
    const gridlines = g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.05);

    gridlines.selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1);

    // Neural Confidence Range Band Gradient
    const confidenceGrad = defs.append('linearGradient')
      .attr('id', 'confidence-zone-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    confidenceGrad.append('stop').attr('offset', '0%').attr('stop-color', '#C9A84C').attr('stop-opacity', 0.15);
    confidenceGrad.append('stop').attr('offset', '100%').attr('stop-color', '#C9A84C').attr('stop-opacity', 0.0);

    // Glow filter for forecast highlight
    const glowFilter = defs.append('filter')
      .attr('id', 'gold-line-glow')
      .attr('x', '-20%').attr('y', '-20%')
      .attr('width', '140%').attr('height', '140%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', 4).attr('result', 'blur');
    glowFilter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    // Spline Generators
    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.period) || 0)
      .y(d => yScale(d.price))
      .curve(d3.curveMonotoneX);

    // 1. Draw Confidence Band for Q2->Q3 Prediction Range
    const preData = chartData.filter(d => d.period === 'Q2 2026' || d.period === 'Q3 2026');
    if (preData.length === 2) {
      const q2X = xScale(preData[0].period) || 0;
      const q3X = xScale(preData[1].period) || 0;
      const q2Y = yScale(preData[0].price);
      const q3MinY = yScale(preData[1].minRange || preData[1].price);
      const q3MaxY = yScale(preData[1].maxRange || preData[1].price);

      const areaPath = d3.path();
      areaPath.moveTo(q2X, q2Y);
      areaPath.lineTo(q3X, q3MaxY);
      areaPath.lineTo(q3X, q3MinY);
      areaPath.closePath();

      g.append('path')
        .attr('d', areaPath.toString())
        .attr('fill', 'url(#confidence-zone-grad)')
        .attr('opacity', 0.8);
    }

    // 2. Draw Historical path (solid gold)
    const actualData = chartData.filter(d => d.type === 'actual');
    g.append('path')
      .datum(actualData)
      .attr('class', 'line-historical')
      .attr('fill', 'none')
      .attr('stroke', '#C9A84C')
      .attr('stroke-width', 3)
      .attr('d', lineGenerator)
      .attr('stroke-linecap', 'round');

    // 3. Draw Prediction path (dashed cyan or premium gold-light)
    const predictionLineData = chartData.filter(d => d.period === 'Q2 2026' || d.period === 'Q3 2026');
    g.append('path')
      .datum(predictionLineData)
      .attr('class', 'line-prediction')
      .attr('fill', 'none')
      .attr('stroke', '#E5CE8A')
      .attr('stroke-dasharray', '5,5')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#gold-line-glow)')
      .attr('d', lineGenerator);

    // 4. Draw Interactive Axis
    const xAxisLabel = d3.axisBottom(xScale).tickSize(4);
    const yAxisLabel = d3.axisLeft(yScale).ticks(5).tickFormat((d) => {
      const val = d.valueOf();
      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
      return `$${val}`;
    });

    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxisLabel)
      .selectAll('text')
      .attr('fill', '#94A3B8')
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, sans-serif')
      .style('padding-top', '5px');

    g.append('g')
      .call(yAxisLabel)
      .selectAll('text')
      .attr('fill', '#94A3B8')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace');

    // Clean up axis lines to fit minimal grid style
    g.selectAll('.domain').attr('stroke', '#FFFFFF').attr('opacity', 0.1);
    g.selectAll('.tick line').attr('stroke', '#FFFFFF').attr('opacity', 0.15);

    // 5. Draw interactive hover circles
    const circlesGroup = g.append('g').attr('class', 'interactive-circles');

    circlesGroup.selectAll('circle')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.period) || 0)
      .attr('cy', d => yScale(d.price))
      .attr('r', 5)
      .attr('fill', d => d.type === 'predicted' ? '#E5CE8A' : '#C9A84C')
      .attr('stroke', '#0A111F')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 8)
          .attr('stroke-width', 3);

        const [mX, mY] = d3.pointer(event, svgRef.current);
        setHoveredPoint(d);
        setTooltipPos({ x: mX, y: mY - 10 });
      })
      .on('mousemove', function (event) {
        const [mX, mY] = d3.pointer(event, svgRef.current);
        setTooltipPos({ x: mX, y: mY - 10 });
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 5)
          .attr('stroke-width', 2);
        setHoveredPoint(null);
      });

  }, [dimensions, chartData]);

  return (
    <div className="bg-navy-mid/60 border border-gold/18 rounded-lg p-5 relative group flex flex-col justify-between" id="ai-market-forecast">
      <div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center border border-gold/25 shadow-[0_0_10px_rgba(201,168,76,0.1)]">
              <TrendingUp className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Market Forecast</h3>
              <p className="text-[9px] text-slate font-bold uppercase tracking-widest mt-0.5">Next-Quarter Predictive Value Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] bg-gold/5 border border-gold/20 text-gold font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3 text-gold" /> Neural Grid Active
          </div>
        </div>

        <div className="text-[11px] text-slate-light mb-4 flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="text-gold">●</span> Actual Sales History</span>
          <span className="flex items-center gap-1"><span className="text-gold-light opacity-80">--</span> AI Forecast (Q3 2026)</span>
          <span className="flex items-center gap-1"><span className="bg-gold/10 inline-block w-3 h-2 rounded border border-gold/20"></span> Projected Margin Zone</span>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full h-[180px] md:h-[200px] flex-1">
        <svg ref={svgRef} className="w-full h-full text-white overflow-visible" />

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute z-40 p-3 bg-navy border border-gold/30 rounded-lg shadow-2xl pointer-events-none text-xs flex flex-col gap-1 backdrop-blur-xl"
            style={{ 
              left: `${tooltipPos.x}px`, 
              top: `${tooltipPos.y - 60}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate font-bold uppercase tracking-wider">
               <Calendar className="w-3 h-3 text-gold/60" /> {hoveredPoint.period}
               {hoveredPoint.type === 'predicted' && (
                 <span className="bg-gold/10 text-gold px-1 rounded text-[8px] border border-gold/20">AI</span>
               )}
            </div>
            <div className="font-semibold text-cream text-[13px] mt-0.5">
               Median Value: <span className="font-serif text-gold font-bold">{formatCurrency(hoveredPoint.price, currency)}</span>
            </div>
            {hoveredPoint.type === 'predicted' && hoveredPoint.minRange && hoveredPoint.maxRange && (
              <div className="text-[9px] text-slate-light border-t border-white/5 pt-1 mt-1 leading-normal">
                Confidence Band: <br/>
                <span className="font-mono text-cream">{formatCurrency(hoveredPoint.minRange, currency)}</span> - <span className="font-mono text-cream">{formatCurrency(hoveredPoint.maxRange, currency)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate">
         <span className="italic">Based on {listings.length} live Listing portfolios</span>
         <span className="text-gold font-bold uppercase tracking-widest flex items-center gap-1">
           Growth projection: +8.1% Next Q Q-o-Q
         </span>
      </div>
    </div>
  );
}
