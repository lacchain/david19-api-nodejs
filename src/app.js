import express from 'express';
import http from 'http';
import cors from 'cors';
import MongoDAO from "./dao.js";
import APIRouter from "./routes/api.js";
import Logger from "./util/logger.js";
import APIMetrics from "./metrics/api.js";

const logger = new Logger();
const app = express();
const dao = new MongoDAO();
const apiMetrics = new APIMetrics();
const apiRouter = new APIRouter( logger.instance( process.env.ELASTIC_API_INDEX  ), apiMetrics, dao );

app.use( cors() );
app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );
app.use( apiMetrics.middleware );

app.use( '/', apiRouter.getRouter() );

const server = http.createServer( app );

dao.updateUnknownUserCountry().then();

server.listen( process.env.API_PORT, function() {
	console.log( 'DAVID19 API Server v1.03 on port', process.env.API_PORT );
} );