import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  RotateCcw, 
  FileJson, 
  Copy, 
  Check, 
  AlertTriangle, 
  Zap, 
  Lock, 
  Link as LinkIcon, 
  Clock, 
  CheckCircle2, 
  Bug,
  RefreshCw
} from 'lucide-react';
import { AuditBlock, UserRole } from '../types';
import { verifyAuditChain, computeBlockHash } from '../lib/crypto';

interface AuditLogViewerProps {
  chain: AuditBlock[];
  onTamperBlock: (index: number, modifiedPayload: Record<string, any>) => void;
  onRestoreChain: () => void;
  currentRole: UserRole;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  chain,
  onTamperBlock,
  onRestoreChain,
  currentRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlockForModal, setSelectedBlockForModal] = useState<AuditBlock | null>(null);
  const [isTamperModalOpen, setIsTamperModalOpen] = useState(false);
  const [tamperTargetIndex, setTamperTargetIndex] = useState<number>(1);
  const [tamperText, setTamperText] = useState('{"unauthorizedOverride": true, "actor": "Attacker"}');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedState, setVerifiedState] = useState<{
    isValid: boolean;
    tamperedIndex: number | null;
    errorReason: string | null;
    verifiedCount: number;
  } | null>(null);

  // Compute live verification
  const liveVerification = verifyAuditChain(chain);

  const handleRunVerification = async () => {
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 600)); // Animated verification scanning
    const result = verifyAuditChain(chain);
    setVerifiedState(result);
    setIsVerifying(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 1800);
  };

  const handleExecuteTamper = () => {
    try {
      const parsed = JSON.parse(tamperText);
      onTamperBlock(tamperTargetIndex, parsed);
      setIsTamperModalOpen(false);
      setVerifiedState(null); // Force re-eval
    } catch {
      alert('Invalid JSON! Please format the tampered payload as valid JSON.');
    }
  };

  const filteredChain = chain.filter((block) => {
    const q = searchQuery.toLowerCase();
    return (
      block.action.toLowerCase().includes(q) ||
      block.actor.toLowerCase().includes(q) ||
      block.hash.toLowerCase().includes(q) ||
      JSON.stringify(block.payload).toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Step 6: Tamper-Evident Cryptographic Ledger
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">FIPS 180-4 SHA-256 Hash Chain</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Institutional Immutable Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Every booking submission, manager decision, check-in photo fingerprint, and EHS resolution is cryptographically
            chained with its predecessor. Any unauthorized database modification instantly breaks the cryptographic chain.
          </p>
        </div>

        {/* Action Buttons: Verification & Tamper Simulation */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleRunVerification}
            disabled={isVerifying}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Hashing {chain.length} Blocks...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Cryptographic Integrity</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsTamperModalOpen(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Simulate Malicious Tampering</span>
          </button>

          {!liveVerification.isValid && (
            <button
              onClick={onRestoreChain}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restore Ledger Integrity</span>
            </button>
          )}
        </div>
      </div>

      {/* Chain Status Integrity Banner */}
      {!liveVerification.isValid ? (
        <div className="bg-rose-950/80 border-2 border-rose-600 rounded-xl p-4 text-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-900 border border-rose-500 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                CRYPTOGRAPHIC INTEGRITY VIOLATION DETECTED!
              </h3>
              <p className="text-xs text-rose-200 mt-0.5">
                {liveVerification.errorReason}
              </p>
            </div>
          </div>
          <button
            onClick={onRestoreChain}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs shrink-0 transition-colors"
          >
            Re-Seal Chain & Reset Tampering
          </button>
        </div>
      ) : (
        <div className="bg-slate-950 border border-emerald-800/80 rounded-xl p-4 text-emerald-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-white text-xs block">
                Cryptographic Chain Verified Valid (100% Intact)
              </span>
              <span className="text-[11px] text-emerald-400/90">
                All {chain.length} blocks verified against genesis zero-hash with standard FIPS 180-4 SHA-256 digest.
              </span>
            </div>
          </div>
          <div className="text-right font-mono text-[11px] text-slate-400 hidden sm:block">
            Tip Hash: {chain[chain.length - 1]?.hash.substring(0, 16)}...
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, actor, or payload data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
          />
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span>Ledger Depth: <strong className="text-white">{chain.length} Blocks</strong></span>
          <span className="text-slate-600">·</span>
          <span>Genesis: <span className="font-mono text-slate-300">00000000...</span></span>
        </div>
      </div>

      {/* Cryptographic Hash Chain Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-14">#</th>
                <th className="py-3 px-4">Action & Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Previous Block Hash (prevHash)</th>
                <th className="py-3 px-4">Current Block Hash (SHA-256)</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredChain.map((block, idx) => {
                // Check if this specific block is broken
                const isGenesis = block.index === 0;
                const prevBlock = block.index > 0 ? chain[block.index - 1] : null;
                const calculatedHash = computeBlockHash(
                  block.index,
                  block.timestamp,
                  block.action,
                  block.actor,
                  block.actorRole,
                  block.payload,
                  block.prevHash
                );
                const isHashMismatched = calculatedHash !== block.hash;
                const isPointerBroken = prevBlock && block.prevHash !== prevBlock.hash;
                const isCompromised = isHashMismatched || isPointerBroken || block.isTampered;

                return (
                  <tr
                    key={block.index}
                    className={`transition-colors ${
                      isCompromised
                        ? 'bg-rose-950/40 text-rose-200'
                        : 'hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        isCompromised
                          ? 'bg-rose-900 text-rose-200 border border-rose-600 font-black'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        #{block.index}
                      </span>
                    </td>

                    {/* Action & Timestamp */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white tracking-tight flex items-center gap-1.5">
                        {isCompromised && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        <span>{block.action}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {new Date(block.timestamp).toLocaleString()}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-200">{block.actor}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{block.actorRole}</div>
                    </td>

                    {/* Previous Hash */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <LinkIcon className={`w-3 h-3 ${isPointerBroken ? 'text-rose-400' : 'text-slate-500'}`} />
                        <span
                          className={`truncate max-w-[140px] ${
                            isPointerBroken ? 'text-rose-400 font-bold bg-rose-950 px-1 rounded' : 'text-slate-400'
                          }`}
                          title={block.prevHash}
                        >
                          {block.prevHash.substring(0, 16)}...
                        </span>
                        <button
                          onClick={() => handleCopy(block.prevHash)}
                          className="text-slate-500 hover:text-white"
                          title="Copy prevHash"
                        >
                          {copiedHash === block.prevHash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Current Hash */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Lock className={`w-3 h-3 ${isHashMismatched ? 'text-rose-400' : 'text-teal-400'}`} />
                        <span
                          className={`truncate max-w-[150px] font-bold ${
                            isHashMismatched
                              ? 'text-rose-300 bg-rose-900/60 px-1 rounded border border-rose-700'
                              : 'text-teal-300'
                          }`}
                          title={block.hash}
                        >
                          {block.hash.substring(0, 16)}...
                        </span>
                        <button
                          onClick={() => handleCopy(block.hash)}
                          className="text-slate-500 hover:text-white"
                          title="Copy current block SHA-256 hash"
                        >
                          {copiedHash === block.hash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      {isHashMismatched && (
                        <span className="text-[10px] text-rose-400 font-sans block mt-0.5">
                          Calculated hash != Stored hash (Content Tampered!)
                        </span>
                      )}
                    </td>

                    {/* Payload Details */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedBlockForModal(block)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        <FileJson className="w-3 h-3 text-teal-400" />
                        <span>Inspect Payload</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Block Modal */}
      {selectedBlockForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-teal-400">Block #{selectedBlockForModal.index}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedBlockForModal.action}</h3>
              </div>
              <button
                onClick={() => setSelectedBlockForModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-slate-400">Timestamp: <span className="text-white">{selectedBlockForModal.timestamp}</span></div>
                <div className="text-slate-400">Actor: <span className="text-teal-300">{selectedBlockForModal.actor}</span> ({selectedBlockForModal.actorRole})</div>
                <div className="text-slate-400 truncate">prevHash: <span className="text-slate-300">{selectedBlockForModal.prevHash}</span></div>
                <div className="text-slate-400 truncate">SHA-256: <span className="text-teal-400 font-bold">{selectedBlockForModal.hash}</span></div>
              </div>

              <div>
                <span className="font-semibold text-slate-300 block mb-1">Payload JSON:</span>
                <pre className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-[11px] font-mono text-teal-300 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedBlockForModal.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedBlockForModal(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-750 rounded-lg"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Malicious Tampering Simulator Modal */}
      {isTamperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-600/80 rounded-xl shadow-2xl max-w-lg w-full p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-slate-950 font-bold">
                  <Bug className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Malicious Tamper Simulator</h3>
                  <p className="text-xs text-amber-400">Simulate unauthorized database modification</p>
                </div>
              </div>
              <button
                onClick={() => setIsTamperModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              In a centralized SQL database without cryptographic chaining, a malicious rogue DBA or compromised server could alter historical records silently.
              In BenchShare, any modification changes that block's SHA-256 hash, immediately breaking downstream hashes.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Block to Alter:</label>
                <select
                  value={tamperTargetIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setTamperTargetIndex(idx);
                    const b = chain[idx];
                    if (b) {
                      setTamperText(JSON.stringify({ ...b.payload, MALICIOUS_TAMPER: 'Unauthorized grant change' }, null, 2));
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                >
                  {chain.map((b) => (
                    <option key={b.index} value={b.index}>
                      Block #{b.index}: {b.action} ({b.actor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Modified Payload Payload Data (JSON):</label>
                <textarea
                  rows={4}
                  value={tamperText}
                  onChange={(e) => setTamperText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTamperModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTamper}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Inject Tampered Payload</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
