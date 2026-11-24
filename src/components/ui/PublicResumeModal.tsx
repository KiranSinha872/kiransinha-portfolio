'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

interface PublicResumeModalProps {
  isOpen: boolean;
  resumeUrl: string;
  onClose: () => void;
  title?: string;
}

export default function PublicResumeModal({
  isOpen,
  resumeUrl,
  onClose,
  title = 'Kiran Sinha — Resume',
}: PublicResumeModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !resumeUrl) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl h-[85vh] bg-white border border-[#DADADA] rounded-2xl shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[#DADADA] flex items-center justify-between bg-[#F9F9F9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#DADADA] flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#0B7658]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#121212] tracking-wide">
                  {title}
                </h3>
                <p className="text-[11px] text-[#5B5B5B]">PDF Document Preview</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <a
                href={resumeUrl}
                download="Kiran_Sinha_Resume.pdf"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B7658] text-white font-medium hover:bg-[#096148] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>

              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 border border-[#DADADA] rounded-lg text-[#5B5B5B] hover:text-[#121212] bg-white hover:bg-[#F1F1F1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
                aria-label="Open PDF in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 border border-[#DADADA] rounded-lg text-[#5B5B5B] hover:text-[#121212] bg-white hover:bg-[#F1F1F1] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PDF Viewer Frame */}
          <div className="flex-1 w-full bg-[#F1F1F1] relative">
            <iframe
              src={`${resumeUrl}#toolbar=0`}
              title={title}
              className="w-full h-full border-none"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
