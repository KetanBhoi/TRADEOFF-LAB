import React, { useState } from 'react';
import { INITIAL_COMMUNITY_POSTS } from '../../utils/advancedTradingData';
import { CommunityPost } from '../../types/trading';
import {
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ThumbsUp,
  Send,
  Filter,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
} from 'lucide-react';

export const CommunityDiscussionTab: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostSymbol, setNewPostSymbol] = useState('TATAMOTORS');
  const [showModerationLogs, setShowModerationLogs] = useState(false);

  // Anti-slop / Anti-tipster regex filter simulation
  const checkModerationTrigger = (text: string) => {
    const flags: ('NONE' | 'PUMP_AND_DUMP_WARNING' | 'GUARANTEED_RETURN_CLAIM' | 'UNSOLICITED_TIPSTER')[] = [];
    const lower = text.toLowerCase();

    if (
      lower.includes('100%') ||
      lower.includes('guarantee') ||
      lower.includes('sure-shot') ||
      lower.includes('jackpot') ||
      lower.includes('pakka')
    ) {
      flags.push('GUARANTEED_RETURN_CLAIM');
    }

    if (
      lower.includes('multibagger') ||
      lower.includes('5x') ||
      lower.includes('10x') ||
      lower.includes('rocket') ||
      lower.includes('moon')
    ) {
      flags.push('PUMP_AND_DUMP_WARNING');
    }

    if (
      lower.includes('telegram') ||
      lower.includes('whatsapp') ||
      lower.includes('join group') ||
      lower.includes('tip') ||
      lower.includes('calls')
    ) {
      flags.push('UNSOLICITED_TIPSTER');
    }

    return flags.length > 0 ? flags : ['NONE'];
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const detectedFlags = checkModerationTrigger(newPostContent);
    const hasViolation = detectedFlags.some((f) => f !== 'NONE');

    const newPost: CommunityPost = {
      id: `POST-${Date.now()}`,
      symbol: newPostSymbol,
      companyName: newPostSymbol,
      authorName: 'You (Verified Trader)',
      authorHandle: '@your_verified_handle',
      reputationScore: 92,
      isTradeVerified: true,
      verifiedHoldingInfo: `Verified Trading Account (${newPostSymbol} holding verified)`,
      timestamp: 'Just now',
      content: newPostContent,
      upvotes: 0,
      moderationFlags: detectedFlags as any,
      moderationActionNotice: hasViolation
        ? 'AUTOMATICALLY FLAGGED: Your post contains restricted keywords (unsolicited tipster or guaranteed return promises) and requires administrative verification before public display.'
        : undefined,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleUpvote = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextVoted = !p.hasUserUpvoted;
          return {
            ...p,
            upvotes: nextVoted ? p.upvotes + 1 : p.upvotes - 1,
            hasUserUpvoted: nextVoted,
          };
        }
        return p;
      })
    );
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedSymbol !== 'ALL' && p.symbol !== selectedSymbol) return false;
    if (!showModerationLogs && p.moderationFlags.some((f) => f !== 'NONE')) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Verified Trader Verification
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              SEBI Anti-Tipster Filter Active
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Community Discussion & Moderated Desk</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Institutional peer discussions backed by actual broker execution and holding tenure. Profit screenshots without trade verification are blocked. Automated heuristics quarantine pump-and-dump noise.
          </p>
        </div>

        {/* Reputation Badge */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl shrink-0 flex items-center gap-4">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Your Reputation</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              92 <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Account Status</div>
            <div className="text-xs font-bold text-indigo-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Trader
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimers & Moderation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Discussion is never financial advice.</strong> Independent research is required. Tipsters and unverified calls are quarantined.
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowModerationLogs(!showModerationLogs)}
          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors shrink-0 ${
            showModerationLogs
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          {showModerationLogs ? 'Hide Flagged Quarantine (1)' : 'Inspect Quarantined Posts (1)'}
        </button>
      </div>

      {/* Stock Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {['ALL', 'TATAMOTORS', 'WAAREE', 'SWIGGY', 'INFY'].map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => setSelectedSymbol(sym)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              selectedSymbol === sym
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sym === 'ALL' ? 'All Symbols' : sym}
          </button>
        ))}
      </div>

      {/* Post Submission Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              Post Thesis to Community
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-semibold">Symbol:</span>
              <select
                value={newPostSymbol}
                onChange={(e) => setNewPostSymbol(e.target.value)}
                className="px-2 py-1 text-xs font-bold rounded-md border border-slate-300 bg-slate-50"
              >
                <option value="TATAMOTORS">TATAMOTORS</option>
                <option value="WAAREE">WAAREE</option>
                <option value="SWIGGY">SWIGGY</option>
                <option value="INFY">INFY</option>
              </select>
            </div>
          </div>

          <textarea
            required
            rows={2}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share fundamental, valuation, or technical thesis. Note: unverified profit claims, guaranteed returns, or telegram links are automatically quarantined..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-indigo-600"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Badge attached: Verified Holder ({newPostSymbol})</span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Publish Thesis</span>
            </button>
          </div>
        </form>
      </div>

      {/* Posts Stream */}
      <div className="space-y-3">
        {filteredPosts.map((post) => {
          const isFlagged = post.moderationFlags.some((f) => f !== 'NONE');

          return (
            <div
              key={post.id}
              className={`p-4 rounded-xl border transition-all ${
                isFlagged
                  ? 'bg-rose-50/70 border-rose-300'
                  : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {/* Author & Badge Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center font-mono">
                    {post.authorName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{post.authorName}</span>
                      <span className="text-[10px] text-slate-400">{post.authorHandle}</span>
                      {post.isTradeVerified && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Verified
                        </span>
                      )}
                    </div>
                    {post.verifiedHoldingInfo && (
                      <div className="text-[10px] text-emerald-700 font-medium">
                        {post.verifiedHoldingInfo}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 font-mono">
                    {post.symbol}
                  </span>
                  <span className="text-[10px] text-slate-400">{post.timestamp}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="mt-2.5 text-xs text-slate-800 leading-relaxed">
                {post.content}
              </div>

              {/* Moderation Notice if Flagged */}
              {post.moderationActionNotice && (
                <div className="mt-3 p-2.5 bg-rose-100/80 rounded-lg border border-rose-300 text-rose-950 text-[11px] flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">AUTOMATED MODERATION ENGINE ALERT:</strong>
                    <span>{post.moderationActionNotice}</span>
                  </div>
                </div>
              )}

              {/* Post Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleUpvote(post.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    post.hasUserUpvoted
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{post.upvotes} Upvotes</span>
                </button>

                <span className="text-[10px] text-slate-400">
                  Reputation Score: <strong className="text-slate-700 font-mono">{post.reputationScore}/100</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
