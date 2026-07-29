"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatAskAlphaPrice } from "@/lib/askAlpha";
import { supabase } from "@/lib/supabase";
import type { PaymentStatus } from "@/lib/clientAccess";

type Order = {
  id: string;
  product_title: string;
  question_credits: number;
  amount_lkr: number;
  status: PaymentStatus;
  reference: string;
};

type Message = {
  id: string;
  thread_id: string;
  sender_role: string;
  body: string;
  created_at: string;
};

type Thread = {
  id: string;
  order_id: string;
  subject: string;
  status: "open" | "answered" | "closed";
  updated_at: string;
  messages: Message[];
};

const statusLabel: Record<PaymentStatus, string> = {
  pending_verification: "Pending verification",
  verified: "Verified",
  rejected: "Needs attention",
};

export default function AskAlphaClientDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) {
      router.replace("/ask-alpha");
      return;
    }
    setUserId(user.id);

    const { data: orderData } = await supabase
      .from("ask_alpha_orders")
      .select("id, product_title, question_credits, amount_lkr, status, reference")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });
    const nextOrders = (orderData || []) as Order[];
    if (!nextOrders.length) {
      setOrders([]);
      setThreads([]);
      setLoading(false);
      return;
    }
    setOrders(nextOrders);

    const { data: threadData } = await supabase
      .from("ask_alpha_threads")
      .select("id, order_id, subject, status, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    const baseThreads = (threadData || []) as Omit<Thread, "messages">[];
    const ids = baseThreads.map((thread) => thread.id);
    const { data: messageData } = ids.length
      ? await supabase.from("ask_alpha_messages").select("id, thread_id, sender_role, body, created_at").in("thread_id", ids).order("created_at")
      : { data: [] };
    const grouped = ((messageData || []) as Message[]).reduce<Record<string, Message[]>>((map, item) => {
      map[item.thread_id] = [...(map[item.thread_id] || []), item];
      return map;
    }, {});
    setThreads(baseThreads.map((thread) => ({ ...thread, messages: grouped[thread.id] || [] })));
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const verifiedOrders = orders.filter((order) => order.status === "verified");
  const totalCredits = verifiedOrders.reduce((sum, order) => sum + Number(order.question_credits || 0), 0);
  const remainingCredits = Math.max(0, totalCredits - threads.length);
  const availableOrder = useMemo(
    () => verifiedOrders.find((order) => threads.filter((thread) => thread.order_id === order.id).length < order.question_credits),
    [threads, verifiedOrders],
  );

  const sendQuestion = async () => {
    if (!availableOrder || !subject.trim() || !question.trim()) {
      setMessage(availableOrder ? "Please enter a subject and question." : "A verified question credit is required.");
      return;
    }
    setActiveId("new");
    setMessage("");
    const { data: thread, error } = await supabase.from("ask_alpha_threads").insert({
      order_id: availableOrder.id,
      user_id: userId,
      subject: subject.trim(),
      status: "open",
    }).select("id").single();
    if (error || !thread) {
      setMessage(error?.message || "Unable to create the question.");
      setActiveId("");
      return;
    }
    const { error: messageError } = await supabase.from("ask_alpha_messages").insert({
      thread_id: thread.id,
      sender_id: userId,
      sender_role: "client",
      body: question.trim(),
    });
    if (messageError) setMessage(messageError.message);
    else {
      setSubject("");
      setQuestion("");
      await load();
    }
    setActiveId("");
  };

  const reply = async (threadId: string) => {
    if (remainingCredits <= 0) {
      setMessage("You have no question credits remaining. Purchase more credits to continue messaging.");
      return;
    }

    const body = (drafts[threadId] || "").trim();
    if (!body) return;
    setActiveId(threadId);
    const { error } = await supabase.from("ask_alpha_messages").insert({
      thread_id: threadId,
      sender_id: userId,
      sender_role: "client",
      body,
    });
    if (!error) {
      await supabase.from("ask_alpha_threads").update({ status: "open" }).eq("id", threadId);
      setDrafts((current) => ({ ...current, [threadId]: "" }));
      await load();
    } else setMessage(error.message);
    setActiveId("");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/ask-alpha");
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#F6F3EC] font-black text-gray-400">Loading Q&amp;A dashboard</div>;

  return (
    <div className="min-h-screen bg-[#F6F3EC] px-4 py-10 text-[#14161D] sm:px-6">
      <motion.div className="mx-auto max-w-5xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="text-xs font-black uppercase tracking-[0.18em] text-[#E1472B]">Ask Alpha client</div><h1 className="mt-2 font-outfit text-4xl font-black">Your Q&amp;A Dashboard</h1><p className="mt-2 font-semibold text-gray-500">View your package, credits, questions and replies.</p></div>
          <Button variant="secondary" onClick={signOut} className="gap-2 rounded-xl"><LogOut size={16} />Sign out</Button>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#14161D] p-6 text-white"><div className="text-xs font-black uppercase tracking-wider text-white/60">Credits remaining</div><div className="mt-2 font-outfit text-5xl font-black">{remainingCredits}</div></div>
          <div className="rounded-2xl border border-[#E7E1D3] bg-white p-6"><div className="text-xs font-black uppercase tracking-wider text-gray-400">Selected packages</div><div className="mt-3 space-y-2">{orders.length ? orders.map((order) => <div key={order.id} className="flex justify-between gap-3 text-sm"><span className="font-black">{order.product_title}</span><span className="font-bold text-gray-500">{formatAskAlphaPrice(order.amount_lkr)} · {statusLabel[order.status]}</span></div>) : <div className="text-sm font-semibold text-gray-500">No Ask Alpha package submitted yet.</div>}</div></div>
        </div>

        {!orders.length ? (
          <div className="mb-6 rounded-2xl border border-[#E7E1D3] bg-white p-5">
            <div className="font-black">Complete your Ask Alpha package selection</div>
            <p className="mt-1 text-sm font-semibold text-gray-500">Choose a package and submit its payment slip before messaging can be activated.</p>
            <Link href="/ask-alpha" className="mt-3 inline-flex rounded-xl bg-[#E1472B] px-4 py-2 text-sm font-black text-white">Choose a package</Link>
          </div>
        ) : !verifiedOrders.length && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <div className="font-black">Messaging unlocks after payment verification</div>
            <p className="mt-1 text-sm font-semibold leading-relaxed">
              Your selected Ask Alpha package is shown above. Once its payment is verified, its question credits and messaging form will activate here.
            </p>
            <Link href="/signup/success" className="mt-3 inline-flex text-sm font-black underline">Check payment status</Link>
          </div>
        )}

        {remainingCredits > 0 && <section className="mb-6 rounded-2xl border border-[#E7E1D3] bg-white p-5 sm:p-7"><h2 className="font-outfit text-2xl font-black">Ask a new question</h2><div className="mt-4 grid gap-3"><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Short subject" className="rounded-xl border border-[#E7E1D3] px-4 py-3"/><textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} placeholder="Write your question..." className="resize-none rounded-xl border border-[#E7E1D3] px-4 py-3"/><Button onClick={sendQuestion} isLoading={activeId === "new"} className="w-fit gap-2 rounded-xl bg-[#E1472B] text-white"><Send size={16} />Send question</Button></div></section>}
        {message && <div className="mb-5 rounded-xl bg-[#FBE4DE] p-4 text-sm font-bold">{message}</div>}

        <section className="space-y-4">
          {threads.length ? threads.map((thread) => <article key={thread.id} className="rounded-2xl border border-[#E7E1D3] bg-white p-5 sm:p-6"><div className="mb-4 flex justify-between gap-3"><h2 className="font-outfit text-xl font-black">{thread.subject}</h2><span className="text-xs font-black uppercase text-gray-400">{thread.status}</span></div><div className="space-y-2">{thread.messages.map((item) => <div key={item.id} className={`flex ${item.sender_role === "client" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-xl p-3 text-sm ${item.sender_role === "client" ? "bg-[#14161D] text-white" : "bg-[#F6F3EC]"}`}><p className="whitespace-pre-wrap">{item.body}</p><div className="mt-1 text-[10px] opacity-50">{new Date(item.created_at).toLocaleString()}</div></div></div>)}</div>{thread.status !== "closed" && <div className="mt-4"><div className="flex gap-2"><textarea value={drafts[thread.id] || ""} onChange={(event) => setDrafts((current) => ({ ...current, [thread.id]: event.target.value }))} rows={2} disabled={remainingCredits <= 0} placeholder={remainingCredits > 0 ? "Reply..." : "No credits remaining"} className="flex-1 resize-none rounded-xl border border-[#E7E1D3] px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"/><Button onClick={() => reply(thread.id)} isLoading={activeId === thread.id} disabled={remainingCredits <= 0} className="self-end rounded-xl disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500">Reply</Button></div>{remainingCredits <= 0 && <p className="mt-2 text-sm font-bold text-[#E1472B]">Purchase more credits to continue this conversation.</p>}</div>}</article>) : <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center"><MessageCircle className="mx-auto text-gray-400" /><div className="mt-3 font-black">No questions yet</div></div>}
        </section>
        <div className="mt-6 text-center"><Link href="/ask-alpha" className="text-sm font-black text-[#E1472B]">Buy more credits</Link></div>
      </motion.div>
    </div>
  );
}
