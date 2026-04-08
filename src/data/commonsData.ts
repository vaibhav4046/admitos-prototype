export type PostType = 'Question' | 'Discussion' | 'Anonymous' | 'Counsellor Insight';

export interface CommonsPost {
  id: string;
  type: PostType;
  timestamp: string;
  author: {
    name: string;
    avatarColor: string;
    initials: string;
    isVerifiedCounsellor?: boolean;
    isAnonymous?: boolean;
  };
  title: string;
  body: string;
  tags: string[];
  reactions: {
    helpful: number;
    replies: number;
  };
  isUnderReview?: boolean;
}

export const COMMONS_TAGS = [
  { name: '#Oxford', count: 34 },
  { name: '#Cambridge', count: 28 },
  { name: '#文书', count: 45 },
  { name: '#MAT', count: 19 },
  { name: '#Common-App', count: 38 },
  { name: '#Ivy', count: 52 },
  { name: '#UCAS', count: 31 },
  { name: '#面试', count: 27 },
  { name: '#焦虑', count: 41 },
  { name: '#研究', count: 22 },
  { name: '#择校', count: 35 },
  { name: '#成绩', count: 29 },
];

export const MOCK_POSTS: CommonsPost[] = [
  {
    id: '1',
    type: 'Question',
    timestamp: '2h ago',
    author: { name: 'Indigo Applicant', avatarColor: 'bg-purple-500', initials: 'IA' },
    title: 'Has anyone done the MAT this year? How was Section B?',
    body: "I'm sitting it in two weeks and I'm really struggling with the integration questions in Section B. The past paper from 2022 was especially rough — is the difficulty similar this year?",
    tags: ['#MAT', '#Oxford'],
    reactions: { helpful: 8, replies: 3 }
  },
  {
    id: '2',
    type: 'Discussion',
    timestamp: '4h ago',
    author: { name: 'Teal Applicant', avatarColor: 'bg-teal-500', initials: 'TA' },
    title: 'Common App activities section — how are people ordering their 10 slots?',
    body: "I've been going back and forth on whether to put my research experience first or my leadership role. My counsellor said it depends on the school but I'm applying to 12 schools with very different profiles...",
    tags: ['#Common-App', '#择校'],
    reactions: { helpful: 14, replies: 7 }
  },
  {
    id: '3',
    type: 'Counsellor Insight',
    timestamp: 'Yesterday',
    author: { name: 'Verified Counsellor · Sarah K.', avatarColor: 'bg-[#15803D]', initials: 'SK', isVerifiedCounsellor: true },
    title: 'On the Oxford personal statement: what tutors actually look for in 2026',
    body: "After reviewing over 200 Oxford applications this cycle, here's what I consistently see separating strong PS submissions from the average: it's not the breadth of reading — it's the quality of intellectual engagement with a single idea...",
    tags: ['#Oxford', '#文书'],
    reactions: { helpful: 67, replies: 12 }
  },
  {
    id: '4',
    type: 'Anonymous',
    timestamp: '6h ago',
    author: { name: 'Anonymous', avatarColor: 'bg-gray-400', initials: '?', isAnonymous: true },
    title: 'Is it normal to feel like everyone else is more prepared than you?',
    body: "I genuinely feel like I'm the only one who doesn't have a clear 'narrative' for my application yet. All my friends seem to have this figured out and I'm just...",
    tags: ['#焦虑'],
    reactions: { helpful: 31, replies: 15 }
  },
  {
    id: '5',
    type: 'Discussion',
    timestamp: '3h ago',
    author: { name: 'Coral Applicant', avatarColor: 'bg-orange-400', initials: 'CA' },
    title: 'Cambridge vs Oxford CS — what actually differs in the interview style?',
    body: "I have interviews at both and I'm trying to understand whether the thinking-out-loud approach that works well for Oxford translates to Cambridge or if it's more problem-solving focused...",
    tags: ['#Cambridge', '#Oxford', '#面试'],
    reactions: { helpful: 22, replies: 9 }
  },
  {
    id: '6',
    type: 'Question',
    timestamp: '1h ago',
    author: { name: 'Sage Applicant', avatarColor: 'bg-green-500', initials: 'SA' },
    title: 'UCAS reference — when should I actually approach my teachers?',
    body: "I know the official deadline is January but I've heard teachers need 6-8 weeks minimum. My school hasn't given us clear guidance and I'm panicking a bit...",
    tags: ['#UCAS'],
    reactions: { helpful: 5, replies: 2 }
  }
];
