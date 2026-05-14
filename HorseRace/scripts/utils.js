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
   
    function sum(arr) {
        return arr.reduce((acc, val) => acc + val, 0);
    }
 
    function roundToNearestBreakpoint(num, breakpoints) {
        return breakpoints.reduce((prev, curr) => {
            return (Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev);
        });
    }
 
    function formatOdds(odds) {
 
        let whole = Math.trunc(odds);
        let frac = +((odds - whole).toFixed(2));
        switch (frac) {
            case 0:
                return `${odds}:1`;
            case 0.25:
                return `${Math.round(odds*4)}:4`;
            case 0.33:
                return `${Math.round(odds*3)}:3`;
            case 0.5:
                return `${Math.round(odds*2)}:2`;
            case 0.67:
                return `${Math.round(odds*3)}:3`;
 
            case 0.75:
                return `${Math.round(odds*4)}:4`;
            default:
                return `${odds}:1`;
        }
    }

function randomizer(values) {
    let i, pickedValue,
            randomNr = Math.random(),
            threshold = 0;

    for (i = 0; i < values.length; i++) {
        if (values[i].probability === '*') {
            continue;
        }

        threshold += values[i].probability;
        if (threshold > randomNr) {
                pickedValue = values[i].value;
                break;
        }

        if (!pickedValue) {
            //nothing found based on probability value, so pick element marked with wildcard
            pickedValue = values.filter((value) => value.probability === '*');
        }
    }

    return pickedValue;
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

function getTieBreakShares(winners, horses) {
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

// function convolveArrays(die1, die2) {
//     let result = [];
//     // Iterate through the first array
//     for (let i = 0; i < die1.length; i++) {
//         // For each element in the first array, iterate through the second array
//         for (let j = 0; j < die2.length; j++) {
//             // If the index exists in the result array, add the product; otherwise, initialize it
//             if (i + j < result.length) {
//                 result[i + j] += die1[i] * die2[j];
//             } else {
//                 result.push(die1[i] * die2[j]);
//             }
//         }
//     }
//     return result;
// }