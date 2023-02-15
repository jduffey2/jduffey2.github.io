function displayClock(time) {
	document.getElementById('clockDiv').innerHTML = `${time[0]}:${time[1].toString().padStart(2,'0')}`;
}

function displayAdvClock(time) {
	document.getElementById('advClockDiv').innerHTML = `${time[0]}:${time[1].toString().padStart(2,'0')} - ${time[2]}`;
}

myClock = new Clock(0,0,displayClock, true);
isRunning = false;

function toggle() {
	if(isRunning) {
		myClock.stop()
	}
	else {
		myClock.start();
	}

	isRunning = !isRunning;
	
}

advClock = new AdvantageClock(displayAdvClock);

function red() {
	advClock.start(Advantage.RED);
}

function green() {
	advClock.start(Advantage.GREEN);
}

function stop() {
	advClock.stop();
}

function init() {
	displayClock(myClock.getTime());
	displayAdvClock(advClock.getTime());

}

