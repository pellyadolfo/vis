import { Info, Filter, X, Menu, Sun, Moon } from 'lucide-react';

interface TopbarProps {
  weekdayThreshold: number;
  onWeekdayThresholdChange: (value: number) => void;
  onMenuClick: () => void;
  proportionalMode: 'off' | 'weekday' | 'weekend';
  onProportionalModeChange: (value: 'off' | 'weekday' | 'weekend') => void;
}

export function Topbar({ weekdayThreshold, onWeekdayThresholdChange, onMenuClick, proportionalMode, onProportionalModeChange }: TopbarProps) {
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
        </div>
        <div className="flex items-center gap-4 flex-wrap">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => onProportionalModeChange(proportionalMode === 'weekday' ? 'off' : 'weekday')}
              className={`p-2 rounded-lg transition-colors ${proportionalMode === 'weekday' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              title={proportionalMode === 'weekday' ? 'Disable weekday proportional circles' : 'Show weekday proportional circles'}
              aria-label={proportionalMode === 'weekday' ? 'Disable weekday proportional circles' : 'Show weekday proportional circles'}
              aria-pressed={proportionalMode === 'weekday'}
            >
              <Sun className="h-5 w-5" />
            </button>
            <button
              onClick={() => onProportionalModeChange(proportionalMode === 'weekend' ? 'off' : 'weekend')}
              className={`p-2 rounded-lg transition-colors ${proportionalMode === 'weekend' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              title={proportionalMode === 'weekend' ? 'Disable weekend proportional circles' : 'Show weekend proportional circles'}
              aria-label={proportionalMode === 'weekend' ? 'Disable weekend proportional circles' : 'Show weekend proportional circles'}
              aria-pressed={proportionalMode === 'weekend'}
            >
              <Moon className="h-5 w-5" />
            </button>
          </div>
          <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
        </div>
      </div>
    </header>
  );
}