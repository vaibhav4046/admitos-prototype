import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import { 
  Home,
  Bot, 
  GraduationCap, 
  Map, 
  PenTool, 
  BookOpenCheck, 
  Users, 
  CreditCard, 
  Settings,
  Plus,
  Search,
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  ChevronDown,
  ShieldCheck,
  School,
  Sun,
  Moon,
  Sparkles,
  HeartHandshake,
  Heart,
  MessagesSquare,
  X,
  Gift,
  MessageSquare,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Menu,
  SquarePen,
  Copy,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import AdieSidebarWidget from "@/components/adie/AdieSidebarWidget";

const navItems = [
  { name: "Home", href: "/dashboard", exact: true, icon: Home },
  { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { name: "Preparation OS", href: "/dashboard/preparation", icon: BookOpenCheck },
  { name: "Application OS", href: "/dashboard/applications", icon: Map },
  { name: "School List", href: "/dashboard/schools", icon: GraduationCap },
  { name: "Essays & Writing", href: "/dashboard/essays", icon: PenTool },
  { name: "Advising & Services", href: "/dashboard/human-services", icon: HeartHandshake },
  { name: "Commons", href: "/dashboard/commons", icon: MessagesSquare, hasNew: true },
  { name: "Adie AI Assistant", href: "#", icon: Sparkles, isAdie: true },
];

const bottomNavItems = [
  { name: "Pricing", href: "/dashboard/pricing", icon: CreditCard },
];

type Role = "student" | "parent" | "consultant" | "school";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeRole, setActiveRole] = useState<Role>("student");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isAdieExpanded, setIsAdieExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [chats, setChats] = useState([
    { id: 1, name: "Initial Positioning Strategy" },
    { id: 2, name: "Extracurricular Brainstorming" },
    { id: 3, name: "Summer Program Research" },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const roles = [
    { id: "student", name: "Student View", icon: GraduationCap, color: "bg-calm-info" },
    { id: "parent", name: "Parent View", icon: Users, color: "bg-calm-primary" },
    { id: "consultant", name: "Consultant View", icon: ShieldCheck, color: "bg-calm-success" },
    { id: "school", name: "School View", icon: School, color: "bg-calm-warning" },
  ];

  const currentRole = roles.find(r => r.id === activeRole) || roles[0];

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [renameChatId, setRenameChatId] = useState<number | null>(null);
  const [renameChatName, setRenameChatName] = useState("");
  const [deleteChatId, setDeleteChatId] = useState<number | null>(null);
  const [showLegalConsent, setShowLegalConsent] = useState(true);
  const [consentChecks, setConsentChecks] = useState({
    adie: false,
    writing: false,
    tos: false
  });
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleRenameChat = (id: number) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    setRenameChatName(chat.name);
    setRenameChatId(id);
  };

  const submitRenameChat = () => {
    if (renameChatId && renameChatName.trim()) {
      setChats(chats.map(c => c.id === renameChatId ? { ...c, name: renameChatName.trim() } : c));
    }
    setRenameChatId(null);
  };

  const handleDeleteChat = (id: number) => {
    setDeleteChatId(id);
  };

  const confirmDeleteChat = () => {
    if (deleteChatId) {
      setChats(chats.filter(c => c.id !== deleteChatId));
    }
    setDeleteChatId(null);
  };

  return (
    <div className="min-h-screen bg-calm-bg flex font-sans text-calm-text overflow-hidden">
      {/* Sidebar - Minimalist Manus Style */}
      <aside className={cn(
        "w-[260px] bg-calm-surface border-r border-calm-border flex flex-col fixed inset-y-0 left-0 z-20 transition-transform duration-300 ease-in-out",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-2">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2 rounded-md transition-colors"
                title="Collapse menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="font-semibold text-base tracking-tight ml-1">AdmitOS</span>
            </div>
            <div className="flex items-center gap-0.5">
              {/* Search Chats Dropdown Trigger */}
              <div className="relative" ref={searchDropdownRef}>
                <button 
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="p-1.5 text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2 rounded-md transition-colors"
                  title="Search chats"
                >
                  <Search className="w-4 h-4" />
                </button>
                {/* Dropdown for Search & Chats */}
                {isSearchExpanded && (
                  <div className="absolute top-full left-0 mt-2 w-[240px] bg-calm-surface border border-calm-border shadow-2xl rounded-xl z-50 overflow-hidden flex flex-col max-h-[300px]">
                    <div className="p-2 border-b border-calm-border">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-calm-text-muted" />
                        <input 
                          type="text" 
                          autoFocus
                          placeholder="Search chats..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-2 py-1.5 bg-calm-bg border border-calm-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-calm-primary text-calm-text placeholder:text-calm-text-muted transition-colors"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto p-1">
                      {filteredChats.length > 0 ? filteredChats.map((chat) => (
                        <div key={chat.id} className="group flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-colors text-calm-text-muted hover:bg-calm-surface-2 hover:text-calm-text cursor-pointer">
                          <div className="flex items-center gap-2 truncate">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0 text-calm-text-muted group-hover:text-calm-text transition-colors" />
                            <span className="truncate">{chat.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); handleRenameChat(chat.id); }} className="p-1 hover:bg-calm-border rounded text-calm-text-muted hover:text-calm-text transition-colors">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }} className="p-1 hover:bg-calm-border rounded text-red-500/80 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div className="px-2 py-3 text-center text-xs text-calm-text-muted">No chats found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* New Chat Button */}
              <button 
                onClick={() => setIsNewChatModalOpen(true)}
                className="p-1.5 text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2 rounded-md transition-colors"
                title="New chat"
              >
                <SquarePen className="w-4 h-4" />
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2 rounded-md transition-colors"
                title="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Switcher (Moved under logo) */}
          <div className="px-2 relative" ref={roleDropdownRef}>
            <button 
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="w-max flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", currentRole.color)} />
                {currentRole.name}
              </div>
              <ChevronDown className={cn("w-3 h-3 transition-transform", isRoleMenuOpen && "rotate-180")} />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute top-full left-2 mt-1 w-[180px] bg-calm-surface border border-calm-border shadow-xl rounded-xl z-50 py-1 overflow-hidden">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setActiveRole(role.id as Role);
                      setIsRoleMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-calm-surface-2",
                      activeRole === role.id ? "text-calm-text font-medium bg-calm-surface-2" : "text-calm-text-muted"
                    )}
                  >
                    <role.icon className={cn("w-3.5 h-3.5", activeRole === role.id ? "text-calm-text" : "text-calm-text-muted")} />
                    {role.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-4 pt-2">

          {/* Main Menu */}
          <div className="space-y-0.5">
          {navItems.map((item) => (
            item.isAdie ? (
              <button
                key={item.name}
                onClick={() => setIsAdieExpanded(!isAdieExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-calm-text-muted hover:bg-calm-surface-2 hover:text-calm-text"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-[#7C3AED]" />
                  <span>{item.name}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
              </button>
            ) : (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.exact}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                  isActive 
                    ? "bg-calm-surface-2 text-calm-text" 
                    : "text-calm-text-muted hover:bg-calm-surface-2 hover:text-calm-text"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                {item.hasNew && (
                  <span className="ml-auto flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-calm-text-muted opacity-60"></span>
                  </span>
                )}
              </NavLink>
            )
          ))}
          
          <AnimatePresence>
            {isAdieExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-2 pt-1">
                  <AdieSidebarWidget />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

        <div className="p-3 space-y-0.5">

          {bottomNavItems.map((item) => {
            // Only show Pricing for parents
            if (item.name === "Pricing" && activeRole !== "parent") return null;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-calm-surface-2 text-calm-text" 
                    : "text-calm-text-muted hover:bg-calm-surface-2 hover:text-calm-text"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            );
          })}
          <div className="mt-2 pt-2 border-t border-calm-border space-y-2">
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 hover:from-indigo-50 hover:to-purple-50 border border-indigo-100/50 text-sm font-medium text-indigo-900 transition-all dark:from-indigo-950/30 dark:to-purple-950/30 dark:border-indigo-800/30 dark:text-indigo-200 dark:hover:from-indigo-900/40 dark:hover:to-purple-900/40 shadow-sm group"
            >
              <div className="bg-white dark:bg-indigo-900/50 p-1.5 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800 group-hover:scale-105 transition-transform">
                <Gift className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-left text-[11px] leading-tight font-semibold tracking-tight">
                Share AdmitOS with a friend,<br/>get 500 credits each
              </span>
            </button>
            <div className="relative group">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                className="hidden" 
                accept="image/*" 
              />
              <NavLink 
                to="/dashboard/settings"
                className={({ isActive }) => cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-calm-surface-2 text-calm-text" 
                    : "text-calm-text-muted hover:bg-calm-surface-2 hover:text-calm-text"
                )}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--calm-primary)] to-[var(--calm-primary-hover)] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden cursor-pointer relative"
                    onClick={(e) => {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      "AC"
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <ImageIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  Alex Chen
                </div>
                <Settings className="w-4 h-4 opacity-50" />
              </NavLink>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen bg-calm-bg transition-all duration-300 ease-in-out relative",
        isSidebarOpen ? "ml-[260px]" : "ml-0"
      )}>
        {!isSidebarOpen && (
          <div className="absolute top-4 left-4 z-10">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 bg-calm-surface border border-calm-border shadow-sm text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2 rounded-md transition-colors"
              title="Open sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex-1 flex flex-col w-full h-full overflow-y-auto relative">
          <Outlet />
        </div>

        {/* MCP-native Copilot Indicator */}
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group cursor-pointer">
          <div className="flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-medium text-calm-text">Intelligence Mesh</span>
            <span className="text-[10px] text-calm-text-muted">24/7 Monitoring active</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-calm-surface border border-calm-border flex items-center justify-center shadow-lg relative transition-colors">
            {/* Inner pulsing ring */}
            <div className="w-3 h-3 rounded-full bg-calm-accent ai-glow" />
          </div>
        </div>
      </main>

      {/* New Chat Modal */}
      <Dialog.Root open={isNewChatModalOpen} onOpenChange={setIsNewChatModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl z-50 focus:outline-none">
            <Dialog.Title className="text-lg font-medium text-calm-text mb-4">Start a New Chat</Dialog.Title>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    setChats([{ id: Date.now(), name: "New Strategy Session" }, ...chats]);
                    setIsNewChatModalOpen(false);
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-calm-border bg-calm-surface-2 hover:bg-calm-border hover:shadow-sm transition-all text-calm-text"
                >
                  <Bot className="w-6 h-6 text-calm-primary" />
                  <span className="text-sm font-medium">AI Consultant</span>
                </button>
                <button 
                  onClick={() => {
                    setChats([{ id: Date.now(), name: "New Essay Review" }, ...chats]);
                    setIsNewChatModalOpen(false);
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-calm-border bg-calm-surface-2 hover:bg-calm-border hover:shadow-sm transition-all text-calm-text"
                >
                  <PenTool className="w-6 h-6 text-calm-info" />
                  <span className="text-sm font-medium">Essay Review</span>
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-calm-text-muted hover:text-calm-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Invite Modal */}
      <Dialog.Root open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-[460px] bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl z-50 focus:outline-none">
            <div className="flex items-center justify-between mb-2">
              <Dialog.Title className="text-xl font-semibold text-calm-text">Invite to get credits</Dialog.Title>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-1.5 text-calm-text-muted hover:text-calm-text hover:bg-calm-surface-2 rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Dialog.Description className="text-sm text-calm-text-muted mb-6">
              Share your invite link with friends, get 500 credits each.
            </Dialog.Description>

            <div className="space-y-6">
              {/* Copy Link */}
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-calm-bg border border-calm-border rounded-lg px-3 py-2.5 text-sm text-calm-text truncate select-all">
                    https://admitos.com/invite/alexchen
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-calm-text text-calm-surface rounded-lg text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Social Share */}
              <div>
                <div className="text-sm font-medium text-calm-text mb-3">Invite friends via</div>
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-full bg-[#07C160]/10 text-[#07C160] flex items-center justify-center hover:bg-[#07C160]/20 transition-colors" title="Share on WeChat">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.8 10.4c-.3 0-.6.1-.9.1-1.6-3.1-5.2-5.2-9.2-5.2-5.5 0-10 3.8-10 8.5 0 2.6 1.4 5 3.8 6.5l-1 3.2 3.8-1.9c1.1.3 2.2.5 3.4.5.3 0 .6 0 .9-.1-1-5.1 3-9.6 8.2-9.6.3 0 .7 0 1-.1zM7.5 9.5c-.8 0-1.5-.6-1.5-1.4s.7-1.4 1.5-1.4 1.5.6 1.5 1.4-.7 1.4-1.5 1.4zm5 0c-.8 0-1.5-.6-1.5-1.4s.7-1.4 1.5-1.4 1.5.6 1.5 1.4-.7 1.4-1.5 1.4z"/><path d="M24 16.5c0-3.8-3.6-6.9-8-6.9s-8 3.1-8 6.9 3.6 6.9 8 6.9c1 0 1.9-.2 2.8-.5l2.9 1.5-.8-2.4c1.9-1.3 3.1-3.2 3.1-5.5zm-10.5-1.5c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1zm5 0c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z"/></svg>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-[#FF2442]/10 text-[#FF2442] flex items-center justify-center hover:bg-[#FF2442]/20 transition-colors" title="Share on Xiaohongshu">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="-0.5">RED</text>
                    </svg>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2]/20 transition-colors" title="Share on Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 transition-colors" title="Share on WhatsApp">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors" title="Share on X">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2]/20 transition-colors" title="Share on LinkedIn">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-[#FF4500]/10 text-[#FF4500] flex items-center justify-center hover:bg-[#FF4500]/20 transition-colors" title="Share on Reddit">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.562-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                  </button>
                </div>
              </div>

              {/* Email Invite */}
              <div>
                <div className="text-sm font-medium text-calm-text mb-2">Send invitation email</div>
                <div className="flex items-center gap-2">
                  <input className="flex-1 bg-calm-bg border border-calm-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-calm-primary text-calm-text placeholder:text-calm-text-muted" placeholder="Email address" />
                  <button className="px-4 py-2.5 bg-calm-surface-2 border border-calm-border text-calm-text rounded-lg text-sm font-medium hover:bg-calm-border transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="mt-8 pt-6 border-t border-calm-border flex items-center justify-between">
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-xs text-calm-text-muted mb-1">Invitations</span>
                  <span className="text-xl font-semibold text-calm-text">0</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-calm-text-muted mb-1">Credits</span>
                  <span className="text-xl font-semibold text-calm-text">0</span>
                </div>
              </div>
              <div className="flex gap-4 text-sm font-medium text-calm-text-muted">
                <button className="hover:text-calm-text transition-colors">Referrals</button>
                <button className="hover:text-calm-text transition-colors">Redeem</button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Rename Chat Modal */}
      <Dialog.Root open={renameChatId !== null} onOpenChange={(open) => !open && setRenameChatId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl z-50 focus:outline-none">
            <Dialog.Title className="text-lg font-medium text-calm-text mb-4">Rename Chat</Dialog.Title>
            <input
              type="text"
              value={renameChatName}
              onChange={(e) => setRenameChatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRenameChat();
              }}
              className="w-full px-3 py-2 bg-calm-bg border border-calm-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-calm-primary text-calm-text mb-6"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRenameChatId(null)}
                className="px-4 py-2 text-sm font-medium text-calm-text-muted hover:text-calm-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRenameChat}
                className="px-4 py-2 bg-calm-primary text-white rounded-lg text-sm font-medium hover:bg-calm-primary-hover transition-colors"
              >
                Save
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Chat Modal */}
      <Dialog.Root open={deleteChatId !== null} onOpenChange={(open) => !open && setDeleteChatId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-xl z-50 focus:outline-none">
            <Dialog.Title className="text-lg font-medium text-calm-text mb-2">Delete Chat</Dialog.Title>
            <Dialog.Description className="text-sm text-calm-text-muted mb-6">
              Are you sure you want to delete this chat? This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteChatId(null)}
                className="px-4 py-2 text-sm font-medium text-calm-text-muted hover:text-calm-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteChat}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Legal Consent Modal */}
      <Dialog.Root open={showLegalConsent} onOpenChange={setShowLegalConsent}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content 
            className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg bg-calm-surface border border-calm-border rounded-2xl p-8 shadow-2xl z-50 focus:outline-none"
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-calm-accent" />
              <Dialog.Title className="text-xl font-medium text-calm-text">Before we begin...</Dialog.Title>
            </div>
            <Dialog.Description className="text-sm text-calm-text-muted mb-6">
              To provide you with the best experience and comply with data privacy regulations, we need your explicit consent for the following features:
            </Dialog.Description>
            
            <div className="space-y-4 mb-8">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none w-5 h-5 border border-calm-border rounded bg-calm-surface-2 checked:bg-calm-accent checked:border-calm-accent transition-colors"
                    checked={consentChecks.adie}
                    onChange={(e) => setConsentChecks(prev => ({ ...prev, adie: e.target.checked }))}
                  />
                  <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <div className="text-sm text-calm-text group-hover:text-calm-text-muted transition-colors">
                  <span className="font-medium block mb-0.5">Adie AI Assistant Disclaimer</span>
                  <span className="text-xs text-calm-text-muted">I understand that Adie is an AI assistant, not a licensed therapist or admissions counselor.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none w-5 h-5 border border-calm-border rounded bg-calm-surface-2 checked:bg-calm-accent checked:border-calm-accent transition-colors"
                    checked={consentChecks.writing}
                    onChange={(e) => setConsentChecks(prev => ({ ...prev, writing: e.target.checked }))}
                  />
                  <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <div className="text-sm text-calm-text group-hover:text-calm-text-muted transition-colors">
                  <span className="font-medium block mb-0.5">Writing Style Vector Consent</span>
                  <span className="text-xs text-calm-text-muted">I consent to the processing of my writing samples to generate a personalized Writing Style Vector.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none w-5 h-5 border border-calm-border rounded bg-calm-surface-2 checked:bg-calm-accent checked:border-calm-accent transition-colors"
                    checked={consentChecks.tos}
                    onChange={(e) => setConsentChecks(prev => ({ ...prev, tos: e.target.checked }))}
                  />
                  <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <div className="text-sm text-calm-text group-hover:text-calm-text-muted transition-colors">
                  <span className="font-medium block mb-0.5">Terms of Service & Privacy Policy</span>
                  <span className="text-xs text-calm-text-muted">I agree to the <Link to="/terms" target="_blank" className="underline hover:text-calm-text">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="underline hover:text-calm-text">Privacy Policy</Link>.</span>
                </div>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowLegalConsent(false)}
                disabled={!consentChecks.adie || !consentChecks.writing || !consentChecks.tos}
                className="px-6 py-2.5 bg-calm-primary text-white rounded-xl text-sm font-medium hover:bg-calm-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                I Understand and Agree
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
