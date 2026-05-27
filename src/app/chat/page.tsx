"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  table?: { match: string; yes: string; no: string }[];
  order?: {
    market: string;
    side: string;
    price: string;
    shares: string;
    total: string;
    potential: string;
  };
}

const DEMO_RESPONSES: Record<string, Message> = {
  "what football matches can i bet on?": {
    role: "assistant",
    content: "Here are the upcoming FIFA World Cup 2026 matches on Limitless:",
    table: [
      { match: "Mexico vs South Africa (Jun 11)", yes: "67%", no: "14%" },
      { match: "South Korea vs Czech Republic (Jun 12)", yes: "37%", no: "36%" },
      { match: "Canada vs Bosnia & Herzegovina (Jun 12)", yes: "54%", no: "23%" },
      { match: "Argentina vs Algeria (Jun 17)", yes: "71%", no: "12%" },
      { match: "Germany vs Curacao (Jun 14)", yes: "94%", no: "5%" },
    ],
  },
  "bet $10 on argentina to beat algeria": {
    role: "assistant",
    content: "Here's your order preview. Please confirm:",
    order: {
      market: "Argentina vs Algeria \u2014 Jun 17",
      side: "BUY YES",
      price: "$0.71",
      shares: "14.08",
      total: "$10.00 USDC",
      potential: "$14.08 if Argentina wins (+40.8%)",
    },
  },
  confirm: {
    role: "assistant",
    content:
      "\u2705 Order placed!\n\nArgentina vs Algeria \u2014 YES @ $0.71\nShares: 14.08 | Cost: $10.00 USDC\nPotential payout: $14.08 (40.8% return)\n\nI'll notify you when the market resolves. Good luck! \u26bd",
  },
  "show my positions": {
    role: "assistant",
    content:
      "Your open positions:\n\n\u26bd Argentina vs Algeria YES @ $0.71\n   14.08 shares | Cost: $10.00 | Current value: $11.26 | P&L: +$1.26\n\n\u26bd Germany vs Curacao YES @ $0.94\n   21.28 shares | Cost: $20.00 | Current value: $20.85 | P&L: +$0.85\n\nTotal invested: $30.00 | Current value: $32.11 | Total P&L: +$2.11",
  },
  "will eth hit $5k by year end?": {
    role: "assistant",
    content:
      "Found a market: \"Will ETH be above $5,000 by EOY 2026\"\n\nCurrent odds:\n  YES: 23% ($0.23/share)\n  NO:  77% ($0.77/share)\n\nVolume: $142,850 | Liquidity: $38,200\n\nMy analysis: Current ETH price is ~$2,580. A move to $5K requires a 94% rally in 7 months. The market is pricing this fairly at 23%. If you believe in the post-halving cycle, YES at $0.23 offers a 4.3x return if it hits.\n\nWant to place a bet?",
  },
};

