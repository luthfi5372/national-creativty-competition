"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, Save, Trash2, Sparkles, AlertCircle, 
  FileText, ImageIcon, CheckCircle, SaveAll, Loader2,
  ChevronRight, Calculator, HelpCircle
} from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";

// --- ⚡ MIPA MATH RENDERER ENGINE ---
const renderMath = (text: string) => {
  if (!text) return "";
  let html = text;
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    try { return katex.renderToString(formula, { displayMode: true, throwOnError: false }); } catch (e) { return match; }
  });
  html = html.replace(/\$(.*?)\$/g, (match, formula) => {
    try { return katex.renderToString(formula, { displayMode: false, throwOnError: false }); } catch (e) { return match; }
  });
  return html;
};

export default function EditorSoalSesi() {
  const params = useParams();
  const exam_id = params.exam_id as string; // 👈 Menggunakan exam_id sesuai request
  const router = useRouter();
  const supabase = createClient();

  const [infoJadwal, setInfoJadwal] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", "", ""],
    correct: "A",
    difficulty: "Medium",
    category: "Olimpiade MIPA",
    weight: 4,
    status: "Published",
    image: ""
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data: examData } = await supabase.from('cbt_exams').select('*').eq('id', exam_id).single();
        if (examData) setInfoJadwal(examData);

        const { data: qsData } = await supabase.from('cbt_questions').select('*').eq('exam_id', exam_id).order('created_at', { ascending: true });
        if (qsData) {
          setQuestions(qsData.map(q => ({
            ...q,
            options: [q.options.A, q.options.B, q.options.C, q.options.D, q.options.E],
            question: q.question_text,
            correct: q.correct_answer,
            image: q.image_url
          })));
        }
      } catch (err) { console.error("Load Error:", err); } finally { setIsLoading(false); }
    };
    loadData();
  }, [exam_id, supabase]);

  const handleSaveQuestion = async () => {
    if (!newQuestion.question || newQuestion.options.some(o => !o)) {
      alert("Mohon isi semua field!");
      return;
    }

    setIsSaving(true);
    const apiPayload = {
      exam_id: exam_id,
      question_text: newQuestion.question,
      options: { A: newQuestion.options[0], B: newQuestion.options[1], C: newQuestion.options[2], D: newQuestion.options[3], E: newQuestion.options[4] },
      correct_answer: newQuestion.correct,
      difficulty: newQuestion.difficulty,
      weight: newQuestion.weight,
      image_url: newQuestion.image || null,
      status: newQuestion.status
    };

    try {
      const res = await fetch('/api/admin/llms/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });
      
      if (res.ok) {
        const saved = await res.json();
        setQuestions([...questions, { ...newQuestion, id: saved.data[0].id }]);
        setNewQuestion({ ...newQuestion, question: "", options: ["", "", "", "", ""], image: "" });
      }
    } catch (err) { console.error("Save Error:", err); } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-slate-400 animate-pulse">MENGHUBUNGKAN KE SERVER...</div>;
  if (!infoJadwal) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Sesi tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-inter p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/hq/llms" className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-500">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-black text-2xl text-slate-800">Manajemen Bank Soal</h1>
              <p className="text-sm text-slate-500">Sesi: <span className="text-indigo-600 font-bold">{infoJadwal.title}</span></p>
            </div>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            Database Persistent Active
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* EDITOR PANEL */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
             <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Calculator className="text-indigo-600" size={20} />
                <h3 className="font-black text-slate-800">MIPA Split-View Editor</h3>
             </div>
             {/* Form Soal Sesuai MIPA SOP */}
             <div className="space-y-4">
                <textarea 
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium outline-none h-32 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Ketik soal LaTeX di sini..."
                />
                <div className="grid gap-3">
                   {newQuestion.options.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                         <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xs shrink-0">{String.fromCharCode(65+i)}</span>
                         <input 
                            value={opt}
                            onChange={(e) => {
                               const next = [...newQuestion.options];
                               next[i] = e.target.value;
                               setNewQuestion({...newQuestion, options: next});
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                            placeholder={`Opsi ${String.fromCharCode(65+i)}`}
                         />
                      </div>
                   ))}
                </div>
                <button 
                   onClick={handleSaveQuestion}
                   disabled={isSaving}
                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                   {isSaving ? <Loader2 className="animate-spin" /> : <SaveAll size={18} />}
                   SIMPAN KE BANK SOAL
                </button>
             </div>
          </div>

          {/* PREVIEW PANEL */}
          <div className="space-y-6">
             <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Participant Preview</span>
                </div>
                <div className="space-y-6">
                   <div className="text-lg font-bold leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMath(newQuestion.question || "Pratinjau soal akan muncul di sini...") }} />
                   <div className="grid gap-2">
                      {newQuestion.options.map((opt, i) => (
                         <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${newQuestion.correct === String.fromCharCode(65+i) ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                            <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black">{String.fromCharCode(65+i)}</span>
                            <div className="text-xs font-bold" dangerouslySetInnerHTML={{ __html: renderMath(opt || "...") }} />
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
