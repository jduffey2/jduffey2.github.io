class Dice {
    values = [];
    distribution = [];
    currentDistribution = [];
    previousDistribution = [1];
    currentLossProb = 1;
    currentWinProb = 0;

    calculatedProb = 0;
    simulatedProb = 0;
    winScoreDist = new Map();
    constructor(diceValues = [1,2,3,4,5,6]) {
            this.values = diceValues;
            this.distribution = new Array(Math.max(...diceValues) + 1).fill(0);
            for (const val of diceValues) {
                this.distribution[val]++;
            }
            this.currentDistribution = this.distribution;
    }

    roll() {
        return this.values[Math.floor(Math.random() * this.values.length)];
    }
}

class DiceDecorator {
    constructor(dice) {
        this.dice = dice;
    }

    roll() {
        return this.dice.roll();
    }

    get distribution() {
        return this.dice.distribution;
    }

    set distribution(value) {
        this.dice.distribution = value;
    }

    get currentDistribution() {
        return this.dice.currentDistribution
    }

    set currentDistribution(value) {
        this.dice.currentDistribution = value;
    }

    get values() {
        return this.dice.values;
    }

    set values(value) {
        this.dice.values = value;
    }

    get previousDistribution() {
        return this.dice.previousDistribution;
    }

    set previousDistribution(value) {
        this.dice.previousDistribution = value;
    }

    get currentLossProb() {
        return this.dice.currentLossProb;
    }

    set currentLossProb(value) {
        this.dice.currentLossProb = value;
    }

    get currentWinProb() {
        return this.dice.currentWinProb;
    }

    set currentWinProb(value) {
        this.dice.currentWinProb = value;
    }

    get calculatedProb() {
        return this.dice.calculatedProb;
    }

    set calculatedProb(value) {
        this.dice.calculatedProb = value;
    }

    get simulatedProb() {
        return this.dice.simulatedProb;
    }

    set simulatedProb(value) {
        this.dice.simulatedProb = value;
    }

    get winScoreDist() {
        return this.dice.winScoreDist;
    }

    set winScoreDist(value) {
        this.dice.winScoreDist = value;
    }
}

class AdditionDice extends DiceDecorator {
    constructor(dice, addition) {
        super(dice);
        this.addition = addition;


        // Update distribution for Addition
        const newDist = new Array(this.distribution.length + addition).fill(0);
        for (let i = 0; i < this.distribution.length; i++) {
            // Shift distribution by addition, ensuring we don't go negative
            newDist[Math.max(i + addition, 0)] += this.distribution[i];
        }

        this.OGDistribution = this.distribution;
        this.distribution = newDist;
        this.currentDistribution = newDist;
    }

    
    roll() {
        return super.roll() + this.addition;
    }
}

class Prob {
    constructor(value, probability) {
        this.value = value;
        this.probability = probability;
    }
}

class AddProbDice extends DiceDecorator {
    constructor(dice, probMap) {
        super(dice);
        this.probMap = probMap;

        // Update distribution for AddProb
        const newDist = new Array(this.distribution.length + Math.max(...probMap.map(p => p.value))).fill(0);
        for (let i = 0; i < this.distribution.length; i++) {
            for (const { value, probability } of probMap) {
                newDist[Math.max(i + value,0)] += this.distribution[i] * probability;
            }
        }

        this.OGDistribution = this.distribution;
        this.distribution = newDist;
        this.currentDistribution = newDist;
    }

    roll() {
        const baseRoll = super.roll();
        let add = randomizer(this.probMap);
        return baseRoll + add;
    }

}

class MultiProbDice extends DiceDecorator {
    constructor(dice, probMap) {
        super(dice);
        this.probMap = probMap;

        // Update distribution for MultiProb
        const newDist = new Array(this.distribution.length).fill(0);
        for (const { value, probability } of probMap) {
            for (let i = 0; i < this.distribution.length; i++) {
                const newIndex = Math.round(i * value);

                if (newDist[newIndex] === undefined) {
                    newDist[newIndex] = 0;
                }
                newDist[newIndex] += this.distribution[i] * probability;
            }
        }

        for (let i = 0; i < newDist.length; i++) {
            if (newDist[i] === undefined) {
                newDist[i] = 0;
            }
        }

        this.OGDistribution = this.distribution;
        this.distribution = newDist;
        this.currentDistribution = newDist;
    }

