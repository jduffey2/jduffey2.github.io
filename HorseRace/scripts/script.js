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
let squareSize = 48;
let animationState = null;
let animationFrameId = null;
let raceTimer = null;
 
function drawRace(race, ctx) {
    if(!race || !ctx) {
        return;
    }

    const laneCount = race.horses.length;
    const laneHeight = Math.max(40, Math.min(70, Math.floor(height / Math.max(laneCount, 2))));
    const worldWidth = Math.max(width, (race.distance + 8) * squareSize);
    const cameraOffsetX = getCameraOffsetX(race);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8fbff';
    ctx.fillRect(0, 0, width, height);

    const firstVisibleTile = Math.floor(cameraOffsetX / squareSize) - 1;
    const lastVisibleTile = Math.ceil((cameraOffsetX + width) / squareSize) + 1;

    for(let lane = 0; lane < laneCount; lane++) {
        const laneY = lane * laneHeight;
        ctx.fillStyle = colors[lane % colors.length];
        ctx.fillRect(-cameraOffsetX + 4, laneY + 4, squareSize - 8, squareSize - 8);
        ctx.strokeStyle = '#111827';
        ctx.strokeRect(-cameraOffsetX + 4, laneY + 4, squareSize - 8, squareSize - 8);

        for(let tile = firstVisibleTile; tile <= lastVisibleTile; tile++) {
            const tileX = tile * squareSize - cameraOffsetX;
            if(tileX + squareSize < 0 || tileX > width) {
                continue;
            }
            ctx.fillStyle = (tile + lane) % 2 === 0 ? '#f3f7ff' : '#e8eef8';
            ctx.fillRect(tileX, laneY, squareSize, laneHeight);
            ctx.strokeStyle = '#cbd5e1';
            ctx.strokeRect(tileX, laneY, squareSize, laneHeight);
        }

        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(-cameraOffsetX, laneY);
        ctx.lineTo(worldWidth - cameraOffsetX, laneY);
        ctx.stroke();
    }

    ctx.fillStyle = '#111827';
    ctx.fillRect(-cameraOffsetX, 0, 2, laneCount * laneHeight);

    const finishX = (race.distance * squareSize) - cameraOffsetX;
    for(let row = 0; row < laneCount; row++) {
        const laneY = row * laneHeight;
        for(let col = 0; col < 3; col++) {
            const blockX = finishX + col * 8;
            const isDark = (row + col) % 2 === 0;
            ctx.fillStyle = isDark ? '#111827' : '#f8fafc';
            ctx.fillRect(blockX, laneY, 8, laneHeight);
            ctx.strokeStyle = '#475569';
            ctx.strokeRect(blockX, laneY, 8, laneHeight);
        }
    }

    for(let m = 0; m < race.horses.length; m++) {
        const horse = race.horses[m];
        const horseProgress = getHorseDisplayProgress(horse, m);
        const laneY = m * laneHeight;
        const horseSize = Math.max(12, Math.floor(squareSize * 0.5));
        const horseX = (horseProgress * squareSize - cameraOffsetX) + (squareSize - horseSize) / 2;
        const horseY = laneY + (laneHeight - horseSize) / 2;

        ctx.fillStyle = colors[m % colors.length];
        ctx.fillRect(horseX, horseY, horseSize, horseSize);
        ctx.strokeStyle = '#111827';
        ctx.strokeRect(horseX, horseY, horseSize, horseSize);
    }
}

function getHorseDisplayProgress(horse, index) {
    if(animationState && animationState.horses[index]) {
        const movement = animationState.horses[index];
        return movement.from + (movement.to - movement.from) * animationState.progress;
    }
    return horse.raceSum;
}

