import { ArrowLeft } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import Card from "../../../../../components/ui/Card";

interface ConsensusStateScreenProps {
  onBack: () => void;
  isLoading?: boolean;
  message?: string;
}

export default function ConsensusStateScreen({
  onBack,
  isLoading = false,
  message,
}: ConsensusStateScreenProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="!px-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        {isLoading ? (
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        ) : (
          <Card className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-sm text-amber-700">
              {message ?? "No consensus data available for this study."}
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
