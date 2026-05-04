import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useSelector } from "react-redux";
import Button from "../../../../../components/ui/Button";
import type { RootState } from "../../../../../redux/store";
import type { ExtractionCommentDto } from "../../../../../types/dataExtraction";

interface IsolatedFieldCommentsProps {
  comments: ExtractionCommentDto[];
  onAddComment: (content: string) => Promise<void>;
  isLoading: boolean;
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

export default function IsolatedFieldComments({
  comments,
  onAddComment,
  isLoading,
}: IsolatedFieldCommentsProps) {
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id ?? null);
  const [draft, setDraft] = useState("");
  const commentsContainerRef = useRef<HTMLDivElement | null>(null);

  const orderedComments = useMemo(
    () =>
      [...comments].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      ),
    [comments]
  );

  useEffect(() => {
    if (!commentsContainerRef.current) {
      return;
    }

    commentsContainerRef.current.scrollTo({
      top: commentsContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [orderedComments.length]);

  const canSend = draft.trim().length > 0 && !isLoading;

  const handleSend = async () => {
    const normalized = draft.trim();
    if (!normalized) {
      return;
    }

    await onAddComment(normalized);
    setDraft("");
  };

  return (
    <div className="flex h-full min-h-[65vh] flex-col">
      <div ref={commentsContainerRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
        {orderedComments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            No messages in this thread yet.
          </div>
        ) : (
          orderedComments.map((comment) => {
            const isCurrentUser = Boolean(currentUserId) && currentUserId === comment.userId;

            return (
              <div
                key={comment.id}
                className={isCurrentUser ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    isCurrentUser
                      ? "max-w-[82%] rounded-2xl border border-blue-100 bg-blue-50 p-3"
                      : "max-w-[82%] rounded-2xl border border-slate-200 bg-slate-100 p-3"
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-white">
                      {getInitials(comment.userName)}
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{comment.userName}</p>
                    <span className="text-[11px] text-slate-400">
                      {formatCommentTime(comment.createdAt)}
                    </span>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Reply
        </label>
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <Button
            onClick={() => {
              void handleSend();
            }}
            isLoading={isLoading}
            disabled={!canSend}
            className="h-10 shrink-0 !rounded-xl !px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
