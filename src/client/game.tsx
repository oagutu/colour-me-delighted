import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useDailyImage } from './hooks/useDailyImage';
import { ClockActivityIcon, ShareIcon, UndoIcon } from './icons';

const DEFAULT_PALETTE = ['#ff4d4d', '#ff9900', '#ffd500', '#6bf178', '#35b3ff', '#8a5cff', '#ff6ddb', '#4e4e4e'];

export const App = () => {

  const [ palette, setPalette ] = useState<string[]>(DEFAULT_PALETTE);
  const [ selectedColor, setSelectedColor ] = useState<string>();
  const [ gridVisible, setGridVisible ] = useState(true);
  const { dailyImage } = useDailyImage();

  useEffect(() => {
    if (dailyImage && dailyImage.palette) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPalette([...dailyImage.palette]);
    }
  }, [dailyImage])

  return (
    <div className="min-h-screen p-1 sm:p-3 bg-[url(/img/splash/boy-employee-landscape-8660661_1920.webp)]">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 h-full max-h-[99vh] sm:max-h-[96vh]">
        <div className="h-full min-h-[63vh] col-span-2 flex flex-col justify-center space-y-3 rounded-xl bg-white dark:bg-gray-900">
          <canvas className='rounded-xl'>

          </canvas>
        </div>
        <div className="flex flex-col justify-between space-between h-full col-span-2 sm:col-span-1 rounded-xl px-3 py-5 bg-white dark:bg-gray-900">
          <div className="flex content-center">
            <button 
              id="toggle-switch" 
              type="button" 
              role="switch" 
              aria-checked={gridVisible} 
              onClick={() => setGridVisible((current) => !current)}
              className="group flex items-center w-14 h-8 p-1 mr-3  rounded-full bg-slate-400 transition-colors duration-200 ease-in-out overflow-hidden outline-none focus-visible:ring focus-visible:ring-purple-400 aria-checked:bg-blue-theme"
            >
              <span className="w-6 h-6 rounded-full bg-white transition-transform duration-200 ease-in-out group-aria-checked:translate-x-full"></span>
            </button>
            <label id="toggle-switch-label" htmlFor="toggle-switch" className="dark:text-slate-400">
              {gridVisible ? 'Hide Grid' : 'Show Grid'}
            </label>
          </div>
          <div className="flex flex-wrap mt-6 gap-3 sm:gap-2">
            {palette.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`h-7 w-7 rounded-xl transition ${selectedColor === color ? 'outline-1 outline-offset-1 outline-black dark:outline-white' : 'border-2 border-transparent'}`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-6 gap-3 mt-3">
            <div className="col-span-2 sm:col-span-3 text-blue-theme dark:text-slate-400">
              <button className="flex items-center justify-center gap-3 w-full rounded-xl border-2 border-solid border-orange-300">
                <UndoIcon />
                <div className="text-xs">UNDO</div>
              </button>
            </div>
            <div className="col-span-2 sm:col-span-3 text-blue-theme dark:text-slate-400">
              <button className="flex items-center justify-center gap-3 w-full rounded-xl border-2 border-solid border-red-500">
                <ClockActivityIcon />
                <div className="textx-xs ">RESET</div>
              </button>
            </div>
            <div className="col-span-2 sm:col-span-6 text-blue-theme dark:text-slate-400">
              <button className="flex items-center justify-center gap-3 w-full rounded-xl border-2 border-solid border-green-500">
                <ShareIcon />
                <div className="text-xs ">SHARE</div>
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
