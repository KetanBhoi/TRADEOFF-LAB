import React, { useState } from 'react';
import { IpoItem, IpoAllotmentCheckResult } from '../../types/trading';
import { simulateAllotmentCheck } from '../../utils/tradingMockData';
import { X, Search, CheckCircle2, XCircle, Clock, Building, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

interface IpoAllotmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ipos: IpoItem[];
  selectedIpoId?: string;
}

export const IpoAllotmentModal: React.FC<IpoAllotmentModalProps> = ({
  isOpen,
  onClose,
  ipos,
  selectedIpoId,
}) => {
  const [activeIpoId, setActiveIpoId] = useState<string>(selectedIpoId || ipos[0]?.id || 'ipo-swiggy');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [appNumber, setAppNumber] = useState('10849204');
  const [searchQueryType, setSearchQueryType] = useState<'pan' | 'app'>('pan');
  const [result, setResult] = useState<IpoAllotmentCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const currentIpo = ipos.find((i) => i.id === activeIpoId) || ipos[0];

  const handleCheckAllotment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const query = searchQueryType === 'pan' ? panNumber : appNumber;
      const res = simulateAllotmentCheck(query, currentIpo);
      setResult(res);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Search className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                IPO Allotment Status Checker
              </h3>
              <p className="text-xs text-slate-500">
                Verify retail and HNI/NII bid allocations from official registrar feed
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
          <form onSubmit={handleCheckAllotment} className="space-y-4">
            {/* Select IPO */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                Select Company / Issue
              </label>
              <select
                value={activeIpoId}
                onChange={(e) => {
                  setActiveIpoId(e.target.value);
                  setResult(null);
                }}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              >
                {ipos.map((ipo) => (
                  <option key={ipo.id} value={ipo.id}>
                    {ipo.companyName} ({ipo.symbol}) · Status: {ipo.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Registrar Info Banner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Official Registrar: <strong className="text-slate-800">{currentIpo.registrar}</strong></span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Lot Size: {currentIpo.lotSize} sh
              </span>
            </div>

            {/* Toggle PAN vs App Number */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setSearchQueryType('pan')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  searchQueryType === 'pan'
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Search by PAN
              </button>
              <button
                type="button"
                onClick={() => setSearchQueryType('app')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  searchQueryType === 'app'
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Search by Application No.
              </button>
            </div>

            {/* Input field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 font-mono">
                {searchQueryType === 'pan' ? 'Income Tax PAN Number (10 Characters)' : 'IPO Application Number / CAF'}
              </label>
              <input
                type="text"
                value={searchQueryType === 'pan' ? panNumber : appNumber}
                onChange={(e) =>
                  searchQueryType === 'pan' ? setPanNumber(e.target.value.toUpperCase()) : setAppNumber(e.target.value)
                }
                placeholder={searchQueryType === 'pan' ? 'e.g. ABCDE1234F' : 'e.g. 10849204'}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono font-bold tracking-wider text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Querying Registrar Gateway...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Check Allotment Status</span>
                </>
              )}
            </button>
          </form>

          {/* Results Display */}
          {result && (
            <div className="space-y-3 pt-3 border-t border-slate-200 animate-in fade-in duration-150">
              <div
                className={`p-4 rounded-xl border flex items-start justify-between ${
                  result.status === 'ALLOTTED'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {result.status === 'ALLOTTED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="font-bold text-sm">
                      {result.status === 'ALLOTTED' ? 'Congratulations! Shares Allotted' : 'Shares Not Allotted'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {result.status === 'ALLOTTED'
                      ? `You received ${result.allottedShares} shares in ${result.companyName}. Shares will be credited to demat prior to listing day.`
                      : `Due to strong oversubscription (${currentIpo.subscriptionRetail}x retail), your application was not selected in the computerized lottery.`}
                  </p>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">Applied</span>
                  <strong className="text-slate-900">{result.appliedShares} Shares</strong>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">Allotted</span>
                  <strong className={result.allottedShares > 0 ? 'text-emerald-700' : 'text-slate-500'}>
                    {result.allottedShares} Shares
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">ASBA Status</span>
                  <strong className="text-slate-900">
                    {result.allottedShares > 0 ? 'Debited' : 'Unblocked'}
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">Refund / Unblock</span>
                  <strong className="text-slate-900">
                    ₹{result.refundAmount.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Data synchronized with registrar gateway
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
