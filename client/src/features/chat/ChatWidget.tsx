// AI 聊天浮窗：流式输出 + Markdown 渲染 + 新建/清空对话 + 多风格
import { useState, useRef, useEffect } from 'react';
import { chatService } from '../../services/chat.service';
import type { ChatMessage } from '../../types';

// ─── 风格配置 ──────────────────────────────────────
type ChatStyle = 'classic' | 'letter' | 'pixel';
type ButtonStyle = 'bubble' | 'heart' | 'cat';

const STYLE_KEY = 'our-story-chat-style';
const BTN_KEY = 'our-story-chat-btn';

function loadStyle<T extends string>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); return s ? s as T : fallback; } catch { return fallback; }
}

// ─── 简易 Markdown 渲染 ────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-black/5 px-1 rounded text-xs">$1</code>')
    .replace(/\n/g, '<br/>');
}

// ─── 唤起按钮 ──────────────────────────────────────
function TriggerButton({ style, onClick }: { style: ButtonStyle; onClick: () => void }) {
  if (style === 'heart') {
    return (
      <button onClick={onClick}
        className="fixed bottom-6 right-6 w-16 h-16 flex items-center justify-center text-3xl z-50"
        style={{ animation: 'heartbeat 1.5s ease-in-out infinite', filter: 'drop-shadow(0 4px 12px rgba(255,107,157,0.4))' }}
        title="智能助手">💖</button>
    );
  }
  if (style === 'cat') {
    return (
      <button onClick={onClick}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-white border-2 flex items-center justify-center text-3xl shadow-lg hover:scale-110 transition-transform z-50"
        style={{ borderColor: 'var(--color-border)' }}
        title="智能助手">🐱</button>
    );
  }
  return (
    <button onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform z-50"
      style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' }}
      title="智能助手">💬</button>
  );
}

