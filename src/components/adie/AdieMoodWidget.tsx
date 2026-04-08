import { useState } from 'react';

const MOODS = [
  { value: 1, color: 'bg-gray-600', emoji: '😞' },
  { value: 2, color: 'bg-gray-400', emoji: '🙁' },
  { value: 3, color: 'bg-gray-200', emoji: '😐' },
  { value: 4, color: 'bg-[#C4B5FD]', emoji: '🙂' },
  { value: 5, color: 'bg-[#7C3AED]', emoji: '😄' },
];

interface AdieMoodWidgetProps {
  inChat?: boolean;
}

export default function AdieMoodWidget({ inChat = false }: AdieMoodWidgetProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  return (
    <div className={`bg-white border-l-[3px] border-l-[#7C3AED] rounded-lg shadow-sm ${inChat ? 'p-3' : 'p-4 border border-gray-200'}`}>
      <h3 className="text-[13px] font-medium text-gray-800 mb-3">How are you feeling today?</h3>
      
      <div className="flex items-center justify-between mb-2">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood.value)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              selectedMood === mood.value
                ? 'ring-2 ring-[#7C3AED] ring-offset-2'
                : 'hover:scale-110'
            } ${mood.color}`}
            title={`Mood level ${mood.value}`}
          >
            <span className="text-sm">{mood.emoji}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between h-4 mt-2">
        {selectedMood ? (
          <span className="text-[11px] text-green-600 font-medium">Logged ✓</span>
        ) : (
          <span />
        )}
        <span className="text-[10px] text-gray-400 italic">
          Your mood data is private — only you can see it
        </span>
      </div>
    </div>
  );
}
