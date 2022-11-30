
export const HAND_SIZE = 5;

export enum HAND_VALUES {
    HIGHEST_CARD = 0,
    ONE_PAIR = 1,
    TWO_PAIRS = 2,
    THREE_OF_A__KIND = 3,
    STRAIGHT = 4,
    FLUSH = 5,
    FULL_HOUSE = 6,
    FOUR_OF_A_KIND = 7,
    STRAIGHT_FLUSH = 8,
    ROYAL_FLUSH = 9,
}

export const CARD_VALUES: Record<string, number> = {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "T": 10,
    "J": 11,
    "Q": 12,
    "K": 13,
    "A": 14
};

export type HandRanking = {rank: number, rankHighest: number[], handHighest: number[]}
export type PlayerHandRanking = HandRanking & {playerIndex: number}