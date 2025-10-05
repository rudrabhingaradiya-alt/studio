
export type PuzzleDifficulty = 'easy' | 'medium' | 'hard';

export interface Puzzle {
  id: string;
  fen: string;
  solution: string[];
  rating: number;
  difficulty: PuzzleDifficulty;
  theme: string;
}

export const puzzles: Puzzle[] = [
  {
    id: 'pz001',
    fen: 'r1b1kbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4',
    solution: ['Nxe5'],
    rating: 800,
    difficulty: 'easy',
    theme: 'Fork',
  },
  {
    id: 'pz002',
    fen: 'rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
    solution: ['Nxe5'],
    rating: 900,
    difficulty: 'easy',
    theme: 'Opening Tactic',
  },
  {
    id: 'pz003',
    fen: '8/k7/8/8/8/8/r7/2K5 w - - 0 1',
    solution: ['Kb1'],
    rating: 1200,
    difficulty: 'medium',
    theme: 'King Safety',
  },
  {
    id: 'pz004',
    fen: '1k6/1p6/8/4N3/8/8/8/K7 w - - 0 1',
    solution: ['Kb1'],
    rating: 1100,
    difficulty: 'medium',
    theme: 'Endgame',
  },
   {
    id: 'pz005',
    fen: 'r1b1k2r/pp1n1p1p/2p1pnp1/q2p4/2PP4/2N1PN2/PPQ2PPP/R3KB1R w KQkq - 0 9',
    solution: ['e4'],
    rating: 1500,
    difficulty: 'hard',
    theme: 'Breakthrough',
  },
  {
    id: 'pz006',
    fen: '6k1/5p2/6p1/7p/7P/5qP1/5P2/6K1 w - - 0 1',
    solution: ['Kf1'],
    rating: 1400,
    difficulty: 'hard',
    theme: 'Queen Endgame',
  },
];

    