// ─── 主组件 ────────────────────────────────────────
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatStyle, setChatStyle] = useState<ChatStyle>(() => loadStyle(STYLE_KEY, 'classic'));
  const [btnStyle, setBtnStyle] = useState<ButtonStyle>(() => loadStyle(BTN_KEY, 'bubble'));
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyLoaded = useRef(false);
  const streamControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open && !historyLoaded.current) {
      historyLoaded.current = true;
      chatService.history(30).then((res) => {
        if (res.data?.length) setMessages((prev) => prev.length === 0 ? res.data! : prev);
      });
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // 新建对话（只清空视图，不删数据库）
  const handleNewChat = () => {
    if (streamControllerRef.current) streamControllerRef.current.abort();
    setMessages([]);
    setStreamingText('');
    setSending(false);
  };

  // 加载历史记录
  const handleLoadHistory = async () => {
    const res = await chatService.history(50);
    if (res.data?.length) {
      setMessages(res.data);
    }
  };

  // 清空所有历史（删除数据库记录）
  const handleClearHistory = async () => {
    if (!window.confirm('确定清空所有聊天记录吗？此操作不可恢复。')) return;
    await chatService.clear();
    setMessages([]);
    setStreamingText('');
    setSending(false);
  };

  // 流式发送
  const sendMessage = () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');

    const userMsg: ChatMessage = { id: Date.now(), userId: 0, role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    setStreamingText('');

    let accumulated = '';
    streamControllerRef.current = chatService.sendStream(
      text,
      // onChunk
      (chunk) => {
        accumulated += chunk;
        setStreamingText(accumulated);
      },
      // onDone
      () => {
        const botMsg: ChatMessage = {
          id: Date.now() + 1, userId: 0, role: 'assistant',
          content: accumulated || '嗯嗯~', createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setStreamingText('');
        setSending(false);
      },
      // onError
      (_err) => {
        const botMsg: ChatMessage = {
          id: Date.now() + 1, userId: 0, role: 'assistant',
          content: '抱歉，出了点问题~ 💕', createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setStreamingText('');
        setSending(false);
      },
    );
  };

  // 风格样式
  const windowBg = chatStyle === 'letter' ? 'bg-[#fdf6e3] border-2 border-amber-200'
    : chatStyle === 'pixel' ? 'bg-gray-900 border-4 border-gray-600'
    : '';

  const headerBg = chatStyle === 'letter' ? 'bg-amber-700 text-amber-50'
    : chatStyle === 'pixel' ? 'bg-purple-800 text-green-300 border-b-2 border-gray-600'
    : '';

  const msgAreaBg = chatStyle === 'pixel' ? 'bg-gray-900'
    : chatStyle === 'letter' ? 'bg-[#fdf6e3]'
    : 'bg-gray-50';

  const CHAT_STYLES: { id: ChatStyle; name: string; icon: string }[] = [
    { id: 'classic', name: '经典', icon: '💬' },
    { id: 'letter', name: '信纸', icon: '💌' },
    { id: 'pixel', name: '像素', icon: '🎮' },
  ];
  const BTN_STYLES: { id: ButtonStyle; name: string; icon: string }[] = [
    { id: 'bubble', name: '气泡', icon: '💬' },
    { id: 'heart', name: '心跳', icon: '💖' },
    { id: 'cat', name: '萌宠', icon: '🐱' },
  ];

  return (
    <>
      <TriggerButton style={btnStyle} onClick={() => setOpen(!open)} />

      {open && (
        <div className={`fixed bottom-24 right-6 w-80 h-[500px] rounded-card shadow-xl flex flex-col z-50 animate-fade-in ${windowBg}`}
          style={chatStyle === 'classic' ? { background: 'var(--color-card)' } : undefined}>

          {/* 头部 */}
          <div className={`px-4 py-3 rounded-t-card flex justify-between items-center ${chatStyle === 'classic' ? '' : headerBg}`}
            style={chatStyle === 'classic' ? { background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))`, color: 'white' } : undefined}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="text-sm font-semibold">智能男友助手</h4>
                <span className="text-xs opacity-80">在线</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleNewChat} className="opacity-70 hover:opacity-100 text-xs px-1.5 py-0.5 rounded bg-white/20" title="新建对话（清空当前视图）">新建</button>
              <button onClick={handleLoadHistory} className="opacity-70 hover:opacity-100 text-xs px-1.5 py-0.5 rounded bg-white/20" title="加载历史消息">历史</button>
              <button onClick={handleClearHistory} className="opacity-70 hover:opacity-100 text-xs px-1.5 py-0.5 rounded bg-white/20" title="清空所有记录（不可恢复）">清空</button>
              <button onClick={() => setShowSettings(!showSettings)} className="opacity-70 hover:opacity-100 text-sm ml-1" title="设置">⚙️</button>
              <button onClick={() => setOpen(false)} className="opacity-70 hover:opacity-100 text-xl ml-1">&times;</button>
            </div>
          </div>

          {/* 设置面板 */}
          {showSettings && (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-xs space-y-2 animate-fade-in">
              <div>
                <span className="text-gray-500 mr-2">聊天风格：</span>
                {CHAT_STYLES.map((s) => (
                  <button key={s.id} onClick={() => { setChatStyle(s.id); localStorage.setItem(STYLE_KEY, s.id); }}
                    className={`mr-1.5 px-2 py-0.5 rounded ${chatStyle === s.id ? 'text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    style={chatStyle === s.id ? { background: 'var(--color-primary)' } : undefined}>
                    {s.icon} {s.name}
                  </button>
                ))}
              </div>
              <div>
                <span className="text-gray-500 mr-2">按钮样式：</span>
                {BTN_STYLES.map((s) => (
                  <button key={s.id} onClick={() => { setBtnStyle(s.id); localStorage.setItem(BTN_KEY, s.id); }}
                    className={`mr-1.5 px-2 py-0.5 rounded ${btnStyle === s.id ? 'text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    style={btnStyle === s.id ? { background: 'var(--color-primary)' } : undefined}>
                    {s.icon} {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 消息区 */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${msgAreaBg}`}>
            {messages.length === 0 && !streamingText && (
              <div className={`text-center text-sm py-8 ${chatStyle === 'pixel' ? 'text-green-400' : 'text-[var(--color-text-muted)]'}`}>
                {chatStyle === 'pixel' ? '> HELLO! READY TO CHAT? _' : '你好呀！有什么想问的吗？ 💕'}
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                  chatStyle === 'letter'
                    ? `rounded-sm font-serif ${msg.role === 'user' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-[#fdf6e3] text-gray-700 border border-amber-100'}`
                    : chatStyle === 'pixel'
                    ? `border-2 ${msg.role === 'user' ? 'bg-purple-600 text-white border-purple-800' : 'bg-gray-100 text-gray-800 border-gray-400'}`
                    : `rounded-2xl ${msg.role === 'user' ? 'text-white rounded-br-sm' : 'text-[var(--color-text)] shadow rounded-bl-sm'}`
                }`}
                  style={chatStyle === 'classic'
                    ? { background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-card)' }
                    : chatStyle === 'pixel' ? { fontFamily: '"Courier New", monospace', borderRadius: 0 } : undefined
                  }
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              </div>
            ))}

            {/* 流式输出中 */}
            {streamingText && (
              <div className="flex justify-start">
                <div className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                  chatStyle === 'pixel' ? 'bg-gray-100 text-gray-800 border-2 border-gray-400' : 'shadow rounded-2xl rounded-bl-sm'
                }`}
                  style={chatStyle === 'classic' ? { background: 'var(--color-card)' } : undefined}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingText) + '<span class="animate-pulse">▌</span>' }}
                />
              </div>
            )}

            {sending && !streamingText && (
              <div className="flex justify-start">
                <div className="px-3 py-2 text-sm text-[var(--color-text-muted)]">思考中...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区 */}
          <div className={`flex gap-2 p-3 border-t ${chatStyle === 'pixel' ? 'border-gray-600 bg-gray-800' : ''}`}>
            <input
              type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={chatStyle === 'pixel' ? '> 输入消息...' : '输入消息...'}
              disabled={sending}
              className="flex-1 px-3 py-2 rounded-full text-sm focus:outline-none transition-colors disabled:opacity-50"
              style={chatStyle === 'classic' ? { border: '2px solid var(--color-border)' }
                : chatStyle === 'letter' ? { border: '1px solid #d4a574', background: '#fff8f0' }
                : { background: '#1a1a2e', color: '#00ff00', border: '1px solid #333' }}
            />
            <button onClick={sendMessage} disabled={sending || !input.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}>
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}
