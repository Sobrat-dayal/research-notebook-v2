import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResearchNote, PaperSummary } from '../types';
import {
  BookMarked,
  X,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  Tag,
  Sparkles,
  FileText,
  StickyNote
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResearchNotebookDrawerProps {
  summary: PaperSummary;
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchNotebookDrawer: React.FC<ResearchNotebookDrawerProps> = ({
  summary,
  isOpen,
  onClose
}) => {
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('methodology');
  const [copiedObsidian, setCopiedObsidian] = useState(false);

  // Load from local storage
  useEffect(() => {
    const paperKey = summary?.title || 'default_paper';
    try {
      const saved = localStorage.getItem(`papervision_notes_${paperKey}`);
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        // Initial sample note
        setNotes([
          {
            id: 'init-note-1',
            paperTitle: summary?.title || 'Research Paper',
            highlightText: summary?.tldr || 'Key structural takeaway from paper analysis.',
            userNote: 'Key structural takeaway: self-attention eliminates recurrence, enabling massive GPU parallelization across long contexts.',
            tags: ['architecture', 'breakthrough'],
            createdAt: new Date().toLocaleDateString()
          }
        ]);
      }
    } catch {
      // Fallback
    }
  }, [summary?.title]);

  const saveNotes = (updated: ResearchNote[]) => {
    setNotes(updated);
    const paperKey = summary?.title || 'default_paper';
    try {
      localStorage.setItem(`papervision_notes_${paperKey}`, JSON.stringify(updated));
    } catch {
      // localstorage full or restricted
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: ResearchNote = {
      id: `note_${Date.now()}`,
      paperTitle: summary.title,
      userNote: newNoteText.trim(),
      tags: [selectedTag],
      createdAt: new Date().toLocaleDateString()
    };

    const updated = [newNote, ...notes];
    saveNotes(updated);
    setNewNoteText('');
    confetti({ particleCount: 20, spread: 40 });
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
  };

  const generateObsidianMarkdown = () => {
    const yamlTags = ['research', 'papervision', summary.field.toLowerCase().replace(/[^a-z0-9]/g, '-')];
    const notesContent = notes
      .map(n => {
        return `### ${n.createdAt} [${n.tags.map(t => `#${t}`).join(' ')}]
${n.highlightText ? `> "${n.highlightText}"\n\n` : ''}${n.userNote}`;
      })
      .join('\n\n---\n\n');

    return `---
title: "${summary.title}"
authors: [${summary.authors.map(a => `"${a}"`).join(', ')}]
year: ${summary.publicationYear}
institution: "${summary.institution}"
tags: [${yamlTags.join(', ')}]
status: analyzed
created: ${new Date().toISOString()}
---

# ${summary.title}

## Summary TL;DR
${summary.tldr}

## Executive Summary
${summary.executiveSummary}

## Personal Research Notes & Annotations
${notesContent || '*No notes recorded yet.*'}

## Citation
\`\`\`bibtex
${summary.citation}
\`\`\`
`;
  };

  const handleCopyObsidian = () => {
    const md = generateObsidianMarkdown();
    navigator.clipboard.writeText(md);
    setCopiedObsidian(true);
    confetti({ particleCount: 35, spread: 50 });
    setTimeout(() => setCopiedObsidian(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateObsidianMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${summary.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_notes.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-md h-full bg-[#FDFCFB] border-l border-[#1A1A1A]/15 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1A1A1A]/10 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#A67C52]/10 text-[#A67C52]">
              <BookMarked className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="editorial-badge text-[#A67C52]">Research Notebook</span>
                <span className="text-[10px] font-mono text-[#1A1A1A]/50">• Obsidian / Notion</span>
              </div>
              <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-1">{summary.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Export Bar */}
        <div className="px-5 py-2.5 bg-[#FAF9F5] border-b border-[#1A1A1A]/10 flex items-center justify-between">
          <span className="text-xs font-mono text-[#1A1A1A]/60">
            {notes.length} Active Notes
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyObsidian}
              className="px-2.5 py-1 rounded-md bg-white border border-[#1A1A1A]/15 text-[11px] font-mono text-[#1A1A1A] hover:border-[#A67C52] transition-colors flex items-center gap-1 shadow-xs btn-tactile"
            >
              {copiedObsidian ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>Obsidian</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="px-2.5 py-1 rounded-md bg-[#A67C52] text-white text-[11px] font-mono hover:bg-[#8F6640] transition-colors flex items-center gap-1 shadow-xs btn-tactile"
            >
              <Download className="w-3 h-3" />
              <span>.MD</span>
            </button>
          </div>
        </div>

        {/* Notes Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="bg-white p-4 rounded-xl border border-[#1A1A1A]/10 shadow-xs">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1.5 flex items-center gap-1">
              <StickyNote className="w-3.5 h-3.5 text-[#A67C52]" />
              Quick Reflection / Margin Note
            </label>
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Jot down a methodology thought, open question, or critique..."
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-[#1A1A1A]/15 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] resize-none mb-2.5"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {(['methodology', 'architecture', 'critique', 'followup'] as const).map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                      selectedTag === tag
                        ? 'bg-[#A67C52] text-white font-semibold'
                        : 'bg-[#FAF8F5] text-[#1A1A1A]/60 hover:bg-[#FAF0E6]'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1 btn-tactile"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </form>

          {/* Notes List */}
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-white border border-[#1A1A1A]/10 shadow-xs hover:border-[#A67C52]/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {note.tags.map(t => (
                      <span key={t} className="text-[10px] font-mono bg-[#A67C52]/10 text-[#A67C52] px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#1A1A1A]/40">{note.createdAt}</span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-[#1A1A1A]/30 hover:text-rose-600 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {note.highlightText && (
                  <div className="mb-2 p-2 rounded bg-[#FAF9F5] border-l-2 border-[#A67C52] text-[11px] text-[#1A1A1A]/75 italic font-serif">
                    "{note.highlightText}"
                  </div>
                )}

                <p className="text-xs text-[#1A1A1A]/85 leading-relaxed">
                  {note.userNote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
