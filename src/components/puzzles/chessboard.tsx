
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { type BoardTheme, boardThemes } from '@/lib/board-themes';
import { type Puzzle } from '@/lib/puzzles';

type Piece = 'k' | 'q' | 'r' | 'b' | 'n' | 'p' | 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | null;
export type Board = Piece[][];
type PlayerTurn = 'white' | 'black';
type PlayerColor = 'white' | 'black' | 'random';
export type GameResult = 'checkmate-white' | 'checkmate-black' | 'stalemate' | 'resign-white' | 'resign-black';
export interface Move {
    before: string; // FEN before move
    after: string; // FEN after move
    san: string; // Standard Algebraic Notation
}
interface CastlingRights {
    K: boolean; // White kingside
    Q: boolean; // White queenside
    k: boolean; // Black kingside
    q: boolean; // Black queenside
}

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

const boardToFen = (board: Board, turn: PlayerTurn, castling: CastlingRights): string => {
    const fenRows = board.map(row => {
        let fenRow = '';
        let emptyCount = 0;
        for (const piece of row) {
            if (piece) {
                if (emptyCount > 0) {
                    fenRow += emptyCount;
                    emptyCount = 0;
                }
                fenRow += piece;
            } else {
                emptyCount++;
            }
        }
        if (emptyCount > 0) {
            fenRow += emptyCount;
        }
        return fenRow;
    });

    let castlingStr = '';
    if (castling.K) castlingStr += 'K';
    if (castling.Q) castlingStr += 'Q';
    if (castling.k) castlingStr += 'k';
    if (castling.q) castlingStr += 'q';
    if (castlingStr === '') castlingStr = '-';

    return `${fenRows.join('/')} ${turn === 'white' ? 'w' : 'b'} ${castlingStr} - 0 1`;
};


// FEN parsing function
const fenToBoard = (fen: string): [Board, PlayerTurn, CastlingRights] => {
  const [boardPart, turnPart, castlingPart] = fen.split(' ');
  const rows = boardPart.split('/');
  const board: Board = rows.map(row => {
    const newRow: Piece[] = [];
    for (const char of row) {
      if (isNaN(parseInt(char))) {
        newRow.push(char as Piece);
      } else {
        for (let i = 0; i < parseInt(char); i++) {
          newRow.push(null);
        }
      }
    }
    return newRow;
  });
  const turn: PlayerTurn = turnPart === 'w' ? 'white' : 'black';
  const castlingRights: CastlingRights = {
    K: castlingPart.includes('K'),
    Q: castlingPart.includes('Q'),
    k: castlingPart.includes('k'),
    q: castlingPart.includes('q'),
  };
  return [board, turn, castlingRights];
};

interface ChessboardProps {
  puzzle?: Puzzle;
  isStatic?: boolean;
  aiLevel?: number;
  onGameOver?: (result: GameResult, moveHistory: Move[]) => void;
  onPuzzleCorrect?: () => void;
  onPuzzleIncorrect?: () => void;
  playerColor?: PlayerColor;
  boardTheme?: string;
  initialFen?: string;
  showSolutionMove?: string;
}

const isWhitePiece = (piece: Piece) => piece !== null && piece === piece.toUpperCase();
const isBlackPiece = (piece: Piece) => piece !== null && piece === piece.toLowerCase();

const getPieceColor = (piece: Piece): 'white' | 'black' | null => {
    if (isWhitePiece(piece)) return 'white';
    if (isBlackPiece(piece)) return 'black';
    return null;
}

const squareToNotation = (row: number, col: number) => {
    return `${'abcdefgh'[col]}${8 - row}`;
}

const notationToSquare = (notation: string): [number, number] | null => {
    if (notation.length < 2) return null;
    const file = notation.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(notation.substring(1), 10);
    if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
        return [rank, file];
    }
    return null;
}


