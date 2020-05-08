import MongoDAO from "./dao.js";
import moment from "moment";
import countries from '../output.json';
import CovidContract from "./contract.js";

const contract = new CovidContract();

const consumer = async() => {
	const startTime = moment();
	const events = await contract.getAllEvents( 430000, 431000 );
	const generator = contract.processEvents( events );
	let count = 0;
	for( const promise of generator ) {
		try {
			const result = await promise;
			console.log( result._doc.subjectId );
			count++;
		} catch( error ) {
			console.error( error );
			break;
		}
	}
	const endTime = moment();
	console.log( 'Total Records:', count );
	console.log( 'Elapsed Time:', endTime.diff( startTime, 'seconds' ) );
};

const listener = async() => {
	contract.subscribe();
};

const cluster = async() => {
	const dao = new MongoDAO();
	const clusters = await dao.getClusters( [[-143.120239, -3.552948], [-64.435501, 45.806589]], 5 )
	console.log( clusters );
};

const getCountries = async() => {
	const dao = new MongoDAO();
	const users = await dao.getUsers();
	for( const user of users ) {
		try {
			const start = moment();
			const result = await dao.getCountry( user.location );
			const end = moment();
			if( result ) {
				console.log( result.properties.iso_3166_2, end.diff( start, 'milliseconds' ) );
			}
			break;
		} catch( error ) {
			console.error( error );
		}
	}
};

const loadCountries = async() => {
	const dao = new MongoDAO();
	for( const country of countries ) {
		try {
			const result = await dao.insert( country, 'country' );
			console.log( result._doc.type );
		} catch( error ) {
			console.error( error );
		}
	}
};

const filterAgeRanges = async() => {
	const dao = new MongoDAO();
	console.log( await dao.getAgeRanges(2) );
};

const globalStatus = async() => {
	const dao = new MongoDAO();
	console.log( await dao.getGlobalStatus() );
};

const countryRanking = async() => {
	const dao = new MongoDAO();
	console.log( await dao.getCountryRanking() );
};

consumer();