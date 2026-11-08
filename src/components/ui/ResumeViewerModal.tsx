'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

interface ResumeViewerModalProps {
  isOpen: boolean;
  resumeUrl: string;
  onClose: () => void;
  title?: string;
}

export default function ResumeViewerModal({
  isOpen,
  resumeUrl,
  onClose,
  title = 'Kiran Sinha - Resume',
}: ResumeViewerModalProps) {
  if (!isOpen || !resumeUrl) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-4xl h-[85vh] bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#181818]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#BBCCD7]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  {title}
                </h3>
                <p className="text-[11px] text-[#8E9BAE]">PDF Document Preview</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <a
                href={resumeUrl}
                download="Kiran_Sinha_Resume.pdf"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#BBCCD7] text-black font-medium hover:bg-white transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>

              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 border border-white/10 rounded-lg text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                title="Open in New Tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={onClose}
                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded Viewer Body */}
          <div className="flex-1 w-full h-full bg-[#0a0a0a] relative overflow-hidden">
            <iframe
              src={`${resumeUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title="Resume PDF Document"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
