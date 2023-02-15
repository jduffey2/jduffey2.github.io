class Clock {
	intervalDuration = 1000;
	seconds = 0;
	minutes = 0;
	elapsed = 0;
	startTime = 0;
	isUp = false;
	displayFunction = null;
	clockInterval = null;
	
	//min: minutes to set the clock at
	//sec: seconds to set the clock at
	//display: function to call on tick that can be used to update the display, 
	//       should accept a parameter that will be an array [minutes, seconds] currently on the clock
	constructor(min, sec, display, up = false) {
		this.seconds= sec;
		this.minutes = min;
		this.displayFunction = display;
		this.isUp = up
	}

	start() {
		this.startTime = Date.now();
		if(this.clockInterval == null) {
			this.clockInterval = setInterval(() => this.tick(), this.intervalDuration);
		}
		
	}

	stop() {
		clearInterval(this.clockInterval);
		this.clockInterval = null;
	}

	tick() {
		const now = Date.now();
		this.elapsed = now - this.startTime;
		let secs = Math.floor(this.elapsed/1000);

		if(this.isUp) {
			this.seconds += secs;

			if(this.seconds >= 60) {
				this.minutes += 1;
				this.seconds -= 60;
			}
		}
		else {
			this.seconds -= secs

			if(this.minutes == 0 & this.seconds <= 0) {
				this.stop();
				//Do something here to sound a buzzer
			}

			if(this.seconds < 0) {
				this.minutes -= 1;
				this.seconds += 60;
			}
		}

		this.elapsed += this.elapsed%1000;
		this.startTime = now;
		this.displayFunction(this.getTime());

	}

	getTime() {
		return [this.minutes,this.seconds];
	}
}

class AdvantageClock extends Clock{ 
	hasAdvantage = Advantage.NEUTRAL;
	runFor = Advantage.NEUTRAL;

	//display: function to call on tick that can be used to update the display, 
	//       should accept a parameter that will be an array [minutes, seconds, advantage] currently on the clock and who has advantage
	constructor(display) {
		super(0,0,display, true);
	}

	start(color) {
		this.runFor = color;
		if(this.hasAdvantage !== Advantage.NEUTRAL && color !== this.hasAdvantage) {
			this.isUp = false;
			//Since we are flipping the clock we need to start decreasing the elapsed ms,
			//Instead of doing that we will just invert the elapsed ms
			this.elapsed = 1000 - this.elapsed;
		}
		else {
			if(!this.isUp) {
				this.elapsed = 1000 - this.elapsed;
			}
			this.isUp = true;
		}
		
		this.startTime = Date.now();
		if(this.clockInterval !== null) {
			clearInterval(this.clockInterval);
		}
		this.clockInterval = setInterval(() => this.tick(), this.intervalDuration);
	}

	tick() {
		if(this.seconds == 0 && this.minutes == 0) {
			this.isUp = true;
			this.hasAdvantage = Advantage.NEUTRAL;
			
		}

		if(this.isUp && !(this.seconds == 0 && this.minutes == 0)) {
			this.hasAdvantage = this.runFor;
		}

		const now = Date.now();
		this.elapsed += (now - this.startTime);
		let secs = Math.floor(this.elapsed/1000);

		if(this.isUp) {
			this.seconds += secs;

			if(this.seconds >= 60) {
				this.minutes += 1;
				this.seconds -= 60;
			}
		}
		else {
			this.seconds -= secs

			if(this.seconds < 0) {
				this.minutes -= 1;
				this.seconds += 60;
			}
		}

		this.elapsed = this.elapsed%1000;
		this.startTime = now;
		this.displayFunction(this.getTime());
	}

	getTime() {
		return [this.minutes, this.seconds, this.hasAdvantage];
	}
}

const Advantage = {
	GREEN: 'GREEN',
	RED: 'RED',
	NEUTRAL: 'NEUTRAL'
};

