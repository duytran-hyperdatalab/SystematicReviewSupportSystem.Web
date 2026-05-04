import { FiPlus, FiTrash2 } from "react-icons/fi";
import Button from "../ui/Button";

interface BulkActionBarProps {
  selectedCount: number;
  onAddToProcess: () => void;
  onClear: () => void;
  isSubmitting?: boolean;
}

export default function BulkActionBar({
  selectedCount,
  onAddToProcess,
  onClear,
  isSubmitting = false,
}: BulkActionBarProps) {
  if (selectedCount <= 0) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-2 p-2 pl-6 border border-white/10 backdrop-blur-md">
        <div className="flex flex-col mr-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">
            Selection
          </span>
          <span className="text-sm font-black text-white mt-1">
            {selectedCount} {selectedCount === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        <div className="h-8 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-2 pr-2">
          <Button 
            onClick={onAddToProcess} 
            isLoading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white border-none rounded-xl font-black uppercase tracking-widest text-[10px] py-3 px-6 shadow-lg shadow-blue-500/20"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add to Process
          </Button>
          <button 
            onClick={onClear} 
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <FiTrash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
