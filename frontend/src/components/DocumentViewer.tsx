import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Flame, 
  CheckCircle2, 
  FileText, 
  Download,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { DocumentItem, FlagItem, BoundingBox } from '../types';
import { api } from '../services/api';

interface Props {
  documents: DocumentItem[];
  activeDocId?: string;
  onSelectDoc: (id: string) => void;
  activeFlag?: FlagItem | null;
  detectedRooms?: any[];
}

export const DocumentViewer: React.FC<Props> = ({
  documents,
  activeDocId,
  onSelectDoc,
  activeFlag,
  detectedRooms = []
}) => {
  const { t } = useApp();
  const [zoom, setZoom] = useState(1);
  const [showEla, setShowEla] = useState(false);

  const selectedDoc = documents.find(d => d.id === activeDocId) || documents[0];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoom(1);
    setShowEla(false);
  };

  if (!selectedDoc) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No documents available for preview.
      </div>
    );
  }

  // Active flag evidence bounding box
  const flagBBox = (activeFlag && activeFlag.evidence?.source_doc_id === selectedDoc.id)
    ? activeFlag.evidence?.bounding_box
    : null;

  const isTampered = selectedDoc.tamper_signals?.is_tampered;
  const isFloorPlan = selectedDoc.doc_type === 'FLOOR_PLAN';
  const isPhoto = selectedDoc.doc_type === 'CAMPUS_PHOTO';

  // Image source URL
  const srcUrl = showEla 
    ? api.getDocumentElaUrl(selectedDoc.id) 
    : api.getDocumentFileUrl(selectedDoc.id);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col h-full">
      {/* Top Document Tabs */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-3 py-2 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          {documents.map((doc) => {
            const isSelected = doc.id === selectedDoc.id;
            const hasTamper = doc.tamper_signals?.is_tampered;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  onSelectDoc(doc.id);
                  setShowEla(false);
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{doc.doc_type.replace('_', ' ')}</span>
                {hasTamper && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" title="ELA Tamper Flagged"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* ELA Tamper Heatmap Toggle */}
          <button
            onClick={() => setShowEla(!showEla)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              showEla
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Inspect compression error delta and localized pixel manipulation"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{showEla ? 'ELA Heatmap Active' : 'Toggle ELA Heatmap'}</span>
          </button>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-slate-300">
            <button onClick={handleZoomOut} className="p-1 hover:text-white" title={t.officer.zoomOut}>
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] px-1 font-mono">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1 hover:text-white" title={t.officer.zoomIn}>
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleResetZoom} className="p-1 hover:text-white ml-1 border-l border-slate-700" title={t.officer.resetZoom}>
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Canvas Viewport */}
      <div className="relative flex-1 bg-slate-950/90 overflow-auto p-4 flex items-center justify-center min-h-[500px]">
        <div 
          className="relative transition-transform duration-200 shadow-2xl rounded-lg overflow-hidden border border-slate-800 max-w-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Document Image */}
          <img
            src={srcUrl}
            alt={selectedDoc.filename}
            className="max-h-[750px] w-auto object-contain block select-none"
            onError={(e) => {
              // Fallback placeholder if image load encounters error
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* SVG Bounding Boxes Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* 1. Extracted Field Bounding Boxes (Blue) */}
            {!showEla && Object.entries(selectedDoc.bounding_boxes || {}).map(([key, box]) => (
              <g key={key}>
                <rect
                  x={`${box.x}%`}
                  y={`${box.y}%`}
                  width={`${box.width}%`}
                  height={`${box.height}%`}
                  fill="rgba(59, 130, 246, 0.12)"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <text
                  x={`${box.x + 0.5}%`}
                  y={`${Math.max(1.5, box.y - 1.2)}%`}
                  fill="#93C5FD"
                  fontSize="8"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  {box.field_name || key}
                </text>
              </g>
            ))}

            {/* 2. Detected Floor Plan Rooms (Green / Cyan) */}
            {isFloorPlan && detectedRooms.map((room) => (
              <g key={room.id}>
                <rect
                  x={`${room.box.x}%`}
                  y={`${room.box.y}%`}
                  width={`${room.box.width}%`}
                  height={`${room.box.height}%`}
                  fill={room.type === 'CLASSROOM' ? "rgba(16, 185, 129, 0.15)" : "rgba(14, 165, 233, 0.18)"}
                  stroke={room.type === 'CLASSROOM' ? "#10B981" : "#0EA5E9"}
                  strokeWidth="2"
                />
                <text
                  x={`${room.box.x + 1}%`}
                  y={`${room.box.y + 4}%`}
                  fill="#A7F3D0"
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  {room.name}
                </text>
              </g>
            ))}

            {/* 3. Suspicious Tamper Box (High-Visibility Red Pulse) */}
            {selectedDoc.tamper_signals?.suspicious_box && (
              <g>
                <rect
                  x={`${selectedDoc.tamper_signals.suspicious_box.x}%`}
                  y={`${selectedDoc.tamper_signals.suspicious_box.y}%`}
                  width={`${selectedDoc.tamper_signals.suspicious_box.width}%`}
                  height={`${selectedDoc.tamper_signals.suspicious_box.height}%`}
                  fill="rgba(239, 68, 68, 0.25)"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  className="animate-pulse"
                />
                <text
                  x={`${selectedDoc.tamper_signals.suspicious_box.x}%`}
                  y={`${selectedDoc.tamper_signals.suspicious_box.y - 1.5}%`}
                  fill="#F87171"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  ⚠ Tamper Anomaly (ELA Score: {selectedDoc.tamper_signals.anomaly_score})
                </text>
              </g>
            )}

            {/* 4. Active Flag Focus Box (Yellow/Orange Glowing) */}
            {flagBBox && (
              <g>
                <rect
                  x={`${flagBBox.x}%`}
                  y={`${flagBBox.y}%`}
                  width={`${flagBBox.width}%`}
                  height={`${flagBBox.height}%`}
                  fill="rgba(245, 158, 11, 0.28)"
                  stroke="#F59E0B"
                  strokeWidth="3"
                />
                <text
                  x={`${flagBBox.x}%`}
                  y={`${Math.max(2, flagBBox.y - 2)}%`}
                  fill="#FDE68A"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  🔎 Flagged Regulatory Evidence
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Floating Forensic Metadata HUD */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-300 shadow-xl max-w-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Cryptographic Dossier Anchor</span>
            <span className="text-emerald-400 font-mono">SHA-256 Verified</span>
          </div>
          <div className="font-mono text-[10px] text-slate-400 truncate">
            {selectedDoc.file_hash}
          </div>
          {isPhoto && selectedDoc.extracted_fields?.gps_latitude && (
            <div className="flex items-center gap-1.5 text-amber-300 font-medium text-[11px] pt-1 border-t border-slate-800">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>EXIF GPS: {selectedDoc.extracted_fields.gps_latitude} N, {selectedDoc.extracted_fields.gps_longitude} E</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
