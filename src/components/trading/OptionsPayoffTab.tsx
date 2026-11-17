import React, { useState, useMemo, useEffect } from 'react';
import {
  INITIAL_OPTION_PRESETS,
  analyzeOptionsStrategy,
} from '../../utils/bestFeaturesData';
import { OptionChainInjectedLeg, OptionLeg, OptionSide, OptionType } from '../../types/trading';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  AlertTriangle,
  Plus,
  Trash2,
  Sliders,
  TrendingUp,
  Activity,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface OptionsPayoffTabProps {
  injectedLeg?: OptionChainInjectedLeg | null;
  onClearInjectedLeg?: () => void;
}

export const OptionsPayoffTab: React.FC<OptionsPayoffTabProps> = ({
  injectedLeg,
  onClearInjectedLeg,
}) => {
  const [activePresetId, setActivePresetId] = useState<string>(INITIAL_OPTION_PRESETS[0].id);
  const [spotPrice, setSpotPrice] = useState<number>(INITIAL_OPTION_PRESETS[0].spotPrice);
  const [lotSize, setLotSize] = useState<number>(INITIAL_OPTION_PRESETS[0].lotSize);
  const [ivPercent, setIvPercent] = useState<number>(INITIAL_OPTION_PRESETS[0].ivPercent);
  const [daysToExpiry, setDaysToExpiry] = useState<number>(INITIAL_OPTION_PRESETS[0].daysToExpiry);
  const [ivCrushDelta, setIvCrushDelta] = useState<number>(-4.0);
  const [legs, setLegs] = useState<OptionLeg[]>(INITIAL_OPTION_PRESETS[0].legs);

  useEffect(() => {
    if (!injectedLeg) return;
    setSpotPrice(injectedLeg.spotPrice);
    setLotSize(injectedLeg.lotSize);
    setActivePresetId('custom');
    setLegs((prev) => [
      ...prev,
      {
        id: `oi-leg-${Date.now()}`,
        side: injectedLeg.side,
        type: injectedLeg.type,
        strike: injectedLeg.strike,
        lots: 1,
        premium: injectedLeg.premium,
      },
    ]);
    onClearInjectedLeg?.();
  }, [injectedLeg, onClearInjectedLeg]);

  const handleSelectPreset = (presetId: string) => {
    const preset = INITIAL_OPTION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setSpotPrice(preset.spotPrice);
    setLotSize(preset.lotSize);
    setIvPercent(preset.ivPercent);
    setDaysToExpiry(preset.daysToExpiry);
    setLegs(preset.legs.map((l) => ({ ...l })));
  };

  const handleUpdateLeg = (id: string, field: keyof OptionLeg, value: any) => {
    setLegs((prev) =>
      prev.map((leg) => (leg.id === id ? { ...leg, [field]: value } : leg))
    );
  };

  const handleAddLeg = () => {
    const newLeg: OptionLeg = {
      id: `leg-${Date.now()}`,
      side: 'BUY',
      type: 'CE',
      strike: Math.round(spotPrice / 100) * 100,
      lots: 1,
      premium: 120,
    };
    setLegs((prev) => [...prev, newLeg]);
    setActivePresetId('custom');
  };

  const handleRemoveLeg = (id: string) => {
    if (legs.length <= 1) return;
    setLegs((prev) => prev.filter((l) => l.id !== id));
    setActivePresetId('custom');
  };

  const analysis = useMemo(
    () =>
      analyzeOptionsStrategy(
        spotPrice,
        lotSize,
        ivPercent,
        daysToExpiry,
        ivCrushDelta,
        legs
      ),
    [spotPrice, lotSize, ivPercent, daysToExpiry, ivCrushDelta, legs]
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium mb-1">
            <span>NSE F&O Greeks</span>
            <span aria-hidden="true">·</span>
            <span>Black-Scholes Payoff Modeling</span>
            <span aria-hidden="true">·</span>
            <span>IV Crush Stress Test</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Options Strategy Payoff & Greeks Visualizer
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Construct multi-leg option spreads, straddles, and iron condors. Inspect expiry payoff vs. T+0 theoretical value, daily Theta decay, and post-event implied volatility crush before deploying margin.
          </p>
        </div>

        {/* Summary Margin & Net Premium Strip */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-xl shrink-0 flex items-center gap-4">
          <div>
            <div className="text-[11px] font-medium text-slate-400">Net Cash Flow</div>
            <div
              className={`text-lg font-bold font-mono tabular-nums ${
                analysis.netPremiumFlow >= 0 ? 'text-emerald-400' : 'text-amber-300'
              }`}
            >
              {analysis.netPremiumFlow >= 0 ? '+' : ''}₹
              {analysis.netPremiumFlow.toLocaleString('en-IN')}{' '}
              <span className="text-[10px] font-normal text-slate-300">
                {analysis.netPremiumFlow >= 0 ? '(Credit)' : '(Debit)'}
              </span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-[11px] font-medium text-slate-400">Est. SPAN Margin</div>
            <div className="text-lg font-bold text-white font-mono tabular-nums">
              ₹{analysis.estimatedMargin.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* SEBI Mandatory F&O Risk Warning */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">
            SEBI Statutory Derivatives Risk Disclosure:
          </strong>
          <p className="text-amber-900 leading-relaxed text-[11px]">
            9 out of 10 individual traders in the equity Futures and Options (F&O) segment incurred net losses, with average net trading losses exceeding ₹50,000 plus substantial transaction costs (SEBI Study). Payoff charts exclude exchange STT, SEBI turnover fees, and sudden liquidity slippage. Educational analytical simulator only — not trade advice.
          </p>
        </div>
      </div>

      {/* Strategy Preset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {INITIAL_OPTION_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleAddLeg}
          className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Option Leg</span>
        </button>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chart + KPI Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Greeks & Payoff KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Max Profit Potential</div>
              <div className="text-base font-bold text-emerald-600 font-mono tabular-nums mt-0.5">
                {analysis.maxProfit === 'UNLIMITED'
                  ? 'Unlimited'
                  : `₹${analysis.maxProfit.toLocaleString('en-IN')}`}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Breakevens:{' '}
                {analysis.breakevens.length > 0
                  ? analysis.breakevens.map((b) => b.toLocaleString('en-IN')).join(' / ')
                  : 'None'}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Max Defined Loss</div>
              <div className="text-base font-bold text-rose-600 font-mono tabular-nums mt-0.5">
                {analysis.maxLoss === 'UNLIMITED'
                  ? 'Uncapped Risk'
                  : `₹${analysis.maxLoss.toLocaleString('en-IN')}`}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Lot Multiplier: {lotSize} units
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Daily Theta Decay</div>
              <div
                className={`text-base font-bold font-mono tabular-nums mt-0.5 ${
                  analysis.greeks.thetaPerDay >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {analysis.greeks.thetaPerDay >= 0 ? '+' : ''}₹
                {analysis.greeks.thetaPerDay.toLocaleString('en-IN')} / day
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono tabular-nums">
                Net Delta: {analysis.greeks.delta}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-medium text-slate-500">Vega (per 1% IV)</div>
              <div
                className={`text-base font-bold font-mono tabular-nums mt-0.5 ${
                  analysis.greeks.vegaPer1Pct >= 0 ? 'text-indigo-600' : 'text-amber-600'
                }`}
              >
                {analysis.greeks.vegaPer1Pct >= 0 ? '+' : ''}₹
                {analysis.greeks.vegaPer1Pct.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono tabular-nums">
                Gamma: {analysis.greeks.gamma}
              </div>
            </div>
          </div>

          {/* Interactive Payoff Curve Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Payoff Curve: Expiry Intrinsic vs. T+0 vs. IV Crush
                </h3>
                <p className="text-[11px] text-slate-500">
                  Spot Reference: ₹{spotPrice.toLocaleString('en-IN')} · IV: {ivPercent}% · {daysToExpiry} Days to Expiry
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium">
                <span className="flex items-center gap-1.5 text-slate-900">
                  <span className="w-3 h-0.5 bg-slate-900 inline-block" /> On Expiry
                </span>
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <span className="w-3 h-0.5 bg-indigo-600 inline-block" /> T+0 Current
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-3 h-0.5 bg-amber-500 inline-block" /> Post IV Crush ({ivCrushDelta}%)
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={analysis.payoffCurve}
                  margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="spot"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => v.toLocaleString('en-IN')}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    labelFormatter={(lbl) => `Spot: ${Number(lbl).toLocaleString('en-IN')}`}
                    formatter={(val: any, name: any) => [
                      `₹${Number(val ?? 0).toLocaleString('en-IN')}`,
                      name,
                    ]}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  <ReferenceLine
                    x={spotPrice}
                    stroke="#4f46e5"
                    strokeDasharray="4 4"
                    label={{ value: 'Spot', position: 'top', fill: '#4f46e5', fontSize: 10 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expiryPnl"
                    name="On Expiry"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    fill="#e2e8f0"
                    fillOpacity={0.35}
                  />
                  <Line
                    type="monotone"
                    dataKey="t0Pnl"
                    name="T+0 Theoretical"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ivCrushPnl"
                    name={`IV Crush (${ivCrushDelta}%)`}
                    stroke="#d97706"
                    strokeWidth={1.75}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Market Environment & Option Legs Editor (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Market & IV Crush Sliders */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Market & IV Crush Controls</span>
            </h4>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Underlying Spot Price</span>
                <span className="font-mono tabular-nums text-indigo-700">
                  {spotPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={22500}
                max={26000}
                step={50}
                value={spotPrice}
                onChange={(e) => setSpotPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Implied Volatility (IV %)</span>
                <span className="font-mono tabular-nums text-slate-900">{ivPercent}%</span>
              </div>
              <input
                type="range"
                min={8}
                max={35}
                step={0.5}
                value={ivPercent}
                onChange={(e) => setIvPercent(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Days to Expiry (DTE)</span>
                <span className="font-mono tabular-nums text-slate-900">{daysToExpiry}d</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={daysToExpiry}
                onChange={(e) => setDaysToExpiry(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-amber-800 mb-1">
                <span>Event IV Crush Scenario</span>
                <span className="font-mono tabular-nums font-bold">{ivCrushDelta}% IV</span>
              </div>
              <input
                type="range"
                min={-12}
                max={10}
                step={1}
                value={ivCrushDelta}
                onChange={(e) => setIvCrushDelta(Number(e.target.value))}
                className="w-full h-1.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Models post-RBI or earnings IV drop impact on option premiums before expiry.
              </p>
            </div>
          </div>

          {/* Option Legs Builder */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900">
                Active Strategy Legs ({legs.length})
              </h4>
              <span className="text-[11px] font-mono text-slate-500">Lot: {lotSize}</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {legs.map((leg) => (
                <div
                  key={leg.id}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={leg.side}
                        onChange={(e) =>
                          handleUpdateLeg(leg.id, 'side', e.target.value as OptionSide)
                        }
                        className={`px-2 py-1 rounded font-bold text-[11px] border ${
                          leg.side === 'BUY'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>

                      <select
                        value={leg.type}
                        onChange={(e) =>
                          handleUpdateLeg(leg.id, 'type', e.target.value as OptionType)
                        }
                        className="px-2 py-1 rounded font-bold text-[11px] bg-white border border-slate-300"
                      >
                        <option value="CE">CE (Call)</option>
                        <option value="PE">PE (Put)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLeg(leg.id)}
                      disabled={legs.length <= 1}
                      className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                      title="Remove leg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Strike</label>
                      <input
                        type="number"
                        step={50}
                        value={leg.strike}
                        onChange={(e) => handleUpdateLeg(leg.id, 'strike', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs font-mono font-semibold bg-white border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Premium ₹</label>
                      <input
                        type="number"
                        min={1}
                        value={leg.premium}
                        onChange={(e) => handleUpdateLeg(leg.id, 'premium', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs font-mono font-semibold bg-white border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Lots</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={leg.lots}
                        onChange={(e) =>
                          handleUpdateLeg(leg.id, 'lots', Math.max(1, Number(e.target.value)))
                        }
                        className="w-full px-2 py-1 text-xs font-mono font-semibold bg-white border border-slate-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
