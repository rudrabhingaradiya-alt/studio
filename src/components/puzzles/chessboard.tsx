'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

type Piece = 'k' | 'q' | 'r' | 'b' | 'n' | 'p' | 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | null;

const pieceToUnicode: { [key in Piece as string]: string } = {
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
};

const defaultBoard: Piece[][] = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const puzzleBoard: Piece[][] = [
    [null, null, null, null, null, 'r', null, 'k'],
    [null, null, 'p', null, 'p', 'p', 'p', 'p'],
    [null, 'p', 'n', null, null, 'n', 'b', null],
    ['p', null, null, 'P', null, null, null, null],
    ['P', 'B', 'P', null, null, 'N', null, null],
    [null, null, 'Q', null, null, null, null, 'P'],
    [null, 'P', null, null, null, 'P', 'P', null],
    [null, null, null, 'R', null, 'K', null, null],
];

interface ChessboardProps {
  initialBoard?: Piece[][];
  isStatic?: boolean;
}

const Chessboard: React.FC<ChessboardProps> = ({ initialBoard, isStatic=false }) => {
  const [board, setBoard] = useState(initialBoard || (isStatic ? puzzleBoard : defaultBoard));
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);

  const handleSquareClick = (row: number, col: number) => {
    if (isStatic) return;
  
    if (selectedPiece) {
      const [startRow, startCol] = selectedPiece;
  
      // Prevent moving to the same square
      if (startRow === row && startCol === col) {
        setSelectedPiece(null);
        return;
      }
  
      const piece = board[startRow][startCol];
  
      // Simple move logic: allow moving to an empty square or capturing an opponent's piece
      const targetPiece = board[row][col];
      const isCapture = targetPiece !== null;
  
      if (piece) {
        // A very basic check to see if it's a different color piece
        const isOpponent =
          targetPiece &&
          ((piece.toLowerCase() === piece &&
            targetPiece.toUpperCase() === targetPiece) ||
            (piece.toUpperCase() === piece &&
              targetPiece.toLowerCase() === targetPiece));
  
        if (!isCapture || isOpponent) {
          const newBoard = board.map((r) => [...r]);
          newBoard[row][col] = piece;
          newBoard[startRow][startCol] = null;
          setBoard(newBoard);
        }
      }
      setSelectedPiece(null);
    } else if (board[row][col]) {
      setSelectedPiece([row, col]);
    }
  };


  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  return (
    <div className="relative aspect-square w-full max-w-lg mx-auto shadow-2xl rounded-lg overflow-hidden border-4 border-card">
      <div className="grid grid-cols-8 grid-rows-8 aspect-square">
        {board.map((rowArr, rowIndex) =>
          rowArr.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 !== 0;
            const isSelected = selectedPiece && selectedPiece[0] === rowIndex && selectedPiece[1] === colIndex;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={cn(
                  'flex items-center justify-center cursor-pointer',
                  isLight ? 'bg-secondary' : 'bg-primary/50',
                  isSelected && 'bg-accent/50 ring-2 ring-accent',
                  !isStatic && 'hover:bg-accent/30'
                )}
              >
                <span className="text-4xl md:text-5xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {piece && pieceToUnicode[piece]}
                </span>
              </div>
            );
          })
        )}
      </div>
       {/* Ranks */}
       {ranks.map((rank, i) => (
        <div key={rank} className="absolute top-0 h-full w-full pointer-events-none">
            <span style={{top: `${i * 12.5}%`}} className="absolute left-0.5 text-xs font-bold text-primary-foreground opacity-70">
                {rank}
            </span>
        </div>
      ))}
      {/* Files */}
      {files.map((file, i) => (
        <div key={file} className="absolute top-0 h-full w-full pointer-events-none">
            <span style={{left: `${(i * 12.5) + 10.5}%`}} className="absolute bottom-0.5 text-xs font-bold text-primary-foreground opacity-70">
                {file}
            </span>
        </div>
      ))}
    </div>
  );
};

export default Chessboard;
