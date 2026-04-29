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

        this.calculateOdds();
        this.calculateSecondOdds();
        //this.simulateOdds();
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

        finishers.sort((a,b) => a.raceSum < b.raceSum);
        for(let i = 0; i < finishers.length; i++) {
            this.finished++;
            finishers[i].place = this.finished;  
        }
    }

    calculateOdds() {
        for (let turn = 1; turn < this.distance; turn++) {
            for (let combo = 1; combo < 2**this.horses.length; combo++) {
                let turnWin = 1;
                let winners = 0
        
                for (let h = 0; h < this.horses.length; h++) {
                    if ((combo >> h) & 1) {
                        winners++;
                        turnWin *= this.horses[h].win[turn];
                    }
                    else {
                        turnWin *= this.horses[h].loss[turn]
                    }
                }
        
                let winProbIncrement = turnWin / winners;
        
                for (let h = 0; h < this.horses.length; h++) {
                    if ((combo >> h) & 1) {
                        this.horses[h].calculatedProb += winProbIncrement;
                    }
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

    simulateOdds() {
        const numRuns = 1000000;
        let wins = Array.from({ length: this.horses.length }, () => Array.from({ length: this.horses.length }, () => 0));

        for (let run = 0; run < numRuns; run++) {
            let sums = new Array(this.horses.length).fill(0);
            
            let placement = [];
            let finishers = [];
            while (finishers.length < this.horses.length) {
                let win = [];
                for (let j = 0; j < this.horses.length; j++) {
                    if(finishers.includes(j)) {
                        continue;
                    }
                    sums[j] += this.horses[j].die[Math.floor(Math.random() * this.horses[j].die.length)];
                    if (sums[j] >= this.distance) {
                        //wins[j]++;
                        win.push(j);
                        finishers.push(j);
                    }
                }
                placement.push(win);
            }

            let place = 0;
            for (let j = 0; j < placement.length; j++) {
                for(let k = 0; k < placement[j].length; k++) {
                    for(let l = place; l < place + placement[j].length; l++) {
                        wins[placement[j][k]][l] += (1 / placement[j].length);
                    }                    
                }
                place += placement[j].length;
            }
        }

        for (let h = 0; h < this.horses.length; h++) {
            this.horses[h].simulatedProb = wins[h].map(w => w / numRuns);
        }

        for (let h = 0; h < this.horses.length; h++) {
            console.log(this.horses[h].die);
            console.log(this.horses[h].simulatedProb);
        }
    }


}
