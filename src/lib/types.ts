export interface PuzzleHistoryItem {
  puzzleId: string;
  attempts: number;
  solved: boolean;
}

export interface PuzzleRecommendation {
  puzzleId: string;
  description: string;
}
