import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Sparkles, ShieldAlert } from 'lucide-react';
import { COMMONS_TAGS, MOCK_POSTS, CommonsPost } from '@/data/commonsData';
import NewPostModal from '@/components/commons/NewPostModal';

export default function Commons() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommonsPost[]>(MOCK_POSTS);
  const [activeTab, setActiveTab] = useState<'Latest' | 'Trending' | 'My Tags'>('Latest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [simulateModeration, setSimulateModeration] = useState(false);
  const [under18Mode, setUnder18Mode] = useState(false);

  const handleNewPost = (newPost: CommonsPost) => {
    setPosts([newPost, ...posts]);
  };

  const filteredPosts = posts.filter(post => {
    if (selectedTag) {
      return post.tags.includes(selectedTag);
    }
    if (activeTab === 'My Tags') {
      return post.tags.includes('#焦虑') || post.tags.includes('#Oxford');
    }
    return true;
  }).sort((a, b) => {
    if (activeTab === 'Trending') {
      return b.reactions.helpful - a.reactions.helpful;
    }
    return 0; // Keep original order for Latest
  });

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

  const openAdieChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('open-adie-chat'));
  };

  return (
    <div className="flex w-full min-h-screen bg-transparent">
      {/* Left Sidebar */}
      <div className="w-[240px] shrink-0 border-r border-calm-border bg-calm-surface p-6 sticky top-0 h-screen overflow-y-auto hidden md:block">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#15803D] flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <div>
            <h1 className="text-[16px] font-medium text-[#15803D]">Commons</h1>
            <p className="text-[11px] text-calm-text-muted">Application knowledge, shared</p>
          </div>
        </div>
        <div className="border-b border-calm-border mb-6 pb-4"></div>

        {/* New Post Button */}
        <button
          onClick={() => setIsNewPostModalOpen(true)}
          className="w-full bg-[#15803D] text-white text-[13px] font-medium py-2 rounded-lg hover:bg-[#166534] transition-colors mb-6"
        >
          + New post
        </button>

        {/* Tabs */}
        <div className="flex flex-col gap-2 mb-8">
          {(['Latest', 'Trending', 'My Tags'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedTag(null); }}
              className={`text-left px-3 py-2 rounded-full text-[13px] transition-colors border-[0.5px] ${
                activeTab === tab && !selectedTag
                  ? 'bg-[#15803D] text-white border-[#15803D]'
                  : 'bg-calm-surface text-[#15803D] border-[#97C459] hover:bg-[#EAF3DE]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tag Filter */}
        <div className="mb-8">
          <h3 className="text-[11px] uppercase text-calm-text-muted tracking-wider font-semibold mb-3">Filter by tag</h3>
          <div className="flex flex-wrap gap-2">
            {COMMONS_TAGS.map(tag => (
              <button
                key={tag.name}
                onClick={() => {
                  setSelectedTag(selectedTag === tag.name ? null : tag.name);
                  setActiveTab('Latest'); // Reset tab when tag selected
                }}
                className={`px-2 py-1 rounded-full text-[11px] transition-colors border-[0.5px] ${
                  selectedTag === tag.name
                    ? 'bg-[#15803D] text-white border-[#15803D]'
                    : 'bg-[#EAF3DE] text-[#27500A] border-[#97C459] hover:bg-[#dcf0c7]'
                }`}
              >
                {tag.name} <span className="opacity-60 ml-1">{tag.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Counsellor Promo */}
        <div className="border-l-[3px] border-[#15803D] pl-3 py-1 mt-auto">
          <h4 className="text-[12px] font-bold text-[#27500A] mb-1">Verified Counsellor Q&A</h4>
          <p className="text-[11px] text-calm-text-muted leading-relaxed mb-2">
            Top counsellors answer your questions weekly
          </p>
          <button className="text-[12px] text-[#15803D] hover:underline font-medium">
            See this week's insights →
          </button>
        </div>
      </div>

      {/* Main Feed */}
      <div className="flex-1 max-w-3xl mx-auto p-6 lg:p-8">
        {/* Demos Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-[12px] text-calm-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={simulateModeration}
                onChange={(e) => setSimulateModeration(e.target.checked)}
                className="rounded text-[#15803D] focus:ring-[#15803D]"
              />
              Demo: simulate moderation
            </label>
          </div>
          <button
            onClick={() => setUnder18Mode(!under18Mode)}
            className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
              under18Mode ? 'bg-green-100 text-green-800 border-green-300' : 'bg-calm-surface text-calm-text-muted border-calm-border hover:bg-calm-surface-2'
            }`}
          >
            {under18Mode ? 'Protected Mode Active' : 'Switch to under-18 mode'}
          </button>
        </div>

        {under18Mode && (
          <div className="space-y-3 mb-6">
            <div className="bg-[#EAF3DE] border border-[#97C459] rounded-lg p-3 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#27500A] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#27500A] leading-relaxed">
                You're in protected mode. Private messaging and Study Buddy matching are not available for users under 18. Content moderation thresholds are enhanced.
              </p>
            </div>
            <button
              onClick={openAdieChat}
              className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg p-3 flex items-center justify-between hover:bg-[#EDE9FE] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[13px] font-medium text-[#7C3AED]">
                  Feeling anxious? Adie AI Assistant is here to help →
                </span>
              </div>
            </button>
          </div>
        )}

        <div className="space-y-4">
          {filteredPosts.map(post => {
            const needsAdie = post.tags.includes('#焦虑') || post.tags.includes('#anxiety') || (post.type === 'Anonymous' && post.tags.includes('#焦虑'));
            
            return (
              <div
                key={post.id}
                onClick={() => navigate(`/dashboard/commons/${post.id}`)}
                className={`bg-calm-surface border-[0.5px] border-calm-border rounded-xl p-4 cursor-pointer hover:border-[#97C459] transition-colors ${
                  post.isUnderReview ? 'opacity-60' : ''
                }`}
              >
                {post.isUnderReview && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-[11px] px-3 py-2 rounded-lg mb-3 flex flex-col gap-1">
                    <span className="font-medium">Under review — AI content check in progress. This usually takes under 2 hours.</span>
                    <span className="text-[10px] text-yellow-700/70 italic">
                      DEV NOTE: In production: Claude Moderation API checks content synchronously before write. approve &gt; 0.95 confidence → 201 immediate. 0.50-0.95 → 202 under review. &lt;0.50 or explicit violation → 422 rejected.
                    </span>
                  </div>
                )}

                {/* Top Row */}
                <div className="flex justify-between items-center mb-3">
                  {getPostTypeBadge(post.type)}
                  <span className="text-[11px] text-calm-text-muted">{post.timestamp}</span>
                </div>

                {/* Author Row */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-7 h-7 rounded-full ${post.author.avatarColor} flex items-center justify-center text-white text-[10px] font-medium`}>
                    {post.author.initials}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-calm-text">{post.author.name}</span>
                    {post.author.isVerifiedCounsellor && (
                      <span className="bg-[#EAF3DE] text-[#27500A] text-[10px] px-1.5 py-0.5 rounded font-medium">
                        Verified Counsellor
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="mb-3">
                  {post.type === 'Anonymous' && (
                    <div className="text-[11px] text-[#3C3489] font-medium mb-1 flex items-center gap-1">
                      🔒 Anonymous question
                    </div>
                  )}
                  <h3 className="text-[14px] font-medium text-calm-text mb-1 line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-[13px] text-calm-text-muted line-clamp-3 leading-relaxed">
                    {post.body}
                  </p>
                </div>

                {/* Tags Row */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="bg-[#EAF3DE] text-[#27500A] border-[0.5px] border-[#97C459] text-[10px] px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Adie Integration Chip */}
                {needsAdie && (
                  <div className="mb-4">
                    <button
                      onClick={openAdieChat}
                      className="inline-flex items-center gap-1.5 bg-[#F5F3FF] text-[#7C3AED] px-3 py-1.5 rounded-full text-[11px] font-medium hover:bg-[#EDE9FE] transition-colors border-[0.5px] border-[#DDD6FE]"
                    >
                      <Sparkles className="w-3 h-3" />
                      Feeling this way? Adie AI Assistant is here to chat →
                    </button>
                  </div>
                )}

                {/* Footer Row */}
                <div className="flex justify-between items-center pt-3 border-t border-calm-border">
                  <div className="flex items-center gap-4 text-[11px] text-calm-text-muted">
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.reactions.helpful} helpful</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.reactions.replies} replies</span>
                    </div>
                  </div>
                  <button className="text-[11px] font-medium text-[#15803D] border-[0.5px] border-[#15803D] px-3 py-1 rounded-full hover:bg-[#EAF3DE] transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isNewPostModalOpen && (
        <NewPostModal
          onClose={() => setIsNewPostModalOpen(false)}
          onSubmit={handleNewPost}
          simulateModeration={simulateModeration}
        />
      )}
    </div>
  );
}
