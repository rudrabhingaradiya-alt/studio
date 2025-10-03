'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

type Piece = 'k' | 'q' | 'r' | 'b' | 'n' | 'p' | 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | null;
type Board = Piece[][];

const pieceToUnicode: { [key in Piece as string]: string } = {
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
};

const defaultBoard: Board = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const puzzleBoard: Board = [
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
  initialBoard?: Board;
  isStatic?: boolean;
}

const isWhitePiece = (piece: Piece) => piece !== null && piece === piece.toUpperCase();
const isBlackPiece = (piece: Piece) => piece !== null && piece === piece.toLowerCase();

const isValidMove = (board: Board, startRow: number, startCol: number, endRow: number, endCol: number): boolean => {
  const piece = board[startRow][startCol];
  const targetPiece = board[endRow][endCol];
  const pieceColor = isWhitePiece(piece) ? 'white' : 'black';

  // Cannot capture a piece of the same color
  if (targetPiece) {
    const targetColor = isWhitePiece(targetPiece) ? 'white' : 'black';
    if (pieceColor === targetColor) {
      return false;
    }
  }

  const pieceType = piece?.toLowerCase();
  const rowDiff = Math.abs(startRow - endRow);
  const colDiff = Math.abs(startCol - endCol);

  switch (pieceType) {
    case 'p': // Pawn
      const direction = pieceColor === 'white' ? -1 : 1;
      // Moving forward
      if (startCol === endCol && targetPiece === null) {
        // Move one square
        if (startRow + direction === endRow) return true;
        // Move two squares from starting position
        const startRank = pieceColor === 'white' ? 6 : 1;
        if (startRow === startRank && startRow + 2 * direction === endRow && board[startRow + direction][startCol] === null) {
          return true;
        }
      }
      // Capturing
      if (rowDiff === 1 && colDiff === 1 && targetPiece !== null && startRow + direction === endRow) {
        return true;
      }
      return false;

    case 'r': // Rook
      if (startRow === endRow || startCol === endCol) {
        // Check for pieces in the path
        if (startRow === endRow) { // Horizontal move
          const [minCol, maxCol] = [Math.min(startCol, endCol), Math.max(startCol, endCol)];
          for (let col = minCol + 1; col < maxCol; col++) {
            if (board[startRow][col] !== null) return false;
          }
        } else { // Vertical move
          const [minRow, maxRow] = [Math.min(startRow, endRow), Math.max(startRow, endRow)];
          for (let row = minRow + 1; row < maxRow; row++) {
            if (board[row][startCol] !== null) return false;
          }
        }
        return true;
      }
      return false;

    case 'n': // Knight
      return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

    case 'b': // Bishop
      if (rowDiff === colDiff) {
        // Check for pieces in the path
        const rowStep = (endRow - startRow) > 0 ? 1 : -1;
        const colStep = (endCol - startCol) > 0 ? 1 : -1;
        for (let i = 1; i < rowDiff; i++) {
          if (board[startRow + i * rowStep][startCol + i * colStep] !== null) {
            return false;
          }
        }
        return true;
      }
      return false;

    case 'q': // Queen
      // Rook-like move
      if (startRow === endRow || startCol === endCol) {
        if (startRow === endRow) {
          const [minCol, maxCol] = [Math.min(startCol, endCol), Math.max(startCol, endCol)];
          for (let col = minCol + 1; col < maxCol; col++) {
            if (board[startRow][col] !== null) return false;
          }
        } else {
          const [minRow, maxRow] = [Math.min(startRow, endRow), Math.max(startRow, endRow)];
          for (let row = minRow + 1; row < maxRow; row++) {
            if (board[row][startCol] !== null) return false;
          }
        }
        return true;
      }
      // Bishop-like move
      if (rowDiff === colDiff) {
        const rowStep = (endRow - startRow) > 0 ? 1 : -1;
        const colStep = (endCol - startCol) > 0 ? 1 : -1;
        for (let i = 1; i < rowDiff; i++) {
          if (board[startRow + i * rowStep][startCol + i * colStep] !== null) {
            return false;
          }
        }
        return true;
      }
      return false;

    case 'k': // King
      return rowDiff <= 1 && colDiff <= 1;

    default:
      return false;
  }
};


const Chessboard: React.FC<ChessboardProps> = ({ initialBoard, isStatic=false }) => {
  const [board, setBoard] = useState(initialBoard || (isStatic ? puzzleBoard : defaultBoard));
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);

  const handleSquareClick = (row: number, col: number) => {
    if (isStatic) return;

    if (selectedPiece) {
      const [startRow, startCol] = selectedPiece;
      const piece = board[startRow][startCol];

      if (startRow === row && startCol === col) {
        setSelectedPiece(null);
        return;
      }

      if (piece && isValidMove(board, startRow, startCol, row, col)) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = piece;
        newBoard[startRow][startCol] = null;
        setBoard(newBoard);
        setSelectedPiece(null);
      } else {
        // If the new click is on another piece of the same color, select it
        const targetPiece = board[row][col];
        if (targetPiece) {
           const pieceColor = isWhitePiece(piece) ? 'white' : 'black';
           const targetColor = isWhitePiece(targetPiece) ? 'white' : 'black';
           if (pieceColor === targetColor) {
            setSelectedPiece([row, col]);
            return;
           }
        }
        setSelectedPiece(null); // Deselect on invalid move
      }
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
