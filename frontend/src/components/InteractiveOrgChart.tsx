'use client';

import React, { useMemo, useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    ConnectionLineType,
    Panel,
    useNodesState,
    useEdgesState,
    MarkerType,
    Node,
    Edge,
    Handle,
    Position,
    ReactFlowProvider,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from '@dagrejs/dagre';
import { API_BASE_URL, updatePositionCoordinates } from '@/lib/api';

// Helper for image URLs
const getFullImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Custom Node for Org Chart
const OrgNode = ({ data }: any) => {
    const mainEmployee = data.employees && data.employees.length > 0 ? data.employees[0] : null;
    const isAggregate = data.isAggregate;
    const employeeCount = data.employees?.length || 0;
    const isCollapsed = data.isCollapsed;
    const hasChildren = data.hasChildren;
    const onToggleCollapse = data.onToggleCollapse;

    return (
        <div className={`px-2 py-2 shadow-lg rounded-2xl bg-white border-2 transition-all duration-200 ${data.isDraggingOver ? 'border-blue-500 bg-blue-50 scale-105 shadow-blue-200' : 'border-gray-100'} min-w-[160px] cursor-pointer react-flow__draghandle relative`}>
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-blue-400 border-2 border-white" />

            {/* Collapse/Expand Button */}
            {hasChildren && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleCollapse();
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all duration-200 hover:scale-110 z-10"
                    title={isCollapsed ? 'باز کردن' : 'بستن'}
                >
                    <svg
                        className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            )}

            <div className="flex flex-col items-center pointer-events-none">
                {isAggregate ? (
                    <div className="flex flex-col items-center py-1">
                        <div className="flex -space-x-3 mb-2">
                            {data.employees?.slice(0, 3).map((emp: any, idx: number) => (
                                <div key={emp.id} className="relative" style={{ zIndex: 10 - idx }}>
                                    {emp.profileImageUrl ? (
                                        <img
                                            src={getFullImageUrl(emp.profileImageUrl) || ''}
                                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm border-2 border-white">
                                            {emp.firstName[0]}
                                        </div>
                                    )}
                                    {/* Workload badge */}
                                    {emp.workloadPercentage && emp.workloadPercentage < 100 && (
                                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[8px] font-black px-1 rounded-full border border-white">
                                            {emp.workloadPercentage}%
                                        </div>
                                    )}
                                </div>
                            ))}
                            {employeeCount > 3 && (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-black border-2 border-white shadow-sm">
                                    +{employeeCount - 3}
                                </div>
                            )}
                            {employeeCount === 0 && (
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="text-[12px] font-black text-gray-800">
                            {employeeCount} نفر
                        </div>
                    </div>
                ) : (
                    mainEmployee ? (
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                {mainEmployee.profileImageUrl ? (
                                    <img
                                        src={getFullImageUrl(mainEmployee.profileImageUrl) || ''}
                                        alt={mainEmployee.firstName}
                                        className="w-11 h-11 rounded-full border-2 border-white shadow-md object-cover mb-1"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md border-2 border-white mb-1">
                                        {mainEmployee.firstName[0]}
                                    </div>
                                )}
                                {/* Workload percentage badge */}
                                {mainEmployee.workloadPercentage && mainEmployee.workloadPercentage < 100 && (
                                    <div className="absolute -bottom-0 -right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-md">
                                        {mainEmployee.workloadPercentage}%
                                    </div>
                                )}
                                {/* Primary badge */}
                                {mainEmployee.isPrimary && (
                                    <div className="absolute -top-1 -left-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[8px] font-black px-1 py-0.5 rounded-full border-2 border-white shadow-md">
                                        ★
                                    </div>
                                )}
                            </div>
                            <div className="text-[11px] font-bold text-gray-800 text-center">
                                {mainEmployee.firstName} {mainEmployee.lastName}
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-1 border-2 border-dashed border-gray-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )
                )}
                <div className="text-[10px] font-black text-blue-600 mt-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter">
                    {data.title}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-400 border-2 border-white" />
        </div >
    );
};

const nodeTypes = {
    orgNode: OrgNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR' || direction === 'RL';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        if (direction === 'TB') {
            node.targetPosition = Position.Top;
            node.sourcePosition = Position.Bottom;
        } else if (direction === 'LR') {
            node.targetPosition = Position.Left;
            node.sourcePosition = Position.Right;
        } else if (direction === 'RL') {
            node.targetPosition = Position.Right;
            node.sourcePosition = Position.Left;
        }

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

interface InteractiveOrgChartProps {
    data: any[];
    onReorder: (positionId: string, newParentId: string | null) => void;
    readOnly?: boolean;
}

function OrgChartContent({ data, onReorder, readOnly = false }: InteractiveOrgChartProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [direction, setDirection] = React.useState<'TB' | 'LR' | 'RL'>('TB');
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [selectedNodeData, setSelectedNodeData] = React.useState<any>(null);
    const [selectedEmployeeInAggregate, setSelectedEmployeeInAggregate] = React.useState<any>(null);
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const [collapsedNodes, setCollapsedNodes] = React.useState<Set<string>>(new Set());
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { getNodes, project, fitView } = useReactFlow();

    const toggleFullScreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    const toggleCollapse = useCallback((nodeId: string) => {
        setCollapsedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);

    useEffect(() => {
        const handleFSChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
            setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 100);
        };
        document.addEventListener('fullscreenchange', handleFSChange);
        return () => document.removeEventListener('fullscreenchange', handleFSChange);
    }, [fitView]);

    // Flatten the tree data for React Flow
    const initializeChart = useCallback((currentDirection = direction, forceLayout = false) => {
        const rawNodes: Node[] = [];
        const rawEdges: Edge[] = [];
        let hasSavedPositions = false;

        const traverse = (item: any, isVisible = true) => {
            if (!isVisible) return;

            if (item.x !== null && item.y !== null && item.x !== undefined && item.y !== undefined) {
                hasSavedPositions = true;
            }

            const isCollapsed = collapsedNodes.has(item.id);
            const hasChildren = item.children && item.children.length > 0;

            rawNodes.push({
                id: item.id,
                type: 'orgNode',
                data: {
                    title: item.title,
                    employees: item.employees,
                    description: item.description,
                    isAggregate: item.isAggregate,
                    isDraggingOver: false,
                    isCollapsed,
                    hasChildren,
                    onToggleCollapse: () => toggleCollapse(item.id),
                },
                position: { x: item.x || 0, y: item.y || 0 },
                width: nodeWidth,
                height: nodeHeight,
                draggable: !readOnly,
            });

            if (item.children && !isCollapsed) {
                item.children.forEach((child: any) => {
                    rawEdges.push({
                        id: `e-${item.id}-${child.id}`,
                        source: item.id,
                        target: child.id,
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: '#3b82f6', strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#3b82f6',
                        },
                    });
                    traverse(child, true);
                });
            }
        };

        data.forEach(root => traverse(root));

        if (hasSavedPositions && !forceLayout) {
            setNodes(rawNodes);
            setEdges(rawEdges);
        } else {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                rawNodes,
                rawEdges,
                currentDirection
            );

            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }

        // Fit view after a small delay to allow React Flow to render
        setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 });
        }, 50);
    }, [data, setNodes, setEdges, direction, fitView, collapsedNodes, toggleCollapse]);

    useEffect(() => {
        if (data && data.length > 0) {
            initializeChart();
        }
    }, [data, initializeChart]);

    useEffect(() => {
        if (data && data.length > 0) {
            initializeChart();
        }
    }, [collapsedNodes, initializeChart]);

    const onLayoutChange = useCallback((newDir: 'TB' | 'LR' | 'RL') => {
        setDirection(newDir);
        initializeChart(newDir, true);
    }, [initializeChart]);

    const findTargetNode = useCallback((node: Node) => {
        const allNodes = getNodes();

        // Bounding box of the dragged node
        const dragRect = {
            left: node.position.x,
            right: node.position.x + nodeWidth,
            top: node.position.y,
            bottom: node.position.y + nodeHeight,
        };

        return allNodes.find((n) => {
            if (n.id === node.id) return false;

            // Bounding box of target node
            const targetRect = {
                left: n.position.x,
                right: n.position.x + nodeWidth,
                top: n.position.y,
                bottom: n.position.y + nodeHeight,
            };

            // Check for substantial overlap (e.g., center of dragged is inside target,
            // or target box is mostly covered)
            const centerX = dragRect.left + nodeWidth / 2;
            const centerY = dragRect.top + nodeHeight / 2;

            const isCenterOver =
                centerX > targetRect.left &&
                centerX < targetRect.right &&
                centerY > targetRect.top &&
                centerY < targetRect.bottom;

            // Also check for general box overlap as a fallback
            const hasOverlap = !(
                dragRect.right < targetRect.left ||
                dragRect.left > targetRect.right ||
                dragRect.bottom < targetRect.top ||
                dragRect.top > targetRect.bottom
            );

            return isCenterOver || hasOverlap;
        });
    }, [getNodes]);

    const onNodeDrag = useCallback((_: any, node: Node) => {
        const targetNode = findTargetNode(node);

        setNodes((nds) =>
            nds.map((n) => ({
                ...n,
                data: { ...n.data, isDraggingOver: targetNode && n.id === targetNode.id },
                zIndex: (targetNode && n.id === targetNode.id) || n.id === node.id ? 1000 : 1
            }))
        );
    }, [findTargetNode, setNodes]);

    const onNodeDragStop = useCallback(
        async (_: any, node: Node) => {
            const targetNode = findTargetNode(node);

            if (targetNode) {
                setIsProcessing(true);
                try {
                    await onReorder(node.id, targetNode.id);
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                    setIsProcessing(false);
                    return;
                } catch (error) {
                    console.error('Reorder Error:', error);
                    setIsProcessing(false);
                }
            } else {
                const minY = nodes.length > 0 ? Math.min(...nodes.map(n => n.position.y)) : 0;
                if (node.position.y < minY - 50) {
                    setIsProcessing(true);
                    try {
                        await onReorder(node.id, null);
                        setShowSuccess(true);
                        setTimeout(() => setShowSuccess(false), 3000);
                        setIsProcessing(false);
                        return;
                    } catch (error) {
                        console.error('Reorder (Root) Error:', error);
                        setIsProcessing(false);
                    }
                }
            }

            // Save visual position
            try {
                await updatePositionCoordinates(node.id, node.position.x, node.position.y);
            } catch (err) {
                console.error('Failed to save position:', err);
            }

            // Reset drag states
            setNodes((nds) =>
                nds.map((n) => ({
                    ...n,
                    data: { ...n.data, isDraggingOver: false },
                    zIndex: 1
                }))
            );
        },
        [nodes, findTargetNode, onReorder, initializeChart]
    );

    return (
        <div
            ref={containerRef}
            className={`w-full border border-gray-200 bg-gray-50 shadow-inner overflow-hidden relative transition-all duration-500 ${isFullScreen ? 'fixed inset-0 z-[5000] h-screen' : 'h-[600px] rounded-xl'}`}
        >
            {isProcessing && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[2000] flex items-center justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-xl flex items-center space-x-3 border border-blue-100">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-bold text-gray-700 mr-2">در حال بروزرسانی چارت...</span>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2100] animate-bounce">
                    <div className="bg-green-500 text-white px-6 py-2 rounded-full shadow-lg text-sm font-bold flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        تغییرات با موفقیت ذخیره شد
                    </div>
                </div>
            )}

            {selectedNodeData && (
                <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setSelectedNodeData(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                            <button onClick={() => { setSelectedNodeData(null); setSelectedEmployeeInAggregate(null); }} className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors bg-black/10 hover:bg-black/20 p-1.5 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {selectedEmployeeInAggregate ? (
                            // Sub-profile view for employee in aggregate
                            <div className="px-6 pb-8 text-center -mt-12 relative animate-in slide-in-from-right duration-300">
                                <button
                                    onClick={() => setSelectedEmployeeInAggregate(null)}
                                    className="absolute -top-10 left-0 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-xl backdrop-blur-md transition-all flex items-center shadow-lg border border-white/30 group"
                                >
                                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span className="text-[10px] font-bold">بازگشت</span>
                                </button>

                                <div className="inline-block relative">
                                    {selectedEmployeeInAggregate.profileImageUrl ? (
                                        <img
                                            src={getFullImageUrl(selectedEmployeeInAggregate.profileImageUrl) || ''}
                                            alt={selectedEmployeeInAggregate.firstName}
                                            className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl border-4 border-white">
                                            {selectedEmployeeInAggregate.firstName?.[0] || '?'}
                                        </div>
                                    )}
                                    <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mt-4 leading-tight">
                                    {selectedEmployeeInAggregate.firstName} {selectedEmployeeInAggregate.lastName}
                                </h3>
                                <p className="text-blue-600 font-bold text-sm mt-1 uppercase tracking-wide bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">
                                    {selectedNodeData.title}
                                </p>

                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-sm transition-hover hover:shadow-md">
                                        <div className="text-[10px] text-gray-400 font-bold mb-1">کد پرسنلی</div>
                                        <div className="text-sm font-black text-gray-800">{selectedEmployeeInAggregate.employeeId}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-sm transition-hover hover:shadow-md">
                                        <div className="text-[10px] text-gray-400 font-bold mb-1">درصد اشتغال</div>
                                        <div className="text-sm font-black text-gray-800">{selectedEmployeeInAggregate.workloadPercentage || 100}%</div>
                                    </div>
                                </div>

                                <button onClick={() => setSelectedEmployeeInAggregate(null)} className="w-full mt-8 bg-gray-900 text-white py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all">
                                    بازگشت به لیست
                                </button>
                            </div>
                        ) : !selectedNodeData.isAggregate ? (
                            // Independent Mode
                            <div className="px-6 pb-8 text-center -mt-12 relative">
                                <div className="inline-block relative">
                                    {selectedNodeData.mainEmployee?.profileImageUrl ? (
                                        <img
                                            src={getFullImageUrl(selectedNodeData.mainEmployee.profileImageUrl) || ''}
                                            alt={selectedNodeData.mainEmployee.firstName}
                                            className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl border-4 border-white">
                                            {selectedNodeData.mainEmployee?.firstName?.[0] || '?'}
                                        </div>
                                    )}
                                    <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 mt-4 leading-tight">
                                    {selectedNodeData.mainEmployee ? `${selectedNodeData.mainEmployee.firstName} ${selectedNodeData.mainEmployee.lastName}` : 'بدون متصدی'}
                                </h3>
                                <p className="text-blue-600 font-bold text-sm mt-1 uppercase tracking-wide bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">
                                    {selectedNodeData.title}
                                </p>

                                {selectedNodeData.mainEmployee && (
                                    <div className="mt-8 grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-sm transition-hover hover:shadow-md">
                                            <div className="text-[10px] text-gray-400 font-bold mb-1">کد پرسنلی</div>
                                            <div className="text-sm font-black text-gray-800">{selectedNodeData.mainEmployee.employeeId}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-sm transition-hover hover:shadow-md">
                                            <div className="text-[10px] text-gray-400 font-bold mb-1">درصد اشتغال</div>
                                            <div className="text-sm font-black text-gray-800">{selectedNodeData.mainEmployee.workloadPercentage || 100}%</div>
                                        </div>
                                    </div>
                                )}

                                <button onClick={() => setSelectedNodeData(null)} className="w-full mt-8 bg-gray-900 text-white py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all">
                                    متوجه شدم
                                </button>
                            </div>
                        ) : (
                            // Aggregate Mode
                            <div className="px-6 pb-8 -mt-12 relative animate-in fade-in zoom-in duration-300">
                                <div className="flex justify-center flex-col items-center mb-6">
                                    <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white mb-3">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 text-center">{selectedNodeData.title}</h3>
                                    <div className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{selectedNodeData.employees?.length || 0} نفر عضو</div>
                                </div>

                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                    {selectedNodeData.employees && selectedNodeData.employees.length > 0 ? (
                                        selectedNodeData.employees.map((emp: any) => (
                                            <div
                                                key={emp.id}
                                                onClick={() => setSelectedEmployeeInAggregate(emp)}
                                                className="flex items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 transition-all group cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 active:scale-[0.98]"
                                            >
                                                {emp.profileImageUrl ? (
                                                    <img src={getFullImageUrl(emp.profileImageUrl) || ''} alt={emp.firstName} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                                                        {emp.firstName?.[0] || '?'}
                                                    </div>
                                                )}
                                                <div className="mr-3 flex-1">
                                                    <div className="text-sm font-black text-gray-800 group-hover:text-blue-600 transition-colors uppercase">{emp.firstName} {emp.lastName}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter flex items-center gap-2">
                                                        <span>{emp.employeeId}</span>
                                                        {emp.workloadPercentage && emp.workloadPercentage < 100 && (
                                                            <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[9px] font-black">
                                                                {emp.workloadPercentage}%
                                                            </span>
                                                        )}
                                                        {emp.isPrimary && (
                                                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[9px] font-black">
                                                                اصلی
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <svg className="w-4 h-4 text-gray-300 group-hover:translate-x-[-4px] group-hover:text-blue-400 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-gray-400 text-sm font-medium italic">هیچ عضوی یافت نشد</div>
                                    )}
                                </div>

                                <button onClick={() => setSelectedNodeData(null)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95">
                                    متوجه شدم
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                onNodeClick={(_event, node) => {
                    setSelectedNodeData({
                        ...node.data,
                        isAggregate: node.data.isAggregate,
                        mainEmployee: node.data.employees && node.data.employees.length > 0 ? node.data.employees[0] : null
                    });
                }}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                nodesDraggable={true}
                elementsSelectable={true}
                deleteKeyCode={null}
            >
                <Background gap={20} color="#e5e7eb" />
                <Controls />
                <Panel position="top-right" className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col space-y-2 min-w-[120px]">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter text-center border-b border-gray-50 pb-1 mb-1">چیدمان</div>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                        <button
                            onClick={() => onLayoutChange('TB')}
                            title="عمودی"
                            className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${direction === 'TB' ? 'bg-white shadow-md text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onLayoutChange('LR')}
                            title="افقی (چپ به راست)"
                            className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${direction === 'LR' ? 'bg-white shadow-md text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onLayoutChange('RL')}
                            title="افقی (راست به چپ)"
                            className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${direction === 'RL' ? 'bg-white shadow-md text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                    </div>
                    <button
                        onClick={toggleFullScreen}
                        className="w-full mt-1 flex items-center justify-center space-x-2 space-x-reverse py-2 bg-gray-900 text-white rounded-xl text-[10px] font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        {isFullScreen ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0M4 4l0 5m11 0l5-5m0 0l-5 0m5 0l0 5m-5 11l5 5m0 0l-5 0m5 0l0-5m-11 0l-5 5m0 0l5 0m-5 0l0-5" />
                                </svg>
                                <span>خروج از تمام صفحه</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                <span>نمایش تمام صفحه</span>
                            </>
                        )}
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default function InteractiveOrgChart(props: InteractiveOrgChartProps) {
    return (
        <ReactFlowProvider>
            <OrgChartContent {...props} />
        </ReactFlowProvider>
    );
}
