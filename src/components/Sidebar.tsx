import { useState, useEffect, useMemo } from 'react';
import { FolderOpen, ChevronDown, MapPin, Loader2, CheckSquare, Square, ChevronRight, X } from 'lucide-react';
import type { DataSubfolder, DataFile, ProcessedPoint } from '../types/data';
import { loadAllSubfolders, loadDataFile } from '../utils/dataLoader';

interface SidebarProps {
  selectedSubfolder: string;
  onSubfolderChange: (subfolder: string) => void;
  checkedFiles: Set<string>;
  onFileToggle: (filePath: string) => void;
  onCheckAll: () => void;
  onUncheckAll: () => void;
  onPointsChange: (filePath: string, points: ProcessedPoint[]) => void;
  className?: string;
  onClose?: () => void;
  style?: React.CSSProperties;
}

const prefixLabels: Record<string, string> = {
  accomodation: 'Accommodation',
  activity: 'Activity',
  leisure: 'Leisure',
  market: 'Market',
  travel: 'Travel',
};

function getPrefix(fileName: string): string {
  return fileName.split('-')[0];
}

function formatLabel(fileName: string): string {
  return fileName
    .split('-')
    .slice(1)
    .join('-')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function Sidebar({
  selectedSubfolder,
  onSubfolderChange,
  checkedFiles,
  onFileToggle,
  onCheckAll,
  onUncheckAll,
  onPointsChange,
  className = '',
  onClose,
  style,
}: SidebarProps) {
  const [subfolders, setSubfolders] = useState<DataSubfolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchSubfolders() {
      try {
        const data = await loadAllSubfolders();
        setSubfolders(data);
      } catch (error) {
        console.error('Failed to load subfolders:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSubfolders();
  }, []);

  const handleFileToggle = async (file: DataFile) => {
    const newChecked = new Set(checkedFiles);
    const fileKey = `${selectedSubfolder}/${file.name}`;
    
    if (newChecked.has(fileKey)) {
      newChecked.delete(fileKey);
      onFileToggle(fileKey);
    } else {
      newChecked.add(fileKey);
      onFileToggle(fileKey);
      
      try {
        const points = await loadDataFile(file.path, file.name);
        onPointsChange(fileKey, points);
      } catch (error) {
        console.error(`Failed to load ${file.path}:`, error);
      }
    }
  };

  const currentSubfolder = subfolders.find(s => s.name === selectedSubfolder);

  const groupedFiles = useMemo(() => {
    if (!currentSubfolder) return {};
    const groups: Record<string, DataFile[]> = {};
    currentSubfolder.files.forEach(file => {
      const prefix = getPrefix(file.name);
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(file);
    });
    return groups;
  }, [currentSubfolder]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 border-r border-gray-200 ${className}`} style={style}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <label htmlFor="subfolder-select" className="block text-sm font-medium text-gray-700 mb-2">
            Data Category
          </label>
          <select
            id="subfolder-select"
            value={selectedSubfolder}
            onChange={(e) => onSubfolderChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {subfolders.map((subfolder) => (
              <option key={subfolder.name} value={subfolder.name}>
                {subfolder.name}
              </option>
            ))}
          </select>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-4"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="p-4 border-b border-gray-200 flex gap-2">
        <button
          onClick={onCheckAll}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
        >
          <CheckSquare className="h-4 w-4" />
          Check All
        </button>
        <button
          onClick={onUncheckAll}
          className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors flex items-center justify-center gap-1"
        >
          <Square className="h-4 w-4" />
          Uncheck All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentSubfolder ? (
          Object.entries(groupedFiles).map(([prefix, files]) => (
            <div key={prefix} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedGroups(prev => {
                  const next = new Set(prev);
                  if (next.has(prefix)) next.delete(prefix);
                  else next.add(prefix);
                  return next;
                })}
                className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight
                    className={`h-5 w-5 text-gray-500 transition-transform ${expandedGroups.has(prefix) ? 'rotate-90' : ''}`}
                  />
                  <span className="font-semibold text-gray-900 text-sm">
                    {prefixLabels[prefix] || prefix}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {files.length} items
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{files.reduce((sum, f) => sum + f.points.length, 0)} points</span>
                </div>
              </button>
              {expandedGroups.has(prefix) && (
                <div className="p-4 space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`file-${file.name}`}
                            checked={checkedFiles.has(`${selectedSubfolder}/${file.name}`)}
                            onChange={() => handleFileToggle(file)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <label
                            htmlFor={`file-${file.name}`}
                            className="font-medium text-gray-900 cursor-pointer flex-1"
                          >
                            {formatLabel(file.name)}
                          </label>
                        </div>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {file.points.length} points
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setExpandedFiles(prev => {
                          const next = new Set(prev);
                          if (next.has(file.name)) next.delete(file.name);
                          else next.add(file.name);
                          return next;
                        })}
                        className="mt-2 w-full text-left flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${expandedFiles.has(file.name) ? 'rotate-180' : ''}`}
                        />
                        <span>{expandedFiles.has(file.name) ? 'Hide' : 'Show'} points</span>
                      </button>

                      {expandedFiles.has(file.name) && (
                        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                          {file.points.slice(0, 20).map((point, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-xs text-gray-600 px-2 py-1 hover:bg-white rounded"
                            >
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="truncate">{point.name}</span>
                              <span className="text-gray-400 ml-auto">
                                ~{Math.round(point.avgWeeklyVisitors)} wk / {Math.round(point.avgWeekendVisitors)} we
                              </span>
                            </div>
                          ))}
                          {file.points.length > 20 && (
                            <div className="text-xs text-gray-500 px-2 py-1 italic">
                              ... and {file.points.length - 20} more points
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No data files found</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-sm text-gray-600">
          <p className="font-medium">Selected: {checkedFiles.size} file(s)</p>
          <p className="mt-1">Check files to display points on map</p>
        </div>
      </div>
    </div>
  );
}