class Scoreboard {
	home = 0;
	visitor = 0;
	homeTeam = 0
	visitorTeam = 0;
	clock = null;
	ridingClock = null;
	weight = 0;
	match = 0;
	period = 1;
	isRunning = false;

	constructor(displayClock, displayRiding) {
		this.clock = new Clock(3,0,displayClock, false);
		this.ridingClock = new AdvantageClock(displayRiding);
	}

	startRed() {
		this.ridingClock.start(Advantage.RED);
	}

	startGreen() {
		this.ridingClock.start(Advantage.GREEN);
	}

	stopRiding() {
		this.ridingClock.stop();
	}

	toggleClock() {
		if(this.isRunning) {
			this.clock.stop()
		}
		else {
			this.clock.start();
		}

		this.isRunning = !this.isRunning;
	}

	getTime() {
		return this.clock.getTime();
	}

	getRidingTime() {
		return this.ridingClock.getTime();
	}

	resetScores() {
		this.home = 0;
		this.visitor = 0;
		this.homeTeam = 0
		this.visitorTeam = 0;
		this.period = 1;
	}

	addHome() {
		this.home++;
	}

	addVisitor() {
		this.visitor++;
	}

	addHomeTeam() {
		this.homeTeam++;
	}

	addVisitorTeam() {
		this.visitorTeam++;
	}

	addPeriod() {
		this.period++;

		this.clock.stop();
		this.ridingClock.stop();
		this.clock.minutes = 2;
		this.clock.seconds = 0;
	}
}