    roll() {
        const baseRoll = super.roll();
        let mult = randomizer(this.probMap);

        return baseRoll * mult;
    }
}

function calculateOdds() {
    for (let turn = 1; turn < distance; turn++) {
        // Loop through and get the convolutions
        if (turn > 1) {
            for (let h = 0; h < horses.length; h++) {
                horses[h].previousDistribution = horses[h].currentDistribution;
                horses[h].currentDistribution = convolveArrays(horses[h].currentDistribution, horses[h].distribution);
            }
        }

        for (let h = 0; h < horses.length; h++) {
            const totalCount = horses[h].currentDistribution.reduce((a, b) => a + b, 0);
            const lossCount = horses[h].currentDistribution.slice(0, distance).reduce((a, b) => a + b, 0);
            const currentLossProb = lossCount / totalCount;
            horses[h].currentWinProb = horses[h].currentLossProb - currentLossProb;
            horses[h].currentLossProb = currentLossProb;
            horses[h].winScoreDist = getWinScoreDist(horses[h]);
        }

        for (let combo = 1; combo < 2 ** horses.length; combo++) {
            let turnWin = 1;
            const winners = [];

            for (let h = 0; h < horses.length; h++) {
                if ((combo >> h) & 1) {
                    winners.push(h);
                    turnWin *= horses[h].currentWinProb;
                } else {
                    turnWin *= horses[h].currentLossProb;
                }
            }

            if (turnWin === 0) {
                continue;
            }

            const tieShares = getTieBreakShares(winners);
            for (let i = 0; i < winners.length; i++) {
                horses[winners[i]].calculatedProb += turnWin * tieShares[i];
            }
        }
    }
}