function getCameraOffsetX(race) {
    const leadProgress = Math.max(...race.horses.map((horse, index) => getHorseDisplayProgress(horse, index)));
    const targetOffset = leadProgress * squareSize - width * 0.75;
    const worldWidth = Math.max(width, (race.distance + 8) * squareSize);
    const maxOffset = Math.max(0, worldWidth - width);
    return Math.min(maxOffset, Math.max(0, targetOffset));
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
 
 
function startTurnAnimation(moves) {
    const duration = Math.max(100, Number(settings.turnTimer) || 1000);
    animationState = {
        startTime: performance.now(),
        progress: 0,
        duration,
        horses: moves
    };

    if(animationFrameId != null) {
        cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(function animateFrame(timestamp) {
        if(!animationState) {
            return;
        }

        const elapsed = timestamp - animationState.startTime;
        animationState.progress = Math.min(1, elapsed / animationState.duration);
        drawRace(race, context);

        if(animationState.progress < 1) {
            animationFrameId = requestAnimationFrame(animateFrame);
            return;
        }

        animationFrameId = null;
        animationState = null;
        drawRace(race, context);
    });
}
 
function executeTurn() {
    if(!race || animationState) {
        return;
    }

    const priorProgress = race.horses.map(horse => horse.raceSum);
    race.executeTurn();
    const moves = race.horses.map((horse, index) => ({
        horse,
        from: priorProgress[index],
        to: horse.raceSum
    }));

    startTurnAnimation(moves);
    updateCurrentRace(race);
}
 
function autoRace() {
    stopRace();

    const turnDelay = Math.max(100, Number(settings.turnTimer) || 1000);
    const tick = () => {
        if(!race || animationState) {
            raceTimer = setTimeout(tick, 50);
            return;
        }

        executeTurn();
        if(race && race.finished < race.horses.length) {
            raceTimer = setTimeout(tick, turnDelay);
        } else {
            raceTimer = null;
        }
    };

    raceTimer = setTimeout(tick, turnDelay);
}
 
function stopRace() {
    if(raceTimer != null) {
        clearTimeout(raceTimer);
        raceTimer = null;
    }

    if(animationFrameId != null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    animationState = null;
}
 
function init() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
   
    initSettings();
 
    race = new Race(settings);
    updateCurrentRace(race);
    drawRace(race, context);
}
 
function parseProbMap(rawValue) {
    const text = (rawValue || '').trim();
    if(!text) {
        return [];
    }

    if(text.startsWith('[')) {
        try {
            const parsed = JSON.parse(text);
            if(Array.isArray(parsed)) {
                return parsed.map((entry) => ({
                    value: entry.value,
                    probability: entry.probability
                }));
            }
        } catch (error) {
            return [];
        }
    }

    return text.split(',').map((part) => part.trim()).filter(Boolean).map((part) => {
        const [rawValue, rawProbability] = part.split(':');
        const value = rawValue ? rawValue.trim() : '';
        const probability = rawProbability ? rawProbability.trim() : '';
        return {
            value: value === '*' ? '*' : Number(value),
            probability: probability === '*' ? '*' : Number(probability)
        };
    }).filter((entry) => entry.value !== '' && entry.probability !== '');
}

function applyDiceDecoratorToHorse(horse, decoratorType, probMap) {
    if(!horse || !decoratorType || !probMap || probMap.length === 0) {
        return;
    }

    const baseDice = horse.die instanceof DiceDecorator ? horse.die.dice : horse.die;
    let decoratedDie;

    if(decoratorType === 'AddProbDice') {
        decoratedDie = new AddProbDice(baseDice, probMap);
    } else if(decoratorType === 'MultiProbDice') {
        decoratedDie = new MultiProbDice(baseDice, probMap);
    } else {
        return;
    }

    horse.die = decoratedDie;
    horse.distribution = decoratedDie.distribution;
    horse.currentDistribution = decoratedDie.distribution;
    horse.previousDistribution = [1];
    horse.currentLossProb = 1;
    horse.currentWinProb = 0;
    horse.winScoreDist = new Map();
}

function generateRace() {
    save();

    nextRace = new Race(settings);
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
    document.getElementById('decoratorTypeSelect').value = settings.nextRaceDecorator?.type || '';
    document.getElementById('decoratorProbMapInput').value = settings.nextRaceDecorator?.probMap || '';
 
    let typeDiv = document.getElementById('diceEnableDiv')
    typeDiv.innerHTML = '';
    for(let i = 0; i < settings.horseTypes.length; i++) {
        let item = `<label for='${settings.horseTypes[i].ref}'>${data[settings.horseTypes[i].ref].dice}</label><input type='checkbox' id='${settings.horseTypes[i].ref}' ${settings.horseTypes[i].active ? 'checked' : ''}/>`
        typeDiv.innerHTML += item;
        if(i == 7) {
            typeDiv.innerHTML += '<br/>'; // Add a line break after the first 8 checkboxes
        }
    }

    populateDecoratorHorseSelect();
}

function populateDecoratorHorseSelect() {
    const select = document.getElementById('decoratorHorseSelect');
    if(!select) {
        return;
    }

    const participants = Math.max(1, Number(document.getElementById('participantInput').value || settings.participants || 1));
    const currentValue = select.value || settings.nextRaceDecorator?.horseIndex || 1;
    select.innerHTML = '';

    for(let i = 1; i <= participants; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Horse ${i}`;
        select.appendChild(option);
    }

    select.value = currentValue;
}
 
function save() {
    settings.participants = Number(document.getElementById('participantInput').value);
    settings.houseCut = Number(document.getElementById('houseCutInput').value);
    settings.turnTimer = Number(document.getElementById('turnTimerInput').value);
    settings.distance = Number(document.getElementById('distanceSelect').value);
    settings.nextRaceDecorator = {
        type: document.getElementById('decoratorTypeSelect').value,
        probMap: document.getElementById('decoratorProbMapInput').value,
        horseIndex: Number(document.getElementById('decoratorHorseSelect').value)
    };
 
    for(let i = 0; i < settings.horseTypes.length; i++) {
        let checkbox = document.getElementById(settings.horseTypes[i].ref);
        settings.horseTypes[i].active = checkbox.checked;
    }

    populateDecoratorHorseSelect();
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