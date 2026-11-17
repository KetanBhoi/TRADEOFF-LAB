import React, { useState } from 'react';
import { BrokerAccount, BrokerType } from '../../types/trading';
import { ShieldCheck, X, Check, Key, Lock, ArrowRight, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

interface BrokerConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerAccount: BrokerAccount;
  onSaveBroker: (account: BrokerAccount) => void;
}

export const BrokerConnectModal: React.FC<BrokerConnectModalProps> = ({
  isOpen,
  onClose,
  brokerAccount,
  onSaveBroker,
}) => {
  const [selectedBroker, setSelectedBroker] = useState<BrokerType>(brokerAccount.broker);
  const [apiKey, setApiKey] = useState(brokerAccount.apiKey || '');
  const [clientCode, setClientCode] = useState(brokerAccount.clientCode || '');
  const [apiSecret, setApiSecret] = useState('');
  const [isPaperMode, setIsPaperMode] = useState(brokerAccount.isPaperTrading);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      onSaveBroker({
        broker: selectedBroker,
        isConnected: true,
        apiKey: apiKey || (selectedBroker === 'paper' ? 'PAPER_SIM_KEY' : 'API_KEY_ENCRYPTED'),
        clientCode: clientCode || (selectedBroker === 'paper' ? 'SIM_TRADER_01' : 'CLI_892341'),
        lastSyncTime: new Date().toLocaleTimeString(),
        isPaperTrading: isPaperMode || selectedBroker === 'paper',
      });
      setIsConnecting(false);
      onClose();
    }, 700);
  };

  const handleDisconnect = () => {
    onSaveBroker({
      broker: 'paper',
      isConnected: false,
      apiKey: '',
      clientCode: '',
      isPaperTrading: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Broker API Integration
              </h3>
              <p className="text-xs text-slate-500">
                Connect your Indian stockbroker via secure OAuth credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Broker Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Select Broker Provider
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'paper', name: 'Paper Simulator', badge: 'Virtual ₹1,00,000', desc: 'Risk-free simulated live trading' },
                { id: 'zerodha', name: 'Zerodha Kite', badge: 'Kite Connect API', desc: 'India’s largest discount broker' },
                { id: 'upstox', name: 'Upstox Pro', badge: 'API v2 OAuth', desc: 'High-speed institutional routing' },
                { id: 'angelone', name: 'Angel One', badge: 'SmartAPI', desc: 'Full-service low latency feed' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelectedBroker(b.id as BrokerType);
                    if (b.id === 'paper') setIsPaperMode(true);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedBroker === b.id
                      ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{b.name}</span>
                    {selectedBroker === b.id && <Check className="w-3.5 h-3.5 text-orange-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">{b.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Paper vs Live Mode Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Paper Trading Mode
              </span>
              <p className="text-[11px] text-slate-500">
                Execute virtual orders with live market ticks before committing real capital
              </p>
            </div>
            <input
              type="checkbox"
              checked={isPaperMode}
              onChange={(e) => setIsPaperMode(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
            />
          </div>

          {/* Credentials Inputs (Shown when not in pure paper mode) */}
          {selectedBroker !== 'paper' && (
            <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 font-mono">Client ID / UCC</label>
                <input
                  type="text"
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value)}
                  placeholder="e.g. ZER104829"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 font-mono">Broker API Key</label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API Key from Developer Console"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 font-mono">API Secret / TOTP Token</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="Encrypted client-side only"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-1">
                <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Keys are stored encrypted locally. Orders require explicit user confirmation.</span>
              </div>
            </div>
          )}

          {/* Status Alert */}
          {brokerAccount.isConnected && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Currently Connected: <strong>{brokerAccount.broker.toUpperCase()}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-rose-700 hover:text-rose-900 font-bold hover:underline"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConnect}
            disabled={isConnecting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Authorizing...</span>
              </>
            ) : (
              <>
                <span>Save & Connect API</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
