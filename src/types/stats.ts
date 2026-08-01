export interface DailyStats {
  date: string;
  totalSessions: number;
  totalDuration: number;
  avgWpm: number;
  avgAccuracy: number;
  totalChars: number;
}

export interface StatsOverview {
  totalSessions: number;
  totalDuration: number;
  avgWpm: number;
  avgAccuracy: number;
  totalChars: number;
  totalCorrectChars: number;
  totalErrorChars: number;
}
