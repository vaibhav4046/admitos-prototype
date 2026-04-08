import { CalendarHeart } from 'lucide-react';

const MOOD_DATA = [
  { day: 'Mon', score: 3 },
  { day: 'Tue', score: 3 },
  { day: 'Wed', score: 4 },
  { day: 'Thu', score: 2 },
  { day: 'Fri', score: 3 },
  { day: 'Sat', score: 4 },
  { day: 'Sun', score: 4 },
];

const getMoodColor = (score: number) => {
  switch (score) {
    case 1: return 'bg-gray-600';
    case 2: return 'bg-gray-400';
    case 3: return 'bg-gray-300';
    case 4: return 'bg-[#C4B5FD]';
    case 5: return 'bg-[#7C3AED]';
    default: return 'bg-gray-200';
  }
};

const getMoodSize = (score: number) => {
  switch (score) {
    case 1: return 'w-1.5 h-1.5';
    case 2: return 'w-2 h-2';
    case 3: return 'w-2.5 h-2.5';
    case 4: return 'w-3 h-3';
    case 5: return 'w-3.5 h-3.5';
    default: return 'w-2 h-2';
  }
};

export default function AdieWeeklyReview() {
  return (
    <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CalendarHeart className="w-5 h-5 text-[#7C3AED]" />
          <h3 className="text-[14px] font-bold text-calm-text">Your weekly check-in</h3>
        </div>
        <span className="text-[12px] text-calm-text-muted">Week of March 24</span>
      </div>

      {/* Workload Intensity */}
      <div className="mb-5">
        <div className="text-[12px] text-calm-text-muted mb-1.5">Workload intensity</div>
        <div className="h-2 w-full bg-calm-surface-2 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: '70%' }} />
        </div>
        <div className="text-[11px] text-calm-text-muted italic">Quite intensive — you put in a lot this week</div>
      </div>

      {/* Mood Trend */}
      <div className="mb-5">
        <div className="flex justify-between items-end h-8 mb-1 px-2">
          {MOOD_DATA.map((data, i) => (
            <div key={i} className="flex flex-col items-center justify-end h-full">
              <div className={`rounded-full ${getMoodColor(data.score)} ${getMoodSize(data.score)}`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between px-2">
          {MOOD_DATA.map((data, i) => (
            <span key={i} className="text-[9px] text-gray-400 w-6 text-center">{data.day}</span>
          ))}
        </div>
      </div>

      {/* Adie AI Assistant's Message */}
      <div className="bg-calm-surface-2 rounded-lg p-3 mb-4">
        <p className="text-[13px] text-calm-text leading-[1.6]">
          You stayed focused through a tough week. Your Oxford draft is taking shape — that's real progress. This weekend, try to step away from your screen for at least a few hours. You deserve it.
        </p>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-calm-border">
        <div className="text-[11px] text-calm-text-muted mb-1">3 key deadlines next week</div>
        <div className="text-[13px] text-calm-text font-medium">Oxford UCAS — Nov 15 <span className="text-calm-text-muted font-normal">(most urgent)</span></div>
      </div>
    </div>
  );
}
