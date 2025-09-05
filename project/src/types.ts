export type CardType = 'puzzle' | 'final' | 'instruction' | 'end' | 'info';

export type Language = 'en' | 'fi';

export type PuzzleSubtype =
  | 'text'
  | 'rearrange'
  | 'grid'
  | 'rosegrid'
  | 'foodgrid'
  | 'jigsaw'
  | 'lever'
  | 'audio'
  | 'visual'
  | 'sequence'
  | 'endgrid'
  | 'logic'
  | 'splitscreen'
  | 'colorcode'
  | 'ar'
  | '3d'
  | 'multimedia';

export type PuzzleType = 'jigsaw';

export interface InstructionPage {
  title: string;
  content: string;
  image?: string;
  video?: string;
  audio?: string;
  gif?: string;
  model3d?: boolean;
}

export interface Tile {
  id: number;
  image: string;
}

export interface LetterStrip {
  color: string;
  letter: string;
}

export interface DiceFace {
  text1: string;
  text2: string;
  bgColor: string;
  textColor: string;
}

export interface Card {
  id: string;
  title: string;
  type: CardType;
  subtype?: PuzzleSubtype;
  puzzleType?: PuzzleType;
  displayIcon?: string;
  imageSrc?: string;
  hintImage?: string;
  pieces?: number;
  codeAnswer?: string;
  alternateAnswers?: string[];
  successText?: string;
  introText?: string;
  question?: string;
  wrongAnswerText?: string;
  wrongAnswerText2?: string;
  haamuvastaus?: string;
  hintText?: string;
  bigHintText?: string;
  instructionPages?: InstructionPage[];
  destination?: string;
  pinCode?: string;
  pinCodeViesti?: string;
  showsPinForCard?: string;
  mapHelpText?: string;
  mapOffer?: string;
  isLocked?: boolean;
  isCompleted?: boolean;
  triggersLevelChange?: boolean;
  triggersEndGrid?: boolean;
  congratsText?: string;
  strips?: {
    id: number;
    numbers: Array<string | { value: string } | { color: string }>;
  }[];
  logo?: string;
  tiles?: Tile[];
  trackID?: string;
  correctCombination?: Record<string, string>;
  // Split-screen puzzle specific properties
  beforeImage?: string;
  afterImage?: string;
  targetAlignment?: number;
  alignmentTolerance?: number;
  // Color code puzzle properties
  colorSequence?: string[];
  letterStrips?: LetterStrip[];
  // End screen messages
  endCompletionMessage?: string;
  endFeedbackMessage?: string;
  endFeedbackEmail?: string;
  // AR puzzle specific properties
  arTargetSrc?: string;
  arContent?: string;
  arFilterMinCF?: number;
  arFilterBeta?: number;
  // 3D dice puzzle specific properties
  diceFaces?: DiceFace[];
  // Special wrong answer handling
  alternateWrongAnswerText?: string;
  // Dynamic info card content
  dynamicInfoContent?: DynamicInfoContent[];
  // Flag to identify final puzzle
  isFinalPuzzle?: boolean;
}

export interface DynamicInfoContent {
  text: string;
  requiredCompletedCards: string[];
}

export interface RevealedPin {
  cardId: string;
  cardTitle: string;
  pin: string;
}

export interface JournalEntry {
  cardId: string;
  cardTitle: string;
  notes: string;
  pinCode?: string;
  receivedPinCode?: string;
  type: CardType;
  pinCodeMessage?: string;
}

export interface GameState {
  cards: Card[];
  activeCardId: string | null;
  completedCards: Set<string>;
  unlockedCards: Set<string>;
  journalEntries: JournalEntry[];
  currentLevel: number;
  playerName?: string;
  playerId?: string;
  currentPage?: number;
  hintsUsed: number;
  stopwatchState: 'stopped' | 'running' | 'paused';
  stopwatchTime: number;
  theme: 'default' | 'blue-green' | 'grayscale';
  language: Language;
}