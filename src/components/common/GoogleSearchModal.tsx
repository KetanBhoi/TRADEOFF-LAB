import React, { useState, useEffect } from 'react';
import { ScenarioId, RunningParams, HousingParams, GpaParams, BudgetParams, CustomParams } from '../../types';
import {
  Search,
  Globe,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Check,
  RefreshCw,
  X,
  MapPin,
  TrendingUp,
  BookOpen,
  DollarSign,
  Sliders,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';

export interface GroundedMetric {
  label: string;
  value: string;
  numericValue?: number;
  parameterKey?: string;
  description?: string;
}

export interface GroundedSource {
  title: string;
  url: string;
}

export interface GroundedSearchData {
  scenarioId: string;
  query: string;
  summary: string;
  keyMetrics: GroundedMetric[];
  suggestedValues: Record<string, number>;
  searchQueries: string[];
  sources: GroundedSource[];
  isRealtimeGrounded: boolean;
  timestamp: string;
}

interface GoogleSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: ScenarioId;
  runningParams: RunningParams;
  setRunningParams: React.Dispatch<React.SetStateAction<RunningParams>>;
  housingParams: HousingParams;
  setHousingParams: React.Dispatch<React.SetStateAction<HousingParams>>;
  gpaParams: GpaParams;
  setGpaParams: React.Dispatch<React.SetStateAction<GpaParams>>;
  budgetParams: BudgetParams;
  setBudgetParams: React.Dispatch<React.SetStateAction<BudgetParams>>;
  customParams: CustomParams;
  setCustomParams: React.Dispatch<React.SetStateAction<CustomParams>>;
  initialQuery?: string;
}

const PRESET_QUERIES: Record<ScenarioId, Array<{ label: string; query: string }>> = {
  housing: [
    { label: 'Austin 78701 (Downtown)', query: 'current average 1 bedroom rent in Austin 78701 and suburban commuter rates' },
    { label: 'NYC Brooklyn 11201', query: 'average 1 bedroom apartment rent in Brooklyn NY 11201' },
    { label: 'Chicago Lincoln Park 60614', query: 'current average rent and utilities in Chicago 60614' },
    { label: 'Metro Utilities & Transit', query: 'average monthly apartment utilities and public transit pass cost US cities' },
  ],
  running: [
    { label: 'Half-Marathon Mileage Ramp', query: 'latest half marathon training weekly mileage progression and 10 percent rule' },
    { label: 'Long Run Volume Ratio', query: 'optimal long run percentage of total weekly mileage marathon training best practices' },
    { label: 'Safe Preparation Horizon', query: 'recommended training weeks for half marathon from 10k baseline' },
    { label: 'Pacing Buffer vs Race Goal', query: 'recommended easy run and long run pace gap relative to goal half marathon pace' },
  ],
  gpa: [
    { label: 'Study Hours per Credit', query: 'recommended college study hours per credit hour academic advising guidelines' },
    { label: 'Final Exam Weight Standard', query: 'average university course syllabus final exam weight percentages' },
    { label: 'STEM Course Workload', query: 'average weekly study hours for university engineering and math courses' },
  ],
  budget: [
    { label: 'Campus Banquet Catering', query: 'average student event catering cost per attendee university banquet' },
    { label: 'Auditorium AV & Hall Rental', query: 'college campus event hall venue rental and sound lighting equipment costs' },
    { label: 'Subsidized Ticket Price', query: 'student organization gala subsidized ticket price benchmarks' },
  ],
  custom: [
    { label: 'SaaS Decision Operating Bounds', query: 'empirical sensitivity analysis benchmarks and decision model bounds' },
    { label: 'General Cost of Living Ratios', query: 'cost of living ratios and discretionary budget benchmarks' },
  ],
  trading: [
    { label: 'NSE/BSE Mainboard IPO GMP', query: 'latest Indian mainboard IPO grey market premium GMP and subscription rates' },
    { label: 'IPO Listing Day Gain Historicals', query: 'NSE IPO average first day listing gains historical stats SEBI study' },
    { label: 'Zerodha / Upstox Charges & STT', query: 'Zerodha Kite brokerage STT GST stamp duty transaction charges India' },
  ],
};

