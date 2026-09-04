import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  Image, 
  Database, 
  ChevronUp, 
  X, 
  Move
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminFloatingWidget: React.FC = () => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, elemX: 0, elemY: 0 });
  const hasMovedRef = useRef(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Initialize position to bottom-right on mount
  useEffect(() => {
    const initialX = Math.max(20, window.innerWidth - 80);
    const initialY = Math.max(20, window.innerHeight - 80);
    setPosition({ x: initialX, y: initialY });

    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 80),
        y: Math.min(prev.y, window.innerHeight - 80)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click
    if (e.button !== 0) return;
    e.stopPropagation();
    
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: position.x,
      elemY: position.y
    };

    const handleMouseMove = (moveEvt: MouseEvent) => {
      moveEvt.preventDefault();
      moveEvt.stopPropagation();

      const deltaX = moveEvt.clientX - dragStartRef.current.mouseX;
      const deltaY = moveEvt.clientY - dragStartRef.current.mouseY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        hasMovedRef.current = true;
      }

      const newX = Math.max(16, Math.min(window.innerWidth - 70, dragStartRef.current.elemX + deltaX));
      const newY = Math.max(16, Math.min(window.innerHeight - 70, dragStartRef.current.elemY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = (upEvt: MouseEvent) => {
      upEvt.stopPropagation();
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMovedRef.current) {
      setIsOpen(prev => !prev);
    }
  };

  const handleClearCache = () => {
    try {
      localStorage.clear();
      showToast('Client-side cache flushed. Refreshed data from Supabase.', 'success');
      setTimeout(() => window.location.reload(), 600);
    } catch {
      showToast('Cache cleared.', 'info');
    }
  };

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        touchAction: 'none'
      }}
      className="select-none"
    >
      {/* Floating Action Button */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          title="Drag to reposition | Click for Quick CMS Actions"
          className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-transform duration-200 cursor-grab active:cursor-grabbing border-2 ${
            isOpen 
              ? 'bg-secondary text-[#0a192f] border-secondary rotate-45 scale-105' 
              : 'bg-[#0a192f] text-secondary border-secondary/60 hover:scale-110 hover:border-secondary shadow-secondary/20'
          }`}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </button>

        {/* Quick Popup Menu */}
        {isOpen && (
          <div
            onClick={e => e.stopPropagation()}
            className="absolute bottom-14 right-0 w-64 p-3 bg-[#0a192f] border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-200 animate-fade-in space-y-2 font-body"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Supabase Live</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono">v1.0</span>
            </div>

            <div className="space-y-1">
              <Link
                to="/"
                target="_blank"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-white transition-colors"
              >
                <span>View Public Site</span>
                <ExternalLink className="w-3.5 h-3.5 text-secondary" />
              </Link>

              <Link
                to="/admin/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-white transition-colors"
              >
                <span>Brand Logo Manager</span>
                <Image className="w-3.5 h-3.5 text-secondary" />
              </Link>

              <button
                type="button"
                onClick={handleClearCache}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <span>Purge Local Cache</span>
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Move className="w-3 h-3 text-slate-500" />
                <span>Drag handle to reposition</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
