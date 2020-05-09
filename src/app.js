import express from 'express';
import http from 'http';
import cors from 'cors';
import MongoDAO from "./dao.js";
import { Zoom } from "./util/constants.js";
import apicache from "apicache";

const app = express();
const dao = new MongoDAO();

const cache = apicache.middleware;

app.use( cors() );
app.use( express.json() );

apicache.options( {
	appendKey: ( req, res ) => `${req.path}:${JSON.stringify( req.body )}`
} )

app.get( '/', cache( '1 minute' ), async( req, res ) => {
	res.status( 200 ).send( await dao.getCountryRanking() );
} );

app.post( '/ages', cache( '1 minute' ), async( req, res ) => {
	const { status, filter } = req.body;
	const ranges = await dao.getAgeRanges( parseInt( status ), filter );
	res.status( 200 ).send( ranges );
} );

app.post( '/map', cache( '1 minute' ), async( req, res ) => {
	const { box, zoom, filter } = req.body;
	const clusters = await dao.getClusters( box, Zoom[zoom], filter );
	res.status( 200 ).send( clusters );
} );

const server = http.createServer( app );

server.listen( process.env.API_PORT, function() {
	console.log( 'DAVID19 API Server listening on ', process.env.API_PORT );
} );