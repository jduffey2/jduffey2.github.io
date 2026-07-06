class Race {
    horses = [];
    distance = 0;
    houseCut = 0;
    finished = 0;
    constructor(settings) {
        this.distance = parseInt(settings.distance);
        this.houseCut = settings.houseCut;
        let activeTypes = settings.horseTypes.filter(horse => horse.active);
        for(let i = 0; i < settings.participants; i++) {
           
                let horse = new Horse(data[activeTypes[Math.floor(Math.random()*activeTypes.length)].ref], this.distance);
                this.horses.push(horse);
        }

        this.applyDecorator(settings);
        this.calculateOdds();
        //this.calculateSecondOdds();
        this.simulateOdds();
    }

    applyDecorator(settings) {
        const decoratorConfig = settings.nextRaceDecorator || {};
        const parsedProbMap = parseProbMap(decoratorConfig.probMap);
        if(!decoratorConfig.type || parsedProbMap.length === 0) {
            return;
        }

        const horseIndex = Math.max(0, Math.min(this.horses.length - 1, Number(decoratorConfig.horseIndex) - 1));
        applyDiceDecoratorToHorse(this.horses[horseIndex], decoratorConfig.type, parsedProbMap);
    }
 
    executeTurn() {
        let finishers = []
        for (let h = 0; h < this.horses.length; h++) {
            if(this.horses[h].raceSum >= this.distance) {
                continue;
            }
            this.horses[h].executeTurn(this.distance);
            if(this.horses[h].raceSum >= this.distance) {
                finishers.push(this.horses[h]);
            }
        }
 
        finishers.sort((a, b) => {
            const aRoll = a.rolls[a.rolls.length - 1];
            const bRoll = b.rolls[b.rolls.length - 1];
            const aScore = (this.distance - (a.raceSum - aRoll)) / aRoll;
            const bScore = (this.distance - (b.raceSum - bRoll)) / bRoll;

            if (aScore < bScore) return -1;
            if (aScore > bScore) return 1;
            return bRoll - aRoll;
        });

        for (let i = 0; i < finishers.length; i++) {
            this.finished++;
            finishers[i].place = this.finished;
        }
    }
 
    calculateOdds() {
        for (let turn = 1; turn < this.distance; turn++) {
            // Loop through and get the convolutions
            if (turn > 1) {
                for (let h = 0; h < this.horses.length; h++) {
                    this.horses[h].previousDistribution = this.horses[h].currentDistribution;
                    this.horses[h].currentDistribution = convolveArrays(this.horses[h].currentDistribution, this.horses[h].distribution);
                }
            }

            for (let h = 0; h < this.horses.length; h++) {
                const totalCount = this.horses[h].currentDistribution.reduce((a, b) => a + b, 0);
                const lossCount = this.horses[h].currentDistribution.slice(0, this.distance).reduce((a, b) => a + b, 0);
                const currentLossProb = lossCount / totalCount;
                this.horses[h].currentWinProb = this.horses[h].currentLossProb - currentLossProb;
                this.horses[h].currentLossProb = currentLossProb;
                this.horses[h].winScoreDist = getWinScoreDist(this.horses[h], this.distance);
            }

            for (let combo = 1; combo < 2 ** this.horses.length; combo++) {
                let turnWin = 1;
                const winners = [];

                for (let h = 0; h < this.horses.length; h++) {
                    if ((combo >> h) & 1) {
                        winners.push(h);
                        turnWin *= this.horses[h].currentWinProb;
                    } else {
                        turnWin *= this.horses[h].currentLossProb;
                    }
                }

                if (turnWin === 0) {
                    continue;
                }

                const tieShares = getTieBreakShares(this.horses, winners);
                for (let i = 0; i < winners.length; i++) {
                    this.horses[winners[i]].calculatedProb += turnWin * tieShares[i];
                }
            }
        }
    }
 
    calculateSecondOdds() {
        for (let h = 0; h < this.horses.length; h++) {
            for (let i = 0; i < this.horses.length; i++) {
                if(i == h) {
                    continue;
                }
                this.horses[h].calculatedSecondProb += (this.horses[i].calculatedProb * (this.horses[h].calculatedProb / (1 - this.horses[i].calculatedProb)));
            }
        }
    }
 
simulateOdds(numSimulations = 100_000) {
        const winCounts = new Array(this.horses.length).fill(0);
        const maxTurns = 100; // Prevent infinite loops
        // let tiebreakCount = 0;
        // let tiebreak2Count = 0;
        // let tiebreak3Count = 0;

        for (let sim = 0; sim < numSimulations; sim++) {
            const horseSums = new Array(this.horses.length).fill(0);
            let winner = -1;
            let winTurn = -1;

            for (let turn = 1; turn <= maxTurns; turn++) {
                const potentialWinners = [];

                for (let h = 0; h < this.horses.length; h++) {
                    if (horseSums[h] >= this.distance) continue; // Already won, but shouldn't happen

                    const roll = this.horses[h].die.roll();
                    const prevSum = horseSums[h];
                    horseSums[h] += roll;

                    if (horseSums[h] >= this.distance) {
                        const score = (this.distance - prevSum) / roll;
                        potentialWinners.push({ horse: h, score, turn, roll });
                    }
                }

                if (potentialWinners.length > 0) {
                    // Find the earliest turn winners
                    const minTurn = Math.min(...potentialWinners.map(w => w.turn));
                    const turnWinners = potentialWinners.filter(w => w.turn === minTurn);

                    // if(turnWinners.length > 1) {
                    //     tiebreakCount++;
                    // }
                    // Among turn winners, find lowest score
                    const minScore = Math.min(...turnWinners.map(w => w.score));
                    const scoreWinners = turnWinners.filter(w => w.score === minScore);
                    
                    // if(scoreWinners.length > 1) {
                    //     tiebreak2Count++;
                    // }
                    // If multiple with same score, pick the one with the highest final roll
                    const maxRoll = Math.max(...scoreWinners.map(w => w.roll));
                    const rollWinners = scoreWinners.filter(w => w.roll === maxRoll);
                    
                    // if(rollWinners.length > 1) {
                    //     tiebreak3Count++;
                    // }
                    
                    // If still multiple, pick randomly
                    const winnerIndex = Math.floor(Math.random() * rollWinners.length);
                    winner = rollWinners[winnerIndex].horse;
                    winTurn = minTurn;
                    break;
                }
            }

            if (winner !== -1) {
                winCounts[winner]++;
            }
        }

        //console.log(`Tiebreaks (finished same turn): ${tiebreakCount}, Tiebreak2 (same finish fraction): ${tiebreak2Count}, Tiebreak3 (same final roll): ${tiebreak3Count}`);

        for (let h = 0; h < this.horses.length; h++) {
            this.horses[h].simulatedProb = (winCounts[h] / numSimulations);
        }
    }


}