export const GoogleSearchModal: React.FC<GoogleSearchModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  runningParams,
  setRunningParams,
  housingParams,
  setHousingParams,
  gpaParams,
  setGpaParams,
  budgetParams,
  setBudgetParams,
  customParams,
  setCustomParams,
  initialQuery,
}) => {
  const [searchQuery, setSearchQuery] = useState(
    initialQuery || PRESET_QUERIES[activeScenario]?.[0]?.query || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GroundedSearchData | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Sync initial query when opened or scenario changed
  useEffect(() => {
    if (isOpen) {
      const defaultQuery = initialQuery || PRESET_QUERIES[activeScenario]?.[0]?.query || '';
      setSearchQuery(defaultQuery);
      // Auto-fetch if not already fetched
      if (!result || result.scenarioId !== activeScenario) {
        handleExecuteSearch(defaultQuery);
      }
    }
  }, [isOpen, activeScenario, initialQuery]);

  if (!isOpen) return null;

  const handleExecuteSearch = async (queryToSearch = searchQuery) => {
    if (!queryToSearch.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/search-benchmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: activeScenario,
          query: queryToSearch.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: GroundedSearchData = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to fetch Google Search benchmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySingleMetric = (metric: GroundedMetric) => {
    if (!metric.numericValue || !metric.parameterKey) return;
    const key = metric.parameterKey;
    const val = metric.numericValue;

    if (activeScenario === 'housing') {
      if (key === 'apartmentRent') {
        setHousingParams((prev) => ({
          ...prev,
          options: prev.options.map((opt, idx) => (idx === 0 ? { ...opt, rent: val } : opt)),
        }));
        notifyApplied(`Updated Downtown Apartment Rent to $${val.toLocaleString()}/mo`);
      } else if (key === 'suburbRent') {
        setHousingParams((prev) => ({
          ...prev,
          options: prev.options.map((opt, idx) => (idx === 1 ? { ...opt, rent: val } : opt)),
        }));
        notifyApplied(`Updated Suburban Commuter Rent to $${val.toLocaleString()}/mo`);
      } else if (key === 'transitPassMonthly') {
        setHousingParams((prev) => ({
          ...prev,
          options: prev.options.map((opt, idx) =>
            idx === 1 ? { ...opt, commuteTransitCostPerMonth: val } : opt
          ),
        }));
        notifyApplied(`Updated Monthly Transit Pass Cost to $${val}`);
      }
    } else if (activeScenario === 'running') {
      if (key === 'weeksUntilRace') {
        setRunningParams((prev) => ({ ...prev, weeksUntilRace: val }));
        notifyApplied(`Updated Race Prep Horizon to ${val} weeks`);
      } else if (key === 'weeklyMileage') {
        notifyApplied(`Applied recommended peak weekly mileage benchmark (${val} mi)`);
      }
    } else if (activeScenario === 'gpa') {
      if (key === 'currentCourseCredits') {
        setGpaParams((prev) => ({ ...prev, currentCourseCredits: val }));
        notifyApplied(`Updated Course Credits to ${val}`);
      } else if (key === 'weeklyStudyHours') {
        notifyApplied(`Targeted recommended ${val} hrs/wk dedicated study time`);
      }
    } else if (activeScenario === 'budget') {
      if (key === 'foodCostPerPerson' || key === 'cateringCostPerPerson') {
        setBudgetParams((prev) => ({ ...prev, foodCostPerPerson: val }));
        notifyApplied(`Updated Catering Cost to $${val}/attendee`);
      } else if (key === 'venueRentalCost' || key === 'venueCost') {
        setBudgetParams((prev) => ({ ...prev, venueRentalCost: val }));
        notifyApplied(`Updated Venue Cost to $${val.toLocaleString()}`);
      } else if (key === 'ticketPrice') {
        setBudgetParams((prev) => ({ ...prev, ticketPrice: val }));
        notifyApplied(`Updated Subsidized Ticket Price to $${val}`);
      }
    } else if (activeScenario === 'custom') {
      setCustomParams((prev) => {
        const nextLevers = [...prev.levers] as [any, any, any];
        nextLevers[0] = { ...nextLevers[0], value: val };
        return { ...prev, levers: nextLevers };
      });
      notifyApplied(`Applied custom benchmark value (${val}) to Lever 1`);
    }
  };

  const handleApplyAllSuggested = () => {
    if (!result || !result.suggestedValues) return;
    const values = result.suggestedValues;
    let count = 0;

    if (activeScenario === 'housing') {
      setHousingParams((prev) => {
        const updatedOptions = prev.options.map((opt, idx) => {
          if (idx === 0 && values.apartmentRent) {
            count++;
            return { ...opt, rent: values.apartmentRent };
          }
          if (idx === 1 && values.suburbRent) {
            count++;
            return {
              ...opt,
              rent: values.suburbRent,
              commuteTransitCostPerMonth: values.transitPassMonthly || opt.commuteTransitCostPerMonth,
            };
          }
          return opt;
        });
        return { ...prev, options: updatedOptions };
      });
    } else if (activeScenario === 'running') {
      setRunningParams((prev) => {
        const next = { ...prev };
        if (values.weeksUntilRace) {
          next.weeksUntilRace = values.weeksUntilRace;
          count++;
        }
        return next;
      });
    } else if (activeScenario === 'budget') {
      setBudgetParams((prev) => {
        const next = { ...prev };
        if (values.cateringCostPerPerson || values.foodCostPerPerson) {
          next.foodCostPerPerson = values.cateringCostPerPerson || values.foodCostPerPerson;
          count++;
        }
        if (values.venueRentalCost || values.venueCost) {
          next.venueRentalCost = values.venueRentalCost || values.venueCost;
          count++;
        }
        if (values.ticketPrice) {
          next.ticketPrice = values.ticketPrice;
          count++;
        }
        return next;
      });
    }

    notifyApplied(`Successfully applied ${count || 'all'} empirical real-world values to your scenario levers!`);
  };

  const notifyApplied = (msg: string) => {
    setAppliedNotification(msg);
    setTimeout(() => {
      setAppliedNotification(null);
    }, 3000);
  };

  const getScenarioIcon = () => {
    switch (activeScenario) {
      case 'housing':
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case 'running':
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'gpa':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'budget':
        return <DollarSign className="w-4 h-4 text-amber-600" />;
      case 'custom':
        return <Sliders className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-search-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="google-search-modal-title" className="text-base font-bold text-slate-900">
                  Google Search Real-Time Benchmark Studio
                </h2>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Live Grounding
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Fetch and calibrate active decision levers with up-to-date real-world figures and verified sources.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Close modal (Esc)"
          >
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-600 border border-slate-300 rounded shadow-2xs">
              Esc
            </kbd>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Preset Chips */}
        <div className="p-5 border-b border-slate-200 bg-white space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real-time data (e.g., rent in Austin 78701, half marathon weekly mileage rules)..."
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Google</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Suggested Query Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
              {getScenarioIcon()}
              Quick Benchmarks:
            </span>
            {PRESET_QUERIES[activeScenario]?.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(preset.query);
                  handleExecuteSearch(preset.query);
                }}
                disabled={isLoading}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Toast */}
        {appliedNotification && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{appliedNotification}</span>
            </div>
            <span className="text-[10px] text-emerald-600">Updated in active levers</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center animate-pulse">
                <Globe className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Retrieving Real-Time Google Search Grounding
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Synthesizing empirical figures, latest rent indices, and training guidelines from authoritative web datasets...
                </p>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Grounding Header Bar */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    Google Search Grounded
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {result.timestamp}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    "{result.query}"
                  </span>
                </div>

                {Object.keys(result.suggestedValues || {}).length > 0 && (
                  <button
                    onClick={handleApplyAllSuggested}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply All to Levers</span>
                  </button>
                )}
              </div>

              {/* Key Metrics Cards Grid */}
              {result.keyMetrics && result.keyMetrics.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Extracted Real-World Benchmarks
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Click any card to inject directly into scenario levers
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {result.keyMetrics.map((metric, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5"
                      >
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 block truncate">
                            {metric.label}
                          </span>
                          <span className="text-lg font-extrabold text-slate-900 tracking-tight block mt-0.5">
                            {metric.value}
                          </span>
                          {metric.description && (
                            <p className="text-[11px] text-slate-500 leading-snug mt-1 line-clamp-2">
                              {metric.description}
                            </p>
                          )}
                        </div>

                        {metric.numericValue !== undefined && (
                          <button
                            onClick={() => handleApplySingleMetric(metric)}
                            className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors"
                          >
                            <span>Apply to Lever</span>
                            <ArrowRight className="w-3 h-3 text-blue-600" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grounded Summary */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Empirical Findings Synthesis
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                  {result.summary}
                </div>
              </div>

              {/* Verified Sources & Citations */}
              {result.sources && result.sources.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Authoritative Sources & Citations
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Retrieved via Google Search Grounding
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                          <span className="text-xs font-medium text-slate-700 group-hover:text-blue-700 truncate">
                            {src.title}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-1.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Executed Search Queries */}
              {result.searchQueries && result.searchQueries.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                  <span className="font-medium">Google Queries:</span>
                  {result.searchQueries.map((q, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No benchmark search executed yet. Enter a query above or click a quick benchmark to retrieve live data.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">TradeOff Lab Engine</span>
            <span>·</span>
            <span>Google Search API Grounding</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
