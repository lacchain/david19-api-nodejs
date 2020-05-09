export const Symptoms = {
	Fever: 0b0000001,
	Cough: 0b0000010,
	BreathingIssues: 0b0000100,
	LostSmell: 0b0001000,
	Headache: 0b0010000,
	MusclePain: 0b0100000,
	SoreThroat: 0b1000000
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
	Recovered: 3,
	Unknown: 4
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

export const hexToAscii = ( hexArg ) => {
	const hexArgStr = hexArg.toString();
	let resultStr = '';
	for( let i = 0; i < hexArgStr.length; i += 2 )
		resultStr += String.fromCharCode( parseInt( hexArgStr.substr( i, 2 ), 16 ) );
	return resultStr;
};