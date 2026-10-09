import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  Download,
  Printer,
  CheckCircle,
  Copy,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Hash,
  ExternalLink
} from "lucide-react";

export function CertificateModal({
  isOpen,
  onClose,
  recipientName = "Rohan Sharma",
  pathTitle = "Full-Stack AI Engineer",
  skills = ["PyTorch", "Transformers", "LLM Fine-Tuning", "Vector DBs", "RAG Systems"],
  overallProgress = 100,
  credentialId = "SKILL-2026-AI-8492",
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
      // High-resolution Canvas generator (1920x1200 @ 2x pixel ratio)
      const width = 1920;
      const height = 1200;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context not available");

      // 1. Background - Deep obsidian & midnight indigo gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2, height / 2, 100,
        width / 2, height / 2, width / 1.1
      );
      bgGrad.addColorStop(0, "#111827");
      bgGrad.addColorStop(0.5, "#0b0f19");
      bgGrad.addColorStop(1, "#030712");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient corner glows
      const glowGrad1 = ctx.createRadialGradient(0, 0, 10, 0, 0, 600);
      glowGrad1.addColorStop(0, "rgba(99, 102, 241, 0.25)");
      glowGrad1.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.fillStyle = glowGrad1;
      ctx.fillRect(0, 0, 600, 600);

      const glowGrad2 = ctx.createRadialGradient(width, height, 10, width, height, 600);
      glowGrad2.addColorStop(0, "rgba(168, 85, 247, 0.22)");
      glowGrad2.addColorStop(1, "rgba(168, 85, 247, 0)");
      ctx.fillStyle = glowGrad2;
      ctx.fillRect(width - 600, height - 600, 600, 600);

      // 2. Ornate Border Framing
      // Outer Gold Border
      ctx.strokeStyle = "rgba(217, 178, 93, 0.4)";
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // Inner Fine Border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(55, 55, width - 110, height - 110);

      // Corner Accents (L-brackets)
      const bracketSize = 45;
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 3;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(35, 35 + bracketSize);
      ctx.lineTo(35, 35);
      ctx.lineTo(35 + bracketSize, 35);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(width - 35 - bracketSize, 35);
      ctx.lineTo(width - 35, 35);
      ctx.lineTo(width - 35, 35 + bracketSize);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(35, height - 35 - bracketSize);
      ctx.lineTo(35, height - 35);
      ctx.lineTo(35 + bracketSize, height - 35);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(width - 35 - bracketSize, height - 35);
      ctx.lineTo(width - 35, height - 35);
      ctx.lineTo(width - 35, height - 35 - bracketSize);
      ctx.stroke();

      // 3. Institution Crest / Header
      ctx.textAlign = "center";
      ctx.font = "bold 24px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "#818cf8";
      ctx.fillText("S K I L L U P   A C A D E M Y", width / 2, 160);

      ctx.font = "600 15px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("ACCREDITED ADAPTIVE CURRICULUM & ENGINEERING COMPETENCY ENGINE", width / 2, 195);

      // Gold Title: CERTIFICATE OF TECHNICAL MASTERY
      const goldTitleGrad = ctx.createLinearGradient(width / 2 - 300, 0, width / 2 + 300, 0);
      goldTitleGrad.addColorStop(0, "#fde68a");
      goldTitleGrad.addColorStop(0.5, "#fbbf24");
      goldTitleGrad.addColorStop(1, "#d97706");
      ctx.fillStyle = goldTitleGrad;
      ctx.font = "bold 46px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText("CERTIFICATE OF ENGINEERING MASTERY", width / 2, 280);

      // Divider Line
      const divGrad = ctx.createLinearGradient(width / 2 - 250, 0, width / 2 + 250, 0);
      divGrad.addColorStop(0, "rgba(234, 179, 8, 0)");
      divGrad.addColorStop(0.5, "rgba(234, 179, 8, 0.8)");
      divGrad.addColorStop(1, "rgba(234, 179, 8, 0)");
      ctx.fillStyle = divGrad;
      ctx.fillRect(width / 2 - 250, 310, 500, 2);

      // 4. "THIS CERTIFIES THAT"
      ctx.font = "italic 22px Georgia, serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("This is proudly presented to certify that", width / 2, 380);

      // 5. Recipient Name (Prominent Hero)
      ctx.font = "bold 78px 'Plus Jakarta Sans', system-ui, sans-serif";
      const nameGrad = ctx.createLinearGradient(width / 2 - 300, 0, width / 2 + 300, 0);
      nameGrad.addColorStop(0, "#ffffff");
      nameGrad.addColorStop(0.5, "#f8fafc");
      nameGrad.addColorStop(1, "#cbd5e1");
      ctx.fillStyle = nameGrad;
      ctx.fillText(recipientName, width / 2, 475);

      // 6. Descriptive Paragraph
      ctx.font = "20px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(
        "has rigorously completed all practical modules, projects, and assessment milestones for the track",
        width / 2,
        550
      );

      // 7. Path Track Title
      ctx.font = "bold 44px 'Plus Jakarta Sans', system-ui, sans-serif";
      const trackGrad = ctx.createLinearGradient(width / 2 - 250, 0, width / 2 + 250, 0);
      trackGrad.addColorStop(0, "#818cf8");
      trackGrad.addColorStop(0.5, "#c084fc");
      trackGrad.addColorStop(1, "#f472b6");
      ctx.fillStyle = trackGrad;
      ctx.fillText(pathTitle, width / 2, 620);

      // 8. Verified Skills Pill Badges
      const skillsToRender = skills.slice(0, 5);
      const pillY = 700;
      const totalPillWidth = skillsToRender.length * 160;
      let startX = width / 2 - totalPillWidth / 2;

      skillsToRender.forEach((skill) => {
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;

        // Rounded rect for badge
        const bw = 145;
        const bh = 38;
        const radius = 19;
        ctx.beginPath();
        ctx.roundRect(startX, pillY, bw, bh, radius);
        ctx.fill();
        ctx.stroke();

        ctx.font = "600 14px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = "#e2e8f0";
        ctx.fillText(skill, startX + bw / 2, pillY + 24);

        startX += bw + 15;
      });

      // 9. Bottom Signatures & Holographic Stamp
      // Left: Academic Evaluator
      const sigY = 930;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(250, sigY);
      ctx.lineTo(550, sigY);
      ctx.stroke();

      // Stylized digital signature simulation
      ctx.font = "italic 32px 'Brush Script MT', 'Apple Chancery', cursive";
      ctx.fillStyle = "#818cf8";
      ctx.fillText("Prof. Atharva Joshi", 400, sigY - 20);

      ctx.font = "600 16px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Atharva Joshi", 400, sigY + 28);
      ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Lead Curriculum Director", 400, sigY + 52);

      // Center: Official Gold Seal Badge
      const sealCenterX = width / 2;
      const sealCenterY = sigY - 20;

      // Glow behind seal
      const sealGlow = ctx.createRadialGradient(sealCenterX, sealCenterY, 5, sealCenterX, sealCenterY, 75);
      sealGlow.addColorStop(0, "rgba(234, 179, 8, 0.4)");
      sealGlow.addColorStop(1, "rgba(234, 179, 8, 0)");
      ctx.fillStyle = sealGlow;
      ctx.beginPath();
      ctx.arc(sealCenterX, sealCenterY, 75, 0, Math.PI * 2);
      ctx.fill();

      // Outer seal ring
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sealCenterX, sealCenterY, 52, 0, Math.PI * 2);
      ctx.stroke();

      // Inner seal circle
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.arc(sealCenterX, sealCenterY, 48, 0, Math.PI * 2);
      ctx.fill();

      // Star icon inside seal
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("★", sealCenterX, sealCenterY + 10);

      ctx.font = "bold 10px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#fde047";
      ctx.fillText("VERIFIED", sealCenterX, sealCenterY + 28);
      ctx.fillText("CREDENTIAL", sealCenterX, sealCenterY - 18);

      // Right: Verification Authority / Date
      ctx.beginPath();
      ctx.moveTo(width - 550, sigY);
      ctx.lineTo(width - 250, sigY);
      ctx.stroke();

      ctx.font = "italic 32px 'Brush Script MT', 'Apple Chancery', cursive";
      ctx.fillStyle = "#c084fc";
      ctx.fillText("Sayujya Verma", width - 400, sigY - 20);

      ctx.font = "600 16px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Sayujya Verma", width - 400, sigY + 28);
      ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Academic Dean & Verification Lead", width - 400, sigY + 52);

      // 10. Metadata Footer
      ctx.font = "13px 'Plus Jakarta Sans', monospace";
      ctx.fillStyle = "#64748b";
      ctx.fillText(
        `Credential ID: ${credentialId}   •   Issue Date: ${completionDate}   •   SkillUp Digital Ledger (SHA-256)`,
        width / 2,
        height - 65
      );

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
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl z-10 flex flex-col items-center my-auto print:m-0 print:max-w-none">
        {/* Top Control Bar (hidden in print) */}
        <div className="w-full flex items-center justify-between pb-4 print:hidden text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-yellow-500/20 font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Verified Credential Awarded
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready to Download
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Issued by SkillUp Institute of Adaptive Learning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? "Generating..." : "Download High-Res PNG"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold glass-pill hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer border border-white/10"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-pill hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer border border-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Visual Certificate Surface (Print-optimised and Screen View) ── */}
        <div
          ref={certificateRef}
          className="relative w-full aspect-[16/10] bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl border-2 border-yellow-600/40 p-6 sm:p-12 text-center shadow-2xl shadow-indigo-950/60 overflow-hidden flex flex-col justify-between print:rounded-none print:border-4 print:border-yellow-600 print:w-screen print:h-screen print:aspect-auto"
        >
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Ornate Corner Accents */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-yellow-500/60" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-yellow-500/60" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-yellow-500/60" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-yellow-500/60" />

          {/* Certificate Header */}
          <div className="space-y-1 relative z-10 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-indigo-500/30 text-indigo-400 text-[11px] font-bold uppercase tracking-widest font-accent">
              <GraduationCap className="w-3.5 h-3.5" /> SkillUp Academy
            </div>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 font-mono">
              Accredited Adaptive Curriculum & Engineering Competency Engine
            </p>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 font-display pt-1">
              CERTIFICATE OF ENGINEERING MASTERY
            </h2>
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent mx-auto mt-2" />
          </div>

          {/* Recipient Presentation */}
          <div className="space-y-3 relative z-10 my-auto py-2">
            <p className="text-xs sm:text-sm text-gray-400 italic font-serif">
              This is proudly presented to certify that
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight font-display drop-shadow-sm">
              {recipientName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              has successfully fulfilled all curriculum requirements, practical milestone assessments, and demonstrated verified competence in:
            </p>
            <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 font-display">
              {pathTitle}
            </div>

            {/* Verified Skills Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2">
              {skills.slice(0, 5).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold glass-pill text-gray-200 border border-white/10"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Certificate Footer: Signatures & Holographic Seal */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm">
            {/* Left Signature: Atharva */}
            <div className="text-left w-1/3">
              <div className="font-serif italic text-lg sm:text-xl text-indigo-300 font-bold tracking-wide">
                Atharva Joshi
              </div>
              <div className="h-px w-36 bg-white/20 mt-1 mb-1" />
              <p className="font-bold text-gray-200 text-[11px] sm:text-xs">Prof. Atharva Joshi</p>
              <p className="text-[10px] text-gray-400">Lead Curriculum Director</p>
            </div>

            {/* Center Seal */}
            <div className="w-1/3 flex justify-center">
              <div className="relative flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-yellow-500/80 bg-gradient-to-tr from-amber-500/20 via-yellow-400/30 to-amber-600/20 flex flex-col items-center justify-center shadow-lg shadow-yellow-500/20">
                  <ShieldCheck className="w-6 h-6 text-yellow-400" />
                  <span className="text-[8px] font-bold text-yellow-300 tracking-tighter uppercase">VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Right Signature: Sayujya */}
            <div className="text-right w-1/3 flex flex-col items-end">
              <div className="font-serif italic text-lg sm:text-xl text-purple-300 font-bold tracking-wide">
                Sayujya Verma
              </div>
              <div className="h-px w-36 bg-white/20 mt-1 mb-1" />
              <p className="font-bold text-gray-200 text-[11px] sm:text-xs">Sayujya Verma</p>
              <p className="text-[10px] text-gray-400">Academic Dean & Verification Lead</p>
            </div>
          </div>

          {/* Micro Legal & Credential ID bar */}
          <div className="relative z-10 pt-3 text-[10px] text-gray-500 flex flex-col sm:flex-row items-center justify-between font-mono">
            <span>Credential ID: <strong className="text-gray-300">{credentialId}</strong></span>
            <span>Issued: <strong className="text-gray-300">{completionDate}</strong></span>
            <span className="hidden sm:inline">SkillUp Digital Ledger (SHA-256)</span>
          </div>
        </div>

        {/* Bottom Helper Bar (hidden in print) */}
        <div className="w-full mt-3 p-3 rounded-2xl glass-default border border-white/10 flex items-center justify-between text-xs text-gray-300 print:hidden">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-purple-400" />
            <span>Verification Hash: <span className="font-mono text-white">{credentialId}</span></span>
          </div>

          <button
            onClick={handleCopyId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-pill hover:bg-white/10 transition-colors cursor-pointer text-gray-300 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied ID!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
