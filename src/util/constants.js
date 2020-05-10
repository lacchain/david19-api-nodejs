import utf8 from "utf8";

export const Symptoms = {
	Fever: 0b00000010,
	Cough: 0b00000100,
	BreathingIssues: 0b00001000,
	LostSmell: 0b00010000,
	Headache: 0b00100000,
	MusclePain: 0b01000000,
	SoreThroat: 0b10000000
};

export const CovidCode = {
	Confinement: 0,
	Interruption: 1,
	Symptoms: 2,
	Infection: 3,
	Recovery: 4
};

export const Statuses = {
	Healthy: 0,
	WithSymptoms: 1,
	Affected: 2,
	Recovered: 3
};

export const Zoom = {
	1: 2,
	2: 2,
	3: 3,
	4: 3,
	5: 4,
	6: 4,
	7: 4,
	8: 5,
	9: 5,
	10: 5,
	11: 5,
	12: 6,
	13: 6,
	14: 6,
	15: 6,
	16: 6,
	17: 6,
	18: 6,
	19: 6,
	20: 6
}

export const hexToUTF8 = function(hex) {
	let str = "";
	let code = 0;
	hex = hex.replace(/^0x/i,'');

	hex = hex.replace(/^(?:00)*/,'');
	hex = hex.split("").reverse().join("");
	hex = hex.replace(/^(?:00)*/,'');
	hex = hex.split("").reverse().join("");

	let l = hex.length;

	for (let i=0; i < l; i+=2) {
		code = parseInt(hex.substr(i, 2), 16);
		str += String.fromCharCode(code);
	}

	return utf8.decode(str);
};