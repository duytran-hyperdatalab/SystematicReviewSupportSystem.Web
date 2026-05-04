import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import Drawer from "../../../../../components/ui/Drawer";
import type { ExtractionCommentDto } from "../../../../../types/dataExtraction";

interface FieldCommentsProps {
  title: string;
  comments: ExtractionCommentDto[];
  onSendComment: (content: string) => Promise<void>;
  isSending?: boolean;
  disabled?: boolean;
  currentUserId?: string | null;
}

function getInitials(userName: string): string {
  const parts = userName
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatCommentTime(value: string): string {
  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export default function FieldComments({
  title,
  comments,
  onSendComment,
  isSending = false,
  disabled = false,
  currentUserId = null,
}: FieldCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const commentsContainerRef = useRef<HTMLDivElement | null>(null);

  const orderedComments = useMemo(
    () =>
      [...comments].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      ),
    [comments]
  );

  const commentCount = comments.length;
  const canSend = draft.trim().length > 0 && !disabled && !isSending;

  useEffect(() => {
    if (!isOpen || !commentsContainerRef.current) {
      return;
    }

    commentsContainerRef.current.scrollTo({
      top: commentsContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, orderedComments.length]);

  const handleSend = async () => {
    const normalizedContent = draft.trim();
    if (!normalizedContent) {
      return;
    }

    await onSendComment(normalizedContent);
    setDraft("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-slate-200 bg-white px-2 text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        aria-label={`Open comments for ${title}`}
        title="Comments"
      >
        <MessageSquare className="h-4 w-4" />
        {commentCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
            {commentCount > 99 ? "99+" : commentCount}
          </span>
        ) : null}
      </button>

      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={<div className="pr-8">Comments - {title}</div>}
        side="right"
        maxWidth="max-w-xl"
      >
        <div className="flex h-full min-h-[65vh] flex-col">
          <div ref={commentsContainerRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
            {orderedComments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No comments yet. Start the thread for this field.
              </div>
            ) : (
              orderedComments.map((comment) => {
                const isCurrentUser = Boolean(currentUserId) && currentUserId === comment.userId;

                return (
                  <div
                    key={comment.id}
                    className={
                      isCurrentUser
                        ? "ml-10 rounded-2xl border border-blue-100 bg-blue-50 p-3"
                        : "mr-10 rounded-2xl border border-slate-200 bg-white p-3"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                        {getInitials(comment.userName)}
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        {comment.userName}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {formatCommentTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {comment.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <label htmlFor={inputId} className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Add reply
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id={inputId}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your message..."
                disabled={disabled || isSending}
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <Button
                onClick={() => {
                  void handleSend();
                }}
                isLoading={isSending}
                disabled={!canSend}
                className="h-10 shrink-0 !rounded-xl !px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
