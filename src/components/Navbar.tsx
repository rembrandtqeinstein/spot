import { Flame, Plus, BookMarked } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = {
  onCreateClick: () => void;
  onMySpots: () => void;
};

export function Navbar({ onCreateClick, onMySpots }: Props) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10">
      <Link to="/" className="flex items-center gap-2 font-bold text-gray-900 hover:text-brand-600">
        <Flame className="w-6 h-6 text-brand-500" />
        <span className="text-lg">Spot</span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          onClick={onMySpots}
          className="flex items-center gap-1.5 text-gray-600 hover:text-brand-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <BookMarked className="w-4 h-4" />
          <span className="hidden sm:inline">My Spots</span>
        </button>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Spot</span>
        </button>
      </div>
    </header>
  );
}