function simulateOdds(numSimulations = 100_000) {
    const winCounts = new Array(horses.length).fill(0);
    const maxTurns = 100; // Prevent infinite loops
    let tiebreakCount = 0;
    let tiebreak2Count = 0;
    let tiebreak3Count = 0;

    for (let sim = 0; sim < numSimulations; sim++) {
        const horseSums = new Array(horses.length).fill(0);
        let winner = -1;
        let winTurn = -1;

        for (let turn = 1; turn <= maxTurns; turn++) {
            const potentialWinners = [];

            for (let h = 0; h < horses.length; h++) {
                if (horseSums[h] >= distance) continue; // Already won, but shouldn't happen

                const roll = horses[h].roll();
                const prevSum = horseSums[h];
                horseSums[h] += roll;

                if (horseSums[h] >= distance) {
                    const score = (distance - prevSum) / roll;
                    potentialWinners.push({ horse: h, score, turn, roll });
                }
            }

            if (potentialWinners.length > 0) {
                // Find the earliest turn winners
                const minTurn = Math.min(...potentialWinners.map(w => w.turn));
                const turnWinners = potentialWinners.filter(w => w.turn === minTurn);
                
                if(turnWinners.length > 1) {
                    tiebreakCount++;
                }
                // Among turn winners, find lowest score
                const minScore = Math.min(...turnWinners.map(w => w.score));
                const scoreWinners = turnWinners.filter(w => w.score === minScore);

                if(scoreWinners.length > 1) {
                    tiebreak2Count++;
                }
                // If multiple with same score, pick the one with the highest final roll
                const maxRoll = Math.max(...scoreWinners.map(w => w.roll));
                const rollWinners = scoreWinners.filter(w => w.roll === maxRoll);

                if(rollWinners.length > 1) {
                    tiebreak3Count++;
                }
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

    console.log(`Tiebreaks (finished same turn): ${tiebreakCount}, Tiebreak2 (same finish fraction): ${tiebreak2Count}, Tiebreak3 (same final roll): ${tiebreak3Count}`);


    for (let h = 0; h < horses.length; h++) {
        horses[h].simulatedProb = (winCounts[h] / numSimulations).toFixed(4);
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

function getWinScoreDist(horse) {
    const scoreCounts = new Map();
    let totalWinCount = 0;
    const prevDist = horse.previousDistribution;
    const dieDist = horse.distribution;

    for (let prevSum = 0; prevSum < prevDist.length; prevSum++) {
        const count = prevDist[prevSum];
        if (!count) continue;

        const remainingDistance = distance - prevSum;
        if (remainingDistance <= 0) continue;

        for (let roll = 1; roll <= 6; roll++) {
            if (prevSum + roll >= distance) {
                const rollCount = count * dieDist[roll];
                const key = reduceFraction(remainingDistance, roll);
                scoreCounts.set(key, (scoreCounts.get(key) || 0) + rollCount);
                totalWinCount += rollCount;
            }
        }
    }

    const scoreDist = new Map();
    if (totalWinCount === 0) {
        return scoreDist;
    }

    scoreCounts.forEach((count, key) => {
        scoreDist.set(key, count / totalWinCount);
    });
    return scoreDist;
}

function getTieBreakShares(winners) {
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

            const otherProbs = horseDists
                .filter((_, index) => index !== horseIndex)
                .map((otherDist) => {
                    let pGt = 0;
                    for (const laterKey of scoreKeys) {
                        if (compareScoreKeys(laterKey, key) > 0) {
                            pGt += otherDist.get(laterKey) || 0;
                        }
                    }
                    return {
                        pGt,
                        pEq: otherDist.get(key) || 0,
                    };
                });

            let dp = [1];
            for (const { pGt, pEq } of otherProbs) {
                const next = new Array(dp.length + 1).fill(0);
                for (let k = 0; k < dp.length; k++) {
                    next[k] += dp[k] * pGt;
                    next[k + 1] += dp[k] * pEq;
                }
                dp = next;
            }

            const shareAtScore = dp.reduce((sum, prob, k) => sum + prob / (k + 1), 0);
            share += pEq * shareAtScore;
        }
        return share;
    });
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

//let probMap = [new Prob(2,0.5), new Prob(1,0.5)];
//new Dice([1,1,1,6,6,6]), new Dice(), new Dice([0,0,1,2,8,10]), new Dice([2,2,4,4,6,6])
//let horses = [new Dice([1,1,1,6,6,6]), new Dice([0,0,1,2,8,10]), new Dice([2,2,4,4,6,6])];
let horseOptions = [[1,2,3,4,5,6], [1,1,3,3,5,5], [2,2,4,4,6,6], [1,1,1,6,6,6], [3,3,3,4,4,4], [1,4,4,4,4,4], [3,3,3,3,3,6], [2,2,2,5,5,5], [0,0,1,2,8,10], [0,0,0,6,7,9], [0,1,3,3,5,8], [1,1,2,3,5,8], [1,2,3,5,7,11]];
let horses = []
let distance = 50;
let simulations = 1_000_000;

document.getElementById("distance").value = distance;

for (let i = 0; i < horseOptions.length; i++) {
    document.getElementById("horseInput").innerHTML += `<option value="${i}">${horseOptions[i].join(",")}</option>`;
}


function addHorse() {
    let selection = parseInt(document.getElementById("horseInput").value);
    horses.push(new Dice(horseOptions[selection]));
    let table = document.getElementById("oddsTable")
    table.innerHTML += `<tr> <td>${horses.length}</td><td>${horses[horses.length-1].values}</td><td></td><td><button onclick="removeHorse(${horses.length-1})">Remove</button></td></tr>`;
}

function calculateRaceOdds() {
    calculateOdds();
    simulateOdds(simulations);

    let distance = parseInt(document.getElementById("distance").value);

    let table = document.getElementById("oddsTable")
    table.innerHTML = ""
    for (let h = 0; h < horses.length; h++) {
        table.innerHTML += `<tr> <td>${h+1}</td><td>${horses[h].values}</td><td>${(horses[h].calculatedProb * 100).toFixed(4)} %</td><td><button onclick="removeHorse(${h})">Remove</button></td></tr>`;
    }
}

function removeHorse(index) {
    horses.splice(index, 1);
    let table = document.getElementById("oddsTable")
    table.innerHTML = ""
    for (let h = 0; h < horses.length; h++) {
        table.innerHTML += `<tr> <td>${h+1}</td><td>${horses[h].values}</td><td></td><td><button onclick="removeHorse(${h})">Remove</button></td></tr>`;
    }
}

function resetRace() {
    let tempHorses = [];
    let table = document.getElementById("oddsTable");
    table.innerHTML = "";
     for (let h = 0; h < horses.length; h++) {
        tempHorses.push(new Dice(horses[h].values));
        table.innerHTML += `<tr> <td>${h+1}</td><td>${horses[h].values}</td><td></td><td><button onclick="removeHorse(${h})">Remove</button></td></tr>`;
    }
    horses = tempHorses;
    
}