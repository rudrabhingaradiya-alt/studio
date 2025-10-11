
export interface BotLevel {
  rating: number;
  name: string;
  personality: string;
  avatar: string;
}

export const botLevels: BotLevel[] = [
    { rating: 250, name: "Newcomer Ned", personality: "Just learned the rules, might make some illegal moves.", avatar: "https://picsum.photos/seed/bot0/200/200" },
    { rating: 400, name: "Beginner Ben", personality: "Starts to develop pieces but has no clear plan.", avatar: "https://picsum.photos/seed/bot3/200/200" },
    { rating: 450, name: "Novice Noah", personality: "Can spot one-move threats but misses longer combinations.", avatar: "https://picsum.photos/seed/bot4/200/200" },
    { rating: 550, name: "Aspirant Aria", personality: "Loves to attack, sometimes forgetting to defend.", avatar: "https://picsum.photos/seed/bot6/200/200" },
    { rating: 600, name: "Hobbyist Hank", personality: "Knows a few opening lines but quickly goes off-book.", avatar: "https://picsum.photos/seed/bot7/200/200" },
    { rating: 700, name: "Player Pete", personality: "A solid player who understands piece value.", avatar: "https://picsum.photos/seed/bot9/200/200" },
    { rating: 750, name: "Regular Sam", personality: "Plays consistently but can be predictable.", avatar: "https://picsum.photos/seed/bot10/200/200" },
    { rating: 850, name: "Club Player Carl", personality: "Enjoys long games and positional struggles.", avatar: "https://picsum.photos/seed/bot12/200/200" },
    { rating: 900, name: "Steady Stella", personality: "A very cautious player who rarely makes mistakes.", avatar: "https://picsum.photos/seed/bot13/200/200" },
    { rating: 1000, name: "Adept Alex", personality: "A balanced player with a good understanding of all phases.", avatar: "https://picsum.photos/seed/bot15/200/200" },
    { rating: 1050, name: "Strategist Sofia", personality: "Thinks several moves ahead and formulates plans.", avatar: "https://picsum.photos/seed/bot16/200/200" },
    { rating: 1100, name: "Tactician Tom", personality: "Loves to calculate complex variations.", avatar: "https://picsum.photos/seed/bot17/200/200" },
    { rating: 1200, name: "Skilled Simon", personality: "A sharp player who is always looking for an edge.", avatar: "https://picsum.photos/seed/bot19/200/200" },
    { rating: 1250, name: "Proficient Penny", personality: "Converts advantages into wins effectively.", avatar: "https://picsum.photos/seed/bot20/200/200" },
    { rating: 1300, name: "Challenger Chad", personality: "Plays aggressively and puts pressure on his opponents.", avatar: "https://picsum.photos/seed/bot21/200/200" },
    { rating: 1350, name: "Veteran Vera", personality: "Uses experience to navigate tricky endgames.", avatar: "https://picsum.photos/seed/bot22/200/200" },
    { rating: 1450, name: "Seasoned Stan", personality: "A calm and collected player, unflustered by attacks.", avatar: "https://picsum.photos/seed/bot24/200/200" },
    { rating: 1500, name: "Expert Emily", personality: "Has a deep knowledge of opening theory.", avatar: "https://picsum.photos/seed/bot25/200/200" },
    { rating: 1600, name: "Candidate Chris", personality: "Plays with the ambition of a future master.", avatar: "https://picsum.photos/seed/bot27/200/200" },
    { rating: 1650, name: "Strong Steve", personality: "A powerful player who gives no quarter.", avatar: "https://picsum.photos/seed/bot28/200/200" },
    { rating: 1750, name: "Dominant Diana", personality: "Controls the board with an iron grip.", avatar: "https://picsum.photos/seed/bot30/200/200" },
    { rating: 1800, name: "Formidable Fred", personality: "Relentless in attack, stubborn in defense.", avatar: "https://picsum.photos/seed/bot31/200/200" },
    { rating: 1850, name: "Mighty Maya", personality: "A dynamic player who can turn defense into offense in a flash.", avatar: "https://picsum.photos/seed/bot32/200/200" },
    { rating: 1950, name: "Tournament Pro", personality: "Plays like a seasoned tournament competitor.", avatar: "https://picsum.photos/seed/bot34/200/200" },
    { rating: 2000, name: "Mastermind Max", personality: "A true master of strategy and tactics.", avatar: "https://picsum.photos/seed/bot35/200/200" },
    { rating: 2050, name: "Senior Master", personality: "Decades of experience packed into every move.", avatar: "https://picsum.photos/seed/bot36/200/200" },
    { rating: 2100, name: "National Master", personality: "Plays at a nationally recognized level of excellence.", avatar: "https://picsum.photos/seed/bot37/200/200" },
    { rating: 2150, name: "FIDE Master", personality: "An internationally titled player with a flair for the dramatic.", avatar: "https://picsum.photos/seed/bot38/200/200" },
    { rating: 2250, name: "Grandmaster Candidate", personality: "On the cusp of chess greatness, plays with fire.", avatar: "https://picsum.photos/seed/bot40/200/200" },
    { rating: 2300, name: "Grandmaster Igor", personality: "A living legend of the game. Every move is a lesson.", avatar: "https://picsum.photos/seed/bot41/200/200" },
    { rating: 2350, name: "Super Grandmaster", personality: "One of the world's elite. Almost flawless play.", avatar: "https://picsum.photos/seed/bot42/200/200" },
    { rating: 2400, name: "Champion", personality: "Plays with the confidence and power of a world champion.", avatar: "https://picsum.photos/seed/bot43/200/200" },
    { rating: 2450, name: "World Class", personality: "In a league of their own. Truly world-class.", avatar: "https://picsum.photos/seed/bot44/200/200" },
    { rating: 2550, name: "Titan", personality: "A giant of the game, crushing all in their path.", avatar: "https://picsum.photos/seed/bot46/200/200" },
    { rating: 2600, name: "Virtuoso", personality: "A chess artist, painting masterpieces on the board.", avatar: "https://picsum.photos/seed/bot47/200/200" },
    { rating: 2700, name: "Prodigy", personality: "Effortlessly brilliant, destined for the top.", avatar: "https://picsum.photos/seed/bot49/200/200" },
    { rating: 2750, name: "Phenom", personality: "A phenomenon of the chess world. Unstoppable.", avatar: "https://picsum.photos/seed/bot50/200/200" },
    { rating: 2850, name: "The Oracle", personality: "Sees the future of the game with eerie accuracy.", avatar: "https://picsum.photos/seed/bot52/200/200" },
    { rating: 2900, name: "The Thinker", personality: "Deep in thought, calculating lines you've never imagined.", avatar: "https://picsum.photos/seed/bot53/200/200" },
    { rating: 2950, name: "The Engine", personality: "Plays with cold, hard, machinelike precision.", avatar: "https://picsum.photos/seed/bot54/200/200" },
    { rating: 3000, name: "The Centaur", personality: "The perfect fusion of human creativity and machine calculation.", avatar: "https://picsum.photos/seed/bot55/200/200" },
    { rating: 3050, name: "Deep Thought", personality: "A super-intelligence from another dimension.", avatar: "https://picsum.photos/seed/bot56/200/200" },
    { rating: 3100, name: "Alpha", personality: "The first and the last word in chess. The ultimate AI.", avatar: "https://picsum.photos/seed/bot57/200/200" },
    { rating: 3150, name: "Stockfish Level", personality: "Plays at the level of the strongest chess engine.", avatar: "https://picsum.photos/seed/bot58/200/200" },
    { rating: 3200, name: "Ultimate AI", personality: "Beyond human comprehension. The pinnacle of chess.", avatar: "https://picsum.photos/seed/bot59/200/200" }
];

    

    