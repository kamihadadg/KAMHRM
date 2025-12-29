'use client';

import React, { useState } from 'react';
import Tree from 'react-d3-tree';
import { API_BASE_URL } from '@/lib/api';

const getFullImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path; // handle base64 previews
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

interface OrgChartNode {
  id: string;
  name: string;
  attributes: {
    title: string;
    position: string;
    role: string;
    department: string;
    isPosition?: boolean;
  };
  profileImage?: string;
  children: OrgChartNode[];
}

interface OrgChartProps {
  data: OrgChartNode[];
}

const renderCustomNode = ({ nodeDatum }: any) => {
  const { attributes, profileImage } = nodeDatum;

  return (
    <g>
      {/* Node background */}
      <rect
        width="180"
        height="120"
        x="-90"
        y="-60"
        fill={attributes.isPosition ? "#f3f4f6" : "#ffffff"}
        stroke="#d1d5db"
        strokeWidth="2"
        rx="8"
      />

      {/* Profile Image */}
      {profileImage ? (
        <image
          href={getFullImageUrl(profileImage) || ''}
          x="-35"
          y="-50"
          width="40"
          height="40"
          clipPath="circle(20px at center)"
        />
      ) : (
        <circle
          cx="0"
          cy="-30"
          r="20"
          fill={attributes.isPosition ? "#6b7280" : "#3b82f6"}
        />
      )}

      {/* Default avatar icon */}
      {!profileImage && (
        <text
          x="0"
          y="-25"
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontWeight="bold"
        >
          {attributes.isPosition ? "👔" : "👤"}
        </text>
      )}

      {/* Name */}
      <text
        x="0"
        y="10"
        textAnchor="middle"
        fill="#111827"
        fontSize="12"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        {nodeDatum.name.length > 15 ? nodeDatum.name.substring(0, 15) + '...' : nodeDatum.name}
      </text>

      {/* Title/Position */}
      <text
        x="0"
        y="30"
        textAnchor="middle"
        fill="#6b7280"
        fontSize="10"
        fontFamily="Arial, sans-serif"
      >
        {attributes.title.length > 18 ? attributes.title.substring(0, 18) + '...' : attributes.title}
      </text>

      {/* Role indicator */}
      {!attributes.isPosition && (
        <text
          x="0"
          y="45"
          textAnchor="middle"
          fill={attributes.role === 'SUPERADMIN' ? '#dc2626' : attributes.role === 'MIDDLEMANAGER' ? '#059669' : attributes.role === 'HRADMIN' ? '#2563eb' : '#6b7280'}
          fontSize="8"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          {attributes.role === 'SUPERADMIN' ? 'مدیر سیستم' :
            attributes.role === 'MIDDLEMANAGER' ? 'مدیر میانی' :
              attributes.role === 'HRADMIN' ? 'مدیر منابع انسانی' : 'پرسنل'}
        </text>
      )}
    </g>
  );
};

export default function OrgChart({ data }: OrgChartProps) {
  const [translate, setTranslate] = useState({ x: 400, y: 100 });

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500">هیچ داده‌ای برای نمایش چارت سازمانی وجود ندارد.</p>
          <p className="text-sm text-gray-400 mt-2">ابتدا سمت‌ها و پرسنل را تعریف کنید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Tree
        data={data[0]} // Start with the first root node
        translate={translate}
        orientation="vertical"
        pathFunc="step"
        renderCustomNodeElement={renderCustomNode}
        nodeSize={{ x: 200, y: 140 }}
        separation={{ siblings: 1.2, nonSiblings: 1.5 }}
        zoomable={true}
        draggable={true}
        onNodeClick={(nodeDatum) => {
          console.log('Node clicked:', nodeDatum);
        }}
        zoom={0.8}
        scaleExtent={{ min: 0.5, max: 2 }}
      />
    </div>
  );
}