function getWinScoreDist(horse, distance) {
    const scoreCounts = new Map();
    const rollCountsByScore = new Map();
    let totalWinCount = 0;
    const prevDist = horse.previousDistribution;
    const dieDist = horse.distribution;

    for (let prevSum = 0; prevSum < prevDist.length; prevSum++) {
        const count = prevDist[prevSum];
        if (!count) continue;

        const remainingDistance = distance - prevSum;
        if (remainingDistance <= 0) continue;

        for (let roll = 1; roll < dieDist.length; roll++) {
            const rollWeight = dieDist[roll];
            if (!rollWeight) continue;
            if (prevSum + roll >= distance) {
                const rollCount = count * rollWeight;
                const key = reduceFraction(remainingDistance, roll);
                scoreCounts.set(key, (scoreCounts.get(key) || 0) + rollCount);

                const rollMap = rollCountsByScore.get(key) || new Map();
                rollMap.set(roll, (rollMap.get(roll) || 0) + rollCount);
                rollCountsByScore.set(key, rollMap);

                totalWinCount += rollCount;
            }
        }
    }

    const scoreDist = new Map();
    scoreDist.rollDist = new Map();
    if (totalWinCount === 0) {
        return scoreDist;
    }

    scoreCounts.forEach((count, key) => {
        scoreDist.set(key, count / totalWinCount);

        const rollMap = rollCountsByScore.get(key) || new Map();
        const normalizedRollMap = new Map();
        rollMap.forEach((rollCount, roll) => {
            normalizedRollMap.set(roll, rollCount / count);
        });
        scoreDist.rollDist.set(key, normalizedRollMap);
    });

    return scoreDist;
}

