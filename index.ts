import {POKER_ROUNDS} from "./data";
import {CARD_VALUES, HAND_SIZE, HAND_VALUES, HandRanking, PlayerHandRanking} from "./domain";


/**
 * Gives card type statistics (card values, card repeats and suite repeats)
 * @param {string[]} hand - player cards given in format ["9H", ...]
 * @returns {{ cardArray: number[], cardMap: Map<number, number>, suitMap: Map<string, number> }}
 *          cardArray - sorted card values;
 *          cardMap - map of (cardValue, cardValue-repeats);
 *          suitMap - map of (suit, suite-repeats);
 */
function getCardData(hand: string[]): {
  cardArray: number[];
  cardMap: Map<number, number>;
  suitMap: Map<string, number>;
} {
  const cardArray: number[] = [];
  const cardMap = new Map<number, number>();
  const suitMap = new Map<string, number>();

  hand.forEach((card) => {
    let [cardNum, cSuit] = card.split("");

    const cardValue = CARD_VALUES[cardNum];

    cardArray.push(cardValue)
    cardMap.set(cardValue, (cardMap.get(cardValue) || 0) + 1);
    suitMap.set(cSuit, (suitMap.get(cSuit) || 0) + 1);
  });

  cardArray.sort((a, b) => b - a);

  return { cardArray, cardMap, suitMap };
}

/**
 * Calculates hand cards repeat
 * @param {Map<number, number>} cardMap - map of card values and repeats - given from {getCardData}
 * @returns {{pair: number[], three: number, fours: number}} - returns value of card which repeats x times
 */
function getCardRepeats(cardMap: Map<number, number>): {pair: number[], three: number, fours: number} {
  let pair = [];
  let three = 0;
  let fours = 0

  const cards = cardMap.entries();

  while(true) {
    const {value, done} = cards.next();

    if(done) break;

    const [card, count] = value

    if (count === 4) fours = card;
    else if (count === 3) three = card;
    else if (count === 2) pair.push(card);
  }

  return {pair, three, fours};
}

/**
 * Checks if given card values are in a row
 * @param {number[]}
 * @returns {boolean}
 */
function isStraight(cards: number[]): boolean {
  if(cards.length !== HAND_SIZE) return false;

  for (let i = 0; i < cards.length - 1 ; i++) {
    if(cards[i] - 1 !== cards[i+1]) return false;
  }

  return true;
}

/**
 * Ranks player hand and calculates the highest ranked card/s and highest non-ranked card/s
 * @param {string[]}
 * @returns {HandRanking} HandRanking object
 */
function getHandValue(hand: string[]): HandRanking {
  const handValue: HandRanking = {rank: 0, rankHighest: [], handHighest: []};

  const { cardArray, cardMap, suitMap } = getCardData(hand);
  const isFlush = suitMap.size === 1;
  const isStraightHand = isStraight(cardArray);
  const {pair, three, fours } = getCardRepeats(cardMap);


  if(isFlush && isStraightHand && cardArray[0] === CARD_VALUES["A"]){
    handValue.rank = HAND_VALUES.ROYAL_FLUSH;
  } else if(isFlush && isStraightHand) {
    handValue.rank = HAND_VALUES.STRAIGHT_FLUSH
    handValue.rankHighest = [cardArray[0]]
  } else if(fours) {
    handValue.rank = HAND_VALUES.FOUR_OF_A_KIND;
    handValue.rankHighest = [fours];
    handValue.handHighest = cardArray.filter(card => !handValue.rankHighest.includes(card));
  } else if(three && pair.length) {
    handValue.rank = HAND_VALUES.FULL_HOUSE;
    handValue.rankHighest = [three, pair[0]]
  } else if(isFlush) {
    handValue.rank = HAND_VALUES.FLUSH;
    handValue.rankHighest = cardArray;
  } else if (isStraightHand) {
    handValue.rank = HAND_VALUES.STRAIGHT;
    handValue.rankHighest = [cardArray[0]]
  } else if (three) {
    handValue.rank = HAND_VALUES.THREE_OF_A__KIND;
    handValue.rankHighest = [three];
    handValue.handHighest = cardArray.filter(card => !handValue.rankHighest.includes(card));
  } else if(pair.length == 2) {
    handValue.rank = HAND_VALUES.TWO_PAIRS;
    handValue.rankHighest = [pair[0], pair[1]].sort((a, b) => b - a);
    handValue.handHighest = cardArray.filter(card => !handValue.rankHighest.includes(card));
  } else if (pair.length) {
    handValue.rank = HAND_VALUES.ONE_PAIR;
    handValue.rankHighest = [pair[0]];
    handValue.handHighest = cardArray.filter(card => !handValue.rankHighest.includes(card));
  } else {
    handValue.rank = HAND_VALUES.HIGHEST_CARD;
    handValue.rankHighest = cardArray;
  }

  return handValue;
}

/**
 * Compares two hands and returns the higher ranked one
 * @param {HandRanking} hand1 - hand to compare
 * @param {HandRanking} hand2 - hand to compare
 * @returns {Number}  returns 1 if hand1 is ranked higher, 2 if hand 2 is ranked higher or 0 if they are same ranked
 */
function compareHands(hand1: HandRanking, hand2: HandRanking): number {
  if(hand1.rank > hand2.rank) return 1;
  if(hand1.rank < hand2.rank) return 2;

  let pivot = 0;
  for (let i = 0; i < hand1.rankHighest.length; i++) {
    if(hand1.rankHighest[pivot] > hand2.rankHighest[pivot]) return 1;
    if(hand1.rankHighest[pivot] < hand2.rankHighest[pivot]) return 2;

    pivot++;
  }

  pivot = 0;
  for (let i = 0; i < hand1.handHighest.length; i++) {
    if(hand1.handHighest[pivot] > hand2.handHighest[pivot]) return 1;
    if(hand1.handHighest[pivot] < hand2.handHighest[pivot]) return 2;

    pivot++;
  }

  return 0;
}

/**
 * Compares given hands and returns the highest ranked one/s
 * @param {string[][]} hands - hands to compare
 * @returns {PlayerHandRanking[]}  returns highest ranked table hands
 */
function getTableWinner(hands: string[][]): PlayerHandRanking[] {
  let highest: PlayerHandRanking[] = [];

  hands.forEach((hand, index) => {
    const handValue = getHandValue(hand);

    if(index === 0) {
      highest.push({playerIndex: index, ...handValue})
    } else {
      const compare = compareHands(highest[0], handValue);

      if(compare === 0) highest.push({playerIndex: index, ...handValue})
      if(compare === 2) highest = [{playerIndex: index, ...handValue}]
    }
  })

  return highest;
}

const playerWins = new Map<number, number>();

const rounds = POKER_ROUNDS.split("\n")
rounds.forEach(round => {
  const cards = round.split(" ");
  let hands: string[][] = [];

  for (let i = 0; i < cards.length; i += HAND_SIZE) {
    const hand = cards.slice(i, i + HAND_SIZE);
    hands.push(hand);
  }

  const roundWinners = getTableWinner(hands);

  roundWinners.forEach(winner => {
    playerWins.set(winner.playerIndex, (playerWins.get(winner.playerIndex) || 0) + 1)
  })
})

// print player 1 wins
console.log(`Player 1 win count: ${playerWins.get(0)}`)
