
'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, BookOpen, BarChart, Sparkles, AlertTriangle, XCircle, Trophy, ChevronsRight, ChevronsLeft, ChevronRight, ChevronLeft as ChevronLeftIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Chessboard, { Move } from '@/components/puzzles/chessboard';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/theme-context';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GameAnalysisOutput } from '@/ai/flows/game-analysis-flow';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export const GameReview = ({ analysis, moveHistory: initialMoveHistory, onBack }: { analysis: GameAnalysisOutput, moveHistory: Move[], onBack: () => void }) => {
    const { boardTheme } = useTheme();
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

    const moveHistory = useMemo(() => [{ before: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', after: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', san: 'Start' }, ...initialMoveHistory], [initialMoveHistory])

    const moveClassificationStyles = {
        brilliant: { icon: <Sparkles className="text-cyan-400" />, text: 'text-cyan-400', label: 'Brilliant' },
        great: { icon: <CheckCircle className="text-blue-500" />, text: 'text-blue-500', label: 'Great' },
        best: { icon: <CheckCircle className="text-green-500" />, text: 'text-green-500', label: 'Best' },
        excellent: { icon: <CheckCircle className="text-green-400" />, text: 'text-green-400', label: 'Excellent' },
        good: { icon: <CheckCircle className="text-lime-500" />, text: 'text-lime-500', label: 'Good' },
        book: { icon: <BookOpen className="text-gray-400" />, text: 'text-gray-400', label: 'Book' },
        inaccuracy: { icon: <AlertTriangle className="text-yellow-500" />, text: 'text-yellow-500', label: 'Inaccuracy' },
        mistake: { icon: <AlertTriangle className="text-orange-500" />, text: 'text-orange-500', label: 'Mistake' },
        miss: { icon: <XCircle className="text-purple-500" />, text: 'text-purple-500', label: 'Miss' },
        blunder: { icon: <XCircle className="text-red-600" />, text: 'text-red-600', label: 'Blunder' },
    };

    const overallAccuracy = useMemo(() => {
        if (!analysis.opening || !analysis.middlegame || !analysis.endgame) return 0;
        const total = analysis.opening.accuracy + analysis.middlegame.accuracy + analysis.endgame.accuracy;
        return Math.round(total / 3);
    }, [analysis]);

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 animate-in fade-in-50">
            <Button variant="ghost" onClick={onBack} className="mb-4">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Menu
            </Button>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <Chessboard
                        isStatic
                        boardTheme={boardTheme}
                        initialFen={moveHistory[currentMoveIndex]?.before}
                    />
                     <div className="flex items-center justify-center gap-2">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => setCurrentMoveIndex(0)} disabled={currentMoveIndex === 0}>
                                        <ChevronsLeft />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>First Move</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => setCurrentMoveIndex(p => Math.max(0, p - 1))} disabled={currentMoveIndex === 0}>
                                        <ChevronLeftIcon />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Previous Move</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => setCurrentMoveIndex(p => Math.min(moveHistory.length - 1, p + 1))} disabled={currentMoveIndex === moveHistory.length - 1}>
                                        <ChevronRight />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Next Move</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="outline" size="icon" onClick={() => setCurrentMoveIndex(moveHistory.length - 1)} disabled={currentMoveIndex === moveHistory.length - 1}>
                                        <ChevronsRight />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Last Move</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Game Review</CardTitle>
                             <CardDescription>Overall Accuracy: {overallAccuracy}%</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analysis.opening && (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <Label>Opening</Label>
                                        <span className="text-sm font-bold">{analysis.opening.accuracy}%</span>
                                    </div>
                                    <Progress value={analysis.opening.accuracy} />
                                    <p className="text-xs text-muted-foreground mt-1">{analysis.opening.summary}</p>
                                </div>
                            )}
                            {analysis.middlegame && (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <Label>Middlegame</Label>
                                        <span className="text-sm font-bold">{analysis.middlegame.accuracy}%</span>
                                    </div>
                                    <Progress value={analysis.middlegame.accuracy} />
                                    <p className="text-xs text-muted-foreground mt-1">{analysis.middlegame.summary}</p>
                                </div>
                            )}
                           {analysis.endgame && (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <Label>Endgame</Label>
                                        <span className="text-sm font-bold">{analysis.endgame.accuracy}%</span>
                                    </div>
                                    <Progress value={analysis.endgame.accuracy} />
                                    <p className="text-xs text-muted-foreground mt-1">{analysis.endgame.summary}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {analysis.moveAnalysis && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Move Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-64">
                                    <div className="flex flex-col gap-2">
                                    {analysis.moveAnalysis.map((move, index) => {
                                        const styles = moveClassificationStyles[move.classification];
                                        const moveNumber = Math.floor(index / 2) + 1;
                                        const isWhiteMove = index % 2 === 0;

                                        return (
                                            <div 
                                                key={index}
                                                onClick={() => setCurrentMoveIndex(index + 1)}
                                                className={cn(
                                                    "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                                                    currentMoveIndex === index + 1 ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'
                                                )}
                                            >
                                                <span className="w-8 text-sm text-muted-foreground">{isWhiteMove ? `${moveNumber}.` : ''}</span>
                                                <span className="font-bold w-16">{move.move}</span>
                                                <div className={cn("flex items-center gap-1", styles.text)}>
                                                    {styles.icon}
                                                    <span className="text-sm font-semibold">{styles.label}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}

                     {analysis.keyMoments && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Key Moments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analysis.keyMoments.map((moment, index) => (
                                    <Alert key={index} className="mb-2">
                                        <Trophy className="h-4 w-4" />
                                        <AlertTitle>Key Moment: {moment.move}</AlertTitle>
                                        <AlertDescription>{moment.description}</AlertDescription>
                                    </Alert>
                                ))}
                            </CardContent>
                        </Card>
                     )}
                </div>
            </div>
        </div>
    );
};

    