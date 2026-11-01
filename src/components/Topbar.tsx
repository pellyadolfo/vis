import { useTranslation } from 'react-i18next';
import { Info, Filter, X, Menu, Calendar, CalendarOff, Eye, EyeOff, Globe } from 'lucide-react';

interface TopbarProps {
  weekdayThreshold: number;
  onWeekdayThresholdChange: (value: number) => void;
  onMenuClick: () => void;
  proportionalMode: 'off' | 'weekday' | 'weekend';
  onProportionalModeChange: (value: 'off' | 'weekday' | 'weekend') => void;
  showMapLabels: boolean;
  onShowMapLabelsChange: (value: boolean) => void;
  language: 'en' | 'es';
  onLanguageChange: (lang: 'en' | 'es') => void;
}

export function Topbar({ weekdayThreshold, onWeekdayThresholdChange, onMenuClick, proportionalMode, onProportionalModeChange, showMapLabels, onShowMapLabelsChange, language, onLanguageChange }: TopbarProps) {
  const { t } = useTranslation();

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
            <div className="flex items-center gap-2 ml-4 border-l border-gray-200 pl-4">
              <Filter className="h-4 w-4 text-gray-500" />
              <label className="hidden sm:inline text-sm text-gray-600">{t('topbar.minWeekdayAvg')}</label>
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
                title={t('topbar.clearFilter')}
                aria-label={t('topbar.clearFilter')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onProportionalModeChange(proportionalMode === 'weekday' ? 'off' : 'weekday')}
              className={`p-2 rounded-lg transition-colors ${proportionalMode === 'weekday' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              title={proportionalMode === 'weekday' ? t('topbar.disableWeekday') : t('topbar.enableWeekday')}
              aria-label={proportionalMode === 'weekday' ? t('topbar.disableWeekday') : t('topbar.enableWeekday')}
              aria-pressed={proportionalMode === 'weekday'}
            >
              <Calendar className="h-5 w-5" />
            </button>
            <button
              onClick={() => onProportionalModeChange(proportionalMode === 'weekend' ? 'off' : 'weekend')}
              className={`p-2 rounded-lg transition-colors ${proportionalMode === 'weekend' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              title={proportionalMode === 'weekend' ? t('topbar.disableWeekend') : t('topbar.enableWeekend')}
              aria-label={proportionalMode === 'weekend' ? t('topbar.disableWeekend') : t('topbar.enableWeekend')}
              aria-pressed={proportionalMode === 'weekend'}
            >
              <CalendarOff className="h-5 w-5" />
            </button>
            <button
              onClick={() => onShowMapLabelsChange(!showMapLabels)}
              className={`p-2 rounded-lg transition-colors ${showMapLabels ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              title={showMapLabels ? t('topbar.hideMapLabels') : t('topbar.showMapLabels')}
              aria-label={showMapLabels ? t('topbar.hideMapLabels') : t('topbar.showMapLabels')}
              aria-pressed={!showMapLabels}
            >
              {showMapLabels ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'es' : 'en')}
              className="p-2 rounded-lg transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              title={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
              aria-label={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
            >
              <Globe className="h-5 w-5" />
              <span className="hidden sm:inline ml-1 text-xs font-medium">
                {language === 'en' ? 'ES' : 'EN'}
              </span>
            </button>
          </div>
          <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer" title={t('topbar.info')}>
            <Info className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}