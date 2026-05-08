// AI 聊天浮窗：对话消息列表 + 输入框
import { useState, useRef, useEffect } from 'react';
import { chatService } from '../../services/chat.service';
import type { ChatMessage } from '../../types';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyLoaded = useRef(false);

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
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    const userMsg: ChatMessage = { id: Date.now(), userId: 0, role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await chatService.send(text);
      const botMsg: ChatMessage = { id: Date.now() + 1, userId: 0, role: 'assistant', content: res.data!.reply, createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, userId: 0, role: 'assistant', content: '抱歉，出了点问题~', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform z-50"
        title="智能助手"
      >
        💬
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[460px] bg-white rounded-card shadow-xl flex flex-col z-50 animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-3 rounded-t-card flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="text-sm font-semibold">智能男友助手</h4>
                <span className="text-xs opacity-80">在线</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-xl">&times;</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                你好呀！我是你的智能男友助手 💕<br />有什么想问的吗？
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white text-gray-700 shadow rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 shadow px-3 py-2 rounded-2xl rounded-bl-sm text-sm">
                  思考中...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="输入消息..."
              className="flex-1 px-3 py-2 border-2 border-love-border rounded-full text-sm focus:border-primary focus:outline-none transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
