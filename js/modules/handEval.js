export class HandEvaluation {
    static isSpecialStraight(ranks) {
        var sortedRanks = ranks.slice().sort(function(a, b) { return a - b; });
        return sortedRanks[0] === 2 && sortedRanks[1] === 3 && 
               sortedRanks[2] === 4 && sortedRanks[3] === 5 && sortedRanks[4] === 14;
    }

    static getCardValue(card) {
        const CardValues = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return CardValues[card.rank];
    }
    
    // Maps suit to bit value for evaluation
    static getSuitValue(card) {
        const SuitValues = {
            'spades': 1, 'clubs': 2, 'hearts': 4, 'diamonds': 8
        };
        return SuitValues[card.suit];
    }
    static generateCombinations(array, k) {
        let result = [];
        let n = array.length;
    
        function recurse(start, combo) {
            if (combo.length === k) {
                result.push(combo.map(index => array[index - 1]));
                return;
            }
            for (let i = start; i <= n; i++) {
                combo.push(i);
                recurse(i + 1, combo);
                combo.pop();
            }
        }
    
        recurse(1, []);
        return result;
    } 

    static rankPokerHand(cs, ss, hands) {
        var v, i, o, s = 1<<cs[0]|1<<cs[1]|1<<cs[2]|1<<cs[3]|1<<cs[4];
        for (i=-1, v=o=0; i<5; i++, o=Math.pow(2,cs[i]*4)) {v += o*((v/o&15)+1);}
        v = v % 15 - ((s/(s&-s) == 31) || (s == 0x403c) ? 3 : 1);
        v -= (ss[0] == (ss[1]|ss[2]|ss[3]|ss[4])) * ((s == 0x7c00) ? -5 : 1);
        return hands[v];
    }

    static getHandValue(cardRanks) {
        var sortedRanks = cardRanks.slice(),
          rankCounts = {},
          index;
    
      // Count the occurrences of each card rank
      for (index = 0; index < 5; index++) {
        var rank = sortedRanks[index];
        rankCounts[rank] = (rankCounts[rank] >= 1) ? rankCounts[rank] + 1 : 1;
      }
    
    
      // Sort the card ranks based on their frequency and value
      sortedRanks.sort(function(rank1, rank2) {
        var countCompare = rankCounts[rank2] - rankCounts[rank1];
        var rankCompare = rank2 - rank1;
        return countCompare === 0 ? rankCompare : countCompare;
      });
    
      if (HandEvaluation.isSpecialStraight(sortedRanks)) {
        return 0;
      }
      // Encode the sorted ranks into a single integer for comparison
      return (sortedRanks[0] << 16) | (sortedRanks[1] << 12) | 
             (sortedRanks[2] << 8) | (sortedRanks[3] << 4) | sortedRanks[4];
    }

    static findBestHand(combinations, handValues) {
        var bestRank = 0;
        var currScore = 0;
        var bestHand;
    
        for(var i = 0; i < combinations.length; ++i){
            var hand = combinations[i].map(card => {
                return {
                    rank: HandEvaluation.getCardValue(card),
                    suit: HandEvaluation.getSuitValue(card)
                };
            });
            var cs = hand.map(card => card.rank);
            var ss = hand.map(card => card.suit);
            var currentRank = HandEvaluation.rankPokerHand(cs, ss, handValues);
            if (currentRank > bestRank) {
                bestRank = currentRank;
                bestHand = combinations[i];
                currScore = HandEvaluation.getHandValue(cs);
            }
            else if(currentRank === bestRank && currScore < HandEvaluation.getHandValue(cs)){
                bestRank = currentRank;
                bestHand = combinations[i];
                currScore =  HandEvaluation.getHandValue(cs);
            }
        }
        return [bestRank, currScore, bestHand];
    }

    static evaluateHand(playerHand, communityCards, handValues) {
        let combinedHand = playerHand.concat(communityCards);
        let possibleHands = HandEvaluation.generateCombinations(combinedHand, 5);
        let bestHand = HandEvaluation.findBestHand(possibleHands, handValues);
        return bestHand;
    }

    static evaluateAllHands(players, communityCards, handValues) {
        let bestHandScore = 0;
        let winners = []; 
    
        players.forEach((player, index) => {
            if (player.isInGame) {
                const [rank, score, hand] = HandEvaluation.evaluateHand(player.hand, communityCards, handValues);
    
                // Compare the rank and score to determine the best hand or ties
                if (rank > bestHandScore) {
                    bestHandScore = rank;
                    winners = [index]; 
                } else if (rank === bestHandScore) {
                    if (score > (winners.length > 0 ? HandEvaluation.evaluateHand(players[winners[0]].hand, communityCards, handValues)[1] : 0)) {
                        winners = [index];
                    } else if (score === HandEvaluation.evaluateHand(players[winners[0]].hand, communityCards, handValues)[1]) {
                        winners.push(index); 
                    }
                }
            }
        });
        return winners;
    }

    static evaluatePreFlopHand(hand) {

        const handStrengths = {
            '1': ["AA", "KK", "QQ", "JJ", "AKs"],
            '2': ["1010", "AQs", "AJs", "KQs", "AK"],
            '3': ["99", "A10s", "KJs", "QJs", "J10s"],
            '4': ["88", "K10s", "Q10s", "J9s", "AJ", "KQ", "AQ"],
            '5': ["77", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s", "Q9s", "109s", "98s", "87s", "KJ", "QJ", "J10"],
            '6': ["66", "55", "44", "33", "22", "A10", "K10", "Q10"],
            '7': ["A9", "A8", "A7", "A6", "A5", "A4", "A3", "A2", "K9s", "K8s", "K7s", "K6s", "K5s", "K4s", "K3s", "K2s", "Q8s", "Q7s", "J8s", "108s", "97s", "87", "76s", "65s", "54s"],
            '8': ["K9", "K8", "Q9", "J9", "J8", "109", "108", "98", "87", "76", "65", "54"]
        };
        let handStr = hand.map(card => {
            return { original: card.rank, value: this.getCardValue(card) };
        }).sort((a, b) => {
            return b.value - a.value;
        }).map(card => card.original).join('');
        
        handStr += hand[0].suit === hand[1].suit ? 's' : '';

        // Find the hand rank based on the handStrengths mapping
        for (let rank in handStrengths) {
            if (handStrengths[rank].includes(handStr)) {
                return parseInt(rank);
            }
        }
    
        return 9; 
    }
}