//TODO
//Tie break calculation
//Tie-break of tie
//Betting
//2nd + 3rd Calculation
//Trifecta Betting
//More horse types
 
let race, nextRace, canvas, context;
let colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'gray', 'white'];
let width = 1040;
let height = 360;
 
function drawRace(race, ctx) {
 
    //Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,width,height);
    //Draw track
    ctx.strokeStyle = "black";
    ctx.strokeWidth = "3";
    ctx.beginPath();
    ctx.lineTo(0,width);
    let laneHeight = height / race.horses.length;
    let laneWidth = width / (race.distance + 1);
 
    //Draw the lanes
    for(let i = 0; i < race.horses.length; i++) {
        ctx.moveTo(0,(i+1) * laneHeight);
        ctx.lineTo(width,(i+1) * laneHeight);
        //Starting block
        ctx.fillStyle = colors[i];
        ctx.fillRect(0,i*laneHeight,laneWidth, laneHeight)
    }
    //Draw the distances
    for(let j = 0; j < race.distance; j++) {
        ctx.moveTo((j+1)*laneWidth,0)
        ctx.lineTo((j+1)*laneWidth, height);
    }
    ctx.stroke();
    //Draw the finish line
    ctx.beginPath();
    let counter = 0;
    for(let k = 0; k < height; k += laneWidth) {
        ctx.fillStyle = (counter % 2 == 0) ? "black" : "white";
        ctx.fillRect(width - laneWidth,counter*laneWidth,laneWidth,laneWidth);
        counter++;
    }
    ctx.stroke();
 
    //Draw horses
    for(let m = 0; m < race.horses.length; m++) {
        ctx.fillStyle = colors[m];
        ctx.fillRect(laneWidth,m*laneHeight,race.horses[m].raceSum * laneWidth,laneHeight)
    }
}
 
function updateCurrentRace(race) {
    let currentRaceTable = document.getElementById('currentRaceTableContent');
    currentRaceTable.innerHTML = '';
 
    for(let i = 0; i < race.horses.length; i++) {
        let row = `<tr><td style="background-color: ${colors[i]}">${i+1}</td><td>${race.horses[i].name}</td><td>${race.horses[i].getMultiplyOdds(race.houseCut).toFixed(2)}</td><td>${race.horses[i].getOfferedProb(race.houseCut).toFixed(3)}</td><td>${formatOdds(race.horses[i].getOdds(race.houseCut))}</td><td>${race.horses[i].raceSum} - ${race.horses[i].place}</td></tr>`
        currentRaceTable.innerHTML += row;
    }
}
 
function updateNextRace(race) {
    let nextRaceTable = document.getElementById('nextRaceTableContent');
    nextRaceTable.innerHTML = '';
    if(race != null) {
        for(let i = 0; i < race.horses.length; i++) {
            let row = `<tr><td style="background-color: ${colors[i]}">${i+1}</td><td>${race.horses[i].name}</td><td>${race.horses[i].getMultiplyOdds(race.houseCut).toFixed(2)}</td><td>${race.horses[i].getOfferedProb(race.houseCut).toFixed(3)}</td><td>${formatOdds(race.horses[i].getOdds(race.houseCut))}</td><td>${race.horses[i].calculatedProb.toFixed(3)}</td><td>${race.horses[i].simulatedProb.toFixed(3)}</td></tr>`
            nextRaceTable.innerHTML += row;
        }
    }
}

//Multiply Odds
//Odds
//Offered Probability
//Calculated Probability
//Simulated Probability
 
 
function executeTurn() {
    race.executeTurn();
    drawRace(race, context);
    updateCurrentRace(race);
}
 
let raceTimer;
function autoRace() {
    raceTimer = setInterval(executeTurn, settings.turnTimer);
}
 
function stopRace() {
    if(raceTimer != null) {
        clearInterval(raceTimer);
        raceTimer = null;
    }
   
}
 
function init() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
   
    initSettings();
 
    race = new Race(settings);
    updateCurrentRace(race);
    drawRace(race, context);
}
 
function generateRace() {
    //Get the current settings
 
    //Create
    nextRace = new Race(settings);
 
    //Update the table
    updateNextRace(nextRace);
}
 
function next() {
    race = nextRace;
    nextRace = null;
 
    updateCurrentRace(race);
    updateNextRace(nextRace);
    drawRace(race, context);
}
 
function initSettings() {
    document.getElementById('participantInput').value = settings.participants;
    document.getElementById('houseCutInput').value = settings.houseCut;
    document.getElementById('turnTimerInput').value = settings.turnTimer;
    document.getElementById('distanceSelect').value = settings.distance;
 
    let typeDiv = document.getElementById('diceEnableDiv')
    typeDiv.innerHTML = '';
    for(let i = 0; i < settings.horseTypes.length; i++) {
        let item = `<label for='${settings.horseTypes[i].ref}'>${data[settings.horseTypes[i].ref].dice}</label><input type='checkbox' id='${settings.horseTypes[i].ref}' ${settings.horseTypes[i].active ? 'checked' : ''}/>`
        typeDiv.innerHTML += item;
        if(i == 7) {
            typeDiv.innerHTML += '<br/>'; // Add a line break after the first 8 checkboxes
        }
    }
}
 
function save() {
    settings.participants = document.getElementById('participantInput').value;
    settings.houseCut = document.getElementById('houseCutInput').value;
    settings.turnTimer = document.getElementById('turnTimerInput').value;
    settings.distance = document.getElementById('distanceSelect').value;
 
    for(let i = 0; i < settings.horseTypes.length; i++) {
        let checkbox = document.getElementById(settings.horseTypes[i].ref);
        settings.horseTypes[i].active = checkbox.checked;
    }
}
 
function getTurnsByHorse() {
    for(let i=0; i < this.race.horses.length; i++) {
        let total = 0;
        total += this.race.horses[i].rolls.length;
        console.log(this.race.horses[i].rolls.length);
    }
 
    let foo = this.races.horses.map(horse => horse.rolls.length);
    console.log(foo);
    console.log(`Avg: ${total}`)
}