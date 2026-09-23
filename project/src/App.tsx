import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import {
  Send,
  MessageSquare,
  Plus,
  Trash2,
  Menu,
  X,
  Sparkles,
  User,
  Bot,
  Lightbulb,
  Code2,
  BookOpen,
  Calculator,
  Copy,
  Check,
  RefreshCw,
  ArrowDown,
  Brain,
  Zap,
  Globe,
  Palette,
} from "lucide-react";
import {
  sendChatMessage,
  fetchConversations,
  fetchMessages,
  saveMessage,
  deleteConversation,
  updateConversationTimestamp,
} from "@/lib/chat";
import type { Conversation, Message } from "@/lib/supabase";

// ─── Theme System ──────────────────────────────────────────────────────────────
type ThemeName = "aurora" | "nebula" | "solar";

interface ThemeConfig {
  name: ThemeName;
  label: string;
  gradient: string;
  gradientUser: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  dotClass: string;
  accentHex: string;
  bgColor: string;
  blob1: string;
  blob2: string;
  blob3: string;
  auroraC: [string, string, string];
  focusClasses: string;
}

const THEMES: Record<ThemeName, ThemeConfig> = {
  aurora: {
    name: "aurora",
    label: "Aurora",
    gradient: "from-emerald-400 to-teal-600",
    gradientUser: "from-blue-500 to-blue-600",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-400/10",
    accentBorder: "border-emerald-400/30",
    dotClass: "bg-emerald-400",
    accentHex: "#10b981",
    bgColor: "#0a0a10",
    blob1: "bg-emerald-500",
    blob2: "bg-teal-500",
    blob3: "bg-cyan-600",
    auroraC: [
      "rgba(16,185,129,0.09)",
      "rgba(20,184,166,0.07)",
      "rgba(13,148,136,0.05)",
    ],
    focusClasses:
      "focus-within:border-emerald-400/40 focus-within:shadow-lg focus-within:shadow-emerald-500/5",
  },
  nebula: {
    name: "nebula",
    label: "Nebula",
    gradient: "from-violet-400 to-purple-600",
    gradientUser: "from-fuchsia-500 to-purple-600",
    accentText: "text-violet-400",
    accentBg: "bg-violet-400/10",
    accentBorder: "border-violet-400/30",
    dotClass: "bg-violet-400",
    accentHex: "#8b5cf6",
    bgColor: "#0a0810",
    blob1: "bg-violet-500",
    blob2: "bg-purple-500",
    blob3: "bg-fuchsia-600",
    auroraC: [
      "rgba(139,92,246,0.09)",
      "rgba(168,85,247,0.07)",
      "rgba(192,38,211,0.05)",
    ],
    focusClasses:
      "focus-within:border-violet-400/40 focus-within:shadow-lg focus-within:shadow-violet-500/5",
  },
  solar: {
    name: "solar",
    label: "Solar",
    gradient: "from-amber-400 to-orange-600",
    gradientUser: "from-orange-500 to-red-600",
    accentText: "text-amber-400",
    accentBg: "bg-amber-400/10",
    accentBorder: "border-amber-400/30",
    dotClass: "bg-amber-400",
    accentHex: "#f59e0b",
    bgColor: "#0f0a00",
    blob1: "bg-amber-500",
    blob2: "bg-orange-500",
    blob3: "bg-yellow-600",
    auroraC: [
      "rgba(245,158,11,0.09)",
      "rgba(249,115,22,0.07)",
      "rgba(234,179,8,0.05)",
    ],
    focusClasses:
      "focus-within:border-amber-400/40 focus-within:shadow-lg focus-within:shadow-amber-500/5",
  },
};

const ThemeCtx = createContext<ThemeConfig>(THEMES.aurora);
const useTheme = () => useContext(ThemeCtx);

// ─── Constants ─────────────────────────────────────────────────────────────────
interface ChatState {
  messages: Message[];
  conversationId: string | null;
}

const SUGGESTIONS = [
  {
    icon: Code2,
    text: "What is Python?",
    label: "Programming languages",
    color: "from-blue-400 to-blue-600",
  },
  {
    icon: Lightbulb,
    text: "What is machine learning?",
    label: "AI & Technology",
    color: "from-amber-400 to-orange-600",
  },
  {
    icon: BookOpen,
    text: "What is blockchain?",
    label: "Science & Innovation",
    color: "from-emerald-400 to-teal-600",
  },
  {
    icon: Calculator,
    text: "What is 15 * 23 + 7?",
    label: "Quick calculation",
    color: "from-pink-400 to-rose-600",
  },
];

