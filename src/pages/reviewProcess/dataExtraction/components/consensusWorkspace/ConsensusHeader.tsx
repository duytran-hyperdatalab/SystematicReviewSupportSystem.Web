import { ArrowLeft } from "lucide-react";
import Button from "../../../../../components/ui/Button";

interface ConsensusHeaderProps {
  paperTitle: string;
  onBack: () => void;
  onOpenDocument: () => void;
}

export default function ConsensusHeader({
  paperTitle,
  onBack,
  onOpenDocument,
}: ConsensusHeaderProps) {
  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="!px-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3">
          <h1 className="line-clamp-1 text-lg font-semibold text-slate-900">
            {paperTitle}
          </h1>
          <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Consensus Mode
          </span>
          <Button variant="outline" size="sm" onClick={onOpenDocument}>
            📄 View Document
          </Button>
        </div>
      </div>
    </header>
  );
}
