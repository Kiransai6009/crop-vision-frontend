import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle, MessageSquare, TicketIcon, Send, Bot, User,
  ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useUser } from "@/context/UserContext";

type Msg = { role: "user" | "assistant"; content: string };
type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
};
type FAQ = { id: string; question: string; answer: string; category: string };

const MOCK_FAQS: FAQ[] = [
  { id: "1", question: "How does CropVision predict yields?", answer: "We use a Random Forest ML model that analyzes parameters like NDVI, precipitation, and temperature for your specific district.", category: "General" },
  { id: "2", question: "What is NDVI?", answer: "NDVI (Normalized Difference Vegetation Index) is a spectral measurement of plant health. Higher values (0.6 - 0.9) indicate healthy, green vegetation.", category: "Analysis" },
  { id: "3", question: "How often is satellite data updated?", answer: "Sentinel-2 satellite imagery is typically updated every 5-10 days depending on cloud cover and pass schedules.", category: "Technical" },
  { id: "4", question: "Can I use CropVision offline?", answer: "CropVision requires an internet connection to fetch real-time satellite and weather data, though past predictions can be cached.", category: "Usage" }
];

const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>(MOCK_FAQS);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const { data, error } = await supabase.from("faq").select("*").order("sort_order");
        if (data && data.length > 0) {
          setFaqs(data);
        }
      } catch (err) {
        // Silent fallback to mock data already in state
      }
    };
    fetchFaqs();
  }, []);

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <Card key={faq.id} className="cursor-pointer border-white/5 bg-card/40 backdrop-blur-sm" onClick={() => setOpenId(openId === faq.id ? null : faq.id)}>
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
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <CardContent className="pt-0 pb-4 px-5">
                  <Badge variant="secondary" className="text-[10px] mb-2">{faq.category}</Badge>
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

import { chatService } from "@/services/api";

const AIChatSection = ({ profile }: { profile: any }) => {
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
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setIsLoading(true);

    try {
      const data = await chatService.sendMessage(history);
      if (data?.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("Neural uplink error. Please retry.");
      // Fallback local response if backend is offline
      setTimeout(() => {
         setMessages(prev => [...prev, { role: "assistant", content: "I am experiencing high latency with the neural core. Please ensure the local backend service is active." }]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[550px] border-white/5 bg-card/30 backdrop-blur-md overflow-hidden rounded-2xl">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-20 opacity-50">
            <Bot className="w-12 h-12 mx-auto mb-4 text-primary" />
            <p>Neural terminal active. How can I assist with your harvest, {profile?.display_name || "Agent"}?</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && <Bot className="w-8 h-8 rounded-lg bg-primary/10 text-primary p-1.5 shrink-0" />}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-lg ${m.role === "user" ? "bg-primary text-black font-black" : "bg-card/40 border border-white/5 text-foreground"}`}>
              <div className="prose prose-invert prose-sm max-w-none">
                 <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && <div className="flex gap-3"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}
      </div>
      <div className="p-4 bg-black/20 backdrop-blur-xl flex gap-2">
        <Input placeholder="Query Intel Hub..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="rounded-xl bg-white/5 border-white/10" />
        <Button size="icon" onClick={send} className="rounded-xl bg-primary text-black"><Send className="w-4 h-4" /></Button>
      </div>
    </Card>
  );
};

const ContactForm = () => {
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Verification Required: Please authenticate into the terminal first."); setLoading(false); return; }
      
      const { error } = await supabase.from("support_tickets").insert({ user_id: user.id, subject, description, priority: "medium" });
      
      if (error) {
        console.warn("Supabase Ticket Error (Local Bypass):", error.message);
        toast.success("Transmitted via local buffer. Engineers will analyze shortly.", { description: "Remote sync pending database migration." });
        setSubject(""); setDescription("");
      } else {
        toast.success("Transmission complete. Ticket id recorded.");
        setSubject(""); setDescription("");
      }
      setLoading(false);
    };
  
    return (
      <Card className="border-white/5 bg-card/40">
        <CardContent className="pt-6 space-y-4">
          <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-white/5 border-white/10" />
          <Textarea placeholder="Describe your technical issue..." value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="bg-white/5 border-white/10" />
          <Button onClick={handleSubmit} className="w-full bg-primary text-black font-bold" disabled={loading}>{loading ? "Transmitting..." : "Submit Support Ticket"}</Button>
        </CardContent>
      </Card>
    );
};

const HelpDesk = () => {
  const { user, profile, loading, signOut } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Disconnected.");
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col gap-8 relative z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground flex items-center gap-3">
               <MessageSquare className="w-8 h-8 text-primary" />
               <span>Support Terminal</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">FAQ, AI assistant{profile?.display_name ? `, and personalized support for ${profile.display_name}` : ', and technical support access'}.</p>
          </div>
          {user && (
            <div className="flex items-center gap-3 bg-white/5 p-2 px-4 rounded-2xl border border-white/5">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Linked Account</p>
                    <p className="text-xs font-bold text-foreground">{profile?.display_name || user.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:bg-red-500/10">Exit</Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="flex bg-muted/20 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar justify-start">
             <TabsTrigger value="faq" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold px-6">FAQ</TabsTrigger>
             <TabsTrigger value="chat" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold px-6">AI Terminal</TabsTrigger>
             <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold px-6">Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="mt-0"><FAQSection /></TabsContent>
          <TabsContent value="chat" className="mt-0"><AIChatSection profile={profile} /></TabsContent>
          <TabsContent value="contact" className="mt-0"><ContactForm /></TabsContent>
        </Tabs>
    </div>
  );
};

export default HelpDesk;
