import React, { useState } from 'react';
import {
  generateScenarioExport,
  generateScenarioCsv,
  downloadCsvFile,
  downloadJsonFile,
  ScenarioExportPayload,
} from '../../utils/exportUtils';
import {
  X,
  Copy,
  Check,
  Download,
  FileJson,
  FileText,
  Printer,
  Table,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId: string;
  params: unknown;
  onExportSuccess?: (message: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  scenarioId,
  params,
  onExportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'csv' | 'json' | 'summary'>('pdf');
  const [copiedType, setCopiedType] = useState<'none' | 'json' | 'csv' | 'summary'>('none');

  if (!isOpen) return null;

  const payload: ScenarioExportPayload = generateScenarioExport(scenarioId, params);
  const jsonString = JSON.stringify(payload, null, 2);
  const csvString = generateScenarioCsv(payload);

  const formattedSummary = `[${payload.scenarioTitle}]
Exported: ${new Date(payload.exportedAt).toLocaleString()}

DECISION VERDICT & SUMMARY:
${payload.decisionSummary}

INPUT CONFIGURATION:
${Object.entries(payload.inputs)
  .map(([k, v]) => `• ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
  .join('\n')}

COMPUTED OUTCOMES:
${Object.entries(payload.computedResults)
  .filter(([k]) => k !== 'milestones' && k !== 'optionsBreakdown' && k !== 'riegelEquivalents')
  .map(([k, v]) => `• ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
  .join('\n')}

Generated via TradeOff Lab Decision Engineering Engine`;

  const dateStr = new Date().toISOString().split('T')[0];

  const handleDownloadCsv = () => {
    const filename = `tradeoff-lab-${scenarioId}-${dateStr}.csv`;
    downloadCsvFile(csvString, filename);
    onExportSuccess?.(`Exported CSV file (${filename}) successfully.`);
  };

  const handleDownloadJson = () => {
    const filename = `tradeoff-lab-${scenarioId}-${dateStr}.json`;
    downloadJsonFile(payload, filename);
    onExportSuccess?.(`Exported JSON bundle (${filename}) successfully.`);
  };

  const handlePrintPdf = () => {
    // Triggers browser print dialog where user selects "Save as PDF"
    let fired = false;
    const notifyDone = () => {
      if (fired) return;
      fired = true;
      window.removeEventListener('afterprint', notifyDone);
      onExportSuccess?.(`PDF / Print export finished for ${payload.scenarioTitle}.`);
    };
    window.addEventListener('afterprint', notifyDone);
    window.print();
    // Ensure toast still triggers if browser closes print synchronously or skips afterprint
    window.setTimeout(notifyDone, 150);
  };

  const handleCopyCsv = async () => {
    try {
      await navigator.clipboard.writeText(csvString);
      setCopiedType('csv');
      setTimeout(() => setCopiedType('none'), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopiedType('json');
      setTimeout(() => setCopiedType('none'), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(formattedSummary);
      setCopiedType('summary');
      setTimeout(() => setCopiedType('none'), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Export Scenario Data
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                  PDF · CSV · JSON
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Save active simulation parameters and computed outcomes for reports or spreadsheet modeling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Format Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'pdf'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF Document</span>
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'csv'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV Spreadsheet</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'json'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Structured JSON</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Brief</span>
            </button>
          </div>

          {/* Quick Download Buttons */}
          <div className="flex items-center gap-2 pb-2 sm:pb-1.5 shrink-0">
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 py-1.5 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              title="Download scenario data table as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>
            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              title="Save as PDF or print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50 space-y-4">
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Print layout ready for PDF export. In the print dialog, select <strong>"Save as PDF"</strong> as the destination.
                  </span>
                </div>
                <button
                  onClick={handlePrintPdf}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shrink-0 text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print to PDF</span>
                </button>
              </div>

              {/* Printable PDF Document Preview */}
              <div
                id="printable-export-document"
                className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6 text-slate-900"
              >
                {/* Document Header */}
                <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">
                      <span>TradeOff Lab</span>
                      <span>·</span>
                      <span>Decision Engineering Engine</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-950 mt-1">
                      {payload.scenarioTitle}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Export Timestamp: {new Date(payload.exportedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono text-[11px] font-bold uppercase">
                    Status: Validated
                  </div>
                </div>

                {/* Verdict Box */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Executive Decision Verdict
                  </div>
                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    {payload.decisionSummary}
                  </p>
                </div>

                {/* 2-Column Grid: Inputs & Computed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inputs */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono border-b border-slate-100 pb-1">
                      Calibrated Input Levers
                    </h4>
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(payload.inputs).map(([k, v]) => (
                          <tr key={k} className="py-1.5">
                            <td className="py-1.5 pr-2 font-medium text-slate-600 capitalize">
                              {k.replace(/([A-Z])/g, ' $1')}
                            </td>
                            <td className="py-1.5 font-mono text-right font-semibold text-slate-900">
                              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Computed Results */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono border-b border-slate-100 pb-1">
                      Computed Outcomes & Tradeoffs
                    </h4>
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(payload.computedResults)
                          .filter(([k]) => k !== 'milestones' && k !== 'optionsBreakdown' && k !== 'riegelEquivalents')
                          .map(([k, v]) => (
                            <tr key={k} className="py-1.5">
                              <td className="py-1.5 pr-2 font-medium text-slate-600 capitalize">
                                {k.replace(/([A-Z])/g, ' $1')}
                              </td>
                              <td className="py-1.5 font-mono text-right font-bold text-slate-900">
                                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Scenario Specific Tables */}
                {Array.isArray((payload.computedResults as any).milestones) && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                      Training Pace Milestones
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase">
                          <tr>
                            <th className="py-2 px-3">Week</th>
                            <th className="py-2 px-3">Projected Pace</th>
                            <th className="py-2 px-3">Weekly Mileage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(payload.computedResults as any).milestones.map((m: any) => (
                            <tr key={m.week}>
                              <td className="py-2 px-3 font-semibold">Week {m.week}</td>
                              <td className="py-2 px-3 font-mono">{m.pace}</td>
                              <td className="py-2 px-3 font-mono">{m.weeklyMiles} miles</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {Array.isArray((payload.computedResults as any).optionsBreakdown) && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                      Living Options Breakdown
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase">
                          <tr>
                            <th className="py-2 px-3">Option</th>
                            <th className="py-2 px-3">Monthly Savings</th>
                            <th className="py-2 px-3">Annual Cash Savings</th>
                            <th className="py-2 px-3">Savings Rate</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(payload.computedResults as any).optionsBreakdown.map((opt: any) => (
                            <tr key={opt.name}>
                              <td className="py-2 px-3 font-semibold">{opt.name}</td>
                              <td className="py-2 px-3 font-mono">${opt.monthlySavings}</td>
                              <td className="py-2 px-3 font-mono">${opt.annualCashSavings}</td>
                              <td className="py-2 px-3 font-mono">{opt.savingsRatePercent}%</td>
                              <td className="py-2 px-3">
                                {opt.isWinner ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    OPTIMAL
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500">Alternative</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Document Footer */}
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Generated by TradeOff Lab</span>
                  <span>Confidential Decision Memo</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  CSV Data Table Preview (Comma Separated Values)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCsv}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    {copiedType === 'csv' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied CSV</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy CSV</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .CSV</span>
                  </button>
                </div>
              </div>
              <pre className="font-mono text-xs bg-white text-slate-800 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-200 max-h-[380px] whitespace-pre-wrap">
                {csvString}
              </pre>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Structured JSON Configuration & Outputs
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    {copiedType === 'json' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied JSON</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .JSON</span>
                  </button>
                </div>
              </div>
              <pre className="font-mono text-xs bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800 selection:bg-orange-500 selection:text-white max-h-[380px]">
                {jsonString}
              </pre>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Formatted Executive Memo
                </span>
                <button
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  {copiedType === 'summary' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Summary</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="font-mono text-xs bg-white text-slate-800 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-200 max-h-[380px] whitespace-pre-wrap">
                {formattedSummary}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Scenario: <strong className="text-slate-800">{payload.scenarioTitle}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
