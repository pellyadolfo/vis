import { MapPin, Layers, Info, Filter, X, Menu } from 'lucide-react';

interface TopbarProps {
  totalPoints: number;
  checkedFilesCount: number;
  subfolderName: string;
  weekdayThreshold: number;
  onWeekdayThresholdChange: (value: number) => void;
  onMenuClick: () => void;
}

export function Topbar({ totalPoints, checkedFilesCount, subfolderName, weekdayThreshold, onWeekdayThresholdChange, onMenuClick }: TopbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 lg:h-6 w-5 lg:w-6 text-blue-600" />
            Vending Information System
          </h1>
          <span className="hidden sm:inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
            {subfolderName}
          </span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <Layers className="h-4 w-4" />
            <span>{checkedFilesCount} data files selected</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{totalPoints} points</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <label className="hidden sm:inline text-sm text-gray-600">Min weekday avg:</label>
            <input
              type="number"
              value={weekdayThreshold}
              onChange={(e) => onWeekdayThresholdChange(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              max="10000"
              step="100"
              className="w-20 sm:w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              aria-label="Minimum weekday average visitors"
            />
            {weekdayThreshold > 0 && (
              <button
                onClick={() => onWeekdayThresholdChange(0)}
                className="text-gray-400 hover:text-red-500"
                title="Clear filter"
                aria-label="Clear filter"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
        </div>
      </div>
    </header>
  );
}