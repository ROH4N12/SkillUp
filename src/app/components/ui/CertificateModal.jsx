import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  Download,
  Printer,
  Copy,
  Check,
  X
} from "lucide-react";

export function CertificateModal({
  isOpen,
  onClose,
  recipientName = "Rohan",
  pathTitle = "Full-Stack AI Engineer",
  skills = ["PyTorch", "Transformers", "LLM Fine-Tuning", "Vector DBs", "RAG Systems"],
  overallProgress = 100,
  credentialId = "SKILL-2026-ENG-8492",
  completionDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })
}) {
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = () => {
    setDownloading(true);
    try {
      const width = 1920;
      const height = 1080;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context not available");

      // Background - Clean minimalist dark obsidian
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, width, height);

      // Subtle hairline border
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, width - 120, height - 120);

      // Left margin
      const leftX = 140;
      ctx.textAlign = "left";

      // Top brand header
      ctx.font = "bold 36px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("SkillUp", leftX, 150);

      ctx.font = "600 13px 'Plus Jakarta Sans', monospace";
      ctx.fillStyle = "#64748b";
      ctx.fillText("CERTIFICATE OF COMPLETION", leftX, 178);

      // Divider rule
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(leftX, 210, width - (leftX * 2), 1.5);

      // Path section
      ctx.font = "600 14px 'Plus Jakarta Sans', monospace";
      ctx.fillStyle = "#818cf8";
      ctx.fillText("LEARNING PATH", leftX, 290);

      ctx.font = "bold 52px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "#f8fafc";
      ctx.fillText(pathTitle, leftX, 360);

      // Completion statement
      ctx.font = "400 24px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("This learning path was completed by", leftX, 450);

      // Recipient Name - Big bold letters left-aligned
      ctx.font = "900 84px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(recipientName, leftX, 555);

      // Verified Skills Pills (clean, subtle)
      if (skills && skills.length > 0) {
        ctx.font = "500 18px 'Plus Jakarta Sans', monospace";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Verified Competencies: " + skills.slice(0, 6).join("   •   "), leftX, 660);
      }

      // Metadata Row (Issue Date & Credential ID)
      ctx.font = "500 16px monospace";
      ctx.fillStyle = "#64748b";
      ctx.fillText(`Issue Date: ${completionDate}       |       Credential ID: ${credentialId}`, leftX, 760);

      // Bottom Divider rule
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(leftX, 860, width - (leftX * 2), 1.5);

      // Simple credit below
      ctx.font = "600 24px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText("Completed via SkillUp", leftX, 930);

      ctx.font = "400 15px 'Plus Jakarta Sans', monospace";
      ctx.fillStyle = "#64748b";
      ctx.fillText("Verified Engineering Curriculum • skillup.ai", leftX, 962);

      // Trigger instant PNG Download
      const dataUrl = canvas.toDataURL("image/png");
      const downloadAnchor = document.createElement("a");
      const safeName = recipientName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const safePath = pathTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");
      downloadAnchor.download = `SkillUp-Certificate-${safeName}-${safePath}.png`;
      downloadAnchor.href = dataUrl;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    } catch (err) {
      console.error("Failed to generate certificate PNG:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0">
      {/* Backdrop (hidden in print) */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl z-10 flex flex-col items-center my-auto print:m-0 print:max-w-none">
        {/* Top Control Bar (hidden in print) */}
        <div className="w-full flex items-center justify-between pb-4 print:hidden text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Certificate of Completion
              </h3>
              <p className="text-xs text-gray-400">
                Official Credential • Ready to Download
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700 transition-all active:scale-95"
              title="Copy Credential ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied ID" : "Copy ID"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700 transition-all active:scale-95"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? "Generating..." : "Download PNG"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-gray-400 hover:text-white transition-all ml-1"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Minimalist Clean Certificate Card ── */}
        <div
          ref={certificateRef}
          className="w-full bg-[#090d16] text-white border border-slate-800 rounded-2xl p-6 sm:p-12 shadow-2xl relative print:border-none print:shadow-none print:rounded-none print:p-8 print:w-full"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-6 mb-8 text-left">
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
                SkillUp
              </div>
              <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase mt-0.5">
                Certificate of Completion
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Verified Credential
              </span>
            </div>
          </div>

          {/* Body Content - All Left Aligned */}
          <div className="text-left space-y-6">
            <div>
              <div className="text-xs font-mono tracking-wider text-indigo-400 uppercase">
                Learning Path
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {pathTitle}
              </h2>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-slate-400">
                This learning path was completed by
              </p>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mt-1.5">
                {recipientName}
              </h1>
            </div>

            {/* Skills / Competencies tags */}
            {skills && skills.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase mb-2">
                  Competencies Mastered
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 6).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata (Issue Date & Credential ID) */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-xs font-mono text-slate-400">
              <div>
                <span className="text-slate-400">Issue Date: </span>
                <span className="text-slate-200 font-semibold">{completionDate}</span>
              </div>
              <div>
                <span className="text-slate-400">Credential ID: </span>
                <span className="text-slate-200 font-semibold">{credentialId}</span>
              </div>
            </div>
          </div>

          {/* Simple Credit to Us Below */}
          <div className="border-t border-slate-800/80 pt-6 mt-8 flex flex-col sm:flex-row sm:items-center justify-between text-left gap-2">
            <div>
              <div className="text-sm font-semibold text-slate-200">
                Completed via SkillUp
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Verified Engineering Curriculum • skillup.ai
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body {
            background: #090d16 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: landscape;
            margin: 1cm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