function getTieBreakShares(horses, winners) {
    if (winners.length === 1) {
        return [1];
    }

    const scoreMaps = winners.map((h) => horses[h].winScoreDist);
    const scoreKeys = Array.from(new Set(scoreMaps.flatMap((map) => Array.from(map.keys()))));
    scoreKeys.sort(compareScoreKeys);

    const horseDists = scoreMaps.map((map) => {
        const dist = new Map();
        for (const key of scoreKeys) {
            dist.set(key, map.get(key) || 0);
        }
        return dist;
    });

    return horseDists.map((dist, horseIndex) => {
        let share = 0;
        for (const key of scoreKeys) {
            const pEq = dist.get(key) || 0;
            if (pEq === 0) continue;

            const otherInfo = horseDists
                .map((otherDist, index) => ({ otherDist, index }))
                .filter(({ index }) => index !== horseIndex)
                .map(({ otherDist, index }) => {
                    let pGt = 0;
                    for (const laterKey of scoreKeys) {
                        if (compareScoreKeys(laterKey, key) > 0) {
                            pGt += otherDist.get(laterKey) || 0;
                        }
                    }
                    return {
                        pGt,
                        pEq: otherDist.get(key) || 0,
                        rollDist: scoreMaps[index]?.rollDist?.get(key) || new Map(),
                    };
                });

            const currentRollDist = scoreMaps[horseIndex]?.rollDist?.get(key) || new Map();
            const shareAtScore = computeTieBreakShareForKey(currentRollDist, otherInfo);
            share += pEq * shareAtScore;
        }
        return share;
    });
}

function computeTieBreakShareForKey(currentRollDist, otherInfo) {
    let share = 0;
    const numOther = otherInfo.length;
    const subsetCount = 1 << numOther;

    for (let mask = 0; mask < subsetCount; mask++) {
        let eventProb = 1;
        const sameKeyHorses = [];

        for (let j = 0; j < numOther; j++) {
            const other = otherInfo[j];
            if ((mask >> j) & 1) {
                eventProb *= other.pEq;
                sameKeyHorses.push(other);
            } else {
                eventProb *= other.pGt;
            }
        }

        if (eventProb === 0) {
            continue;
        }

        const sameShare = computeSameKeyRollShare(currentRollDist, sameKeyHorses);
        share += eventProb * sameShare;
    }

    return share;
}

function computeSameKeyRollShare(currentRollDist, sameKeyHorses) {
    if (sameKeyHorses.length === 0) {
        return 1;
    }

    let share = 0;
    for (const [roll, pRoll] of currentRollDist) {
        if (pRoll === 0) continue;

        let dp = [1];
        for (const other of sameKeyHorses) {
            let pLt = 0;
            let pEq = 0;
            for (const [otherRoll, pOtherRoll] of other.rollDist) {
                if (otherRoll < roll) {
                    pLt += pOtherRoll;
                } else if (otherRoll === roll) {
                    pEq += pOtherRoll;
                }
            }

            const next = new Array(dp.length + 1).fill(0);
            for (let k = 0; k < dp.length; k++) {
                next[k] += dp[k] * pLt;
                next[k + 1] += dp[k] * pEq;
            }
            dp = next;
        }

        const shareGivenRoll = dp.reduce((sum, prob, tieCount) => sum + prob / (tieCount + 1), 0);
        share += pRoll * shareGivenRoll;
    }

    return share;
}

function reduceFraction(numerator, denominator) {
    const gcdValue = gcd(numerator, denominator);
    return `${numerator / gcdValue}/${denominator / gcdValue}`;
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function compareScoreKeys(a, b) {
    const [an, ad] = a.split('/').map(Number);
    const [bn, bd] = b.split('/').map(Number);
    return an * bd - bn * ad;
}

function convolveArrays(die1, die2) {
    let result = [];
    // Iterate through the first array
    for (let i = 0; i < die1.length; i++) {
        // For each element in the first array, iterate through the second array
        for (let j = 0; j < die2.length; j++) {
            // If the index exists in the result array, add the product; otherwise, initialize it
            if (i + j < result.length) {
                result[i + j] += die1[i] * die2[j];
            } else {
                result.push(die1[i] * die2[j]);
            }
        }
    }
    return result;
}