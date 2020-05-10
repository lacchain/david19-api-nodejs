import express from 'express';
import http from 'http';
import cors from 'cors';
import MongoDAO from "./dao.js";
import CovidContract from "./contract.js";

const app = express();
const dao = new MongoDAO();
const contract = new CovidContract( dao );

app.use( cors() );
app.use( express.json() );

app.post( '/event', async( req, res ) => {
	const { name, status, indexedParameters, nonIndexedParameters } = req.body;
	if( name === 'CredentialRegistered' && status === 'CONFIRMED' ) {
		contract.registerCredential( {
			name,
			returnValues: {
				hash: indexedParameters[0].value,
				id: nonIndexedParameters[1].value,
				sex: nonIndexedParameters[4].value,
				age: nonIndexedParameters[5].value,
				geoHash: nonIndexedParameters[6].value,
				credentialType: nonIndexedParameters[7].value,
				reason: nonIndexedParameters[8].value,
				symptoms: nonIndexedParameters[9].value
			}
		} ).then( result => {
			console.info( name, new Date().getTime(), result._doc.subjectId, result._doc.geohash );
		} ).catch( error => {
			console.debug( name, new Date().getTime(), error, JSON.stringify( req.body ) );
		} );
	}
	res.status( 200 ).send( {} );
} );

app.post( '/block', async( req, res ) => {
	res.status( 200 ).send( {} );
} );

const server = http.createServer( app );

server.listen( process.env.CONSUMER_PORT, function() {
	console.log( 'DAVID19 Consumer Service v1.01 on port', process.env.CONSUMER_PORT );
} );