import React, { useState, useCallback, useMemo } from 'react';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { MapComponent } from './components/MapComponent';
import type { DataSubfolder, ProcessedPoint } from './types/data';
import { loadAllSubfolders } from './utils/dataLoader';

function App() {
  const [subfolders, setSubfolders] = useState<DataSubfolder[]>([]);
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>('morelos');
  const [checkedFiles, setCheckedFiles] = useState<Set<string>>(new Set());
  const [allPoints, setAllPoints] = useState<ProcessedPoint[]>([]);
  const [loading, setLoading] = useState(true);

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
    setAllPoints([]);
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

  const handlePointsChange = useCallback((points: ProcessedPoint[]) => {
    setAllPoints(prev => {
      const existingPoints = new Map(prev.map(p => [`${p.name}-${p.coords}`, p]));
      points.forEach(p => existingPoints.set(`${p.name}-${p.coords}`, p));
      return Array.from(existingPoints.values());
    });
  }, []);

  const currentSubfolder = useMemo(
    () => subfolders.find(s => s.name === selectedSubfolder),
    [subfolders, selectedSubfolder]
  );

  const totalPoints = allPoints.length;

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
        onPointsChange={handlePointsChange}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Topbar
          totalPoints={totalPoints}
          checkedFilesCount={checkedFiles.size}
          subfolderName={currentSubfolder?.name || 'Select category'}
        />
        <div className="flex-1 relative min-h-0">
          <MapComponent points={allPoints} />
        </div>
      </div>
    </div>
  );
}

export default App;