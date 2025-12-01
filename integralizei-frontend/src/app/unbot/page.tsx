"use client";

import { useState, useRef, useEffect } from "react";
import Navbar2 from "../../components/Navbar2/Navbar2";
import { Send, Sparkles, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css"; 

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export default function UnBotPage() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const handleSend = async (textToSend: string = input) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", parts: [{ text: textToSend }] };
    setHistory((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: [...history, userMsg], 
        }),
      });

      if (!res.ok) throw new Error("Erro na comunicação");

      const data = await res.json();
      
      const aiMsg: ChatMessage = { role: "model", parts: [{ text: data.text }] };
      setHistory((prev) => [...prev, aiMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { 
        role: "model", 
        parts: [{ text: "❌ **Erro:** Não consegui conectar ao servidor. Tente novamente mais tarde." }] 
      };
      setHistory((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sugestoes = [
    "Como calculo minha integralização?",
    "O que é o IRA?",
    "Como o site ajuda na matrícula?",
    "Me surpreenda com um fato sobre a UnB"
  ];

  return (
    // CORRIGIDO AQUI: bg-gray-50 -> bg-white
    <div className="min-h-screen bg-white flex flex-col font-[Inter]">
      <Navbar2 />

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-6 px-4">
        
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#006633] to-[#003366] bg-clip-text text-transparent">
            UnBot
          </h1>
          <p className="text-gray-500 text-sm mt-1">Seu assistente virtual de integralização</p>
        </div>

        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col h-[70vh] border border-gray-200 overflow-hidden">
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
            {history.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <Bot size={64} className="mb-4 text-[#006633]" />
                <p>Olá! Pergunte sobre IRA, créditos ou integralização.</p>
              </div>
            )}

            {history.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`
                    relative p-5 rounded-2xl text-[15px] leading-7 shadow-sm transition-all
                    ${msg.role === "user" 
                      ? "bg-gradient-to-br from-[#006633] to-[#003366] text-white rounded-br-none max-w-[85%]" 
                      : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200 w-full max-w-[90%]"}
                  `}
                >
                  <div className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wide ${msg.role === "user" ? "text-green-100 opacity-80" : "text-[#006633] opacity-70"}`}>
                    {msg.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
                    {msg.role === "user" ? "Você" : "UnBot"}
                  </div>
                  
                  <div className={`
                    prose prose-sm max-w-none break-words
                    ${msg.role === "user" ? "prose-invert text-white" : "text-gray-800"}
                    
                    /* Estilos para Tabelas */
                    prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:my-4 prose-table:w-full
                    prose-th:bg-gray-200 prose-th:p-2 prose-th:border prose-th:border-gray-300 prose-th:text-left prose-th:text-gray-900
                    prose-td:p-2 prose-td:border prose-td:border-gray-300
                    
                    /* Ajustes de Listas */
                    prose-p:my-2 prose-p:leading-relaxed
                    prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
                    prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-4
                    prose-li:my-0.5
                    prose-strong:font-bold
                    prose-headings:font-bold prose-headings:my-3 prose-headings:text-base
                    
                    prose-math:overflow-x-auto prose-math:block prose-math:py-2
                  `}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.parts[0].text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start w-full">
                <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none flex items-center gap-2 border border-gray-200">
                  <span className="text-xs font-bold text-[#006633] uppercase mr-2">UnBot</span>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200">
            {history.length < 2 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                {sugestoes.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className="whitespace-nowrap px-4 py-2 bg-white border border-[#006633]/20 text-[#006633] text-xs font-semibold rounded-full hover:bg-[#006633] hover:text-white transition-colors shadow-sm"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-300 focus-within:border-[#006633] focus-within:ring-1 focus-within:ring-[#006633] transition-all shadow-sm">
              <input
                type="text"
                className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700 placeholder-gray-400"
                placeholder="Digite sua dúvida..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-3 bg-gradient-to-r from-[#006633] to-[#003366] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}