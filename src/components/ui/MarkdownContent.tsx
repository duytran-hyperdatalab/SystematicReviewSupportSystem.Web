import ReactMarkdown from "react-markdown";
import { cn } from "../../utils/cn";

interface MarkdownContentProps {
  content: string;
  className?: string;
  variant?: "blue" | "red" | "green" | "gray" | "amber" | "slate";
  inline?: boolean;
}

export function MarkdownContent({
  content,
  className,
  variant = "slate",
  inline = false,
}: MarkdownContentProps) {
  const styles = {
    blue: {
      text: "text-blue-900/90",
      strong: "text-blue-950 bg-blue-50 px-1 rounded-sm border border-blue-100/50",
      em: "text-blue-800/90 italic underline decoration-blue-200 decoration-1 underline-offset-4",
      marker: "marker:text-blue-400",
      code: "text-blue-700 bg-blue-50/50 border-blue-100/40",
    },
    red: {
      text: "text-red-900/90",
      strong: "text-red-950 bg-red-50 px-1 rounded-sm border border-red-100/50",
      em: "text-red-800 italic decoration-red-200 underline decoration-1",
      marker: "marker:text-red-400",
      code: "text-red-700 bg-red-50/50 border-red-100/40",
    },
    green: {
      text: "text-green-900/90",
      strong: "text-green-950 bg-green-50 px-1 rounded-sm border border-green-100/50",
      em: "text-green-800 italic underline decoration-green-200 decoration-1",
      marker: "marker:text-green-400",
      code: "text-green-700 bg-green-50/50 border-green-100/40",
    },
    amber: {
      text: "text-amber-900/90",
      strong: "text-amber-950 bg-amber-50 px-1 rounded-sm border border-amber-100/50",
      em: "text-amber-800 italic underline decoration-amber-200 decoration-1",
      marker: "marker:text-amber-400",
      code: "text-amber-700 bg-amber-50/50 border-amber-100/40",
    },
    slate: {
      text: "text-slate-700",
      strong: "text-slate-900 bg-slate-100/80 px-1 rounded-sm border border-slate-200/50",
      em: "text-slate-800 italic underline decoration-slate-300 decoration-1 underline-offset-4",
      marker: "marker:text-slate-400",
      code: "text-slate-700 bg-slate-50 border-slate-200/60",
    },
    gray: {
      text: "text-gray-600",
      strong: "text-gray-900 bg-gray-100/80 px-1 rounded-sm",
      em: "text-gray-800 italic underline decoration-gray-200 decoration-1",
      marker: "marker:text-gray-400",
      code: "text-gray-600 bg-gray-50 border-gray-100",
    }
  };

  const current = styles[variant];

  const commonTextClasses = cn(
    "font-medium tracking-tight antialiased",
    current.text
  );

  return (
    <div className={cn("max-w-none font-outfit", className)}>
      <ReactMarkdown
        components={{
          p: ({ children }) => inline ? (
            <span className={cn("inline leading-relaxed text-[10.5px]", commonTextClasses)}>{children}</span>
          ) : (
            <p className={cn("mb-2 last:mb-0 leading-[1.6] text-[10.5px]", commonTextClasses)}>{children}</p>
          ),
          strong: ({ children }) => (
            <strong className={cn("font-bold", current.strong)}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={cn(current.em)}>
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className={cn("list-disc pl-3.5 mb-2.5 space-y-1.5", current.marker)}>
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className={cn("pl-1 text-[10.5px] leading-relaxed", commonTextClasses)}>
              {children}
            </li>
          ),
          code: ({ children }) => (
            <code className={cn("px-1 py-0.5 rounded-[3px] text-[9.5px] font-mono border-px", current.code)}>
              {children}
            </code>
          ),
          h1: ({ children }) => <h1 className="text-[11px] font-black uppercase tracking-widest mb-3 mt-4 first:mt-0 text-slate-900">{children}</h1>,
          h2: ({ children }) => <h2 className="text-[10px] font-black uppercase tracking-wider mb-2 mt-3 first:mt-0 text-slate-800/80">{children}</h2>,
          blockquote: ({ children }) => (
            <blockquote className="pl-3 border-l-2 border-slate-200 italic text-slate-500/80 my-2 text-[10px]">
              {children}
            </blockquote>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
