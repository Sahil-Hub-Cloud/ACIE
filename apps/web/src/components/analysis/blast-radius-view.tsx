'use client';

import { Network, Server, Link, GitBranch } from 'lucide-react';
import type { BlastRadiusResult, ProofPathStep } from '@acie/engine/graph';

interface BlastRadiusViewProps {
  blastRadius: BlastRadiusResult;
}

function formatProofPath(proofPath: ProofPathStep[] | undefined): string {
  if (!proofPath || proofPath.length === 0) return '';
  
  return proofPath.map((step, i) => {
    const indent = '  '.repeat(i + 1);
    const via = step.viaSymbol ? ` (via \`${step.viaSymbol}\`)` : '';
    const edgeIcon = step.edgeType === 're-exports' ? '↳' : '→';
    return `${indent}${edgeIcon} \`${step.file}\` ${edgeTypeLabel(step.edgeType)} \`${step.symbol}\`${via}`;
  }).join('\n');
}

function edgeTypeLabel(type: string): string {
  switch (type) {
    case 'imports': return 'imports';
    case 're-exports': return 're-exports';
    default: return type;
  }
}

export default function BlastRadiusView({ blastRadius }: BlastRadiusViewProps) {
  const services = blastRadius.impactedServices || [];
  const chain = blastRadius.dependencyChain || [];

  return (
    <div className="space-y-6">
      {/* Services List */}
      <div className="glass p-6 rounded-2xl">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan" />
          Impacted Services ({services.length})
        </h4>

        {services.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No microservices or decoupled modules affected.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service, idx) => (
              <div key={idx} className="glass-inner p-3 rounded-xl border border-white/5 bg-slate-950/20">
                <div className="text-xs font-bold text-white mb-1.5">{service.name}</div>
                {service.entryPoints.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10">
                      Entry Points
                    </span>
                    <ul className="list-none space-y-0.5 pl-0.5 pt-1.5">
                      {service.entryPoints.map((ep, epIdx) => (
                        <li key={epIdx} className="text-[10px] text-slate-400 font-mono truncate">
                          {ep.split('/').pop()}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-500 italic">No entry point handlers in scope</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Downstream Chain Tree with Proof Paths */}
      <div className="glass p-6 rounded-2xl">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-indigo-400" />
          Downstream Dependents Tree ({Number(blastRadius.totalImpactedFiles) || 0} Files)
        </h4>

        {chain.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No downstream file dependents found.</p>
        ) : (
          <div className="space-y-4">
            {chain.slice(0, 15).map((node, idx) => {
              const baseName = node.file.split('/').pop() || node.file;
              const dirName = node.file.substring(0, node.file.lastIndexOf('/'));
              
              return (
                <div key={idx} className="border-l border-white/5 pl-4 ml-2">
                  <div className="flex items-start gap-2.5 text-xs text-slate-400 mb-2">
                    <GitBranch className="w-3.5 h-3.5 mt-0.5 text-slate-600 shrink-0" />
                    <div className="font-mono">
                      <span className="text-slate-500">{dirName}/</span>
                      <span className="text-white font-bold">{baseName}</span>
                      {node.symbols.length > 0 && (
                        <span className="text-[9px] text-accent bg-accent/10 px-1.5 py-0.5 rounded ml-2 border border-accent/10">
                          imports {node.symbols.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {node.proofPath && node.proofPath.length > 0 && (
                    <div className="ml-4 mt-2 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mb-1">
                        <Link className="w-3 h-3 text-emerald-400" />
                        <span className="font-bold text-emerald-400 uppercase tracking-wider">Proof Path</span>
                      </div>
                      <pre className="text-[9px] text-slate-400 font-mono bg-slate-950/50 p-2 rounded whitespace-pre-wrap overflow-x-auto">
{formatProofPath(node.proofPath)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
            {chain.length > 15 && (
              <div className="text-[10px] text-slate-500 italic pl-6 mt-2">
                ... and {chain.length - 15} more dependents not shown.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}