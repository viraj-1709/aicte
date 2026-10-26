import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { GraphNode, GraphLink } from '../types';
import { Network, X, ExternalLink, ShieldAlert, Phone, FileText, MapPin, Hash } from 'lucide-react';

export const LinkGraphModal: React.FC = () => {
  const { isLinkGraphOpen, setIsLinkGraphOpen, setSelectedAppId, setRole, showToast, t } = useApp();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (isLinkGraphOpen) {
      api.getGraphData().then(data => {
        setNodes(data.nodes);
        setLinks(data.links);
        setSelectedNode(data.nodes[0]);
      });
    }
  }, [isLinkGraphOpen]);

  if (!isLinkGraphOpen) return null;

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (node.type === 'APPLICATION') {
      if (node.id === 'APP-00123') {
        setSelectedAppId('AICTE-2026-APEX-TAMPERED');
      } else if (node.id === 'APP-00044') {
        setSelectedAppId('AICTE-2026-SAHYADRI-POLY');
      }
    }
  };

  const handleOpenCase = (appId: string) => {
    setIsLinkGraphOpen(false);
    setRole('OFFICER');
    showToast(`Navigated to cross-referenced dossier ${appId}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-govNavy-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-govNavy-950">
          <div className="flex items-center space-x-2.5">
            <Network className="w-5 h-5 text-govSaffron-500" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                {t.officer.linkGraphTitle}
              </h2>
              <p className="text-[11px] text-govNavy-200">
                Cross-application identity & certificate duplication radar
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLinkGraphOpen(false)}
            className="text-govNavy-300 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
          {/* Left Visual Graph Panel (7 Cols) */}
          <div className="md:col-span-7 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-500">
                <span>Entity Relationship Visualizer</span>
                <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                  Collusion & Reused Artifacts Detected
                </span>
              </div>

              {/* Node Chips Canvas */}
              <div className="space-y-3 py-2">
                {nodes.map(n => {
                  const isSelected = selectedNode?.id === n.id;
                  const isApp = n.type === 'APPLICATION';
                  const isHash = n.type === 'DOCUMENT_HASH';
                  const isPhone = n.type === 'PHONE';

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNodeClick(n)}
                      className={`p-3 rounded border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-govNavy-900 dark:border-blue-500 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-govNavy-900 dark:ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-white shrink-0 ${
                          isApp ? 'bg-govNavy-900' : isHash ? 'bg-red-600' : isPhone ? 'bg-amber-600' : 'bg-emerald-600'
                        }`}>
                          {isApp && <FileText className="w-3.5 h-3.5" />}
                          {isHash && <Hash className="w-3.5 h-3.5" />}
                          {isPhone && <Phone className="w-3.5 h-3.5" />}
                          {n.type === 'ADDRESS' && <MapPin className="w-3.5 h-3.5" />}
                          {n.type === 'TRUST' && <ShieldAlert className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-100 block">
                            {n.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Type: {n.type}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        n.risk === 'CRITICAL' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300' :
                        n.risk === 'HIGH' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {n.risk || 'NORMAL'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Links Summary */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
              <span className="font-semibold block mb-1">Detected Common Identifiers:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Exact SHA-256 duplicate deed between Lucknow & Pune campuses.</li>
                <li>Shared authorized signatory phone number across two distinct trusts.</li>
              </ul>
            </div>
          </div>

          {/* Right Entity Details Panel (5 Cols) */}
          <div className="md:col-span-5 space-y-4 text-xs">
            {selectedNode ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Node Inspector
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedNode.label}
                </h3>
                <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                  <div>
                    <strong>Category:</strong> {selectedNode.type}
                  </div>
                  <div>
                    <strong>Risk Rating:</strong> {selectedNode.risk || 'STANDARD'}
                  </div>
                  <p className="pt-2 border-t border-slate-200 dark:border-slate-800 leading-relaxed">
                    This entity participates in cross-regional correlation rules. AICTE deduplication sentinel flagged this cluster for formal scrutiny.
                  </p>
                </div>

                {selectedNode.type === 'APPLICATION' && (
                  <button
                    onClick={() => handleOpenCase(selectedNode.id)}
                    className="w-full mt-2 py-2 px-3 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <span>Open Case Dossier in Workspace</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select any node on the left to inspect linked evidence.
              </div>
            )}

            {/* Screen Reader Alternative Table (Section 8.10) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded p-3 text-[11px]">
              <span className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                Text-List Relationship Table (Accessibility)
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {links.map((lnk, idx) => (
                  <div key={idx} className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
                    <strong>{lnk.source}</strong> ➔ <span>{lnk.target}</span>: <em className="text-slate-500">{lnk.label}</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
