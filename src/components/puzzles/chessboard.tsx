
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { type BoardTheme, boardThemes } from '@/lib/board-themes';

type Piece = 'k' | 'q' | 'r' | 'b' | 'n' | 'p' | 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | null;
export type Board = Piece[][];
type PlayerTurn = 'white' | 'black';
type PlayerColor = 'white' | 'black' | 'random';
export type GameResult = 'checkmate-white' | 'checkmate-black' | 'stalemate';

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
  onGameOver?: (result: GameResult) => void;
  playerColor?: PlayerColor;
  boardTheme?: string;
}

const isWhitePiece = (piece: Piece) => piece !== null && piece === piece.toUpperCase();
const isBlackPiece = (piece: Piece) => piece !== null && piece === piece.toLowerCase();

const getPieceColor = (piece: Piece): 'white' | 'black' | null => {
    if (isWhitePiece(piece)) return 'white';
    if (isBlackPiece(piece)) return 'black';
    return null;
}

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
    if (!kingPos) return true; // King is captured, game over.
    const [kingRow, kingCol] = kingPos;
    const opponentColor = kingColor === 'white' ? 'black' : 'white';
    return isSquareAttacked(board, kingRow, kingCol, opponentColor);
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

const hasAnyValidMove = (board: Board, color: PlayerTurn) => {
    for (let r1 = 0; r1 < 8; r1++) {
        for (let c1 = 0; c1 < 8; c1++) {
            if (getPieceColor(board[r1][c1]) === color) {
                for (let r2 = 0; r2 < 8; r2++) {
                    for (let c2 = 0; c2 < 8; c2++) {
                        if (isValidMove(board, r1, c1, r2, c2)) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

const pieceValues: { [key in Piece as string]: number } = {
  k: 1000, q: 9, r: 5, b: 3, n: 3, p: 1,
  K: 1000, Q: 9, R: 5, B: 3, N: 3, P: 1,
};

const pawnPos = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5,  5,  5,  5,  5,  5,  5,  5],
    [1,  1,  2,  3,  3,  2,  1,  1],
    [0.5,0.5,1,  2.5,2.5,1,  0.5,0.5],
    [0,  0,  0,  2,  2,  0,  0,  0],
    [0.5,-0.5,-1,0,  0,-1, -0.5,0.5],
    [0.5,1,  1,-2,-2,  1,  1,  0.5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const knightPos = [
    [-5, -4, -3, -3, -3, -3, -4, -5],
    [-4, -2,  0,  0,  0,  0, -2, -4],
    [-3,  0,  1,1.5,1.5,  1,  0, -3],
    [-3,0.5,1.5,  2,  2,1.5,0.5, -3],
    [-3,  0,1.5,  2,  2,1.5,  0, -3],
    [-3,0.5,  1,1.5,1.5,  1,0.5, -3],
    [-4, -2,  0,0.5,0.5,  0, -2, -4],
    [-5, -4, -3, -3, -3, -3, -4, -5]
];

const bishopPos = [
    [-2,-1,-1,-1,-1,-1,-1,-2],
    [-1, 0, 0, 0, 0, 0, 0,-1],
    [-1, 0,0.5, 1, 1,0.5, 0,-1],
    [-1,0.5,0.5,1, 1,0.5,0.5,-1],
    [-1, 0, 1, 1, 1, 1, 0,-1],
    [-1, 1, 1, 1, 1, 1, 1,-1],
    [-1,0.5,0, 0, 0, 0,0.5,-1],
    [-2,-1,-1,-1,-1,-1,-1,-2]
];

const getPositionalValue = (piece: Piece, row: number, col: number) => {
    if (!piece) return 0;
    const pieceColor = getPieceColor(piece);
    const pieceType = piece.toLowerCase();
    
    const table = (() => {
        switch (pieceType) {
            case 'p': return pawnPos;
            case 'n': return knightPos;
            case 'b': return bishopPos;
            default: return null;
        }
    })();
    
    if (!table) return 0;

    const value = pieceColor === 'white' ? table[row][col] : table.slice().reverse()[row][col];
    return pieceColor === 'white' ? value : -value;
}


const Chessboard: React.FC<ChessboardProps> = ({ initialBoard, isStatic=false, aiLevel=800, onGameOver, playerColor: initialPlayerColor = 'white', boardTheme: boardThemeId = 'default' }) => {
  const [board, setBoard] = useState(initialBoard || (isStatic ? puzzleBoard : defaultBoard));
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [turn, setTurn] = useState<PlayerTurn>('white');
  const [isGameOver, setIsGameOver] = useState(false);
  const [playerColor, setPlayerColor] = useState<PlayerTurn>('white');
  const [aiColor, setAiColor] = useState<PlayerTurn>('black');
  const [currentTheme, setCurrentTheme] = useState<BoardTheme | undefined>(boardThemes.find(t => t.id === boardThemeId));

  useEffect(() => {
    setCurrentTheme(boardThemes.find(t => t.id === boardThemeId));
  }, [boardThemeId]);

  useEffect(() => {
    let chosenPlayerColor: PlayerTurn = 'white';
    if (initialPlayerColor === 'random') {
      chosenPlayerColor = Math.random() > 0.5 ? 'white' : 'black';
    } else {
      chosenPlayerColor = initialPlayerColor;
    }
    setPlayerColor(chosenPlayerColor);
    setAiColor(chosenPlayerColor === 'white' ? 'black' : 'white');
  }, [initialPlayerColor]);


  const checkEndGame = useCallback((currentBoard: Board, nextTurn: PlayerTurn) => {
    if (isGameOver) return;
    
    if (!hasAnyValidMove(currentBoard, nextTurn)) {
        setIsGameOver(true);
        if (isKingInCheck(currentBoard, nextTurn)) {
            const result: GameResult = nextTurn === playerColor ? 'checkmate-black' : 'checkmate-white';
            onGameOver?.(result);
        } else {
            onGameOver?.('stalemate');
        }
    }
  }, [isGameOver, onGameOver, playerColor]);

  const makeAIMove = useCallback((currentBoard: Board) => {
    const opponentColor = playerColor;
    let bestMove: { start: [number, number]; end: [number, number] } | null = null;
    let bestValue = -Infinity;
    let allAIMoves: { start: [number, number]; end: [number, number] }[] = [];

    // Find all possible moves for the AI
    for (let r1 = 0; r1 < 8; r1++) {
        for (let c1 = 0; c1 < 8; c1++) {
            const piece = currentBoard[r1][c1];
            if (piece && getPieceColor(piece) === aiColor) {
                for (let r2 = 0; r2 < 8; r2++) {
                    for (let c2 = 0; c2 < 8; c2++) {
                        if (isValidMove(currentBoard, r1, c1, r2, c2)) {
                            allAIMoves.push({ start: [r1, c1], end: [r2, c2] });

                            const newBoard = currentBoard.map(r => [...r]);
                            newBoard[r2][c2] = newBoard[r1][c1];
                            newBoard[r1][c1] = null;
                            
                            let moveValue = 0;
                            const capturedPiece = currentBoard[r2][c2];
                            if (capturedPiece) {
                                moveValue += pieceValues[capturedPiece] || 0;
                            }

                            // Add positional value
                            moveValue += getPositionalValue(piece, r2, c2) - getPositionalValue(piece, r1, c1);
                            
                            if (isKingInCheck(newBoard, opponentColor)) {
                                if (!hasAnyValidMove(newBoard, opponentColor)) {
                                    moveValue += 10000;
                                } else {
                                    moveValue += 0.5;
                                }
                            }

                            if (moveValue > bestValue) {
                                bestValue = moveValue;
                                bestMove = { start: [r1, c1], end: [r2, c2] };
                            }
                        }
                    }
                }
            }
        }
    }

    if (!bestMove && allAIMoves.length > 0) {
      bestMove = allAIMoves[Math.floor(Math.random() * allAIMoves.length)];
    }

    if (bestMove) {
      const { start, end } = bestMove;
      const [startRow, startCol] = start;
      const [endRow, endCol] = end;

      const pieceToMove = currentBoard[startRow][startCol];
      const newBoard = currentBoard.map((r) => [...r]);
      newBoard[endRow][endCol] = pieceToMove;
      newBoard[startRow][startCol] = null;

      setBoard(newBoard);
      setTurn(playerColor);
      checkEndGame(newBoard, playerColor);
    } else {
        checkEndGame(currentBoard, aiColor);
    }
  }, [checkEndGame, aiColor, playerColor]);
  
  useEffect(() => {
    if (turn === aiColor && !isStatic && !isGameOver) {
      const thinkTime = 500 + Math.random() * 500;
      setTimeout(() => makeAIMove(board), thinkTime);
    }
  }, [turn, board, isStatic, isGameOver, makeAIMove, aiColor]);


  const handleSquareClick = (row: number, col: number) => {
    if (isStatic || turn !== playerColor || isGameOver) return;

    const clickedPiece = board[row][col];
    const clickedPieceColor = getPieceColor(clickedPiece);

    if (selectedPiece) {
      const [startRow, startCol] = selectedPiece;
      
      if (startRow === row && startCol === col) {
        setSelectedPiece(null);
        setPossibleMoves([]);
        return;
      }

      if (clickedPieceColor === turn) {
        setSelectedPiece([row, col]);
        calculatePossibleMoves(row, col);
        return;
      }
      
      if (possibleMoves.some(([r, c]) => r === row && c === col)) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = newBoard[startRow][startCol];
        newBoard[startRow][startCol] = null;
        
        if (newBoard[row][col]?.toLowerCase() === 'p' && (row === 0 || row === 7)) {
            newBoard[row][col] = getPieceColor(newBoard[row][col]) === 'white' ? 'Q' : 'q';
        }

        setBoard(newBoard);
        setSelectedPiece(null);
        setPossibleMoves([]);
        checkEndGame(newBoard, aiColor);
        setTurn(aiColor);
      } else {
        setSelectedPiece(null); 
        setPossibleMoves([]);
      }
    } else if (clickedPiece && clickedPieceColor === turn) {
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


  const files = playerColor === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
  const ranks = playerColor === 'white' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];
  const displayBoard = playerColor === 'white' ? board : board.map(row => row.slice().reverse()).reverse();
  const theme = currentTheme || boardThemes[0];
  const lightSquareClass = theme.light;
  const darkSquareClass = theme.dark;

  return (
    <div className="relative aspect-square w-full max-w-lg mx-auto shadow-2xl rounded-lg overflow-hidden border-4 border-card">
      <div className="grid grid-cols-8 grid-rows-8 aspect-square">
        {displayBoard.map((rowArr, rowIndex) =>
          rowArr.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 !== 0;

            // Adjust selection and possible moves based on board orientation
            const originalRow = playerColor === 'white' ? rowIndex : 7 - rowIndex;
            const originalCol = playerColor === 'white' ? colIndex : 7 - colIndex;

            const isSelected = selectedPiece && selectedPiece[0] === originalRow && selectedPiece[1] === originalCol;
            const isPossibleMove = possibleMoves.some(([r, c]) => r === originalRow && c === originalCol);
            const pieceColor = getPieceColor(piece);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(originalRow, originalCol)}
                className={cn(
                  'flex items-center justify-center relative',
                  isLight ? lightSquareClass : darkSquareClass,
                  isSelected && 'bg-yellow-400/70 ring-2 ring-yellow-500',
                  !isStatic && turn === playerColor && !isGameOver && 'cursor-pointer hover:bg-yellow-400/50'
                )}
              >
                {isPossibleMove && !displayBoard[rowIndex][colIndex] && (
                  <div className="absolute h-1/3 w-1/3 rounded-full bg-black/20" />
                )}
                 {isPossibleMove && displayBoard[rowIndex][colIndex] && (
                  <div className="absolute h-[90%] w-[90%] rounded-full border-4 border-black/20" />
                )}
                <span className={cn("text-4xl md:text-5xl relative drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]", {
                    "text-stone-100": pieceColor === 'white',
                    "text-stone-800": pieceColor === 'black',
                })}>
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
            <span style={{top: `${i * 12.5}%`}} className={cn("absolute text-xs font-bold text-neutral-900/40", playerColor === 'white' ? 'left-0.5' : 'right-0.5' )}>
                {rank}
            </span>
        </div>
      ))}
      {/* Files */}
      {files.map((file, i) => (
        <div key={file} className="absolute top-0 h-full w-full pointer-events-none">
            <span style={{left: `${(i * 12.5) + (playerColor === 'white' ? 11 : 0)}%`}} className={cn("absolute text-xs font-bold text-neutral-900/40", playerColor === 'white' ? 'bottom-0.5' : 'top-0.5')}>
                {file}
            </span>
        </div>
      ))}
    </div>
  );
};

export default Chessboard;
