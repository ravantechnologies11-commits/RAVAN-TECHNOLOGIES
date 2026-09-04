import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, Focus, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CircleDot, Check, Maximize, Minimize, Crosshair } from 'lucide-react';
import { storageService } from '../../lib/storageService';
import { useToast } from '../../context/ToastContext';

export interface CropResult {
  url: string;
  storage_path: string;
  file_size: string;
  alt_text: string;
}

export interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (result: CropResult) => void;
  aspectRatioLabel?: '4:5 (Portrait)' | '4:3 (Standard)' | '16:9 (Landscape)' | '1:1 (Square)' | '16:10 (Wide)' | '4:6 (Standard Photo)';
  targetBucket?: 'media' | 'avatars' | 'gallery' | 'projects' | 'ecosystem';
  targetFolder?: string;
  initialAltText?: string;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  aspectRatioLabel = '4:5 (Portrait)',
  targetBucket = 'avatars',
  targetFolder = 'general',
  initialAltText = ''
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [altText, setAltText] = useState(initialAltText);

  // Viewport & Image State
  const [targetRatio, setTargetRatio] = useState<string>(aspectRatioLabel);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [fitMode, setFitMode] = useState<'SMART' | 'FILL' | 'CONTAIN'>('SMART');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [sourceInfo, setSourceInfo] = useState<{w: number, h: number, ratio: number, orientation: string} | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceBox, setFaceBox] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  const VIEWPORT_W = 320;

  const getNumericRatio = (label: string) => {
    switch(label) {
      case '4:5 (Portrait)': return 4/5;
      case '4:3 (Standard)': return 4/3;
      case '4:6 (Standard Photo)': return 4/6;
      case '16:9 (Landscape)': return 16/9;
      case '16:10 (Wide)': return 16/10;
      case '1:1 (Square)': return 1;
      default: return 1;
    }
  };

  const ratioNumeric = getNumericRatio(targetRatio);
  const VIEWPORT_H = VIEWPORT_W / ratioNumeric;

  const calculateFit = useCallback((mode: 'SMART' | 'FILL' | 'CONTAIN', currentRatioNumeric: number = ratioNumeric) => {
    if (!sourceInfo || !imgRef.current) return;
    const nw = sourceInfo.w;
    const nh = sourceInfo.h;
    const vH = VIEWPORT_W / currentRatioNumeric;

    const scaleX = VIEWPORT_W / nw;
    const scaleY = vH / nh;
    
    let newZoom = 1;
    let newPan = { x: 0, y: 0 };

    if (mode === 'CONTAIN') {
      newZoom = Math.min(scaleX, scaleY);
    } else {
      // FILL or SMART
      newZoom = Math.max(scaleX, scaleY);
      
      if (mode === 'SMART') {
        if (faceDetected && faceBox) {
          // Center the face
          const faceCenterX = faceBox.x + (faceBox.width / 2);
          const faceCenterY = faceBox.y + (faceBox.height / 2);
          const imgCenterX = nw / 2;
          const imgCenterY = nh / 2;
          
          newPan.x = (imgCenterX - faceCenterX) * newZoom;
          newPan.y = (imgCenterY - faceCenterY) * newZoom;
        } else {
          // Geometry heuristic
          if (sourceInfo.orientation === 'Portrait') {
            const excessY = (nh * newZoom) - vH;
            if (excessY > 0) {
              newPan.y = excessY * 0.4; // shift image down by 40% of excess to preserve head
            }
          }
        }
      }
    }

    setZoom(newZoom);
    setPan(newPan);
  }, [sourceInfo, ratioNumeric, faceDetected, faceBox]);

  useEffect(() => {
    if (imageSrc) {
      calculateFit(fitMode);
    }
  }, [targetRatio, imageSrc, calculateFit, fitMode]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = storageService.validateImage(file, 10);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid file', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setOriginalFile(file);
    setAltText(file.name.split('.')[0] || 'Uploaded image');

    const img = new Image();
    img.onerror = () => {
      showToast('Browser cannot process this image format. Please try a standard JPG or PNG.', 'error');
      setImageSrc(null);
      setOriginalFile(null);
    };
    img.onload = async () => {
      const w = img.width;
      const h = img.height;
      const ratio = w / h;
      let orientation = 'Square';
      if (ratio > 1.05) orientation = 'Landscape';
      if (ratio < 0.95) orientation = 'Portrait';

      setSourceInfo({ w, h, ratio, orientation });

      let detected = false;
      let detectedBox = null;
      if ('FaceDetector' in window) {
        try {
          const detector = new (window as any).FaceDetector();
          const faces = await detector.detect(img);
          if (faces && faces.length > 0) {
            detected = true;
            const biggestFace = faces.reduce((prev: any, curr: any) => 
              (prev.boundingBox.width * prev.boundingBox.height > curr.boundingBox.width * curr.boundingBox.height) ? prev : curr
            );
            detectedBox = biggestFace.boundingBox;
          }
        } catch (err) {
          if (import.meta.env.DEV) console.warn('FaceDetector failed', err);
        }
      }
      setFaceDetected(detected);
      setFaceBox(detectedBox);
    };
    img.src = url;
  };

  const movePan = (dx: number, dy: number) => {
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleModeChange = (mode: 'SMART' | 'FILL' | 'CONTAIN') => {
    setFitMode(mode);
    calculateFit(mode);
  };

  const handleSaveAndUpload = async () => {
    if (!imageSrc || !originalFile || !imgRef.current || !sourceInfo) return;
    setIsUploading(true);

    try {
      const canvas = document.createElement('canvas');
      const exportWidth = 1200;
      const exportHeight = exportWidth / ratioNumeric;
      
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, exportWidth, exportHeight);

      const scaleMultiplier = exportWidth / VIEWPORT_W;
      
      ctx.translate(
        (exportWidth / 2) + (pan.x * scaleMultiplier), 
        (exportHeight / 2) + (pan.y * scaleMultiplier)
      );
      ctx.scale(zoom * scaleMultiplier, zoom * scaleMultiplier);
      
      const nw = sourceInfo.w;
      const nh = sourceInfo.h;
      ctx.drawImage(imgRef.current, -nw / 2, -nh / 2, nw, nh);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas toBlob failed')), 'image/jpeg', 0.95);
      });

      const croppedFile = new File([blob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const uploadRes = await storageService.uploadImage(croppedFile, targetBucket, targetFolder);

      onConfirm({
        url: uploadRes.url,
        storage_path: uploadRes.path,
        file_size: uploadRes.file_size,
        alt_text: altText || originalFile.name
      });
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Crop upload failed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040810]/95 backdrop-blur-md p-4">
      <div className="bg-[#0a192f] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#07111e]">
          <div className="flex items-center gap-3">
            <Focus className="w-5 h-5 text-secondary" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Adjust Leadership Image</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!imageSrc ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-secondary rounded-xl p-16 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#07111e]/50 text-center group min-h-[400px]"
            >
              <Upload className="w-12 h-12 text-slate-500 group-hover:text-secondary mb-4 transition-colors" />
              <div className="text-base font-bold text-white mb-2">Click to select photo from device</div>
              <div className="text-xs text-slate-400">Supports JPG, PNG, WEBP, and more.</div>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-7 flex flex-col items-center gap-4">
                <div className="bg-[#07111e] p-6 rounded-xl border border-slate-800 w-full flex justify-center items-center relative overflow-hidden shadow-inner min-h-[450px]">
                  <div
                    className="relative overflow-hidden bg-slate-900 border-2 border-secondary shadow-2xl cursor-move select-none"
                    style={{ width: VIEWPORT_W, height: VIEWPORT_H }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Crop preview"
                      className="max-w-none absolute pointer-events-none"
                      style={{
                        width: sourceInfo?.w || 0,
                        height: sourceInfo?.h || 0,
                        left: '50%',
                        top: '50%',
                        marginLeft: sourceInfo ? -(sourceInfo.w / 2) : 0,
                        marginTop: sourceInfo ? -(sourceInfo.h / 2) : 0,
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center'
                      }}
                    />
                    
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20 border border-white">
                      <div className="border-r border-b border-white"></div><div className="border-r border-b border-white"></div><div className="border-b border-white"></div>
                      <div className="border-r border-b border-white"></div><div className="border-r border-b border-white"></div><div className="border-b border-white"></div>
                      <div className="border-r border-white"></div><div className="border-r border-white"></div><div></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full justify-center">
                  <button onClick={() => handleModeChange('SMART')} className={`px-4 py-2 rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-2 ${fitMode === 'SMART' ? 'bg-secondary text-[#0a192f]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    <Crosshair className="w-3.5 h-3.5" /> [ SMART FIT ]
                  </button>
                  <button onClick={() => handleModeChange('FILL')} className={`px-4 py-2 rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-2 ${fitMode === 'FILL' ? 'bg-secondary text-[#0a192f]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    <Maximize className="w-3.5 h-3.5" /> [ FILL ]
                  </button>
                  <button onClick={() => handleModeChange('CONTAIN')} className={`px-4 py-2 rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-2 ${fitMode === 'CONTAIN' ? 'bg-secondary text-[#0a192f]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    <Minimize className="w-3.5 h-3.5" /> [ CONTAIN ]
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-5">
                
                <div className="bg-[#07111e] p-5 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">Fixed Image Frame / Live Preview</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500">Source:</span>
                      <span className="text-white font-mono">{sourceInfo ? `${sourceInfo.w} × ${sourceInfo.h} px` : '---'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500">Ratio:</span>
                      <span className="text-white font-mono">{sourceInfo ? `${(sourceInfo.w / sourceInfo.h).toFixed(2)} (${sourceInfo.orientation})` : '---'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500 flex items-center gap-2">Target Frame Preset:</span>
                      <select 
                        value={targetRatio}
                        onChange={(e) => setTargetRatio(e.target.value)}
                        className="bg-[#0a192f] border border-slate-700 text-secondary font-mono rounded px-2 py-1 text-xs focus:outline-none focus:border-secondary"
                      >
                        <option value="4:5 (Portrait)">4:5 (Portrait)</option>
                        <option value="4:3 (Standard)">4:3 (Standard)</option>
                        <option value="4:6 (Standard Photo)">4:6 (Standard Photo)</option>
                        <option value="1:1 (Square)">1:1 (Square)</option>
                        <option value="16:9 (Landscape)">16:9 (Landscape)</option>
                        <option value="16:10 (Wide)">16:10 (Wide)</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500">Face detected:</span>
                      <span className={`font-mono ${faceDetected ? 'text-secondary font-bold' : 'text-slate-400'}`}>{faceDetected ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Output:</span>
                      <span className="text-secondary font-mono font-bold">1200 × {Math.round(1200 / ratioNumeric)} px</span>
                    </div>
                    {sourceInfo && sourceInfo.w < 1200 && (
                      <div className="mt-2 text-[10px] text-amber-400 bg-amber-400/10 p-2 rounded flex items-start gap-1.5 border border-amber-400/20">
                        <span className="font-bold">⚠ Warning:</span> Source resolution is lower than 1200px output. Image quality may be reduced.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#07111e] p-5 rounded-xl border border-slate-800 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Zoom:</span>
                      <span className="text-[10px] font-mono text-secondary">{Math.round(zoom * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ZoomOut className="w-4 h-4 text-slate-500" />
                      <input 
                        type="range" 
                        min="0.1" max="5" step="0.01" 
                        value={zoom} 
                        onChange={e => setZoom(parseFloat(e.target.value))} 
                        className="w-full accent-secondary" 
                      />
                      <ZoomIn className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                  
                  <div className="flex justify-center items-center py-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      <div />
                      <button type="button" onClick={() => movePan(0, -20)} className="p-3 bg-slate-800 rounded hover:bg-slate-700 transition-colors"><ArrowUp className="w-4 h-4 text-white" /></button>
                      <div />
                      <button type="button" onClick={() => movePan(-20, 0)} className="p-3 bg-slate-800 rounded hover:bg-slate-700 transition-colors"><ArrowLeft className="w-4 h-4 text-white" /></button>
                      <button type="button" onClick={() => {setPan({x:0, y:0}); calculateFit(fitMode);}} className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-secondary flex items-center justify-center transition-colors"><CircleDot className="w-3 h-3 text-secondary" /></button>
                      <button type="button" onClick={() => movePan(20, 0)} className="p-3 bg-slate-800 rounded hover:bg-slate-700 transition-colors"><ArrowRight className="w-4 h-4 text-white" /></button>
                      <div />
                      <button type="button" onClick={() => movePan(0, 20)} className="p-3 bg-slate-800 rounded hover:bg-slate-700 transition-colors"><ArrowDown className="w-4 h-4 text-white" /></button>
                      <div />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-800 bg-[#07111e] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
               if (imageSrc) {
                 setTargetRatio(aspectRatioLabel);
                 setFitMode('SMART');
                 calculateFit('SMART', getNumericRatio(aspectRatioLabel));
               }
            }}
            className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 border border-slate-700"
            disabled={!imageSrc}
          >
            [ RESET ]
          </button>
          
          <div className="flex gap-4">
             <button
               type="button"
               onClick={() => {
                 setImageSrc(null);
                 setSourceInfo(null);
                 setOriginalFile(null);
               }}
               className="px-6 py-2.5 bg-transparent text-slate-400 hover:text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors"
               disabled={!imageSrc || isUploading}
             >
               CHANGE IMAGE
             </button>
             {imageSrc && (
               <button
                 type="button"
                 onClick={handleSaveAndUpload}
                 disabled={isUploading}
                 className="px-10 py-2.5 bg-secondary text-[#0a192f] rounded text-xs font-bold uppercase hover:bg-secondary-fixed transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
               >
                 <Check className="w-5 h-5" />
                 <span>{isUploading ? 'PROCESSING...' : '[ APPLY ]'}</span>
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
