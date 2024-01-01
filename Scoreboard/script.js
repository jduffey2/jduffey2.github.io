function displayClock(time) {
	document.getElementById('clockDiv').innerHTML = `${time[0]}:${time[1].toString().padStart(2,'0')}`;
}

function displayAdvClock(time) {
	document.getElementById('advClockDiv').innerHTML = `${time[0]}:${time[1].toString().padStart(2,'0')} - ${time[2]}`;
}

function displayScoreboard() {
	document.getElementById('homeScoreDiv').innerHTML = scoreboard.home;
	document.getElementById('visitorScoreDiv').innerHTML = scoreboard.visitor;
	
	document.getElementById('periodDiv').innerHTML = scoreboard.period;

	document.getElementById('homeTeamScoreDiv').innerHTML = scoreboard.homeTeam;
	document.getElementById('visitorTeamScoreDiv').innerHTML = scoreboard.visitorTeam;
}

function updateScoreboard(event) {
	console.log(event.key);
	switch (event.key) {
		case keybindings.HOMESCORE:
			//Add to home score
			scoreboard.addHome();
			break;
		case keybindings.VISITORSCORE:
			//Add to home score
			scoreboard.addVisitor();
			break;
		case keybindings.HOMETEAMSCORE:
			//Add to home score
			scoreboard.addHomeTeam();
			break;
		case keybindings.VISITORTEAMSCORE:
			//Add to home score
			scoreboard.addVisitorTeam();
			break;
		case keybindings.PERIOD:
			//Add to home score
			scoreboard.addPeriod();
			break;
		case keybindings.CLOCK:
			//Add to home score
			scoreboard.toggleClock();
			break;
		case keybindings.RED:
			//Add to home score
			scoreboard.startRed();
			break;
		case keybindings.GREEN:
			//Add to home score
			scoreboard.startGreen();
			break;
		case keybindings.RIDINGSTOP:
			//Add to home score
			scoreboard.stopRiding();
			break;
	}

	displayScoreboard();

}

function toggle() {
	scoreboard.toggleClock();	
}

function red() {
	scoreboard.startRed();
}

function green() {
	scoreboard.startGreen();
}

function stop() {
	scoreboard.stopRiding();
}

function init() {
	displayClock(scoreboard.getTime());
	displayAdvClock(scoreboard.getRidingTime());
	displayScoreboard();

}

scoreboard = new Scoreboard(displayClock, displayAdvClock);