import express from 'express';
import http from 'http';
import cors from 'cors';
import MongoDAO from "./dao.js";
import { Zoom } from "./constants.js";
import CovidContract from "./contract.js";

const app = express();
const dao = new MongoDAO();
const contract = new CovidContract( dao );

app.use( cors() );
app.use( express.json() );

app.get( '/', async( req, res ) => {
	res.status( 200 ).send( await dao.getCountryRanking() );
} );

app.post( '/eventeum/event', async( req, res ) => {
	const { name, indexedParameters, nonIndexedParameters } = req.body;
	if( name === 'CredentialRegistered' ) {
		contract.registerCredential( {
			name,
			returnValues: {
				hash: indexedParameters[0].value,
				id: nonIndexedParameters[0].value,
				sex: nonIndexedParameters[4].value,
				age: nonIndexedParameters[5].value,
				geoHash: nonIndexedParameters[6].value,
				credentialType: nonIndexedParameters[7].value,
				reason: nonIndexedParameters[8].value,
				symptoms: nonIndexedParameters[9].value
			}
		} ).then( result => {
			console.info( name, new Date().getTime(), result._doc.subjectId );
		} ).catch( error => {
			console.debug( name, new Date().getTime(), error, JSON.stringify( req.body ) );
		} );
	} else if( name === 'CredentialRevoked' ) {
		contract.revokeCredential( {
			name,
			returnValues: {
				hash: indexedParameters[0].value,
				id: nonIndexedParameters[0].value,
			}
		} ).then( result => {
			console.error( name, new Date().getTime(), result._doc.subjectId );
		} ).catch( error => {
			console.debug( name, new Date().getTime(), error, JSON.stringify( req.body ) );
		} );
	}
	res.status( 200 ).send( {} );
} );

app.post( '/eventeum/block', async( req, res ) => {
	res.status( 200 ).send( {} );
} );

app.post( '/ages', async( req, res ) => {
	const { status, filter } = req.body;
	const ranges = await dao.getAgeRanges( parseInt( status ), filter );
	res.status( 200 ).send( ranges );
} );

app.post( '/map', async( req, res ) => {
	const { box, zoom, filter } = req.body;
	const clusters = await dao.getClusters( box, Zoom[zoom], filter );
	res.status( 200 ).send( clusters );
} );

const server = http.createServer( app );

server.listen( 8081, function() {
	console.log( 'Express server listening on ', 8081 );
} );