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
let settings = {};

function init() {
	let savedSettings = JSON.parse(localStorage.getItem('christmasGameSettings'));

	if(savedSettings == null) {
		const defaultSettings = {
			rolls: ['A', 'B', 'C', 'D', 'E', 'C', 'B', 'F', 'G', 'H', 'C', 'I', 'B', 'H', 'D', 'C', 'F', 'D', 'H', 'C'],
			passRange: 4,
			custom: []
		}
		savedSettings = defaultSettings;
		localStorage.setItem('christmasGameSettings',JSON.stringify(defaultSettings));

	}
	settings = savedSettings;

	//Init the Roll and Results
	document.getElementById('rollDiv').innerHTML = 0;
	document.getElementById('resultDiv').innerHTML = 'Roll!';

	initAdmin();
}

function initAdmin() {
	document.getElementById('passRange').value = settings.passRange;
	let container = document.getElementById('rollContainer');
	container.innerHTML = "";

	for (var i = 0; i < settings.rolls.length; i++) {
		var temp = document.getElementById('rollElementTemplate');
		var clone = temp.content.cloneNode(true);
		if(isNaN(settings.rolls[i])) {
			clone.querySelector('.rollText').value = predefined[settings.rolls[i]];
		}
		else {
			clone.querySelector('.rollText').value = settings.custom[parseInt(settings.rolls[i])];
		}
		clone.querySelector('.removeBtn').setAttribute("data-elementid",i);
		clone.querySelector('.upBtn').setAttribute("data-elementid",i);
		clone.querySelector('.downBtn').setAttribute("data-elementid",i);

		if(i === 0) {
			clone.querySelector('.upBtn').setAttribute("disabled", true);
		}

		if(i === settings.rolls.length - 1) {
			clone.querySelector('.downBtn').setAttribute("disabled", true);
		}


		container.appendChild(clone);
	}


	const keys = Object.keys(predefined);
	const select = document.getElementById('presetElements');
	select.innerHTML = "";
	for (var j = 0; j < keys.length; j++) {
		let option = new Option(predefined[keys[j]],keys[j]);
		select.add(option, undefined);
	}

	for (var k = 0; k < settings.custom.length; k++) {
		let option = new Option(settings.custom[k],k);
		select.add(option, undefined);
	}
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
			if(isNaN(settings.rolls[roll])) {
				message = predefined[settings.rolls[roll]];
			}
			else {
				message = settings.custom[parseInt(settings.rolls[roll])];
			}

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

	localStorage.setItem('christmasGameSettings',JSON.stringify(settings));
}

function removeElement(event) {
	const target = event.target.getAttribute("data-elementid");
	settings.rolls.splice(target,1);

	initAdmin();
}

function elementUp(event) {
	const target = event.target.getAttribute("data-elementid");
	let temp = settings.rolls[target];
	settings.rolls[target] = settings.rolls[target - 1];
	settings.rolls[target - 1] = temp;

	initAdmin();
}

function elementDown(event) {
	const target = parseInt(event.target.getAttribute("data-elementid"));
	let temp = settings.rolls[target];
	settings.rolls[target] = settings.rolls[target + 1];
	settings.rolls[target + 1] = temp;

	initAdmin();
}

function addPreset(event) {
	settings.rolls.push(document.getElementById('presetElements').value);

	initAdmin();
}

function addCustom() {
	settings.custom.push(document.getElementById('customElement').value);
	settings.rolls.push((settings.custom.length - 1).toString());

	initAdmin();
}