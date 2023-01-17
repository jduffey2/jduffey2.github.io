const predefined = {
	'A': '+1 round',
	'B': `Pass right {amt}`,
	'C': 'Unwrap your gift',
	'D': `Pass Left {amt}`,
	'E': 'Take any action',
	'F': 'Have 2 people swap',
	'G': 'Have some else unwrap their gift',
	'H': 'Steal someone\'s gift',
	'I': 'Undo last swap'
}

const custom = {}

let settings = {};


function init() {
	let savedSettings = JSON.parse(localStorage.getItem('settings'));

	if(savedSettings == null) {
		const defaultSettings = {
			rolls: ['A', 'B', 'C', 'D', 'E', 'C', 'B', 'F', 'G', 'H', 'C', 'I', 'B', 'H', 'D', 'C', 'F', 'D', 'H', 'C'],
			passRange: 4
		}
		savedSettings = defaultSettings;
		localStorage.setItem('settings',JSON.stringify(defaultSettings));

	}
	settings = savedSettings;

	//Init the Roll and Results
	document.getElementById('rollDiv').innerHTML = 0;
	document.getElementById('resultDiv').innerHTML = 'Roll!';

	initAdmin();
}

function initAdmin() {
	document.getElementById('passRange').value = settings.passRange;
}

function roll() {
	const max = settings.rolls.length;
	const roll = Math.floor(Math.random() * max);

	displayRoll(roll);
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function displayRoll(roll) {
	document.getElementById('resultDiv').innerHTML = '';
	await fakeRolls();
	document.getElementById('rollDiv').innerHTML = roll + 1;

	let message = ''
	switch(settings.rolls[roll]) {
		case 'B':
		case 'D':
			const passNum = Math.floor(Math.random() * settings.passRange) + 1;
			message = predefined[settings.rolls[roll]].replace('{amt}', passNum)
			break;
		default:
			message = predefined[settings.rolls[roll]];

	}
	document.getElementById('resultDiv').innerHTML = message;
}

async function fakeRolls() {
	let changes = Math.floor(Math.random() * 8) + 5;

	for(var i = 0; i < changes; i++) {
		const max = settings.rolls.length;
		const fakeRoll = Math.floor(Math.random() * max);
		document.getElementById('rollDiv').innerHTML = fakeRoll + 1;
		await sleep(300);
	}
}

function showAdmin() {
	document.getElementById('mainDiv').style.display = "none";
	document.getElementById('adminDiv').style.display = "block";
}

function showMain() {
	saveSettings();
	document.getElementById('mainDiv').style.display = "block";
	document.getElementById('adminDiv').style.display = "none";


}

function saveSettings() {
	settings.passRange = document.getElementById('passRange').value;

	localStorage.setItem('settings',JSON.stringify(settings));
}
