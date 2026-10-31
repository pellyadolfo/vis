export interface NotablePoint {
  name: string;
  coords: string;
  people: string;
}

export interface ParsedCoords {
  lat: number;
  lng: number;
}

export interface ParsedPeople {
  weekFrom: number;
  weekTo: number;
  weekendFrom: number;
  weekendTo: number;
}

export interface ProcessedPoint extends NotablePoint {
  parsedCoords: ParsedCoords;
  parsedPeople: ParsedPeople;
  avgWeeklyVisitors: number;
  avgWeekendVisitors: number;
}

export interface DataFile {
  name: string;
  path: string;
  points: ProcessedPoint[];
}

export interface DataSubfolder {
  name: string;
  files: DataFile[];
}