function getResponse(input: string): Message {
  const lower = input.toLowerCase().trim();
  if (DEMO_RESPONSES[lower]) return DEMO_RESPONSES[lower];

  if (lower.includes("football") || lower.includes("soccer") || lower.includes("world cup")) {
    return DEMO_RESPONSES["what football matches can i bet on?"];
  }
  if (lower.includes("eth") || lower.includes("bitcoin") || lower.includes("crypto")) {
    return DEMO_RESPONSES["will eth hit $5k by year end?"];
  }
  if (lower.includes("position") || lower.includes("portfolio") || lower.includes("bets")) {
    return DEMO_RESPONSES["show my positions"];
  }
  if (lower.includes("bet") || lower.includes("buy") || lower.includes("wager")) {
    return {
      role: "assistant",
      content:
        "I'd be happy to help you place a bet! Let me search for that market on Limitless.\n\nTo place real bets, you'll need to:\n1. Connect your wallet on Base\n2. Have USDC in your wallet\n3. Set up a Limitless API key\n\nFor now, try one of the demo prompts below to see how the flow works!",
    };
  }

  return {
    role: "assistant",
    content:
      "I can help you with prediction markets on Limitless! Try asking me:\n\n\u2022 \"What football matches can I bet on?\"\n\u2022 \"Will ETH hit $5K by year end?\"\n\u2022 \"Bet $10 on Argentina to beat Algeria\"\n\u2022 \"Show my positions\"\n\nOr tap one of the quick prompts below.",
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    (text: string) => {
      const userMsg: Message = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      const delay = 600 + Math.random() * 800;
      setTimeout(() => {
        const response = getResponse(text);
        setMessages((prev) => [...prev, response]);
        setIsTyping(false);
        inputRef.current?.focus();
      }, delay);
    },
    []
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;
    sendMessage(text);
  }, [input, isTyping, sendMessage]);

  const quickPrompts = [
    "What football matches can I bet on?",
    "Bet $10 on Argentina to beat Algeria",
    "Show my positions",
    "Will ETH hit $5K by year end?",
  ];

  return (
    <div className="chat-root">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar">L</div>
          <div>
            <div className="chat-header-title">LimitlessBot</div>
            <div className="chat-header-status">
              <span className="status-dot" />
              Live Demo \u00b7 Powered by Aomi + Limitless on Base
            </div>
          </div>
        </div>
        <a href="/" className="chat-back-btn">
          \u2190 Back
        </a>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">\u26bd</div>
            <h2 className="chat-empty-title">Welcome to LimitlessBot</h2>
            <p className="chat-empty-desc">
              Your AI prediction market assistant. Ask about markets, get odds
              analysis, or place a bet \u2014 all by chatting.
            </p>
            <div className="chat-prompts-grid">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="chat-prompt-btn"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-msg ${msg.role === "user" ? "chat-msg-user" : "chat-msg-bot"}`}
          >
            <div className="chat-bubble">
              <p className="chat-bubble-text">{msg.content}</p>

              {msg.table && (
                <div className="chat-table-wrap">
                  <table className="chat-table">
                    <thead>
                      <tr>
                        <th>Match</th>
                        <th>YES</th>
                        <th>NO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {msg.table.map((row, j) => (
                        <tr key={j}>
                          <td>{row.match}</td>
                          <td className="text-green">{row.yes}</td>
                          <td className="text-red">{row.no}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {msg.order && (
                <div className="chat-order">
                  <div className="chat-order-row">
                    <span className="chat-order-label">Market</span>
                    <span className="chat-order-value">{msg.order.market}</span>
                  </div>
                  <div className="chat-order-row">
                    <span className="chat-order-label">Side</span>
                    <span className="chat-order-value text-green">{msg.order.side}</span>
                  </div>
                  <div className="chat-order-row">
                    <span className="chat-order-label">Price</span>
                    <span className="chat-order-value">{msg.order.price}</span>
                  </div>
                  <div className="chat-order-row">
                    <span className="chat-order-label">Shares</span>
                    <span className="chat-order-value">{msg.order.shares}</span>
                  </div>
                  <div className="chat-order-row">
                    <span className="chat-order-label">Total Cost</span>
                    <span className="chat-order-value">{msg.order.total}</span>
                  </div>
                  <div className="chat-order-row chat-order-highlight">
                    <span className="chat-order-label">Potential Payout</span>
                    <span className="chat-order-value text-green">{msg.order.potential}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-msg chat-msg-bot">
            <div className="chat-bubble chat-typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        {messages.length === 0 && (
          <div className="chat-quick-row">
            {quickPrompts.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="chat-quick-btn"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div className="chat-input-wrap">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask about markets, odds, or place a bet..."
            className="chat-input"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="chat-send-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
        <p className="chat-disclaimer">
          This is a demo. Prediction markets involve risk. AI suggestions are not financial advice.
        </p>
      </div>
    </div>
  );
}
