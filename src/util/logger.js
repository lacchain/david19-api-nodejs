import winston from "winston";
import WinstonElastic from "winston-elasticsearch";
import ElasticSearch from "@elastic/elasticsearch";

export default class Logger {

	constructor() {
		this.client = new ElasticSearch.Client( {
			node:  process.env.ELASTIC_NODE_URL,
			auth: {
				apiKey: process.env.ELASTIC_API_KEY
			}
		} )
	}

	instance( index ) {
		return winston.createLogger( {
			transports: [
				new WinstonElastic.ElasticsearchTransport( {
					level: 'debug',
					index,
					client: this.client
				} ),
				new winston.transports.Console( {
					level: 'debug',
					handleExceptions: true,
					json: true,
					colorize: true
				} )
			]
		} );

	}
}