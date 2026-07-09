import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';


export const Splash = () => {
  return (
    <div className="min-h-screen px-7 py-3 bg-[url(/img/splash/boy-employee-landscape-8660661_1920.webp)]">
      <div className="flex justify-between mb-2">
        <div className="flex">
          <img 
            className="rounded-full w-12 h-12 mr-2 object-cover border-2 border-white shadow-lg dark:border-gray-700"
            id="avatar"
            src={ context.snoovatar ?? "/img/snoo.png" }
            alt="Snoo"
          />
          <div className="flex flex-col justify-center text-white">
            <div> {context.username ?? 'Guest'} </div>
            <div> <span className="text-[#FFDD66]">--</span> Points </div>
          </div>

        </div>
        <div>
          <button className="flex hover:cursor-pointer">
            <img className="w-10 h-10 m-auto" src="/img/trophy.svg"/>
          </button>
        </div>
      </div>
      <div className="min-w-full min-h-[82vh] max-h-[82vh] rounded-xl mt-5 bg-white p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 h-full max-h-[75vh]">
          <div className="col-span-2 flex flex-col justify-center space-y-6">
            <div>
              <h1 className="text-5xl font-mono font-semibold text-slate-900">COLOUR<br/>RELAX<br/>UPVOTE<br/>REPEAT.<br/></h1>
            </div>
            <button 
              className="w-max px-6 py-3 bg-blue-theme text-white rounded-xl shadow hover:text-gray-300 hover:cursor-pointer transition"
              onClick={e => {requestExpandedMode(e.nativeEvent, "game")}}
            >
              GET COLOURING
            </button>
          </div>
          <div className="relative overflow-hidden">
            <div className="h-full overflow-hidden">
              <div className="space-y-4 animate-vertical-carousel">
                <img src="/img/splash/pikura-pixel-7272046_640.webp" alt="" className="w-[80%] rounded-3xl shadow-xl/20 border w border-white shadow-lg object-cover" />
                <img src="/img/splash/lesiakower-sea-7306671_640.webp" alt="" className="w-[80%] rounded-3xl shadow-xl/20 border border-white shadow-lg object-cover" />
                <img src="/img/splash/pikura-tv-8760955_640.webp" alt="" className="w-[80%] rounded-3xl shadow-xl/20 border border-white shadow-lg object-cover" />
                <img src="/img/splash/edenmoon-minecraft-5974404_640.webp" alt="" className="w-[80%] shadow-xl/20 rounded-3xl border border-white shadow-lg object-cover" />
                {/* Duplicates */}
                <img src="/img/splash/pikura-pixel-7272046_640.webp" alt="" className="w-[80%] shadow-xl/20 rounded-3xl border w border-white shadow-lg object-cover" />
                <img src="/img/splash/lesiakower-sea-7306671_640.webp" alt="" className="w-[80%] shadow-xl/20 rounded-3xl border border-white shadow-lg object-cover" />
                <img src="/img/splash/pikura-tv-8760955_640.webp" alt="" className="w-[80%] shadow-xl/20 rounded-3xl border border-white shadow-lg object-cover" />
                <img src="/img/splash/edenmoon-minecraft-5974404_640.webp" alt="" className="w-[80%] shadow-xl/20 rounded-3xl border border-white shadow-lg object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
