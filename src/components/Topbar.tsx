import { MapPin, Layers, Info } from 'lucide-react';

interface TopbarProps {
  totalPoints: number;
  checkedFilesCount: number;
  subfolderName: string;
}

export function Topbar({ totalPoints, checkedFilesCount, subfolderName }: TopbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Vending Information System
          </h1>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
            {subfolderName}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Layers className="h-4 w-4" />
            <span>{checkedFilesCount} data files selected</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{totalPoints} points on map</span>
          </div>
          <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
        </div>
      </div>
    </header>
  );
}