import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, MessageSquare, Sparkles } from 'lucide-react';
import { MOCK_POSTS, CommonsPost } from '@/data/commonsData';

export default function CommonsPostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState('');
  const [postAnonymously, setPostAnonymously] = useState(true);

  // Find the post or default to post 4 for the demo
  const post = MOCK_POSTS.find(p => p.id === postId) || MOCK_POSTS[3];

  const getPostTypeBadge = (type: string) => {
    switch (type) {
      case 'Question':
        return <span className="bg-[#E6F1FB] text-[#0C447C] text-[10px] px-2 py-0.5 rounded-full font-medium">Question</span>;
      case 'Discussion':
        return <span className="bg-[#F1EFE8] text-[#5F5E5A] text-[10px] px-2 py-0.5 rounded-full font-medium">Discussion</span>;
      case 'Anonymous':
        return <span className="bg-[#EEEDFE] text-[#3C3489] text-[10px] px-2 py-0.5 rounded-full font-medium">Anonymous</span>;
      case 'Counsellor Insight':
        return <span className="bg-[#EAF3DE] text-[#27500A] text-[10px] px-2 py-0.5 rounded-full font-medium">Counsellor Insight</span>;
      default:
        return null;
    }
  };

  const openAdieChat = () => {
    window.dispatchEvent(new CustomEvent('open-adie-chat'));
  };

  const needsAdie = post.tags.includes('#焦虑') || post.tags.includes('#anxiety') || (post.type === 'Anonymous' && post.tags.includes('#焦虑'));

  return (
    <div className="min-h-screen bg-transparent py-8 px-4">
      <div className="max-w-[720px] mx-auto">
        {/* Back Link */}
        <button
          onClick={() => navigate('/dashboard/commons')}
          className="flex items-center gap-2 text-[#15803D] text-[13px] font-medium hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Commons
        </button>

        {/* Post Header / Content */}
        <div className="bg-calm-surface border-[0.5px] border-calm-border rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            {getPostTypeBadge(post.type)}
            <span className="text-[11px] text-calm-text-muted">{post.timestamp}</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full ${post.author.avatarColor} flex items-center justify-center text-white text-[11px] font-medium`}>
              {post.author.initials}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-calm-text">{post.author.name}</span>
              {post.author.isVerifiedCounsellor && (
                <span className="bg-[#EAF3DE] text-[#27500A] text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Verified Counsellor
                </span>
              )}
            </div>
          </div>

          {post.type === 'Anonymous' && (
            <div className="text-[12px] text-[#3C3489] font-medium mb-2 flex items-center gap-1.5">
              🔒 Anonymous question
            </div>
          )}

          <h1 className="text-[18px] font-medium text-calm-text mb-3 leading-snug">
            {post.title}
          </h1>
          
          <p className="text-[14px] text-calm-text-muted leading-relaxed whitespace-pre-wrap mb-6">
            {post.body}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map(tag => (
              <span key={tag} className="bg-[#EAF3DE] text-[#27500A] border-[0.5px] border-[#97C459] text-[11px] px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {needsAdie && (
            <div className="mb-6">
              <button
                onClick={openAdieChat}
                className="inline-flex items-center gap-1.5 bg-[#F5F3FF] text-[#7C3AED] px-3 py-1.5 rounded-full text-[12px] font-medium hover:bg-[#EDE9FE] transition-colors border-[0.5px] border-[#DDD6FE]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Feeling this way? Adie AI Assistant is here to chat →
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-calm-border">
            <div className="flex items-center gap-6 text-[12px] text-calm-text-muted">
              <button className="flex items-center gap-1.5 hover:text-[#15803D] transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span>{post.reactions.helpful} helpful</span>
              </button>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>{post.reactions.replies} replies</span>
              </div>
            </div>
            <button className="text-[10px] text-calm-text-muted hover:text-calm-text transition-colors">
              Report
            </button>
          </div>
        </div>

        {/* Replies Section */}
        <div className="mb-8">
          <h2 className="text-[14px] font-medium text-calm-text mb-4">{post.reactions.replies} replies</h2>
          
          <div className="space-y-4">
            {/* Sample Reply 2 (Pinned) */}
            <div className="ml-5 bg-calm-surface border-[0.5px] border-calm-border border-l-[2px] border-l-[#15803D] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-calm-text">Verified Counsellor</span>
                  <span className="bg-[#EAF3DE] text-[#27500A] text-[10px] px-1.5 py-0.5 rounded font-medium">
                    Verified Counsellor
                  </span>
                </div>
                <span className="text-[11px] text-calm-text-muted">5h ago</span>
              </div>
              <p className="text-[13px] text-calm-text-muted leading-relaxed mb-3">
                "I want to reassure you: the 'everyone has it figured out' feeling is one of the most common things I hear from students. Most of your peers feel exactly the same — they're just not posting about it. The clarity usually comes through writing, not before it."
              </p>
              <button className="flex items-center gap-1.5 text-[11px] text-calm-text-muted hover:text-[#15803D] transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>12 helpful</span>
              </button>
            </div>

            {/* Sample Reply 1 */}
            <div className="ml-5 bg-calm-surface border-[0.5px] border-calm-border border-l-[2px] border-l-[#15803D] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium text-calm-text">Teal Applicant</span>
                <span className="text-[11px] text-calm-text-muted">4h ago</span>
              </div>
              <p className="text-[13px] text-calm-text-muted leading-relaxed mb-3">
                "Yes, completely normal. I felt this exact way until about two months ago. What helped me was focusing on one genuine interest rather than trying to build a 'narrative' around what I thought universities wanted. Your authentic self IS the narrative."
              </p>
              <button className="flex items-center gap-1.5 text-[11px] text-calm-text-muted hover:text-[#15803D] transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>8 helpful</span>
              </button>
            </div>

            {/* Sample Reply 3 (AI) */}
            <div className="ml-5 bg-calm-surface border-[0.5px] border-calm-border border-l-[2px] border-l-[#15803D] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-calm-text">Commons AI</span>
                  <span className="bg-calm-surface-2 text-calm-text-muted text-[10px] px-1.5 py-0.5 rounded font-medium">
                    AI Reference (Claude)
                  </span>
                </div>
                <span className="text-[11px] text-calm-text-muted">2h ago</span>
              </div>
              <p className="text-[13px] text-calm-text-muted leading-relaxed mb-3">
                "Based on similar discussions in Commons, the feeling of being 'behind' peaks in October-November for most applicants. Research suggests that late-developers often produce more authentic applications because they haven't over-engineered their narrative. [AI Reference — not personalised advice]"
              </p>
              <button className="flex items-center gap-1.5 text-[11px] text-calm-text-muted hover:text-[#15803D] transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>3 helpful</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reply Input Box */}
        <div className="bg-calm-surface border-[0.5px] border-calm-border rounded-2xl p-4">
          <div className="relative mb-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Share your experience or perspective..."
              rows={3}
              maxLength={500}
              className="w-full text-[13px] text-calm-text border border-calm-border rounded-lg p-3 focus:outline-none focus:border-[#15803D] placeholder-calm-text-muted resize-none bg-transparent"
            />
            <div className="absolute top-3 right-3 text-[11px] text-calm-text-muted">
              {replyText.length} / 500
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={postAnonymously}
                onChange={(e) => setPostAnonymously(e.target.checked)}
                className="rounded text-[#15803D] focus:ring-[#15803D]"
              />
              <span className="text-[12px] text-calm-text-muted">Post anonymously</span>
            </label>
            
            <button
              disabled={!replyText.trim()}
              className="px-4 py-1.5 bg-[#15803D] text-white text-[12px] font-medium rounded-lg hover:bg-[#166534] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
