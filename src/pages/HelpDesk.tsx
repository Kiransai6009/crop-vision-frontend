import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle, MessageSquare, TicketIcon, Send, Bot, User,
  ChevronDown, ChevronUp, Plus, Clock, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };
type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
};
type FAQ = { id: string; question: string; answer: string; category: string };

// ─── FAQ Section ───
const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("faq").select("*").order("sort_order").then(({ data }) => {
      if (data) setFaqs(data);
    });
  }, []);

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <Card key={faq.id} className="cursor-pointer" onClick={() => setOpenId(openId === faq.id ? null : faq.id)}>
          <CardHeader className="py-4 px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium text-sm text-foreground">{faq.question}</span>
              </div>
              {openId === faq.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </CardHeader>
          <AnimatePresence>
            {openId === faq.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                <CardContent className="pt-0 pb-4 px-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{faq.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );
};

// ─── AI Chat ───
const AIChatSection = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/helpdesk-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) { toast.error("Too many requests. Please wait a moment."); }
        else if (resp.status === 402) { toast.error("AI credits exhausted."); }
        else { toast.error("AI service error."); }
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      toast.error("Failed to connect to AI.");
    }
    setIsLoading(false);
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <CardTitle className="text-base font-display">AI Assistant</CardTitle>
        </div>
        <CardDescription className="text-xs">Ask anything about CropVision</CardDescription>
      </CardHeader>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-12">
            <Bot className="w-10 h-10 mx-auto mb-3 text-primary/40" />
            <p>Hi! How can I help you today?</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && <Bot className="w-5 h-5 text-primary mt-1 shrink-0" />}
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
            {m.role === "user" && <User className="w-5 h-5 text-muted-foreground mt-1 shrink-0" />}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2">
            <Bot className="w-5 h-5 text-primary mt-1" />
            <div className="bg-muted rounded-xl px-4 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          disabled={isLoading}
        />
        <Button size="icon" onClick={send} disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

// ─── Contact Form ───
const ContactForm = () => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please sign in to submit a ticket."); setLoading(false); return; }

    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject,
      description,
      priority,
    });
    if (error) { toast.error("Failed to create ticket."); }
    else { toast.success("Ticket created!"); setSubject(""); setDescription(""); setPriority("medium"); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-display">Submit a Ticket</CardTitle>
        <CardDescription className="text-xs">We'll get back to you as soon as possible</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="Brief summary of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={200} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea placeholder="Describe your issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} required maxLength={2000} rows={5} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// ─── Tickets List ───
const TicketsList = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
      if (data) setTickets(data);
      setLoading(false);
    };
    load();
  }, []);

  const statusIcon = (s: string) => {
    if (s === "open") return <AlertCircle className="w-3.5 h-3.5 text-secondary" />;
    if (s === "in_progress") return <Clock className="w-3.5 h-3.5 text-accent" />;
    return <CheckCircle2 className="w-3.5 h-3.5 text-primary" />;
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-3">
      {tickets.length === 0 ? (
        <Card className="py-12 text-center">
          <TicketIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">No tickets yet</p>
        </Card>
      ) : (
        tickets.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon(t.status)}
                  <span className="font-medium text-sm truncate">{t.subject}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant={t.priority === "high" ? "destructive" : "secondary"} className="text-xs capitalize">{t.priority}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

// ─── Main Page ───
const HelpDesk = () => {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Help Desk</h1>
            <p className="text-sm text-muted-foreground mt-1">FAQ, AI assistant, and support tickets</p>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 bg-muted p-1">
            <TabsTrigger value="faq" className="gap-1.5 text-xs sm:text-sm py-2.5">
              <HelpCircle className="w-3.5 h-3.5" /> FAQ
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1.5 text-xs sm:text-sm py-2.5">
              <Bot className="w-3.5 h-3.5" /> AI Chat
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5 text-xs sm:text-sm py-2.5">
              <MessageSquare className="w-3.5 h-3.5" /> Contact
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-1.5 text-xs sm:text-sm py-2.5">
              <TicketIcon className="w-3.5 h-3.5" /> Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq"><FAQSection /></TabsContent>
          <TabsContent value="chat"><AIChatSection /></TabsContent>
          <TabsContent value="contact">
            {user ? <ContactForm /> : (
              <Card className="py-12 text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm mb-4">Sign in to submit a support ticket</p>
                <Button onClick={() => navigate("/auth")}>Sign In</Button>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="tickets">
            {user ? <TicketsList /> : (
              <Card className="py-12 text-center">
                <TicketIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm mb-4">Sign in to view your tickets</p>
                <Button onClick={() => navigate("/auth")}>Sign In</Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelpDesk;
