import React, { useState } from 'react';
import { HiOutlineUserCircle, HiOutlineAtSymbol, HiOutlineLink } from 'react-icons/hi';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- NotesTabs Component ---
const tabs = ['Notes', 'Your Mentions', 'All Mentions'];

const NotesTabs: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-border-default px-2">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors relative",
            activeTab === tab ? "text-brand-600" : "text-text-muted hover:text-text-main"
          )}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};

// --- CommentItem Component ---
interface CommentItemProps {
  user: string;
  role: string;
  content: string;
  timestamp: string;
}

const CommentItem: React.FC<CommentItemProps> = ({ user, role, content, timestamp }) => {
  return (
    <div className="p-4 border-b border-border-default hover:bg-surface-ground transition-colors group">
      <div className="flex items-start gap-3">
        <HiOutlineUserCircle className="w-10 h-10 text-slate-300 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="font-semibold text-text-main truncate text-sm">{user} ({role})</h4>
            <span className="text-[10px] text-text-muted whitespace-nowrap">{timestamp}</span>
          </div>
          <p className="text-sm text-text-main line-clamp-3 group-hover:line-clamp-none transition-all">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- CommentEditor Component ---
const CommentEditor: React.FC = () => {
  return (
    <div className="p-4 border-t border-border-default bg-surface-card sticky bottom-0">
      <div className="border border-brand-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-100 transition-all">
        <div className="flex items-center gap-1 p-2 border-b border-brand-50 bg-brand-50/30">
          <button className="p-1 hover:bg-white rounded text-xs font-bold w-6 h-6 flex items-center justify-center">B</button>
          <button className="p-1 hover:bg-white rounded text-xs italic w-6 h-6 flex items-center justify-center">i</button>
          <button className="p-1 hover:bg-white rounded text-xs underline w-6 h-6 flex items-center justify-center">U</button>
          <div className="w-px h-4 bg-brand-100 mx-1" />
          <button className="p-1 hover:bg-white rounded text-text-muted"><HiOutlineAtSymbol className="w-4 h-4" /></button>
          <button className="p-1 hover:bg-white rounded text-text-muted"><HiOutlineLink className="w-4 h-4" /></button>
        </div>
        <textarea 
          placeholder="Write a comment..."
          className="w-full p-4 text-sm bg-transparent border-none focus:ring-0 resize-none h-24"
        />
        <div className="flex justify-end p-2 border-t border-brand-50">
          <button className="px-4 py-1.5 bg-brand-50 text-brand-400 rounded-full text-xs font-semibold cursor-not-allowed">
            Comment
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main NotesPanel Component ---
const NotesPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Notes');

  const mockComments = [
    {
      id: 1,
      user: "Vong Tai Dong",
      role: "K18 HCM",
      content: "This looks like a solid start for the protocol. We should refine the research questions next week.",
      timestamp: "2026-02-12, 11:00 am"
    },
    {
      id: 2,
      user: "System AI",
      role: "Assistant",
      content: "I recommend adding more specific PICO criteria to ensure clear screening guidelines.",
      timestamp: "2026-02-12, 11:05 am"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-surface-card">
      <NotesTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'Notes' ? (
          <div className="divide-y divide-border-default">
            {mockComments.map(comment => (
              <CommentItem key={comment.id} {...comment} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-text-muted text-sm italic">
            No mentions found.
          </div>
        )}
      </div>

      <CommentEditor />
    </div>
  );
};

export default NotesPanel;
