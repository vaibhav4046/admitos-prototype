import { useState } from 'react';
import { motion } from 'motion/react';
import { COMMONS_TAGS, PostType } from '@/data/commonsData';

interface NewPostModalProps {
  onClose: () => void;
  onSubmit: (post: any) => void;
  simulateModeration: boolean;
}

export default function NewPostModal({ onClose, onSubmit, simulateModeration }: NewPostModalProps) {
  const [selectedType, setSelectedType] = useState<PostType | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'checking' | 'success'>('idle');

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleSubmit = () => {
    if (!selectedType || !title.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('checking');

    setTimeout(() => {
      setSubmitStatus('success');
      setTimeout(() => {
        onSubmit({
          id: Date.now().toString(),
          type: selectedType,
          timestamp: 'just now',
          author: selectedType === 'Anonymous' || (selectedType === 'Anonymous question' as any) 
            ? { name: 'Anonymous', avatarColor: 'bg-gray-400', initials: '?', isAnonymous: true }
            : { name: 'New Applicant', avatarColor: 'bg-blue-500', initials: 'NA' },
          title,
          body,
          tags: selectedTags,
          reactions: { helpful: 0, replies: 0 },
          isUnderReview: simulateModeration
        });
        onClose();
      }, 500);
    }, 500);
  };

  const types: { label: string; value: PostType | 'Poll'; disabled?: boolean }[] = [
    { label: 'Question', value: 'Question' },
    { label: 'Discussion', value: 'Discussion' },
    { label: 'Poll', value: 'Poll', disabled: true },
    { label: 'Anonymous question', value: 'Anonymous' }
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-[520px] rounded-2xl p-6 shadow-xl flex flex-col max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-6">
          <h2 className="text-[18px] font-medium text-gray-900">Share with Commons</h2>
          <p className="text-[12px] text-gray-500 mt-1">
            Questions, experiences, and reflections on your application journey.
          </p>
        </div>

        {/* Post Type Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {types.map((type) => (
            <button
              key={type.label}
              disabled={type.disabled}
              onClick={() => setSelectedType(type.value as PostType)}
              className={`p-2.5 rounded-lg border-[0.5px] text-left transition-colors flex flex-col justify-center ${
                selectedType === type.value
                  ? 'border-[#15803D] bg-[#EAF3DE] border-2'
                  : 'border-gray-200 hover:border-gray-300'
              } ${type.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[13px] font-medium ${selectedType === type.value ? 'text-[#27500A]' : 'text-gray-700'}`}>
                  {type.label}
                </span>
                {type.disabled && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Coming soon</span>}
              </div>
              <span className={`text-[11px] mt-1 ${selectedType === type.value ? 'text-[#27500A]/80' : 'text-gray-500'}`}>
                {type.value === 'Question' && 'Ask the community something'}
                {type.value === 'Discussion' && 'Share your experience or thoughts'}
                {type.value === 'Poll' && 'Collect opinions'}
                {type.value === 'Anonymous' && 'Ask without revealing identity'}
              </span>
            </button>
          ))}
        </div>

        {/* Content Fields */}
        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="What's your question or topic?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-[14px] border-b border-gray-200 pb-2 focus:outline-none focus:border-[#15803D] placeholder-gray-400 bg-transparent"
          />
          <div className="relative">
            <textarea
              placeholder="Add more context... (optional)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full text-[13px] border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#15803D] placeholder-gray-400 resize-none bg-transparent"
            />
            <div className="absolute bottom-3 right-3 text-[11px] text-gray-400">
              {body.length} / 500
            </div>
          </div>
        </div>

        {/* Tag Selector */}
        <div className="mb-6">
          <div className="text-[12px] text-gray-500 mb-2">Add up to 3 tags</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMONS_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              const isDisabled = !isSelected && selectedTags.length >= 3;
              return (
                <button
                  key={tag.name}
                  onClick={() => handleTagToggle(tag.name)}
                  disabled={isDisabled}
                  className={`px-3 py-1 rounded-full text-[11px] transition-colors border-[0.5px] ${
                    isSelected
                      ? 'bg-[#15803D] text-white border-[#15803D]'
                      : isDisabled
                      ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] italic text-gray-400">
            Custom tags are not allowed. Tags are curated by the AdmitOS team.
          </div>
        </div>

        {/* Anonymous Toggle */}
        {selectedType === 'Anonymous' && (
          <div className="bg-[#EEEDFE] rounded-lg p-3 mb-6">
            <label className="flex items-center gap-2 cursor-pointer mb-1">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-[#3C3489] focus:ring-[#3C3489]"
              />
              <span className="text-[13px] font-medium text-[#3C3489]">Post anonymously</span>
            </label>
            <p className="text-[11px] text-gray-600 ml-6">
              Your identity is never visible to other users or counsellors. AdmitOS knows who you are for safety purposes only.
            </p>
          </div>
        )}

        {/* Content Safety Note */}
        <div className="border-l-2 border-[#15803D] pl-3 mb-6">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            All posts are reviewed by AI before publication. Posts that violate community guidelines will not be published. This usually takes less than 1 second.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between mt-auto">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedType || !title.trim() || isSubmitting}
            className="px-4 py-2 text-[13px] font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex justify-center"
          >
            {submitStatus === 'checking' ? 'Checking content...' : submitStatus === 'success' ? 'Posted! ✓' : 'Post to Commons'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
