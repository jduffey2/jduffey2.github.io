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

class Prob {
    constructor(value, probability) {
        this.value = value;
        this.probability = probability;
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


