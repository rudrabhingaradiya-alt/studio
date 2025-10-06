
export interface PuzzleHistoryItem {
  puzzleId: string;
  attempts: number;
  solved: boolean;
}

export interface GameHistoryItem {
  opponent: string;
  result: 'Win' | 'Loss' | 'Draw';
  date: string;
  ratingChange: number;
  rating: number;
}

export interface PuzzleRecommendation {
  puzzleId: string;
  description: string;
}

    