const THINKING_MESSAGES = [
  "Thinking...",
  "Processing your question...",
  "Analyzing context...",
  "Formulating a response...",
  "Gathering knowledge...",
];

// ─── Particle Canvas ───────────────────────────────────────────────────────────
function ParticleCanvas({ accentHex }: { accentHex: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);

    interface P {
      x: number; y: number; vx: number; vy: number;
      r: number; o: number;
    }
    const pts: P[] = Array.from({ length: 72 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.4 + 0.4,
      o: Math.random() * 0.45 + 0.08,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouseRef.current;

      for (const p of pts) {
        const dx = mx - p.x;
        const dy = my - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 180 && d > 0) {
          p.vx += (dx / d) * 0.016;
          p.vy += (dy / d) * 0.016;
        }
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accentHex;
        ctx.globalAlpha = p.o;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 105) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = accentHex;
            ctx.globalAlpha = (1 - d / 105) * 0.13;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [accentHex]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      style={{ opacity: 0.55 }}
    />
  );
}

// ─── Live Stats Bar ────────────────────────────────────────────────────────────
function LiveStatsBar({
  messageCount,
  wordCount,
}: {
  messageCount: number;
  wordCount: number;
}) {
  const theme = useTheme();
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="relative z-50 flex w-full items-center justify-center gap-3 border-b border-white/[0.04] bg-black/30 px-4 py-1.5 text-[10px] text-gray-600"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <span className="stats-pill">
        <MessageSquare
          className={`h-2.5 w-2.5 ${theme.accentText} opacity-50`}
        />
        <span>{messageCount} msg{messageCount !== 1 ? "s" : ""}</span>
      </span>

      <span className="stats-pill">
        <Brain className={`h-2.5 w-2.5 ${theme.accentText} opacity-50`} />
        <span>{wordCount.toLocaleString()} words</span>
      </span>

      <span className="stats-pill font-mono tracking-wide">
        {time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>

      <span className={`stats-pill font-medium ${theme.accentText} opacity-70`}>
        <span
          className={`h-1.5 w-1.5 rounded-full ${theme.dotClass}`}
          style={{ animation: "status-pulse 2s ease-in-out infinite" }}
        />
        {theme.label} Mode
      </span>
    </div>
  );
}

