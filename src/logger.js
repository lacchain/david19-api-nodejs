import winston from "winston";
import Elasticsearch from "winston-elasticsearch";
import { start } from "elastic-apm-node";

const apm = start( { serverUrl: "<apm server http url>" } )
const logger = winston.createLogger( {
	transports: [
		new Elasticsearch( {
			apm,
			level: 'info',
			clientOpts: { node: "<elastic server>" }
		} )
	]
} );

logger.stream = {
	write: function(message, encoding) {
		logger.info(message);
	},
};