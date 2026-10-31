import type { NotablePoint, ProcessedPoint, DataFile, DataSubfolder } from '../types/data';

const DATA_BASE_PATH = '/data';

export function parseCoords(coords: string): { lat: number; lng: number } {
  const [latStr, lngStr] = coords.split(',').map(s => s.trim());
  return { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
}

export function parsePeople(people: string): { weekFrom: number; weekTo: number; weekendFrom: number; weekendTo: number } {
  const [weekFrom, weekTo, weekendFrom, weekendTo] = people.split(',').map(s => parseInt(s.trim(), 10));
  return { weekFrom, weekTo, weekendFrom, weekendTo };
}

export function processPoint(point: NotablePoint, category: string): ProcessedPoint {
  const parsedCoords = parseCoords(point.coords);
  const parsedPeople = parsePeople(point.people);
  const avgWeeklyVisitors = (parsedPeople.weekFrom + parsedPeople.weekTo) / 2;
  const avgWeekendVisitors = (parsedPeople.weekendFrom + parsedPeople.weekendTo) / 2;
  return {
    ...point,
    parsedCoords,
    parsedPeople,
    avgWeeklyVisitors,
    avgWeekendVisitors,
    category,
  };
}

export async function loadDataFile(relativePath: string, category: string): Promise<ProcessedPoint[]> {
  const response = await fetch(`${DATA_BASE_PATH}${relativePath}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${relativePath}: ${response.statusText}`);
  }
  const data: NotablePoint[] = await response.json();
  return data.map(point => processPoint(point, category));
}

export async function loadSubfolder(subfolder: string): Promise<DataFile[]> {
  const files = [
    'accomodation-elder.json',
    'accomodation-hotel.json',
    'accomodation-residential.json',
    'activity-government.json',
    'activity-hospitals.json',
    'activity-industry.json',
    'activity-kinder.json',
    'activity-notary.json',
    'activity-schools.json',
    'activity-sport.json',
    'activity-universities.json',
    'leisure-park.json',
    'leisure-restaurant.json',
    'leisure-street.json',
    'market-food.json',
    'market-nofood.json',
    'travel-tourism.json',
    'travel-transport.json',
  ];

  const dataFiles: DataFile[] = [];
  for (const file of files) {
    try {
      const category = file.replace('.json', '');
      const points = await loadDataFile(`/${subfolder}/${file}`, category);
      if (points.length > 0) {
        dataFiles.push({
          name: category,
          path: `/${subfolder}/${file}`,
          points,
        });
      }
    } catch {
      // File doesn't exist or failed to load, skip
    }
  }
  return dataFiles;
}

export async function loadAllSubfolders(): Promise<DataSubfolder[]> {
  const subfolders = ['morelos'];
  const result: DataSubfolder[] = [];
  
  for (const subfolder of subfolders) {
    const files = await loadSubfolder(subfolder);
    if (files.length > 0) {
      result.push({ name: subfolder, files });
    }
  }
  return result;
}