// ─── Typewriter Text ───────────────────────────────────────────────────────────
function TypewriterText({
  content,
  active,
}: {
  content: string;
  active: boolean;
}) {
  const theme = useTheme();
  const [displayed, setDisplayed] = useState(active ? "" : content);
  const [done, setDone] = useState(!active);
  const iRef = useRef(0);

  useEffect(() => {
    if (!active || content.length > 2800) {
      setDisplayed(content);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    iRef.current = 0;
    const iv = setInterval(() => {
      iRef.current = Math.min(iRef.current + 3, content.length);
      setDisplayed(content.slice(0, iRef.current));
      if (iRef.current >= content.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, 9);
    return () => clearInterval(iv);
  }, [content, active]);

  return (
    <>
      <FormattedContent content={displayed} />
      {!done && (
        <span
          className={`ml-0.5 inline-block h-3.5 w-0.5 align-middle rounded-full ${theme.dotClass}`}
          style={{ animation: "blink-cursor 0.75s steps(1) infinite" }}
        />
      )}
    </>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [themeName, setThemeName] = useState<ThemeName>("aurora");
  const theme = THEMES[themeName];

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chat, setChat] = useState<ChatState>({
    messages: [],
    conversationId: null,
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [latestAiMsgId, setLatestAiMsgId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUserTextRef = useRef<string>("");

  const cycleTheme = () =>
    setThemeName((t) =>
      t === "aurora" ? "nebula" : t === "nebula" ? "solar" : "aurora"
    );

  const loadConversations = useCallback(async () => {
    try {
      const data = await fetchConversations();
      setConversations(data || []);
    } catch {
      // ignore on initial load
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    if (!isTyping) scrollToBottom();
  }, [chat.messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isTyping) {
      let idx = 0;
      setThinkingMessage(THINKING_MESSAGES[0]);
      thinkingIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % THINKING_MESSAGES.length;
        setThinkingMessage(THINKING_MESSAGES[idx]);
      }, 1800);
    } else {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
    }
    return () => {
      if (thinkingIntervalRef.current)
        clearInterval(thinkingIntervalRef.current);
    };
  }, [isTyping]);

  const handleScroll = useCallback(() => {
    const c = scrollContainerRef.current;
    if (!c) return;
    setShowScrollButton(c.scrollHeight - c.scrollTop - c.clientHeight > 200);
  }, []);

  const startNewChat = () => {
    setChat({ messages: [], conversationId: null });
    setError(null);
    setLatestAiMsgId(null);
    setSidebarOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const selectConversation = async (conv: Conversation) => {
    try {
      const messages = await fetchMessages(conv.id);
      setChat({ messages, conversationId: conv.id });
      setError(null);
      setLatestAiMsgId(null);
      setSidebarOpen(false);
    } catch {
      setError("Could not load this conversation.");
    }
  };

  const handleDeleteConversation = async (
    e: React.MouseEvent,
    convId: string
  ) => {
    e.stopPropagation();
    try {
      await deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (chat.conversationId === convId) startNewChat();
    } catch {
      setError("Could not delete conversation.");
    }
  };

  const adjustTextareaHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    requestAnimationFrame(adjustTextareaHeight);
  };

  const handleCopy = async (content: string, msgId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  const handleRegenerate = async () => {
    if (isTyping) return;
    const lastUserMsg = [...chat.messages]
      .reverse()
      .find((m) => m.role === "user");
    if (!lastUserMsg) return;

    const text = lastUserMsg.content;
    lastUserTextRef.current = text;
    const trimmed = chat.messages.slice(0, chat.messages.length - 1);
    setChat((prev) => ({ ...prev, messages: trimmed }));
    setIsTyping(true);
    setError(null);

    try {
      const history = trimmed.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const result = await sendChatMessage(text, chat.conversationId, history);
      await saveMessage(result.conversationId, "assistant", result.response);
      await updateConversationTimestamp(result.conversationId);
      const newId = "regen-assistant-" + Date.now();
      setLatestAiMsgId(newId);
      setChat((prev) => ({
        conversationId: result.conversationId,
        messages: [
          ...prev.messages,
          {
            id: newId,
            conversation_id: result.conversationId,
            role: "assistant",
            content: result.response,
            created_at: new Date().toISOString(),
          },
        ],
      }));
      loadConversations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isTyping) return;

    setError(null);
    setInput("");
    lastUserTextRef.current = text;
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Send burst animation
    setIsSending(true);
    setTimeout(() => setIsSending(false), 600);

    const tempUserMsg: Message = {
      id: "temp-user-" + Date.now(),
      conversation_id: chat.conversationId || "",
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    const history = chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    setChat((prev) => ({
      ...prev,
      messages: [...prev.messages, tempUserMsg],
    }));
    setIsTyping(true);

    try {
      const result = await sendChatMessage(text, chat.conversationId, history);
      await saveMessage(result.conversationId, "user", text);
      await saveMessage(result.conversationId, "assistant", result.response);
      await updateConversationTimestamp(result.conversationId);

      const newAiId = "real-assistant-" + Date.now();
      setLatestAiMsgId(newAiId);

      setChat((prev) => ({
        conversationId: result.conversationId,
        messages: [
          ...prev.messages.filter((m) => m.id !== tempUserMsg.id),
          {
            id: "real-user-" + Date.now(),
            conversation_id: result.conversationId,
            role: "user",
            content: text,
            created_at: new Date().toISOString(),
          },
          {
            id: newAiId,
            conversation_id: result.conversationId,
            role: "assistant",
            content: result.response,
            created_at: new Date().toISOString(),
          },
        ],
      }));
      loadConversations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setChat((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== tempUserMsg.id),
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffH = (now.getTime() - date.getTime()) / 3_600_000;
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${Math.floor(diffH)}h ago`;
    if (diffH < 168) return `${Math.floor(diffH / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const hasMessages = chat.messages.length > 0;

  const stats = useMemo(() => {
    const messageCount = chat.messages.length;
    const wordCount = chat.messages.reduce(
      (sum, m) =>
        sum + m.content.split(/\s+/).filter(Boolean).length,
      0
    );
    return { messageCount, wordCount };
  }, [chat.messages]);

  const auroraStyle = {
    background: `
      radial-gradient(ellipse 60% 50% at 20% 10%, ${theme.auroraC[0]}, transparent 60%),
      radial-gradient(ellipse 50% 40% at 80% 20%, ${theme.auroraC[1]}, transparent 60%),
      radial-gradient(ellipse 40% 30% at 50% 80%, ${theme.auroraC[2]}, transparent 60%)
    `,
  };

  return (
    <ThemeCtx.Provider value={theme}>
      <div
        className="relative flex flex-col h-screen overflow-hidden text-gray-100"
        style={{ background: theme.bgColor }}
      >
        {/* Cosmic particle field */}
        <ParticleCanvas accentHex={theme.accentHex} />

        {/* Aurora gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={auroraStyle}
        />

        {/* Aurora blobs */}
        <div
          className={`aurora-blob h-80 w-80 ${theme.blob1}`}
          style={{ top: "5%", left: "8%" }}
        />
        <div
          className={`aurora-blob h-64 w-64 ${theme.blob2}`}
          style={{ top: "40%", right: "5%", animationDelay: "5s" }}
        />
        <div
          className={`aurora-blob h-56 w-56 ${theme.blob3}`}
          style={{ bottom: "10%", left: "30%", animationDelay: "10s" }}
        />

        {/* Live Stats Bar */}
        <LiveStatsBar
          messageCount={stats.messageCount}
          wordCount={stats.wordCount}
        />

        {/* Main layout */}
        <div className="relative z-10 flex flex-1 overflow-hidden">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <aside
            className={`fixed md:relative z-40 flex h-full w-72 flex-col transition-transform duration-300 glass ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
            style={{
              borderRight: `1px solid rgba(255,255,255,0.05)`,
              boxShadow: `inset -1px 0 0 0 ${theme.accentHex}14, 4px 0 40px rgba(0,0,0,0.35)`,
            }}
          >
            {/* Holographic shimmer line on top */}
            <div
              className="shimmer-bar flex-shrink-0"
              style={{ "--accent-hex": theme.accentHex } as React.CSSProperties}
            />

            {/* Logo */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} shadow-lg`}
                  style={{ boxShadow: `0 4px 18px ${theme.accentHex}40` }}
                >
                  <Sparkles className="h-5 w-5 text-white" />
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${theme.gradient} opacity-40 pulse-ring`}
                  />
                </div>
                <div>
                  <h1 className="holographic-text text-sm font-bold tracking-tight">
                    Nova AI
                  </h1>
                  <p className="text-[10px] text-gray-500">Your AI assistant</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white md:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* New chat button */}
            <div className="px-3 pt-2">
              <button
                onClick={startNewChat}
                className={`group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/[0.08]`}
              >
                <Plus
                  className={`h-4 w-4 ${theme.accentText} transition-transform duration-300 group-hover:rotate-180`}
                />
                New Chat
              </button>
            </div>

            {/* Conversation list */}
            <div className="mt-4 flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                Recent Conversations
              </p>
              {conversations.length === 0 ? (
                <div className="px-2 py-8 text-center">
                  <MessageSquare className="mx-auto mb-2 h-6 w-6 text-gray-700" />
                  <p className="text-xs text-gray-600">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                        chat.conversationId === conv.id
                          ? `${theme.accentBg} text-white`
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      }`}
                    >
                      {/* Active accent bar */}
                      {chat.conversationId === conv.id && (
                        <div
                          className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
                          style={{ background: theme.accentHex }}
                        />
                      )}
                      <MessageSquare
                        className={`h-4 w-4 shrink-0 ${
                          chat.conversationId === conv.id
                            ? theme.accentText
                            : "text-gray-600 group-hover:text-gray-400"
                        }`}
                      />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs font-medium">
                          {conv.title}
                        </p>
                        <p className="text-[10px] text-gray-600">
                          {formatDate(conv.updated_at)}
                        </p>
                      </div>
                      <span
                        onClick={(e) =>
                          handleDeleteConversation(e, conv.id)
                        }
                        className="shrink-0 rounded-md p-1 text-gray-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-4 py-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <div
                  className={`relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${theme.gradient} text-[10px] font-bold text-white`}
                >
                  U
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-300">
                    Guest User
                  </p>
                  <p className="text-[10px] text-gray-600">Free Plan</p>
                </div>
                <div className="relative flex h-2 w-2">
                  <div className={`h-2 w-2 rounded-full ${theme.dotClass}`} />
                  <div
                    className={`absolute h-2 w-2 rounded-full ${theme.dotClass} pulse-ring`}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main chat area ──────────────────────────────────────────────── */}
          <main className="relative flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-white/5 glass px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <div className={`h-2 w-2 rounded-full ${theme.dotClass}`} />
                    <div
                      className={`absolute h-2 w-2 rounded-full ${theme.dotClass} pulse-ring`}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-300">
                    {chat.conversationId ? "Chat Active" : "New Chat"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-3 text-xs text-gray-600 sm:flex">
                  <div className="flex items-center gap-1.5">
                    <Brain
                      className={`h-3.5 w-3.5 ${theme.accentText} opacity-60`}
                    />
                    <span>Nova Engine</span>
                  </div>
                  <div className="h-3 w-px bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400/60" />
                    <span>Fast Mode</span>
                  </div>
                  <div className="h-3 w-px bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-cyan-400/60" />
                    <span>30+ topics</span>
                  </div>
                </div>

                {/* Theme switcher */}
                <button
                  onClick={cycleTheme}
                  id="theme-switcher-btn"
                  title="Switch theme"
                  className={`flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium ${theme.accentText} transition-all hover:bg-white/10 hover:scale-105 active:scale-95`}
                >
                  <Palette className="h-3.5 w-3.5" />
                  <span className="hidden sm:block">{theme.label}</span>
                </button>
              </div>
            </header>

            {/* Messages */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto scrollbar-thin"
            >
              {!hasMessages && !isTyping ? (
                <WelcomeScreen onSuggestion={handleSend} />
              ) : (
                <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
                  {chat.messages.map((msg, idx) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      index={idx}
                      isLast={idx === chat.messages.length - 1}
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      onRegenerate={handleRegenerate}
                      canRegenerate={
                        idx === chat.messages.length - 1 &&
                        msg.role === "assistant" &&
                        !isTyping
                      }
                      isLatestAi={msg.id === latestAiMsgId}
                    />
                  ))}
                  {isTyping && (
                    <TypingIndicator thinkingMessage={thinkingMessage} />
                  )}
                  {error && (
                    <div
                      className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                      style={{ animation: "float-up 0.3s ease-out" }}
                    >
                      {error}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Scroll-to-bottom */}
            {showScrollButton && hasMessages && (
              <button
                onClick={() => scrollToBottom()}
                className="absolute bottom-24 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-[#1a1a24] text-gray-400 shadow-lg transition-all hover:text-white"
                style={{ animation: "float-up 0.2s ease-out" }}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            )}

            {/* Input area */}
            <div className="border-t border-white/5 glass px-4 py-4 md:px-6">
              <div className="mx-auto max-w-3xl">
                <div
                  className={`relative flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 transition-all ${theme.focusClasses} ${
                    isSending ? "send-flash" : ""
                  }`}
                  style={
                    isSending
                      ? { boxShadow: `0 0 24px ${theme.accentHex}35` }
                      : {}
                  }
                >
                  <textarea
                    ref={textareaRef}
                    id="chat-input"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Ask me anything..."
                    className="max-h-[200px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none scrollbar-thin"
                  />
                  <button
                    id="send-btn"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100`}
                    style={{ boxShadow: `0 4px 16px ${theme.accentHex}35` }}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-gray-600">
                  <Sparkles
                    className={`h-3 w-3 ${theme.accentText} opacity-40`}
                  />
                  Nova AI can make mistakes. Verify important information.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}

// ─── Welcome Screen ────────────────────────────────────────────────────────────
function WelcomeScreen({
  onSuggestion,
}: {
  onSuggestion: (text: string) => void;
}) {
  const theme = useTheme();

  return (
    <div
      className="flex min-h-full flex-col items-center justify-center px-4 py-12"
      style={{ animation: "fadeIn 0.5s ease-out" }}
    >
      {/* 3D Holographic Orb */}
      <div
        className="relative mb-8 flex items-center justify-center orb-ring-wrap"
        style={{ width: 200, height: 200 }}
      >
        {/* Outer diffuse glow */}
        <div
          className={`absolute h-40 w-40 rounded-full bg-gradient-to-br ${theme.gradient} opacity-20 blur-3xl`}
          style={{ animation: "orb-glow 3.5s ease-in-out infinite" }}
        />

        {/* Core orb */}
        <div
          className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${theme.gradient}`}
          style={{
            boxShadow: `0 0 50px ${theme.accentHex}55, 0 0 100px ${theme.accentHex}22, inset 0 2px 6px rgba(255,255,255,0.25)`,
            animation: "orb-float 4s ease-in-out infinite",
          }}
        >
          <Sparkles className="h-11 w-11 text-white drop-shadow-lg" />
        </div>

        {/* Orbit ring 1 — equatorial */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            width: 148,
            height: 148,
            border: `1px solid ${theme.accentHex}35`,
            borderRadius: "50%",
            animation: "orbit-1 5s linear infinite",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: -5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 10,
              height: 10,
              background: theme.accentHex,
              boxShadow: `0 0 10px ${theme.accentHex}`,
            }}
          />
        </div>

        {/* Orbit ring 2 — tilted 60° */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            width: 172,
            height: 172,
            border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: "50%",
            animation: "orbit-2 8s linear infinite",
          }}
        >
          <div
            className="absolute rounded-full bg-white/50"
            style={{
              top: -4,
              left: "50%",
              transform: "translateX(-50%)",
              width: 7,
              height: 7,
            }}
          />
        </div>

        {/* Orbit ring 3 — outer slow */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            width: 196,
            height: 196,
            border: `1px solid rgba(255,255,255,0.05)`,
            borderRadius: "50%",
            animation: "orbit-3 13s linear infinite",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: -3,
              left: "50%",
              transform: "translateX(-50%)",
              width: 5,
              height: 5,
              background: `${theme.accentHex}99`,
            }}
          />
        </div>
      </div>

      {/* Heading */}
      <h2 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        How can I help you today?
      </h2>
      <p
        className="mb-2 text-sm shimmer-text font-medium"
        style={
          { "--accent-hex": theme.accentHex } as React.CSSProperties
        }
      >
        Ask me anything — I'm here to help
      </p>
      <p className="mb-10 max-w-md text-center text-sm text-gray-500">
        From explaining complex topics to helping you brainstorm ideas, write
        code, or just have a chat. I know about programming, AI, science,
        health, business, and more.
      </p>

      {/* Suggestion cards */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={s.text}
              onClick={() => onSuggestion(s.text)}
              className="suggestion-card group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.08]"
              style={{ animation: `float-up 0.4s ease-out ${idx * 0.1}s both` }}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white transition-transform group-hover:scale-110`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className="mt-0.5 text-sm text-gray-300 group-hover:text-white">
                  {s.text}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feature badges */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-600">
        <span className="flex items-center gap-1.5">
          <Brain className={`h-3.5 w-3.5 ${theme.accentText} opacity-50`} />
          Knowledge base
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-400/50" /> Instant responses
        </span>
        <span className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-cyan-400/50" /> 30+ topics
        </span>
        <span className="flex items-center gap-1.5">
          <Code2 className="h-3.5 w-3.5 text-blue-400/50" /> Code examples
        </span>
      </div>
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  message,
  index,
  isLast,
  copiedId,
  onCopy,
  onRegenerate,
  canRegenerate,
  isLatestAi,
}: {
  message: Message;
  index: number;
  isLast: boolean;
  copiedId: string | null;
  onCopy: (content: string, msgId: string) => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
  isLatestAi: boolean;
}) {
  const theme = useTheme();
  const isUser = message.role === "user";
  const isCopied = copiedId === message.id;

  return (
    <div
      className={`group mb-6 flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      style={{
        animation: `slideIn 0.3s ease-out ${Math.min(index * 0.03, 0.15)}s both`,
      }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${
            isUser ? theme.gradientUser : theme.gradient
          }`}
          style={{
            boxShadow: `0 2px 10px ${theme.accentHex}30`,
          }}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <span className="px-1 text-[10px] font-medium text-gray-600">
          {isUser ? "You" : "Nova AI"}
        </span>
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? `rounded-tr-sm bg-gradient-to-br ${theme.gradientUser} text-white`
              : "rounded-tl-sm border border-white/10 bg-white/5 text-gray-200"
          }`}
        >
          {!isUser && isLatestAi ? (
            <TypewriterText content={message.content} active={true} />
          ) : (
            <FormattedContent content={message.content} />
          )}
        </div>

        {/* Action buttons */}
        {!isUser && (
          <div className="flex items-center gap-1 px-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onCopy(message.content, message.id)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-gray-600 transition-colors hover:bg-white/5 hover:text-gray-300"
            >
              {isCopied ? (
                <>
                  <Check className={`h-3 w-3 ${theme.accentText}`} />
                  <span className={theme.accentText}>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
            {canRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-gray-600 transition-colors hover:bg-white/5 hover:text-gray-300"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FormattedContent ──────────────────────────────────────────────────────────
function FormattedContent({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre
          key={key++}
          className="my-2 overflow-x-auto rounded-xl border border-white/10 bg-[#0a0a0f] p-3 text-xs leading-relaxed scrollbar-thin"
        >
          <code className="font-mono text-emerald-300/90">
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      blocks.push(
        <div key={key++} className="flex gap-2">
          <span className="shrink-0 font-semibold text-emerald-400">
            {numMatch[1]}.
          </span>
          <span>{renderInline(numMatch[2])}</span>
        </div>
      );
      i++;
      continue;
    }

    // Bullet point
    const bulletMatch = line.match(/^[-•]\s+(.+)/);
    if (bulletMatch) {
      blocks.push(
        <div key={key++} className="flex gap-2">
          <span className="shrink-0 text-emerald-400">•</span>
          <span>{renderInline(bulletMatch[1])}</span>
        </div>
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      blocks.push(<div key={key++} className="h-2" />);
      i++;
      continue;
    }

    // Regular paragraph
    blocks.push(<div key={key++}>{renderInline(line)}</div>);
    i++;
  }

  return <>{blocks}</>;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let partKey = 0;

  const codeRegex = /`([^`]+)`/;
  const boldRegex = /\*\*(.+?)\*\*/;
  const italicRegex = /\*(.+?)\*/;

  while (remaining.length > 0) {
    const matches: {
      regex: RegExp;
      type: string;
      index: number;
      content: string;
    }[] = [];

    const cm = remaining.match(codeRegex);
    if (cm && cm.index !== undefined)
      matches.push({ regex: codeRegex, type: "code", index: cm.index, content: cm[1] });

    const bm = remaining.match(boldRegex);
    if (bm && bm.index !== undefined)
      matches.push({ regex: boldRegex, type: "bold", index: bm.index, content: bm[1] });

    const im = remaining.match(italicRegex);
    if (im && im.index !== undefined)
      matches.push({ regex: italicRegex, type: "italic", index: im.index, content: im[1] });

    if (matches.length === 0) {
      parts.push(<span key={partKey++}>{remaining}</span>);
      break;
    }

    matches.sort((a, b) => a.index - b.index);
    const first = matches[0];

    if (first.index > 0) {
      parts.push(
        <span key={partKey++}>{remaining.substring(0, first.index)}</span>
      );
    }

    if (first.type === "code") {
      parts.push(
        <code
          key={partKey++}
          className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-emerald-300"
        >
          {first.content}
        </code>
      );
    } else if (first.type === "bold") {
      parts.push(
        <strong key={partKey++} className="font-semibold text-white">
          {first.content}
        </strong>
      );
    } else if (first.type === "italic") {
      parts.push(
        <em key={partKey++} className="text-gray-400">
          {first.content}
        </em>
      );
    }

    const matchText = remaining.substring(first.index);
    const matchResult = matchText.match(first.regex)!;
    remaining = matchText.substring(matchResult[0].length);
  }

  return <>{parts}</>;
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator({
  thinkingMessage,
}: {
  thinkingMessage: string;
}) {
  const theme = useTheme();

  return (
    <div
      className="mb-6 flex gap-3"
      style={{ animation: "slideIn 0.3s ease-out both" }}
    >
      <div className="relative shrink-0">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${theme.gradient}`}
          style={{ boxShadow: `0 2px 10px ${theme.accentHex}35` }}
        >
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div
          className={`absolute inset-0 rounded-lg bg-gradient-to-br ${theme.gradient} opacity-30 pulse-ring`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="px-1 text-[10px] font-medium text-gray-600">
          Nova AI
        </span>
        <div className="flex flex-col gap-2 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-4">
          <div className="flex items-center gap-1.5">
            {[0, 0.2, 0.4].map((delay, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${theme.dotClass}`}
                style={{
                  animation: "bounce-dot 1.4s ease-in-out infinite",
                  animationDelay: `${delay}s`,
                }}
              />
            ))}
          </div>
          <span
            key={thinkingMessage}
            className="text-[11px] text-gray-500"
            style={{ animation: "fadeIn 0.4s ease-out" }}
          >
            {thinkingMessage}
          </span>
        </div>
      </div>
    </div>
  );
}
