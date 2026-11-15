"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Attachment = { type: string; bucket: string; path: string; media: string; name: string };
export function MessageBody({ body }: { body: string }) {
  let attachment: Attachment | null = null;
  try { const v = JSON.parse(body); if (v.type === 'attachment' && v.bucket === 'message-attachments' && typeof v.path === 'string') attachment = v; } catch {}
  const path = attachment?.path;
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setUrl(''); setError(false);
    if (path) supabase.storage.from('message-attachments').createSignedUrl(path, 3600).then(({data,error}) => { if (active) { setUrl(data?.signedUrl || ''); setError(Boolean(error)); } });
    return () => { active = false; };
  }, [path]);
  if (!attachment) return <p className="whitespace-pre-wrap">{body}</p>;
  if (error) return <p>Unable to load attachment. Refresh to retry.</p>;
  if (!url) return <p>Loading attachment…</p>;
  if (attachment.media === 'image') return <img src={url} alt={attachment.name || 'Client attachment'} className="max-h-96 max-w-full rounded-xl" />;
  if (attachment.media === 'video') return <video src={url} controls preload="metadata" className="max-h-96 max-w-full rounded-xl" />;
  return <audio src={url} controls preload="metadata" className="max-w-full" />;
}

type Payload = { name?: string; kcal?: number; protein?: number; eaten?: boolean; extra?: boolean; deleted?: boolean; sets?: {kg: number | string; reps: number; done: boolean}[] };
type Log = { item_id: string; kind: string; payload: Payload };
export function ClientDailyActivity({ clientId }: { clientId: string }) {
  const [date,setDate] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; });
  const [planned,setPlanned] = useState(0);
  const [rows,setRows] = useState<Log[]>([]);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  useEffect(() => { let active = true; setLoading(true); setError('');
    supabase.from('client_meal_plans').select('days,start_date').eq('client_id',clientId).maybeSingle().then(({data}) => {
      if (!active) return;
      const weekday = new Intl.DateTimeFormat('en-US',{weekday:'long'}).format(new Date(date+'T12:00:00'));
      const day = (data?.days as {day?:string;dayOfWeek?:string;meals?:{calories?:number;kcal?:number}[]}[] | null)?.find(d => (d.day || d.dayOfWeek || '').slice(0,3).toLowerCase() === weekday.slice(0,3).toLowerCase());
      setPlanned(data?.start_date && date < data.start_date ? 0 : (day?.meals || []).reduce((sum,m)=>sum+Number(m.calories || m.kcal || 0),0));
    });
    supabase.from('client_daily_logs').select('item_id,kind,payload').eq('client_id',clientId).eq('log_date',date).then(({data,error}) => { if (active) {setRows((data || []) as Log[]);setError(error ? 'Unable to load daily activity.' : '');setLoading(false);} });
    return () => {active=false;};
  },[clientId,date]);
  const meals = rows.filter(r => r.kind === 'meal' && r.payload.eaten && !r.payload.deleted);
  return <details className="my-4 rounded-xl border p-4"><summary className="cursor-pointer font-bold">Client daily activity</summary>
    <label className="my-3 block">Date <input aria-label="Activity date" type="date" value={date} onChange={e => setDate(e.target.value)} className="ml-2 rounded border p-2 text-black" /></label>
    {loading ? <p>Loading…</p> : error ? <p role="alert">{error}</p> : <>
      <p>{planned} kcal planned ? {meals.reduce((s,r) => s+(r.payload.kcal || 0),0)} kcal eaten · {meals.reduce((s,r) => s+(r.payload.protein || 0),0)}g protein</p>
      {meals.map(r => <p key={r.item_id}>{r.payload.name} · {r.payload.kcal} kcal {r.payload.extra ? '· Extra meal' : ''}</p>)}
      {rows.filter(r=>r.kind==='exercise').map(r=><div key={r.item_id} className="mt-3"><strong>{r.payload.name}</strong>{r.payload.sets?.map((s,i)=><p key={i}>Set {i+1}: {s.reps} reps/sec · {s.kg || 0} kg {s.done ? '✓' : ''}</p>)}</div>)}
      {!rows.length && <p>No activity logged for this date.</p>}
    </>}
  </details>;
}
