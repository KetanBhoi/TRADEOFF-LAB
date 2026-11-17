import React, { useState } from 'react';
import {
  CoolingOffSettings,
  BlackoutSchedule,
} from '../../types/trading';
import {
  ShieldAlert,
  Clock,
  Ban,
  PauseCircle,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Calendar,
  Lock,
  RotateCcw,
  Play,
  X,
} from 'lucide-react';

export const BehavioralGuardrailsTab: React.FC = () => {
  const [settings, setSettings] = useState<CoolingOffSettings>({
    isCoolingOffActive: true,
    orderThresholdAmount: 50000,
    coolingOffMinutes: 30,
    dailyMaxTrades: 6,
    todayTradesCount: 4,
    consecutiveLossCount: 2,
    consecutiveLossThreshold: 3,
    isStreakCoolingOffTriggered: false,
    blackoutSchedules: [
      {
        id: 'blk-rbi',
        title: 'RBI Monetary Policy Resolution Window',
        type: 'RBI_MPC',
        startTime: '09:45 AM',
        endTime: '11:15 AM',
        isActive: true,
        notes: 'Extreme bid-ask spread widening and volatility whipsaw around rate decision announcement.',
      },
      {
        id: 'blk-budget',
        title: 'Union Budget Parliamentary Speech Window',
        type: 'BUDGET_DAY',
        startTime: '10:45 AM',
        endTime: '01:30 PM',
        isActive: true,
        notes: 'Severe implied volatility crush and rapid sector rotation during tax policy readings.',
      },
      {
        id: 'blk-postopen',
        title: 'Pre-Market / First 15-Minute Noise Filter',
        type: 'CUSTOM',
        startTime: '09:15 AM',
        endTime: '09:30 AM',
        isActive: true,
        notes: 'Avoids retail open FOMO traps and false gap fill breakdowns.',
      },
    ],
  });

  // Simulated cooling-off active timer
  const [simulatedTimerSeconds, setSimulatedTimerSeconds] = useState<number | null>(null);

  const toggleBlackout = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      blackoutSchedules: prev.blackoutSchedules.map((b) =>
        b.id === id ? { ...b, isActive: !b.isActive } : b
      ),
    }));
  };

  const handleSimulateLargeOrder = () => {
    setSimulatedTimerSeconds(settings.coolingOffMinutes * 60);
  };

  const cancelSimulatedTimer = () => {
    setSimulatedTimerSeconds(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Behavioral Guardrails & Cooling-Off Engine
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-50 text-rose-800 rounded border border-rose-200">
                Impulse Protection
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Enforce mandatory cooling-off delays on large orders, daily execution limits, loss-streak breaks, and event blackout schedules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${
              settings.isCoolingOffActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Guardrails {settings.isCoolingOffActive ? 'Active' : 'Disabled'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Simulated Active Cooling-Off Waiting Period Banner (if triggered) */}
      {simulatedTimerSeconds !== null && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400 animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  Mandatory Large-Order Cooling-Off in Progress
                </h4>
                <p className="text-xs text-slate-400">
                  Order amount of ₹75,000 exceeds your ₹{settings.orderThresholdAmount.toLocaleString()} threshold.
                </p>
              </div>
            </div>
            <button
              onClick={cancelSimulatedTimer}
              className="py-1 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel Order & Reset
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-300 font-medium">Remaining Reflection Window:</span>
              <div className="font-mono text-2xl font-bold text-amber-400">
                {Math.floor(simulatedTimerSeconds / 60)}m {simulatedTimerSeconds % 60}s
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              This enforced delay gives you time to verify your trade thesis, ensuring the order is not driven by emotional FOMO or adrenaline.
            </p>
          </div>
        </div>
      )}

      {/* Grid: 3 Core Guardrail Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Large-Order Cooling Off */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Large-Order Delay Timer
            </h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Requires an intentional pause before executing trades exceeding a set capital threshold.
          </p>

          <div className="space-y-3 pt-2 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-sans">
                <span className="text-slate-600 font-medium">Trigger Threshold:</span>
                <span className="font-bold text-slate-900">₹{settings.orderThresholdAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={settings.orderThresholdAmount}
                onChange={(e) => setSettings((s) => ({ ...s, orderThresholdAmount: Number(e.target.value) }))}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-sans">
                <span className="text-slate-600 font-medium">Mandatory Delay:</span>
                <span className="font-bold text-slate-900">{settings.coolingOffMinutes} Minutes</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={settings.coolingOffMinutes}
                onChange={(e) => setSettings((s) => ({ ...s, coolingOffMinutes: Number(e.target.value) }))}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSimulateLargeOrder}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 font-sans"
            >
              <Play className="w-3.5 h-3.5 text-slate-600" />
              <span>Simulate ₹75,000 Order Trigger</span>
            </button>
          </div>
        </div>

        {/* 2. Daily Churn & Overtrading Cap */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Daily Churn Rate Cap
            </h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Limits total daily executions to eliminate reckless churning and exchange fee accumulation.
          </p>

          <div className="space-y-3 pt-2 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-sans">
                <span className="text-slate-600 font-medium">Daily Max Orders:</span>
                <span className="font-bold text-slate-900">{settings.dailyMaxTrades} Orders / Day</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={settings.dailyMaxTrades}
                onChange={(e) => setSettings((s) => ({ ...s, dailyMaxTrades: Number(e.target.value) }))}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-sans text-xs">
                <span className="text-slate-600">Today's Executions:</span>
                <span className="font-bold text-slate-900">{settings.todayTradesCount} / {settings.dailyMaxTrades}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full"
                  style={{ width: `${(settings.todayTradesCount / settings.dailyMaxTrades) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block font-sans">
                {settings.dailyMaxTrades - settings.todayTradesCount} permissible executions remaining today.
              </span>
            </div>
          </div>
        </div>

        {/* 3. Loss-Streak Circuit Breaker */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Consecutive Loss Breaker
            </h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Forces a mandatory break whenever consecutive losses exceed threshold to curb revenge trading.
          </p>

          <div className="space-y-3 pt-2 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-sans">
                <span className="text-slate-600 font-medium">Loss Streak Trigger:</span>
                <span className="font-bold text-slate-900">{settings.consecutiveLossThreshold} Losses</span>
              </div>
              <input
                type="range"
                min="2"
                max="5"
                step="1"
                value={settings.consecutiveLossThreshold}
                onChange={(e) => setSettings((s) => ({ ...s, consecutiveLossThreshold: Number(e.target.value) }))}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1 text-xs font-sans">
              <span className="font-bold text-amber-950 block">Current Status:</span>
              <p className="text-[11px] text-amber-900">
                You currently have <strong>{settings.consecutiveLossCount} consecutive losing trades</strong>. 1 more will lock the order terminal for 45 minutes to restore composure.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* "Do Not Trade" / Blackout Schedule Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-700" />
            <h4 className="text-sm font-bold text-slate-900">
              High-Risk Event Blackout Schedules
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">Automated Order Lock</span>
        </div>

        <div className="space-y-2.5">
          {settings.blackoutSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                schedule.isActive
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-slate-100/50 border-slate-200/50 opacity-60'
              }`}
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{schedule.title}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-700 rounded border border-slate-200">
                    {schedule.startTime} - {schedule.endTime}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {schedule.notes}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => toggleBlackout(schedule.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    schedule.isActive
                      ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {schedule.isActive ? 'Blackout Enforced' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
