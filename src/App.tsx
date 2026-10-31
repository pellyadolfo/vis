import React, { useState, useCallback, useMemo } from 'react';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { MapComponent } from './components/MapComponent';
import type { DataSubfolder, ProcessedPoint } from './types/data';
import { loadAllSubfolders, loadDataFile } from './utils/dataLoader';

function App() {
  const [subfolders, setSubfolders] = useState<DataSubfolder[]>([]);
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>('morelos');
  const [checkedFiles, setCheckedFiles] = useState<Set<string>>(new Set());
  const [filePointsCache, setFilePointsCache] = useState<Map<string, ProcessedPoint[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [weekdayThreshold, setWeekdayThreshold] = useState<number>(0);

  const loadInitialData = useCallback(async () => {
    try {
      const data = await loadAllSubfolders();
      setSubfolders(data);
      if (data.length > 0) {
        setSelectedSubfolder(data[0].name);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSubfolderChange = useCallback((subfolder: string) => {
    setSelectedSubfolder(subfolder);
    setCheckedFiles(new Set());
    setFilePointsCache(new Map());
  }, []);

  const handleFileToggle = useCallback((filePath: string) => {
    setCheckedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  }, []);

  const currentSubfolder = useMemo(
    () => subfolders.find(s => s.name === selectedSubfolder),
    [subfolders, selectedSubfolder]
  );

  const handleCheckAll = useCallback(async () => {
    if (!currentSubfolder) return;
    const allFilePaths = currentSubfolder.files.map(f => `${selectedSubfolder}/${f.name}`);
    setCheckedFiles(new Set(allFilePaths));
    
    // Load data for all files
    await Promise.all(currentSubfolder.files.map(async (file) => {
      const fileKey = `${selectedSubfolder}/${file.name}`;
      try {
        const points = await loadDataFile(file.path, file.name);
        setFilePointsCache(prev => {
          const next = new Map(prev);
          next.set(fileKey, points);
          return next;
        });
      } catch (error) {
        console.error(`Failed to load ${file.path}:`, error);
      }
    }));
  }, [currentSubfolder, selectedSubfolder]);

  const handleUncheckAll = useCallback(() => {
    setCheckedFiles(new Set());
  }, []);

  const handlePointsChange = useCallback((filePath: string, points: ProcessedPoint[]) => {
    setFilePointsCache(prev => {
      const next = new Map(prev);
      next.set(filePath, points);
      return next;
    });
  }, []);

  // Derive allPoints from checked files and cached points
  const allPoints = useMemo(() => {
    const points: ProcessedPoint[] = [];
    checkedFiles.forEach(filePath => {
      const filePoints = filePointsCache.get(filePath);
      if (filePoints) {
        points.push(...filePoints);
      }
    });
    return points;
  }, [checkedFiles, filePointsCache]);

  // Filter points by weekday threshold
  const filteredPoints = useMemo(() => {
    if (weekdayThreshold <= 0) return allPoints;
    return allPoints.filter(point => {
      const avgWeekday = (point.parsedPeople.weekFrom + point.parsedPeople.weekTo) / 2;
      return avgWeekday >= weekdayThreshold;
    });
  }, [allPoints, weekdayThreshold]);

  // Generate consistent colors for each category
  const categoryColors = useMemo(() => {
    const colors = [
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#ef4444', // red
      '#f97316', // orange
      '#eab308', // yellow
      '#22c55e', // green
      '#06b6d4', // cyan
      '#6366f1', // indigo
      '#f43f5e', // rose
      '#14b8a6', // teal
      '#a855f7', // purple
    ];
    const map = new Map<string, string>();
    // Use all possible categories for consistent coloring, not just loaded files
    const allCategories = [
      'accomodation-elder',
      'accomodation-hotel',
      'accomodation-residential',
      'activity-government',
      'activity-hospitals',
      'activity-industry',
      'activity-kinder',
      'activity-notary',
      'activity-schools',
      'activity-sport',
      'activity-universities',
      'leisure-park',
      'leisure-restaurant',
      'leisure-street',
      'market-food',
      'market-nofood',
      'travel-tourism',
      'travel-transport',
    ];
    allCategories.forEach((cat, index) => {
      map.set(cat, colors[index % colors.length]);
    });
    return map;
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Vending Information System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <Sidebar
        selectedSubfolder={selectedSubfolder}
        onSubfolderChange={handleSubfolderChange}
        checkedFiles={checkedFiles}
        onFileToggle={handleFileToggle}
        onCheckAll={handleCheckAll}
        onUncheckAll={handleUncheckAll}
        onPointsChange={handlePointsChange}
        className="w-80 flex-shrink-0"
      />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Topbar
          totalPoints={filteredPoints.length}
          checkedFilesCount={checkedFiles.size}
          subfolderName={currentSubfolder?.name || 'Select category'}
          weekdayThreshold={weekdayThreshold}
          onWeekdayThresholdChange={setWeekdayThreshold}
        />
        <div className="flex-1 relative min-h-0">
          <MapComponent points={filteredPoints} categoryColors={categoryColors} />
        </div>
      </div>
    </div>
  );
}

export default App;