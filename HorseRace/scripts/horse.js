class Horse {
    name = "";
    die = [];
    //loss = [];
    //win = [];

    calculatedProb = 0;
    calculatedSecondProb = 0;
    simulatedProb = 0;
    raceSum = 0;
    rolls = [];
    place = 0;
 
 
    constructor(horseDetails, length) {
        this.name = horseDetails.name[Math.floor(Math.random() * horseDetails.name.length)];
        this.dieValues = horseDetails.dice;
        this.die = new Dice(this.dieValues);
        this.distribution = this.die.distribution;
        this.currentDistribution = this.die.distribution;
        this.previousDistribution = [1];
        this.currentLossProb = 1;
        this.currentWinProb = 0;
        this.winScoreDist = new Map();
        //this.loss = Array.from(horseDetails["targets"][length].loss);
        //this.win = Array.from(horseDetails["targets"][length].win);
    }

    getMultiplyOdds(houseCut) {
        let cutMultiplier = 1 - (houseCut / 100);
        let offeredProb = this.calculatedProb / cutMultiplier;
        let offeredOdds = 1  / offeredProb;
        return offeredOdds;
    }

    getOfferedProb(houseCut) {
        let cutMultiplier = 1 - (houseCut / 100);
        let offeredProb = this.calculatedProb / cutMultiplier;
        return offeredProb;
    }
 
    getOdds(houseCut) {
        let cutMultiplier = 1 - (houseCut / 100);
        let offeredProb = this.calculatedProb / cutMultiplier;
        let offeredOdds = (1 - offeredProb) / offeredProb;
        //TODO do more to round to nice number
        let whole = Math.trunc(offeredOdds);
        let frac = offeredOdds - whole;
        let breakpoints = [0,1]
       
        if(whole <= 7) {
            breakpoints = [0, 0.33,0.5, 0.67, 1];
        }
        if(whole <= 4) {
            breakpoints = [0, 0.25, 0.33, 0.5, 0.67, 0.75, 1];
        }
 
       let offeredFrac = roundToNearestBreakpoint(frac, breakpoints);
 
        let roundedOdds = whole + offeredFrac;
 
        return roundedOdds;
    }
 
    executeTurn(raceLength) {
        if(this.raceSum < raceLength) {
            let roll = this.die.roll()
            this.rolls.push(roll);
            this.raceSum += roll;
   
            //return [roll, this.raceSum];
        }
       
    }
}