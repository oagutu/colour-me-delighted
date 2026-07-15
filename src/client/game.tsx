import './index.css';

import { StrictMode, MouseEvent, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useDailyImage } from './hooks/useDailyImage';
import { ClockActivityIcon, ShareIcon, UndoIcon } from './icons';
import { CommentResponse } from '../shared/api';
import { FormEffectResponse, navigateTo, showForm } from '@devvit/web/client';

const DEFAULT_PALETTE = ['#ff4d4d', '#ff9900', '#ffd500', '#6bf178', '#35b3ff', '#8a5cff', '#ff6ddb', '#4e4e4e'];
const GRID_SIZE = 32;

export const App = () => {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorSvgRef = useRef<string | null>(null);
  const dailyImageRef = useRef<HTMLImageElement | null>(null);
  const initialImageRef = useRef<ImageData | null>(null);
  const undoStackRef = useRef<ImageData[]>([]);
  const [ dailyImageReady, setDailyImageReady] = useState(false);
  const [ palette, setPalette ] = useState<string[]>(DEFAULT_PALETTE);
  const [ selectedColor, setSelectedColor ] = useState<string>();
  const [ cursorUrl, setCursorUrl ] = useState<string>('auto');
  const [ showGridLines, setShowGridLines ] = useState(true);
  const [ isErasing, setIsErasing ] = useState<boolean>(false);
  const [ isSharing, setIsSharing ] = useState<boolean>(false);
  const [ colorChangeCount, setColorChangeCount ] = useState<number>(0);
  const [ gridDisplaySize, setGridDisplaySize ] = useState<{ width: number; height: number } | null>(null);
  const [ hoverCell, setHoverCell ] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const { dailyImage } = useDailyImage();

  useEffect(() => {
    if (dailyImage && dailyImage.palette) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPalette([...dailyImage.palette]);
      setSelectedColor(dailyImage.palette[0])
    }

    if (!dailyImage?.imageUrl) return;
    const dailyImageElem: HTMLImageElement = new Image();
    dailyImageElem.crossOrigin = "anonymous";
    dailyImageElem.onload = () => {
      dailyImageRef.current = dailyImageElem;
      const canvas = canvasRef.current;
      const canvasContext = canvas?.getContext('2d');
      if (!canvas || !canvasContext) return;
      const width = dailyImageElem.naturalWidth;
      const height = dailyImageElem.naturalHeight;
      canvas.width = width;
      canvas.height = height;
      canvasContext.drawImage(dailyImageElem, 0, 0);
      // store initial image snapshot and clear undo stack
      try {
        initialImageRef.current = canvasContext.getImageData(0, 0, width, height);
      } catch {
        initialImageRef.current = null;
      }
      undoStackRef.current = [];
      setColorChangeCount(0);
      setDailyImageReady(true);
    };
    dailyImageElem.onerror = () => {
      setDailyImageReady(true);
    };
    dailyImageElem.src = dailyImage.imageUrl;

  }, [dailyImage])

  useEffect(() => {
    const buildCursorUrl = (svgText: string, color: string) => {
      let svg = svgText;
      svg = svg.replace(/fill="currentColor"/g, `fill="${color}"`);
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 16 16, auto`;
    };

    const updateCursor = (svgText: string, color: string) => {
      setCursorUrl(buildCursorUrl(svgText, color));
    };

    if (!cursorSvgRef.current) {
      fetch('/img/cursors/circle.svg')
        .then((res) => res.text())
        .then((text) => {
          cursorSvgRef.current = text;
          updateCursor(text, selectedColor ?? '#000000');
        })
        .catch(() => {
          setCursorUrl('auto');
        });
      return;
    }

    updateCursor(cursorSvgRef.current, selectedColor ?? '#000000');
  }, [selectedColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateGridSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dailyImageElem =  dailyImageRef?.current;
      setGridDisplaySize({
        width: rect.width / (canvas.width / GRID_SIZE),
        height: rect.height / (dailyImageElem?.naturalHeight ?? canvas.height/ GRID_SIZE),
      });
    };

    updateGridSize();

    const observer = new ResizeObserver(updateGridSize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [dailyImageReady]);  

  const getGridCell = (x: number, y: number) => ({
    x: Math.floor(x / GRID_SIZE) * GRID_SIZE,
    y: Math.floor(y / GRID_SIZE) * GRID_SIZE,
  });

  const getHoverCell = (x: number, y: number, rect: DOMRect) => {
    const cell = getGridCell(x, y);
    const scaleX = rect.width / canvasRef.current!.width;
    const scaleY = rect.height / canvasRef.current!.height;

    return {
      left: cell.x * scaleX,
      top: cell.y * scaleY,
      width: GRID_SIZE * scaleX,
      height: GRID_SIZE * scaleY,
    };
  };

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!selectedColor && !isErasing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) * canvas.width) / rect.width);
    const y = Math.floor(((e.clientY - rect.top) * canvas.height) / rect.height);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

    const { x: cellX, y: cellY } = getGridCell(x, y);
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) return;

    // push current state to undo stack
    try {
      const snapshot = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      undoStackRef.current.push(snapshot);
      // limit stack
      if (undoStackRef.current.length > 100) undoStackRef.current.shift();
    } catch (err) {
      // getImageData may fail for cross-origin; ignore if so
    }

    canvasContext.fillStyle = isErasing ? '#ffffff' : (selectedColor ?? '#ffffff');
    canvasContext.fillRect(cellX, cellY, GRID_SIZE, GRID_SIZE);
    setColorChangeCount((prev) => prev + (isErasing ? -1 : 1));
  };

  const handleGetShareComment = async () => {
    setIsSharing(true);
    const result: FormEffectResponse<{comment?: string;} & {[key: string]: string;}> = await showForm({
        fields: [
          {
            type: 'paragraph',
            name: 'comment',
            label: 'Comment to be Posted with your art!',
          },
        ],
      },
    );
    const comment = result && 'values' in result ? result?.values?.comment : null;
    await share(comment)
  }

  const share = async (commentText?: string | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const response = await fetch('/api/share', {
      method: 'POST',
      body: JSON.stringify({ image: dataUrl, commentText: commentText }),
    });
    const resObj = await response.json() as CommentResponse;
    if (resObj?.url) {
      navigateTo(resObj.url);
    }
    setIsSharing(false);
  };

  const onCanvasHover = (e: MouseEvent<HTMLCanvasElement>) => {

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) * canvas.width) / rect.width);
    const y = Math.floor(((e.clientY - rect.top) * canvas.height) / rect.height);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
      setHoverCell(null);
      return;
    }

    setHoverCell(getHoverCell(x, y, rect));
  };

  const onCanvasLeave = () => {
    setHoverCell(null);
  }

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const stack = undoStackRef.current;
    if (!stack.length) return;
    const prev = stack.pop()!; // last saved state
    try {
      ctx.putImageData(prev, 0, 0);
      setColorChangeCount((prevCount) => Math.max(0, prevCount - 1));
    } catch {
      console.error(`undo:e01:Failed to undo - {e}`);
    }
  };

  const resetToInitial = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const init = initialImageRef.current;
    if (!init) return;
    try {
      ctx.putImageData(init, 0, 0);
      undoStackRef.current = [];
      setColorChangeCount(0);
    } catch (e) {
      console.error(`resetToInitial:e01:Failed to reset to intial state - {e}`);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen p-1 sm:p-3 bg-[url(/img/splash/boy-employee-landscape-8660661_1920.webp)]">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 h-full max-h-[99vh] sm:max-h-[96vh]">
        <div className="relative h-full min-h-[63vh] col-span-2 flex flex-col justify-center space-y-3 rounded-xl bg-white dark:bg-gray-900">
          <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick} 
            onMouseMove={onCanvasHover} 
            onMouseLeave={onCanvasLeave} 
            className="block w-full h-auto"
            style={{ cursor: cursorUrl }}
          />
          {showGridLines && gridDisplaySize && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.14) 1px, transparent 1px)',
                backgroundSize: `${gridDisplaySize.width}px ${gridDisplaySize.height}px`,
              }}
            />
          )}
          {hoverCell && (
            <div
              className="pointer-events-none absolute border border-black/30 bg-black/10 dark:border-white/30 dark:bg-white/10"
              style={{
                left: hoverCell.left,
                top: hoverCell.top,
                width: hoverCell.width,
                height: hoverCell.height,
              }}
            />
          )}
          {!dailyImageReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/40">
              <span className="text-gray-800 dark:text-gray-100">Loading image...</span>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between space-between h-full col-span-2 sm:col-span-1 rounded-xl px-3 py-5 bg-white dark:bg-gray-900">
          <div className="flex items-center">
            <button 
              id="toggle-switch" 
              type="button" 
              role="switch" 
              aria-checked={showGridLines} 
              onClick={() => setShowGridLines((prev) => !prev)}
              className="group flex items-center w-12 h-6 p-1 mr-3 rounded-full bg-slate-400 transition-colors duration-200 ease-in-out overflow-hidden outline-none focus-visible:ring focus-visible:ring-purple-400 aria-checked:bg-blue-theme"
            >
              <span className="w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out group-aria-checked:translate-x-full"></span>
            </button>
            <label id="toggle-switch-label" htmlFor="toggle-switch" className="text-xs dark:text-slate-400">
              {showGridLines ? 'Hide Grid' : 'Show Grid'}
            </label>
          </div>
          <div className="flex flex-wrap mt-2 gap-3 sm:gap-2">
            <button
              key="erase"
              type="button"
              title="Erase"
              onClick={() => setIsErasing((prev) => !prev)}
              className={`h-5 w-5 sm:h-7 sm:w-7 rounded-xl transition ${isErasing ? 'outline-1 outline-offset-1 outline-black dark:outline-white' : 'border-2 border-transparent'}`}
              style={{ backgroundColor: '#ffffff', cursor: cursorUrl }}
              aria-label="Erase"
            >
              <img src="/img/cursors/eraser.svg" alt="eraser icon" className="h-full w-full object-contain" />
            </button>
            {palette.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => { setSelectedColor(color); setIsErasing(false); }}
                className={`h-5 w-5 sm:h-7 sm:w-7 rounded-xl transition ${selectedColor === color && !isErasing ? 'outline-1 outline-offset-1 outline-black dark:outline-white' : 'border-2 border-transparent'}`}
                style={{ backgroundColor: color, cursor: cursorUrl }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-6 gap-3 mt-3">
            <div className="col-span-2 sm:col-span-3 text-black dark:text-slate-400">
              <button onClick={undo} className="flex items-center justify-center py-1 gap-3 w-full hover:cursor-pointer rounded-xl border-2 border-solid border-orange-300">
                <UndoIcon />
                <div className="text-xs">UNDO</div>
              </button>
            </div>
            <div className="col-span-2 sm:col-span-3 text-black dark:text-slate-400">
              <button onClick={resetToInitial} className="flex items-center justify-center py-1 gap-3 w-full hover:cursor-pointer rounded-xl border-2 border-solid border-red-500">
                <ClockActivityIcon />
                <div className="text-xs ">RESET</div>
              </button>
            </div>
            <div className="col-span-2 sm:col-span-6 text-black dark:text-slate-400">
              <button 
                onClick={handleGetShareComment}
                disabled={isSharing || colorChangeCount < 5}
                title={colorChangeCount < 5 ? 'Make at least 5 color changes before sharing' : undefined}
                className="flex items-center justify-center py-1 gap-3 w-full rounded-xl border-2 border-solid border-green-500 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSharing ? (
                  <img src="/img/bars.svg" alt="Loading" className="h-4 w-4 my-1 dark:text-white" />
                ) : (
                  <>
                    <ShareIcon />
                    <div className="text-xs">SHARE</div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