const moveSan = (board: Board, startRow: number, startCol: number, endRow: number, endCol: number): string => {
    const piece = board[startRow][startCol];
    if (!piece) return '';

    // Handle castling notation
    if (piece.toLowerCase() === 'k' && Math.abs(startCol - endCol) === 2) {
        return endCol > startCol ? 'O-O' : 'O-O-O';
    }

    const pieceType = piece.toUpperCase();
    const targetSquare = squareToNotation(endRow, endCol);
    const isCapture = board[endRow][endCol] !== null;

    if (pieceType === 'P') {
        return isCapture ? `${'abcdefgh'[startCol]}x${targetSquare}` : targetSquare;
    }

    // This is a simplified SAN generation. A real one is much more complex.
    return `${pieceType !== 'P' ? pieceType : ''}${isCapture ? 'x' : ''}${targetSquare}`;
};

const isMoveValidWithoutCheck = (board: Board, startRow: number, startCol: number, endRow: number, endCol: number): boolean => {
  const piece = board[startRow][startCol];
  const targetPiece = board[endRow][endCol];
  
  if (!piece) return false;

  const pieceColor = getPieceColor(piece);

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
      if (startCol === endCol && targetPiece === null) {
        if (startRow + direction === endRow) return true;
        const startRank = pieceColor === 'white' ? 6 : 1;
        if (startRow === startRank && startRow + 2 * direction === endRow && board[startRow + direction][startCol] === null) {
          return true;
        }
      }
      if (rowDiff === 1 && colDiff === 1 && targetPiece !== null && startRow + direction === endRow) {
        return true;
      }
      return false;

    case 'r': // Rook
      if (startRow === endRow || startCol === endCol) {
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
    if (!kingPos) return true;
    const [kingRow, kingCol] = kingPos;
    const opponentColor = kingColor === 'white' ? 'black' : 'white';
    return isSquareAttacked(board, kingRow, kingCol, opponentColor);
};


const isValidMove = (
    board: Board, 
    startRow: number, 
    startCol: number, 
    endRow: number, 
    endCol: number,
    castlingRights: CastlingRights
): boolean => {
    const piece = board[startRow][startCol];
    if (!piece) return false;
    const color = getPieceColor(piece);
    if (!color) return false;
    const opponentColor = color === 'white' ? 'black' : 'white';
    
    // Check for castling
    if (piece.toLowerCase() === 'k' && Math.abs(startCol - endCol) === 2 && startRow === endRow) {
        if (isKingInCheck(board, color)) return false;

        const isKingside = endCol > startCol;
        if (isKingside) { // Kingside castle
            if (color === 'white' && !castlingRights.K) return false;
            if (color === 'black' && !castlingRights.k) return false;
            // Check for pieces between king and rook
            if (board[startRow][startCol + 1] !== null || board[startRow][startCol + 2] !== null) return false;
            // Check if king passes through check
            if (isSquareAttacked(board, startRow, startCol + 1, opponentColor)) return false;
        } else { // Queenside castle
            if (color === 'white' && !castlingRights.Q) return false;
            if (color === 'black' && !castlingRights.q) return false;
            // Check for pieces between king and rook
            if (board[startRow][startCol - 1] !== null || board[startRow][startCol - 2] !== null || board[startRow][startCol - 3] !== null) return false;
            // Check if king passes through check
            if (isSquareAttacked(board, startRow, startCol - 1, opponentColor)) return false;
        }
        return true; // The final square is checked in the general check validation below
    }

    if (!isMoveValidWithoutCheck(board, startRow, startCol, endRow, endCol)) {
        return false;
    }

    const newBoard = board.map(r => [...r]);
    newBoard[endRow][endCol] = newBoard[startRow][startCol];
    newBoard[startRow][startCol] = null;

    return !isKingInCheck(newBoard, color);
};

const hasAnyValidMove = (board: Board, color: PlayerTurn, castlingRights: CastlingRights) => {
    for (let r1 = 0; r1 < 8; r1++) {
        for (let c1 = 0; c1 < 8; c1++) {
            if (getPieceColor(board[r1][c1]) === color) {
                for (let r2 = 0; r2 < 8; r2++) {
                    for (let c2 = 0; c2 < 8; c2++) {
                        if (isValidMove(board, r1, c1, r2, c2, castlingRights)) {
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

const evaluateBoard = (board: Board): number => {
    let totalEvaluation = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                const pieceValue = pieceValues[piece.toLowerCase() as keyof typeof pieceValues] || 0;
                const positionalValue = getPositionalValue(piece, row, col);
                const value = pieceValue + positionalValue;
                totalEvaluation += (getPieceColor(piece) === 'white' ? value : -value);
            }
        }
    }
    return totalEvaluation;
};

const Chessboard: React.FC<ChessboardProps> = ({ puzzle, isStatic=false, aiLevel = 200, onGameOver, onPuzzleCorrect, onPuzzleIncorrect, playerColor: initialPlayerColor = 'white', boardTheme: boardThemeId = 'default', initialFen, showSolutionMove }) => {
  const [initialBoardState, initialTurnState, initialCastlingState] = useMemo(() => {
    const fen = initialFen || puzzle?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    return fenToBoard(fen);
  }, [puzzle, initialFen]);

  const [board, setBoard] = useState<Board>(initialBoardState);
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [turn, setTurn] = useState<PlayerTurn>(initialTurnState);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(initialCastlingState);
  const [isGameOver, setIsGameOver] = useState(false);
  const [playerColor, setPlayerColor] = useState<PlayerTurn>('white');
  const [aiColor, setAiColor] = useState<PlayerTurn>('black');
  const [currentTheme, setCurrentTheme] = useState<BoardTheme | undefined>(boardThemes.find(t => t.id === boardThemeId));
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);

  useEffect(() => {
    setCurrentTheme(boardThemes.find(t => t.id === boardThemeId));
  }, [boardThemeId]);
  
  useEffect(() => {
    setBoard(initialBoardState);
    setTurn(initialTurnState);
    setCastlingRights(initialCastlingState);
    const fen = initialFen || puzzle?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    setMoveHistory(initialFen ? [{before: fen, after: fen, san: 'start'}] : []);
  }, [initialBoardState, initialTurnState, initialCastlingState, initialFen, puzzle]);

  useEffect(() => {
    let chosenPlayerColor: PlayerTurn = initialPlayerColor === 'random' 
        ? (Math.random() > 0.5 ? 'white' : 'black') 
        : initialPlayerColor;
    
    if (puzzle) {
        chosenPlayerColor = initialTurnState;
    }
    
    setPlayerColor(chosenPlayerColor);
    setAiColor(chosenPlayerColor === 'white' ? 'black' : 'white');
  }, [initialPlayerColor, puzzle, initialTurnState]);


  const checkEndGame = useCallback((currentBoard: Board, nextTurn: PlayerTurn, currentCastlingRights: CastlingRights) => {
    if (isGameOver) return;
    
    if (!hasAnyValidMove(currentBoard, nextTurn, currentCastlingRights)) {
        setIsGameOver(true);
        if (isKingInCheck(currentBoard, nextTurn)) {
            const result: GameResult = nextTurn === playerColor ? 'checkmate-black' : 'checkmate-white';
            onGameOver?.(result, moveHistory);
        } else {
            onGameOver?.('stalemate', moveHistory);
        }
    }
  }, [isGameOver, onGameOver, playerColor, moveHistory]);

  const updateCastlingRights = (rights: CastlingRights, piece: Piece, startRow: number, startCol: number) => {
    const newRights = { ...rights };
    if (piece === 'K') {
      newRights.K = false;
      newRights.Q = false;
    } else if (piece === 'k') {
      newRights.k = false;
      newRights.q = false;
    } else if (piece === 'R') {
      if (startRow === 7 && startCol === 0) newRights.Q = false;
      if (startRow === 7 && startCol === 7) newRights.K = false;
    } else if (piece === 'r') {
      if (startRow === 0 && startCol === 0) newRights.q = false;
      if (startRow === 0 && startCol === 7) newRights.k = false;
    }
    return newRights;
  };


  const makeAIMove = useCallback((currentBoard: Board, currentCastlingRights: CastlingRights) => {
    const opponentColor = playerColor;
    let bestMove: { start: [number, number]; end: [number, number] } | null = null;
    let bestValue = -Infinity;
    let allAIMoves: { start: [number, number]; end: [number, number], value: number }[] = [];

    for (let r1 = 0; r1 < 8; r1++) {
        for (let c1 = 0; c1 < 8; c1++) {
            const piece = currentBoard[r1][c1];
            if (piece && getPieceColor(piece) === aiColor) {
                for (let r2 = 0; r2 < 8; r2++) {
                    for (let c2 = 0; c2 < 8; c2++) {
                        if (isValidMove(currentBoard, r1, c1, r2, c2, currentCastlingRights)) {
                            const newBoard = currentBoard.map(r => [...r]);
                            newBoard[r2][c2] = newBoard[r1][c1];
                            newBoard[r1][c1] = null;
                            
                            let moveValue = -evaluateBoard(newBoard); // AI wants to minimize the score (negative for black)

                            if (isKingInCheck(newBoard, opponentColor)) {
                                if (!hasAnyValidMove(newBoard, opponentColor, currentCastlingRights)) {
                                    moveValue += 10000;
                                } else {
                                    moveValue += 0.5;
                                }
                            }

                            allAIMoves.push({ start: [r1, c1], end: [r2, c2], value: moveValue });
                        }
                    }
                }
            }
        }
    }
    
    if (allAIMoves.length === 0) {
        checkEndGame(currentBoard, aiColor, currentCastlingRights);
        return;
    }

    // Add randomness based on aiLevel
    const randomnessFactor = 1.0 - (aiLevel / 3200); // 0.0 for perfect AI, 1.0 for completely random
    const randomizedMoves = allAIMoves.map(move => ({
        ...move,
        value: move.value + (Math.random() * 2 - 1) * randomnessFactor * 5 // Randomness scaled by factor
    }));

    randomizedMoves.sort((a, b) => b.value - a.value);
    
    bestMove = randomizedMoves[0];

    if (bestMove) {
      const { start, end } = bestMove;
      const [startRow, startCol] = start;
      const [endRow, endCol] = end;

      const newBoard = currentBoard.map((r) => [...r]);
      const san = moveSan(newBoard, startRow, startCol, endRow, endCol);
      const beforeFen = boardToFen(newBoard, aiColor, currentCastlingRights);
      
      const pieceToMove = newBoard[startRow][startCol];
      newBoard[endRow][endCol] = pieceToMove;
      newBoard[startRow][startCol] = null;

      // Handle castling rook move for AI
        if (pieceToMove?.toLowerCase() === 'k' && Math.abs(startCol - endCol) === 2) {
            if (endCol > startCol) { // Kingside
                newBoard[startRow][5] = newBoard[startRow][7];
                newBoard[startRow][7] = null;
            } else { // Queenside
                newBoard[startRow][3] = newBoard[startRow][0];
                newBoard[startRow][0] = null;
            }
        }

      const newCastlingRights = updateCastlingRights(currentCastlingRights, pieceToMove, startRow, startCol);
      setCastlingRights(newCastlingRights);

      const afterFen = boardToFen(newBoard, playerColor, newCastlingRights);
      setMoveHistory(prev => [...prev, { before: beforeFen, after: afterFen, san }]);
      setBoard(newBoard);
      setTurn(playerColor);
      checkEndGame(newBoard, playerColor, newCastlingRights);
    } else {
        checkEndGame(currentBoard, aiColor, currentCastlingRights);
    }
  }, [checkEndGame, aiColor, playerColor, aiLevel]);
  
  useEffect(() => {
    if (turn === aiColor && !isStatic && !isGameOver && !puzzle) {
      const thinkTime = 500 + Math.random() * 500;
      setTimeout(() => makeAIMove(board, castlingRights), thinkTime);
    }
  }, [turn, board, castlingRights, isStatic, isGameOver, makeAIMove, aiColor, puzzle]);

  const makeMove = useCallback((startRow: number, startCol: number, endRow: number, endCol: number) => {
    const newBoard = board.map(r => [...r]);
    const pieceToMove = newBoard[startRow][startCol];
    newBoard[endRow][endCol] = pieceToMove;
    newBoard[startRow][startCol] = null;
    setBoard(newBoard);
  }, [board]);

  const [solutionMove, solutionArrow] = useMemo(() => {
    if (!showSolutionMove || !puzzle) return [null, null];

    let startSquare: [number, number] | null = null;
    let endSquare: [number, number] | null = null;
    
    // Simplified SAN parsing for puzzles
    const move = puzzle.solution[0].replace(/[+#]/g, '');

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (getPieceColor(board[r][c]) === turn) {
                for (let r2 = 0; r2 < 8; r2++) {
                    for (let c2 = 0; c2 < 8; c2++) {
                        if(isValidMove(board, r, c, r2, c2, castlingRights)) {
                            const san = moveSan(board, r, c, r2, c2);
                            if (san.includes(move)) {
                                startSquare = [r, c];
                                endSquare = [r2, c2];
                                break;
                            }
                        }
                    }
                }
            }
            if(startSquare) break;
        }
        if(startSquare) break;
    }
    
    if (!startSquare || !endSquare) return [null, null];

    const getCoords = (row: number, col: number) => {
        let r = boardOrientation === 'white' ? row : 7 - row;
        let c = boardOrientation === 'white' ? col : 7 - col;
        const x = c * 12.5 + 6.25;
        const y = r * 12.5 + 6.25;
        return { x, y };
    };

    const startCoords = getCoords(startSquare[0], startSquare[1]);
    const endCoords = getCoords(endSquare[0], endSquare[1]);
    
    const arrow = {
        x1: `${startCoords.x}%`,
        y1: `${startCoords.y}%`,
        x2: `${endCoords.x}%`,
        y2: `${endCoords.y}%`,
    }

    return [{ start: startSquare, end: endSquare }, arrow];

  }, [showSolutionMove, puzzle, board, turn, castlingRights, boardOrientation]);


  useEffect(() => {
    if (solutionMove) {
      const { start, end } = solutionMove;
      makeMove(start[0], start[1], end[0], end[1]);
      onPuzzleCorrect?.();
    }
  }, [solutionMove, makeMove, onPuzzleCorrect]);


  const handleSquareClick = (row: number, col: number) => {
    if (isStatic || turn !== playerColor || isGameOver || showSolutionMove) return;

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
        
        if (puzzle) {
            const piece = board[startRow][startCol] as string;
            const targetSquare = squareToNotation(row, col);
            const moveNotation = moveSan(board, startRow, startCol, row, col);

            // Simple check: does the player's move notation (e.g., "Nxe5") match the end of the solution string?
            if(puzzle.solution.some(s => moveNotation.includes(s.replace(/[+#]/g, '')))) {
                makeMove(startRow, startCol, row, col);
                onPuzzleCorrect?.();
            } else {
                onPuzzleIncorrect?.();
                setSelectedPiece(null);
                setPossibleMoves([]);
                return; 
            }
        } else {
            const san = moveSan(board, startRow, startCol, row, col);
            const beforeFen = boardToFen(board, playerColor, castlingRights);

            const pieceToMove = board[startRow][startCol];
            const newBoard = board.map(r => [...r]);
            newBoard[row][col] = pieceToMove;
            newBoard[startRow][startCol] = null;
            
            // Handle castling rook move for player
            if (pieceToMove?.toLowerCase() === 'k' && Math.abs(startCol - col) === 2) {
                if (col > startCol) { // Kingside
                    newBoard[startRow][5] = newBoard[startRow][7];
                    newBoard[startRow][7] = null;
                } else { // Queenside
                    newBoard[startRow][3] = newBoard[startRow][0];
                    newBoard[startRow][0] = null;
                }
            }

            if (pieceToMove?.toLowerCase() === 'p' && (row === 0 || row === 7)) {
                newBoard[row][col] = getPieceColor(newBoard[row][col]) === 'white' ? 'Q' : 'q';
            }

            const newCastlingRights = updateCastlingRights(castlingRights, pieceToMove, startRow, startCol);
            setCastlingRights(newCastlingRights);
            
            const afterFen = boardToFen(newBoard, aiColor, newCastlingRights);
            setMoveHistory(prev => [...prev, { before: beforeFen, after: afterFen, san }]);
            setBoard(newBoard);
            
            checkEndGame(newBoard, aiColor, newCastlingRights);
            setTurn(aiColor);
        }

        setSelectedPiece(null);
        setPossibleMoves([]);
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
        if (isValidMove(board, row, col, i, j, castlingRights)) {
          moves.push([i, j]);
        }
      }
    }
    setPossibleMoves(moves);
  };

  const boardOrientation = puzzle ? initialTurnState : playerColor;

  const files = boardOrientation === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
  const ranks = boardOrientation === 'white' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];
  
  const displayBoard = useMemo(() => {
    return boardOrientation === 'white' ? board : board.map(row => row.slice().reverse()).reverse();
  }, [board, boardOrientation]);
  
  const theme = currentTheme || boardThemes[0];
  const lightSquareClass = theme.light;
  const darkSquareClass = theme.dark;

  return (
    <div className="relative aspect-square w-full max-w-lg mx-auto shadow-2xl rounded-lg overflow-hidden border-4 border-card">
      <div className="grid grid-cols-8 grid-rows-8 aspect-square">
        {displayBoard.map((rowArr, rowIndex) =>
          rowArr.map((piece, colIndex) => {
            
            const originalRow = boardOrientation === 'white' ? rowIndex : 7 - rowIndex;
            const originalCol = boardOrientation === 'white' ? colIndex : 7 - colIndex;

            const isSelected = selectedPiece && selectedPiece[0] === originalRow && selectedPiece[1] === originalCol;
            const isPossibleMove = possibleMoves.some(([r, c]) => r === originalRow && c === originalCol);
            const pieceColor = getPieceColor(piece);
            const isLight = (originalRow + originalCol) % 2 !== 0;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(originalRow, originalCol)}
                className={cn(
                  'flex items-center justify-center relative',
                  isLight ? lightSquareClass : darkSquareClass,
                  isSelected && 'bg-yellow-400/70 ring-2 ring-yellow-500',
                  !isStatic && turn === playerColor && !isGameOver && 'cursor-pointer'
                )}
              >
                {isPossibleMove && !piece && (
                  <div className="absolute h-1/3 w-1/3 rounded-full bg-black/20" />
                )}
                 {isPossibleMove && piece && (
                  <div className="absolute h-[90%] w-[90%] rounded-full border-4 border-black/20" />
                )}
                <span className={cn("text-4xl md:text-5xl relative drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] z-10", {
                    "text-stone-100": pieceColor === 'white',
                    "text-black": pieceColor === 'black',
                })}>
                  {piece && pieceToUnicode[piece]}
                </span>
              </div>
            );
          })
        )}
      </div>
       {ranks.map((rank, i) => (
        <div key={rank} className="absolute top-0 h-full w-full pointer-events-none">
            <span style={{top: `${i * 12.5}%`}} className={cn("absolute text-xs font-bold opacity-50", isLight(i, 0) ? darkSquareClass : lightSquareClass, boardOrientation === 'white' ? 'left-0.5' : 'right-0.5' )}>
                {rank}
            </span>
        </div>
      ))}
      {files.map((file, i) => (
        <div key={file} className="absolute top-0 h-full w-full pointer-events-none">
            <span style={{left: `${i * 12.5}%`, transform: 'translateX(0.2rem)'}} className={cn("absolute text-xs font-bold opacity-50", isLight(7, i) ? darkSquareClass : lightSquareClass, boardOrientation === 'white' ? 'bottom-0.5' : 'top-0.5')}>
                {file}
            </span>
        </div>
      ))}
       {solutionArrow && (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-80" viewBox="0 0 100 100">
            <defs>
                <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="0" refY="1.75" orient="auto">
                    <polygon points="0 0, 5 1.75, 0 3.5" fill="rgb(34 197 94 / 1)" />
                </marker>
            </defs>
            <line 
                x1={solutionArrow.x1} y1={solutionArrow.y1} 
                x2={solutionArrow.x2} y2={solutionArrow.y2} 
                stroke="rgb(34 197 94 / 1)" 
                strokeWidth="2.5" 
                markerEnd="url(#arrowhead)" 
            />
        </svg>
      )}
    </div>
  );
};
const isLight = (row: number, col: number) => (row + col) % 2 !== 0;


export default Chessboard;

    