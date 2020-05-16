import express from 'express';
import http from 'http';
import cors from 'cors';
import MongoDAO from "./dao.js";
import ConsumerRouter from "./routes/consumer.js";
import Logger from "./util/logger.js";

const logger = new Logger();
const app = express();
const dao = new MongoDAO();
const consumerRouter = new ConsumerRouter( logger.instance( process.env.ELASTIC_CONSUMER_INDEX ), dao );

app.use( cors() );
app.use( express.json() );

app.use( '/', consumerRouter.getRouter() );

const server = http.createServer( app );

server.listen( process.env.CONSUMER_PORT, function() {
	console.log( 'DAVID19 Consumer Service v1.03 on port', process.env.CONSUMER_PORT );
} );