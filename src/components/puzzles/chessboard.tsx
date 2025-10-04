
'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type Piece = 'k' | 'q' | 'r' | 'b' | 'n' | 'p' | 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | null;
type Board = Piece[][];
type PlayerTurn = 'white' | 'black';

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
  aiLevel?: number;
}

const isWhitePiece = (piece: Piece) => piece !== null && piece === piece.toUpperCase();
const isBlackPiece = (piece: Piece) => piece !== null && piece === piece.toLowerCase();

const getPieceColor = (piece: Piece): PlayerTurn | null => {
    if (isWhitePiece(piece)) return 'white';
    if (isBlackPiece(piece)) return 'black';
    return null;
}

const isSquareAttacked = (board: Board, row: number, col: number, attackerColor: PlayerTurn): boolean => {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && getPieceColor(piece) === attackerColor) {
                if (isMoveValidWithoutCheck(board, r, c, row, col)) {
                    return true;
                }
            }
        }
    }
    return false;
};

const findKing = (board: Board, color: PlayerTurn): [number, number] | null => {
    const kingPiece = color === 'white' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === kingPiece) {
                return [r, c];
            }
        }
    }
    return null;
};

const isKingInCheck = (board: Board, kingColor: PlayerTurn): boolean => {
    const kingPos = findKing(board, kingColor);
    if (!kingPos) return false; // Should not happen in a real game
    const [kingRow, kingCol] = kingPos;
    const opponentColor = kingColor === 'white' ? 'black' : 'white';
    return isSquareAttacked(board, kingRow, kingCol, opponentColor);
};


const isMoveValidWithoutCheck = (board: Board, startRow: number, startCol: number, endRow: number, endCol: number): boolean => {
  const piece = board[startRow][startCol];
  const targetPiece = board[endRow][endCol];
  
  if (!piece) return false;

  const pieceColor = getPieceColor(piece);

  // Cannot capture a piece of the same color
  if (targetPiece) {
    const targetColor = getPieceColor(targetPiece);
    if (pieceColor === targetColor) {
      return false;
    }
  }

  const pieceType = piece.toLowerCase();
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

const isValidMove = (board: Board, startRow: number, startCol: number, endRow: number, endCol: number): boolean => {
    if (!isMoveValidWithoutCheck(board, startRow, startCol, endRow, endCol)) {
        return false;
    }

    const piece = board[startRow][startCol];
    if (!piece) return false;

    const pieceColor = getPieceColor(piece);
    if (!pieceColor) return false;

    // Simulate the move
    const newBoard = board.map(r => [...r]);
    newBoard[endRow][endCol] = newBoard[startRow][startCol];
    newBoard[startRow][startCol] = null;

    // Check if the king of the moving player is in check after the move
    return !isKingInCheck(newBoard, pieceColor);
};


const Chessboard: React.FC<ChessboardProps> = ({ initialBoard, isStatic=false, aiLevel=800 }) => {
  const [board, setBoard] = useState(initialBoard || (isStatic ? puzzleBoard : defaultBoard));
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [turn, setTurn] = useState<PlayerTurn>('white');

  const makeAIMove = (currentBoard: Board) => {
    const aiColor = 'black';
    const allAIMoves: { start: [number, number]; end: [number, number] }[] = [];

    // Find all possible moves for the AI
    for (let r1 = 0; r1 < 8; r1++) {
      for (let c1 = 0; c1 < 8; c1++) {
        const piece = currentBoard[r1][c1];
        if (piece && getPieceColor(piece) === aiColor) {
          for (let r2 = 0; r2 < 8; r2++) {
            for (let c2 = 0; c2 < 8; c2++) {
              if (isValidMove(currentBoard, r1, c1, r2, c2)) {
                allAIMoves.push({ start: [r1, c1], end: [r2, c2] });
              }
            }
          }
        }
      }
    }

    if (allAIMoves.length === 0) {
      console.log('Checkmate or stalemate!');
      return;
    }

    // Select a random move
    const randomMove = allAIMoves[Math.floor(Math.random() * allAIMoves.length)];
    const { start, end } = randomMove;
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    const pieceToMove = currentBoard[startRow][startCol];
    const newBoard = currentBoard.map((r) => [...r]);
    newBoard[endRow][endCol] = pieceToMove;
    newBoard[startRow][startCol] = null;

    setBoard(newBoard);
    setTurn('white'); // Switch turn back to the player
  };
  
  useEffect(() => {
    if (turn === 'black' && !isStatic) {
      // AI's turn. The timeout can be adjusted based on aiLevel for perceived difficulty.
      const thinkTime = 500 + Math.random() * 500;
      setTimeout(() => makeAIMove(board), thinkTime);
    }
  }, [turn, board, isStatic, makeAIMove]);


  const handleSquareClick = (row: number, col: number) => {
    if (isStatic || turn !== 'white') return; // Only allow player to move on their turn

    const clickedPiece = board[row][col];
    const clickedPieceColor = getPieceColor(clickedPiece);

    if (selectedPiece) {
      const [startRow, startCol] = selectedPiece;
      
      // If clicking the same piece, deselect it
      if (startRow === row && startCol === col) {
        setSelectedPiece(null);
        setPossibleMoves([]);
        return;
      }

      // If clicking another of your own pieces, switch selection
      if (clickedPieceColor === turn) {
        setSelectedPiece([row, col]);
        calculatePossibleMoves(row, col);
        return;
      }
      
      // Attempt to move
      if (possibleMoves.some(([r, c]) => r === row && c === col)) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = newBoard[startRow][startCol];
        newBoard[startRow][startCol] = null;
        setBoard(newBoard);
        setSelectedPiece(null);
        setPossibleMoves([]);
        setTurn('black'); // Switch turn to AI
      } else {
        // Invalid move, deselect
        setSelectedPiece(null); 
        setPossibleMoves([]);
      }
    } else if (clickedPiece && clickedPieceColor === turn) {
      // Select a piece if it's the current player's turn
      setSelectedPiece([row, col]);
      calculatePossibleMoves(row, col);
    }
  };

  const calculatePossibleMoves = (row: number, col: number) => {
    const moves: [number, number][] = [];
    const piece = board[row][col];
    if (!piece) return;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (isValidMove(board, row, col, i, j)) {
          moves.push([i, j]);
        }
      }
    }
    setPossibleMoves(moves);
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
            const isPossibleMove = possibleMoves.some(([r, c]) => r === rowIndex && c === colIndex);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={cn(
                  'flex items-center justify-center cursor-pointer relative',
                  isLight ? 'bg-secondary' : 'bg-primary/50',
                  isSelected && 'bg-accent/50 ring-2 ring-accent',
                  !isStatic && turn === 'white' && 'hover:bg-accent/30'
                )}
              >
                {isPossibleMove && !isWhitePiece(board[rowIndex][colIndex]) && (
                  <div className="absolute h-1/3 w-1/3 rounded-full bg-black/20" />
                )}
                 {isPossibleMove && isWhitePiece(board[rowIndex][colIndex]) && (
                  <div className="absolute h-[90%] w-[90%] rounded-full border-4 border-black/20" />
                )}
                <span className="text-4xl md:text-5xl relative" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
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
