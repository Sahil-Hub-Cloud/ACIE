'use client';

import { useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface DependencyGraphProps {
  graphData: {
    nodes: Array<{ id: number; file_path: string; symbol_name: string; symbol_kind: string; is_exported: boolean }>;
    edges: Array<{ id: number; source_file: string; target_file: string; edge_type: string }>;
  } | null;
}

export default function DependencyGraph({ graphData }: DependencyGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  useEffect(() => {
    if (!graphData) return;

    // 1. Group unique files to make Node items
    const uniqueFiles = Array.from(new Set(graphData.nodes.map(n => n.file_path)));
    
    // 2. Simple layouting algorithm: Place nodes in a grid
    const columns = 4;
    const spacingX = 300;
    const spacingY = 120;

    const formattedNodes = uniqueFiles.map((file, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      
      const fileNodes = graphData.nodes.filter(n => n.file_path === file);
      const isEntry = file.includes('controller') || file.includes('route') || file.includes('page');

      return {
        id: file,
        position: { x: col * spacingX, y: row * spacingY },
        data: {
          label: (
            <div className="p-3 text-left">
              <div className="font-bold text-[11px] font-mono text-white truncate max-w-[200px]" title={file}>
                {file.split('/').pop()}
              </div>
              <div className="text-[9px] text-slate-500 truncate max-w-[200px]" title={file}>
                {file.substring(0, file.lastIndexOf('/')) || './'}
              </div>
              <div className="mt-1.5 flex gap-1 items-center flex-wrap">
                <span className="text-[8px] font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded border border-indigo-500/10">
                  {fileNodes.length} symbols
                </span>
                {isEntry && (
                  <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/10 uppercase">
                    entry
                  </span>
                )}
              </div>
            </div>
          ),
        },
        style: {
          background: 'rgba(11, 15, 26, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          width: 240,
        },
      };
    });

    // 3. Formulate Edge connections
    const formattedEdges = graphData.edges.map((edge, idx) => ({
      id: `e-${idx}`,
      source: edge.source_file,
      target: edge.target_file,
      animated: edge.edge_type === 'calls',
      style: {
        stroke: edge.edge_type === 'calls' ? '#06b6d4' : '#7c3aed',
        strokeWidth: 1.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.edge_type === 'calls' ? '#06b6d4' : '#7c3aed',
      },
    }));

    setNodes(formattedNodes);
    setEdges(formattedEdges);
  }, [graphData, setNodes, setEdges]);

  if (!graphData) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 italic">
        Select a repository or complete indexing to load dependency tree map.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] border border-white/5 rounded-2xl overflow-hidden glass relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <MiniMap
          nodeColor={() => 'rgba(124, 58, 237, 0.2)'}
          maskColor="rgba(2, 6, 23, 0.7)"
          style={{ background: '#0b0f1a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}
        />
        <Background gap={16} size={1} color="rgba(255, 255, 255, 0.05)" />
      </ReactFlow>
    </div>
  );
}
