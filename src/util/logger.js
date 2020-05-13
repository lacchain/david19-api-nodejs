import winston from "winston";
import WinstonElastic from "winston-elasticsearch";
import ElasticSearch from "@elastic/elasticsearch";

export default class Logger {

	constructor() {
		if( process.env.LOGGER_LEVEL !== 'none' )
			this.client = new ElasticSearch.Client( {
				node: process.env.ELASTIC_NODE_URL,
				auth: {
					username: 'elastic',
					password: process.env.ELASTIC_API_KEY
				}
			} )
	}

	instance( index ) {
		const level = process.env.LOGGER_LEVEL;
		return winston.createLogger( {
			transports: [
				...( level !== 'none' ? [new WinstonElastic.ElasticsearchTransport( {
					level,
					index,
					client: this.client
				} )] : [] ),
				new winston.transports.Console( {
					level,
					handleExceptions: true,
					json: true,
					colorize: true
				} )
			],
			silent: level === 'none'
		} );

	}
}