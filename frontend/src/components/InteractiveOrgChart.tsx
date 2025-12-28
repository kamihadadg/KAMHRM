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

    // Convert number to hex color and create beautiful color scheme
    const numberToHex = (num: number) => `#${num.toString(16).padStart(6, '0')}`;
    const colorHex = data.colorScheme ? numberToHex(data.colorScheme) : '#3b82f6';

    // Create beautiful gradients and colors based on the selected color
    const createBeautifulColors = (hex: string) => {
        // Parse the hex color
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        // Create lighter and darker variants for gradient
        const lightR = Math.min(255, r + 120);
        const lightG = Math.min(255, g + 120);
        const lightB = Math.min(255, b + 120);

        const darkR = Math.max(0, r - 60);
        const darkG = Math.max(0, g - 60);
        const darkB = Math.max(0, b - 60);

        // Create complementary colors for borders and accents
        const borderR = Math.max(0, r - 40);
        const borderG = Math.max(0, g - 40);
        const borderB = Math.max(0, b - 40);

        // Calculate text color based on brightness for better contrast
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = brightness > 128 ? `rgb(${Math.max(0, r - 150)}, ${Math.max(0, g - 150)}, ${Math.max(0, b - 150)})` : '#ffffff';

        return {
            gradient: `linear-gradient(135deg, rgba(${lightR}, ${lightG}, ${lightB}, 0.9) 0%, rgba(${r}, ${g}, ${b}, 0.95) 50%, rgba(${darkR}, ${darkG}, ${darkB}, 0.9) 100%)`,
            border: `rgba(${borderR}, ${borderG}, ${borderB}, 0.8)`,
            shadow: `rgba(${r}, ${g}, ${b}, 0.4)`,
            glow: `rgba(${r}, ${g}, ${b}, 0.6)`,
            accent: `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, 0.9)`,
            text: textColor,
            titleBg: `rgba(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)}, 0.2)`,
            titleBorder: `rgba(${r}, ${g}, ${b}, 0.3)`
        };
    };

    const beautifulColors = createBeautifulColors(colorHex);

    return (
        <div
            className={`px-4 py-4 rounded-3xl shadow-2xl border-3 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer react-flow__draghandle relative overflow-hidden backdrop-blur-sm ${data.isDraggingOver ? 'scale-110 shadow-3xl ring-4' : 'hover:shadow-3xl'}`}
            style={{
                background: data.isDraggingOver ? `linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.95) 100%)` : beautifulColors.gradient,
                borderColor: data.isDraggingOver ? 'rgba(59, 130, 246, 0.8)' : beautifulColors.border,
                boxShadow: data.isDraggingOver
                    ? '0 25px 50px rgba(59, 130, 246, 0.4), 0 0 0 4px rgba(59, 130, 246, 0.3)'
                    : `0 20px 40px ${beautifulColors.shadow}, 0 0 0 2px ${beautifulColors.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                minWidth: '220px',
                maxWidth: '280px'
            }}
        >
            {/* Beautiful background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full" style={{ backgroundColor: beautifulColors.accent }}></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full" style={{ backgroundColor: beautifulColors.accent }}></div>
                <div className="absolute top-1/2 left-4 w-2 h-2 rounded-full" style={{ backgroundColor: beautifulColors.accent }}></div>
            </div>

            {/* Handles with beautiful styling */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-4 h-4 !border-4 !border-white shadow-lg"
                style={{
                    backgroundColor: beautifulColors.accent,
                    boxShadow: `0 0 0 3px ${beautifulColors.border}, 0 0 10px ${beautifulColors.glow}`
                }}
            />

            {/* Collapse/Expand Button */}
            {hasChildren && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleCollapse();
                    }}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-2xl border-3 border-white transition-all duration-300 hover:scale-125 z-20 animate-pulse"
                    style={{
                        background: `linear-gradient(135deg, ${beautifulColors.accent} 0%, rgba(${colorHex.slice(1, 3)}, ${colorHex.slice(3, 5)}, ${colorHex.slice(5, 7)}, 0.8) 100%)`,
                        boxShadow: `0 8px 20px ${beautifulColors.shadow}, 0 0 0 2px rgba(255, 255, 255, 0.8)`
                    }}
                    title={isCollapsed ? 'باز کردن فرزندان' : 'بستن فرزندان'}
                >
                    <svg
                        className={`w-4 h-4 transition-all duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            )}

            <div className="flex flex-col items-center pointer-events-none relative z-10">
                {isAggregate ? (
                    <div className="flex flex-col items-center py-2">
                        {/* Beautiful avatar stack */}
                        <div className="flex -space-x-4 mb-3 relative">
                            {data.employees?.slice(0, 4).map((emp: any, idx: number) => (
                                <div key={emp.id} className="relative transition-all duration-300 hover:scale-110 hover:z-20" style={{ zIndex: 10 - idx }}>
                                    {emp.profileImageUrl ? (
                                        <img
                                            src={getFullImageUrl(emp.profileImageUrl) || ''}
                                            className="w-12 h-12 rounded-full border-3 border-white shadow-xl object-cover transition-all duration-300 hover:shadow-2xl"
                                            style={{ borderColor: 'rgba(255, 255, 255, 0.9)' }}
                                        />
                                    ) : (
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-black shadow-xl border-3 transition-all duration-300 hover:shadow-2xl"
                                            style={{
                                                background: `linear-gradient(135deg, ${beautifulColors.accent} 0%, rgba(${colorHex.slice(1, 3)}, ${colorHex.slice(3, 5)}, ${colorHex.slice(5, 7)}, 0.8) 100%)`,
                                                borderColor: 'rgba(255, 255, 255, 0.9)'
                                            }}
                                        >
                                            {emp.firstName[0]}
                                        </div>
                                    )}
                                    {/* Beautiful workload badge */}
                                    {emp.workloadPercentage && emp.workloadPercentage < 100 && (
                                        <div
                                            className="absolute -bottom-1 -right-1 text-white text-[9px] font-black px-2 py-1 rounded-full border-2 shadow-lg animate-pulse"
                                            style={{
                                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                borderColor: 'rgba(255, 255, 255, 0.9)',
                                                boxShadow: '0 4px 8px rgba(245, 158, 11, 0.4)'
                                            }}
                                        >
                                            {emp.workloadPercentage}%
                                        </div>
                                    )}
                                </div>
                            ))}
                            {employeeCount > 4 && (
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black border-3 shadow-xl"
                                    style={{
                                        background: beautifulColors.titleBg,
                                        borderColor: 'rgba(255, 255, 255, 0.9)',
                                        color: beautifulColors.text
                                    }}
                                >
                                    +{employeeCount - 4}
                                </div>
                            )}
                            {employeeCount === 0 && (
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center border-3 border-dashed shadow-lg"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                        color: 'rgba(255, 255, 255, 0.6)'
                                    }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div
                            className="text-sm font-black px-3 py-1 rounded-full border-2 shadow-lg"
                            style={{
                                color: beautifulColors.text,
                                background: beautifulColors.titleBg,
                                borderColor: beautifulColors.titleBorder
                            }}
                        >
                            {employeeCount} نفر
                        </div>
                    </div>
                ) : (
                    mainEmployee ? (
                        <div className="flex flex-col items-center">
                            <div className="relative mb-2">
                                {mainEmployee.profileImageUrl ? (
                                    <img
                                        src={getFullImageUrl(mainEmployee.profileImageUrl) || ''}
                                        alt={mainEmployee.firstName}
                                        className="w-14 h-14 rounded-full border-4 shadow-2xl object-cover transition-all duration-300 hover:scale-110"
                                        style={{
                                            borderColor: 'rgba(255, 255, 255, 0.9)',
                                            boxShadow: `0 8px 20px ${beautifulColors.shadow}, 0 0 0 3px ${beautifulColors.glow}`
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-black shadow-2xl border-4 transition-all duration-300 hover:scale-110"
                                        style={{
                                            background: `linear-gradient(135deg, ${beautifulColors.accent} 0%, rgba(${colorHex.slice(1, 3)}, ${colorHex.slice(3, 5)}, ${colorHex.slice(5, 7)}, 0.8) 100%)`,
                                            borderColor: 'rgba(255, 255, 255, 0.9)',
                                            boxShadow: `0 8px 20px ${beautifulColors.shadow}, 0 0 0 3px ${beautifulColors.glow}`
                                        }}
                                    >
                                        {mainEmployee.firstName[0]}
                                    </div>
                                )}
                                {/* Beautiful workload badge */}
                                {mainEmployee.workloadPercentage && mainEmployee.workloadPercentage < 100 && (
                                    <div
                                        className="absolute -bottom-1 -right-1 text-white text-[10px] font-black px-2 py-1 rounded-full border-3 shadow-xl animate-pulse"
                                        style={{
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                            borderColor: 'rgba(255, 255, 255, 0.9)',
                                            boxShadow: '0 4px 8px rgba(245, 158, 11, 0.4)'
                                        }}
                                    >
                                        {mainEmployee.workloadPercentage}%
                                    </div>
                                )}
                                {/* Beautiful primary badge */}
                                {mainEmployee.isPrimary && (
                                    <div
                                        className="absolute -top-2 -left-2 text-white text-sm px-2 py-1 rounded-full border-3 shadow-xl animate-bounce"
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            borderColor: 'rgba(255, 255, 255, 0.9)',
                                            boxShadow: '0 4px 8px rgba(16, 185, 129, 0.4)'
                                        }}
                                    >
                                        ⭐
                                    </div>
                                )}
                            </div>
                            <div
                                className="text-sm font-bold text-center mb-2 px-2"
                                style={{ color: beautifulColors.text }}
                            >
                                {mainEmployee.firstName} {mainEmployee.lastName}
                            </div>
                        </div>
                    ) : (
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center mb-2 border-3 border-dashed shadow-lg"
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                color: 'rgba(255, 255, 255, 0.6)'
                            }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )
                )}

                {/* Beautiful title */}
                <div
                    className="text-xs font-black px-3 py-2 rounded-full border-2 shadow-lg uppercase tracking-wider text-center transition-all duration-300 hover:scale-105"
                    style={{
                        color: beautifulColors.text,
                        background: beautifulColors.titleBg,
                        borderColor: beautifulColors.titleBorder,
                        boxShadow: `0 4px 12px ${beautifulColors.shadow}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                    }}
                >
                    {data.title}
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-4 h-4 !border-4 !border-white shadow-lg"
                style={{
                    backgroundColor: beautifulColors.accent,
                    boxShadow: `0 0 0 3px ${beautifulColors.border}, 0 0 10px ${beautifulColors.glow}`
                }}
            />
        </div>
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
    dagreGraph.setGraph({ 
        rankdir: direction,
        ranksep: 120, // فاصله بین رتبه‌ها (سطح‌ها) - عمودی برای TB
        nodesep: 80,  // فاصله بین نودها در همان رتبه - افقی برای TB
        edgesep: 50,  // فاصله بین یال‌ها
        marginx: 50,  // حاشیه افقی
        marginy: 50   // حاشیه عمودی
    });

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

        const handleFitView = () => {
            fitView({ padding: 0.2, duration: 800 });
        };
        document.addEventListener('fitChartView', handleFitView);

        return () => {
            document.removeEventListener('fullscreenchange', handleFSChange);
            document.removeEventListener('fitChartView', handleFitView);
        };
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
                    colorScheme: item.colorScheme,
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

    // Check if dragged node is a parent of target node
    const isParentOf = useCallback((draggedNodeId: string, targetNodeId: string) => {
        const findNodeInTree = (nodes: any[], targetId: string): any => {
            for (const node of nodes) {
                if (node.id === targetId) return node;
                if (node.children) {
                    const found = findNodeInTree(node.children, targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        const targetNode = findNodeInTree(data, targetNodeId);
        if (!targetNode) return false;

        // Check if dragged node is in the parent chain of target node
        let current = targetNode;
        while (current.parentPositionId) {
            if (current.parentPositionId === draggedNodeId) {
                return true;
            }
            // Find parent node
            current = findNodeInTree(data, current.parentPositionId);
            if (!current) break;
        }

        return false;
    }, [data]);

    const onNodeDragStop = useCallback(
        async (_: any, node: Node) => {
            const targetNode = findTargetNode(node);

            if (targetNode) {
                // Check if dragged node is a parent of target node
                if (isParentOf(node.id, targetNode.id)) {
                    console.log('Cannot reorder: dragged node is a parent of target node');
                    // Reset drag states without making changes
                    setNodes((nds) =>
                        nds.map((n) => ({
                            ...n,
                            data: { ...n.data, isDraggingOver: false },
                            zIndex: 1
                        }))
                    );
                    return;
                }

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
        [nodes, findTargetNode, onReorder, initializeChart, isParentOf]
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
                defaultEdgeOptions={{
                    style: {
                        stroke: '#6366f1',
                        strokeWidth: 3,
                        filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))'
                    },
                    animated: true,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#6366f1',
                        width: 20,
                        height: 20,
                    },
                    type: 'smoothstep'
                }}
                fitView
                nodesDraggable={true}
                elementsSelectable={true}
                deleteKeyCode={null}
            >
                <Background
                    gap={30}
                    color="rgba(99, 102, 241, 0.1)"
                    style={{
                        background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)'
                    }}
                />
                <Controls />
                <Panel position="top-right" className="bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/20 flex flex-col space-y-3 min-w-[140px] overflow-hidden">
                    <div className="text-xs font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text uppercase tracking-wider text-center border-b border-gradient-to-r from-blue-100 to-purple-100 pb-2 mb-2">چیدمان چارت</div>
                    <div className="flex bg-gradient-to-r from-gray-50 to-blue-50 p-2 rounded-2xl border border-gray-100/50 shadow-inner">
                        <button
                            onClick={() => onLayoutChange('TB')}
                            title="چیدمان عمودی"
                            className={`flex-1 flex justify-center py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                                direction === 'TB'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                                    : 'text-gray-400 hover:text-blue-500 hover:bg-white/50'
                            }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onLayoutChange('LR')}
                            title="چیدمان افقی چپ به راست"
                            className={`flex-1 flex justify-center py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                                direction === 'LR'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                                    : 'text-gray-400 hover:text-blue-500 hover:bg-white/50'
                            }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onLayoutChange('RL')}
                            title="چیدمان افقی راست به چپ"
                            className={`flex-1 flex justify-center py-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                                direction === 'RL'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                                    : 'text-gray-400 hover:text-blue-500 hover:bg-white/50'
                            }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
