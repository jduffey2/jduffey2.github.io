class Horse {
    name = "";
    die = [];
    loss = []; 
    win = [];
    calculatedProb = 0;
    calculatedSecondProb = 0;
    simulatedProb = 0;
    raceSum = 0;
    rolls = [];
    place = 0;


    constructor(horseDetails, length) {
        this.name = horseDetails.name;
        this.die = horseDetails.dice;
        this.loss = Array.from(horseDetails[length].loss);
        this.win = Array.from(horseDetails[length].win);
    }

    getOdds(houseCut) {
        let cutMultiplier = 1 + (houseCut / 100);
        let offeredProb = this.calculatedProb * cutMultiplier;
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
            let roll = this.die[Math.floor(Math.random() * this.die.length)]
            this.rolls.push(roll);
            this.raceSum += this.die[Math.floor(Math.random() * this.die.length)];
    
            //return [roll, this.raceSum];
        }
        
    }
}
