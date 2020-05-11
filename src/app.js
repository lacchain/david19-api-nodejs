import express from 'express';
import http from 'http';
import cors from 'cors';
import MongoDAO from "./dao.js";
import { Zoom } from "./util/constants.js";
import apicache from "apicache";
import logger from "morgan";

const app = express();
const dao = new MongoDAO();

const cache = apicache.middleware;

app.use( cors() );
app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );
app.use( logger( 'dev' ) );

apicache.options( {
	appendKey: ( req, res ) => `${req.path}:${JSON.stringify( req.body )}`
} )

app.get( '/loaderio-beed9861fed14cb68841ad3e61ac277a', ( req, res ) => res.status( 200 ).send( "loaderio-beed9861fed14cb68841ad3e61ac277a" ) );

app.get( '/', cache( '1 minute' ), async( req, res ) => {
	try {
		res.status( 200 ).send( await dao.getCountryRanking() );
	} catch( error ) {
		res.status( 500 ).send( error );
	}
} );

app.post( '/ages', cache( '1 minute' ), async( req, res ) => {
	const { status, filter } = req.body;
	try {
		const ranges = await dao.getAgeRanges( parseInt( status ), filter );
		res.status( 200 ).send( ranges );
	} catch( error ) {
		res.status( 500 ).send( error );
	}
} );

app.post( '/map', cache( '1 minute' ), async( req, res ) => {
	const { box, zoom, filter } = req.body;
	try {
		const clusters = await dao.getClusters( box, Zoom[zoom], filter );
		res.status( 200 ).send( clusters );
	} catch( error ) {
		res.status( 500 ).send( error );
	}
} );

app.post( '/query', cache( '1 minute' ), async( req, res ) => {
	const { box, zoom, filter } = req.body;
	try {
		const clusters = await dao.getQuery( box, Zoom[zoom], filter );
		res.status( 200 ).send( clusters );
	} catch( error ) {
		res.status( 500 ).send( error );
	}
} );

const server = http.createServer( app );

server.listen( process.env.API_PORT, function() {
	console.log( 'DAVID19 API Server v1.01 on port', process.env.API_PORT );
} );