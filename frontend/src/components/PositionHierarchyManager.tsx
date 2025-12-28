'use client';

import React, { useState } from 'react';

interface Position {
  id: string;
  title: string;
  description?: string;
  parentPositionId?: string | null;
  order: number;
  employees?: any[];
  childPositions?: Position[];
}

interface PositionHierarchyManagerProps {
  positions: Position[];
  onReorder: (positionId: string, newParentId: string | null) => void;
}

export default function PositionHierarchyManager({ positions, onReorder }: PositionHierarchyManagerProps) {
  const [draggedPosition, setDraggedPosition] = useState<string | null>(null);

  // Validate positions data
  const validPositions = positions.filter(pos => {
    if (!pos.id || typeof pos.id !== 'string' || pos.id.length !== 36) {
      console.warn('PositionHierarchyManager: Filtering out invalid position:', pos.title || pos.id);
      return false;
    }
    return true;
  });

  console.log('PositionHierarchyManager: Received', positions.length, 'positions,', validPositions.length, 'valid positions');

  const handleDragStart = (e: React.DragEvent, positionId: string) => {
    setDraggedPosition(positionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPositionId: string | null) => {
    e.preventDefault();
    if (draggedPosition && draggedPosition !== targetPositionId) {
      onReorder(draggedPosition, targetPositionId);
    }
    setDraggedPosition(null);
  };

  const buildHierarchy = (positions: Position[], parentId: string | null = null, level = 0): React.JSX.Element[] => {
    const filteredPositions = validPositions.filter(pos => pos.parentPositionId === parentId);

    return filteredPositions.map((position) => (
      <div key={position.id} className="mb-2">
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, position.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, position.id)}
          className={`
            flex items-center p-3 bg-white border rounded-lg shadow-sm cursor-move
            hover:shadow-md transition-shadow duration-200
            ${draggedPosition === position.id ? 'opacity-50' : ''}
          `}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {/* Drag Handle */}
          <div className="flex items-center mr-3 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>

          {/* Position Info */}
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{position.title}</span>
              {position.employees && position.employees.length > 0 && (
                <span className="mr-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {position.employees.length} پرسنل
                </span>
              )}
            </div>
            {position.description && (
              <p className="text-sm text-gray-600 mt-1">{position.description}</p>
            )}
          </div>

          {/* Drop Zone Indicator */}
          <div
            className="ml-2 w-2 h-8 border-2 border-dashed border-gray-300 rounded opacity-0 hover:opacity-100 transition-opacity"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, position.id)}
          />
        </div>

        {/* Children */}
        {buildHierarchy(positions, position.id, level + 1)}

        {/* Drop zone for root level */}
        {level === 0 && (
          <div
            className="h-2 border-2 border-dashed border-gray-300 rounded opacity-0 hover:opacity-100 transition-opacity mb-2"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)}
          />
        )}
      </div>
    ));
  };

  if (!positions || positions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        هیچ سمتی تعریف نشده است.
      </div>
    );
  }

  if (validPositions.length === 0) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>خطا: همه سمت‌های تعریف شده نامعتبر هستند.</p>
        <p className="text-sm mt-2">لطفاً با مدیر سیستم تماس بگیرید.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {buildHierarchy(positions)}

      {/* Final drop zone */}
      <div
        className="h-8 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-sm opacity-0 hover:opacity-100 transition-opacity"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
      >
        رها کنید تا به سطح ریشه منتقل شود
      </div>
    </div>
  );
}
