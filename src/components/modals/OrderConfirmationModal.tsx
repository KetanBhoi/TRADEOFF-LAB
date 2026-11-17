import React, { useState, useEffect } from 'react';
import { TradingOrder, OrderSide, OrderType, OrderProduct } from '../../types/trading';
import { ShieldAlert, X, Check, AlertTriangle, ArrowRight, Calculator, Lock } from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    product: OrderProduct;
    quantity: number;
    price: number;
    stopLossPrice?: number;
    targetPrice?: number;
    currentPrice: number;
  } | null;
  onConfirmOrder: (order: TradingOrder) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onConfirmOrder,
}) => {
  const [acknowledgedRisk, setAcknowledgedRisk] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAcknowledgedRisk(false);
    }
  }, [isOpen, orderData?.symbol, orderData?.side, orderData?.quantity]);

  if (!isOpen || !orderData) return null;

  const estimatedTurnover = Math.round(orderData.quantity * orderData.price * 100) / 100;
  // Indian market statutory charges calculation
  const flatBrokerage = 20;
  const stt = orderData.product === 'CNC' ? Math.round(estimatedTurnover * 0.001 * 100) / 100 : Math.round(estimatedTurnover * 0.00025 * 100) / 100;
  const exchangeTurnoverCharge = Math.round(estimatedTurnover * 0.0000345 * 100) / 100;
  const gst = Math.round((flatBrokerage + exchangeTurnoverCharge) * 0.18 * 100) / 100;
  const stampDuty = orderData.side === 'BUY' ? Math.round(estimatedTurnover * 0.00015 * 100) / 100 : 0;
  const totalCharges = Math.round((flatBrokerage + stt + gst + stampDuty + exchangeTurnoverCharge) * 100) / 100;

  const marginRequired = orderData.product === 'MIS' ? Math.round(estimatedTurnover * 0.2) : estimatedTurnover;

  const handleConfirm = () => {
    if (!acknowledgedRisk) return;

    const newOrder: TradingOrder = {
      id: `ORD_${Date.now()}`,
      symbol: orderData.symbol,
      side: orderData.side,
      type: orderData.type,
      product: orderData.product,
      quantity: orderData.quantity,
      price: orderData.price,
      triggerPrice: orderData.stopLossPrice,
      status: 'EXECUTED',
      timestamp: new Date().toLocaleTimeString(),
      executionPrice: orderData.price,
      brokerage: flatBrokerage,
      stt,
      gst,
      totalCharges,
    };

    onConfirmOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            orderData.side === 'BUY' ? 'bg-emerald-50/80 border-emerald-200' : 'bg-rose-50/80 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center shadow-xs ${
                orderData.side === 'BUY' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {orderData.side}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Confirm {orderData.side} Order
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 rounded">
                  {orderData.product} · {orderData.type}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Mandatory confirmation safeguard prior to broker routing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main Order Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block font-mono">Instrument</span>
              <strong className="text-base font-bold text-slate-900">{orderData.symbol}</strong>
              <span className="text-[11px] text-slate-500 block">LTP: ₹{orderData.currentPrice.toLocaleString()}</span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block font-mono">Order Size</span>
              <strong className="text-base font-bold text-slate-900">
                {orderData.quantity} Shares @ ₹{orderData.price.toLocaleString()}
              </strong>
              <span className="text-[11px] text-slate-500 block font-mono">
                Turnover: ₹{estimatedTurnover.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stop Loss & Target Safety */}
          {orderData.stopLossPrice && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900 font-mono">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Stop-Loss Attached:</span>
              </div>
              <span className="font-bold">₹{orderData.stopLossPrice.toLocaleString()}</span>
            </div>
          )}

          {/* Charges & Margin Breakdown Table */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Statutory Charges & Margin Estimate
            </span>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Brokerage (Flat)</span>
                <span>₹{flatBrokerage.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Securities Transaction Tax (STT)</span>
                <span>₹{stt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%) & Exchange Charges</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                <span>Total Estimated Charges</span>
                <span className="text-orange-600">₹{totalCharges.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                <span>Margin Required ({orderData.product})</span>
                <span className="text-indigo-700">₹{marginRequired.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Mandatory Safeguard Checkbox */}
          <label className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={acknowledgedRisk}
              onChange={(e) => setAcknowledgedRisk(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              I confirm this order request. I acknowledge that stock market and IPO trading involve market risk,
              and this order is placed under my direct instruction.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Cancel Order
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!acknowledgedRisk}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-2xs ${
              orderData.side === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300'
                : 'bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300'
            }`}
          >
            <span>Confirm & Execute {orderData.side}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
