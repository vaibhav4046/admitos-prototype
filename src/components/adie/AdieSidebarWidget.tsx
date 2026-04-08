import { useState } from 'react';
import { AlertTriangle, Heart } from 'lucide-react';
import AdieCrisisScreen from './AdieCrisisScreen';

export default function AdieSidebarWidget() {
  const [showCrisis, setShowCrisis] = useState(false);

  return (
    <>
      <div className="mx-1 p-3 rounded-xl bg-calm-surface-2/50 border border-calm-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="text-[11px] font-medium text-calm-text">Weekly Pace</span>
          </div>
          <div className="flex items-center gap-1 bg-calm-success/10 px-1.5 py-0.5 rounded text-calm-success">
            <div className="w-1.5 h-1.5 rounded-full bg-calm-success"></div>
            <span className="text-[10px] font-medium">On Track</span>
          </div>
        </div>

        <p className="text-[11px] text-calm-text-muted leading-relaxed italic mb-2.5">
          "You're maintaining a great rhythm. Keep going."
        </p>
        
        <div className="flex items-center justify-between pt-2.5 border-t border-calm-border/50">
          <div className="flex items-center gap-1.5" title="4 focus days this week">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-1 h-2.5 rounded-full bg-[#7C3AED] opacity-80"></div>
              ))}
              {[5, 6, 7].map(i => (
                <div key={i} className="w-1 h-2.5 rounded-full bg-calm-border"></div>
              ))}
            </div>
            <span className="text-[10px] text-calm-text-muted ml-0.5">4 days</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-adie-chat'))}
              className="text-[10px] font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
            >
              Chat
            </button>
            <button
              onClick={() => setShowCrisis(true)}
              className="text-[10px] text-calm-text-muted hover:text-red-500 transition-colors flex items-center"
              title="Demo Crisis Screen"
            >
              <AlertTriangle className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {showCrisis && <AdieCrisisScreen onClose={() => setShowCrisis(false)} />}
    </>
  );
}
