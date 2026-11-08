'use client';

import React from 'react';
import Image from 'next/image';
import { Pencil, Trash2, ExternalLink, Code2 } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectAdminCardProps {
  item: Project;
  isDeleting: boolean;
  onEdit: (item: Project) => void;
  onDelete: (id: string, title: string) => void;
}

export default function ProjectAdminCard({
  item,
  isDeleting,
  onEdit,
  onDelete,
}: ProjectAdminCardProps) {
  return (
    <div className="border border-gray-200 rounded overflow-hidden flex flex-col justify-between bg-white">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-gray-100 border-b border-gray-200 flex items-center justify-center">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain"
          />
        ) : (
          <div className="text-xs text-gray-400">No image</div>
        )}
        {item.featured && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-semibold border border-gray-300 bg-white text-gray-800 rounded">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
            {item.title}
          </h3>
          {item.tagline && (
            <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
              {item.tagline}
            </p>
          )}
          <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 pt-1">
          {item.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 border border-gray-200 text-gray-700"
            >
              {tag}
            </span>
          ))}
          {item.tags && item.tags.length > 3 && (
            <span className="px-1 py-0.5 text-[10px] text-gray-500">
              +{item.tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2">
            {item.liveUrl && (
              <a
                href={item.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900"
                title="Live demo"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {item.repoUrl && (
              <a
                href={item.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900"
                title="Source code"
              >
                <Code2 className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-1 border border-gray-200 rounded text-gray-700 hover:bg-gray-50"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => item.id && onDelete(item.id, item.title)}
              className="p-1 border border-red-200 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
