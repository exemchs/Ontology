"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatbotPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Ask me about your ontology schema in natural language. I'll help you write queries.",
};

function getMockResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("equipment")) {
    return "Try this query: `{ queryEquipment(func: has(equipment_id)) { uid equipment_id name } }`";
  }
  if (lower.includes("wafer")) {
    return "Here's a wafer query: `{ queryWafer(func: has(wafer_id)) { uid wafer_id status } }`";
  }
  if (lower.includes("defect")) {
    return "Try this: `{ queryDefect(func: has(defect_id)) { uid defect_id severity location } }`";
  }
  if (lower.includes("recipe")) {
    return "Here's a recipe query: `{ queryRecipe(func: has(recipe_id)) { uid recipe_id name version } }`";
  }
  if (lower.includes("process")) {
    return "Try: `{ queryProcess(func: has(process_id)) { uid process_id step_name duration } }`";
  }
  if (lower.includes("measurement")) {
    return "Try: `{ queryMeasurement(func: has(measurement_id)) { uid measurement_id value unit } }`";
  }
  return "I can help with queries about Equipment, Process, Wafer, Defect, Recipe, and Measurement types. Try asking about a specific type!";
}

export function ChatbotPanel({ isOpen, onToggle }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getMockResponse(trimmed);
      const assistantMsg: Message = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
        onClick={onToggle}
      >
        <MessageCircle className="size-5" />
        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-chart-1 ring-2 ring-background" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 flex w-80 flex-col shadow-lg border-border/60 overflow-hidden" style={{ height: "24rem" }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-4 text-primary" />
          <span className="text-sm font-medium">Natural Language Query</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onToggle}
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground">
              Thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border/40 p-2">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your schema..."
            className="flex-1 rounded-md border border-border/60 bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Send className="size-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
