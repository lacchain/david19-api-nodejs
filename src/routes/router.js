import express from 'express';
import apicache from "apicache";

export default class Router {

	constructor( logger, metrics ) {
		apicache.options( {
			appendKey: ( req, res ) => `${req.path}:${JSON.stringify( req.body )}:${JSON.stringify( req.query )}:${JSON.stringify( req.params )}`
		} )
		this.logger = logger;
		this.metrics = metrics;
		this.handleMetrics = metrics;
		this.router = express.Router();
		this.cache = apicache.middleware;
		this.init();
	}

	init() {
	}

	get( path, cache, ...callbacks ) {
		if( !cache )
			this.router.get( path, this._bindCustomResponses, this._getCallbacks( callbacks ) );
		else
			this.router.get( path, this.cache( cache ), this._bindCustomResponses, this._getCallbacks( callbacks ) );
	}

	post( path, cache, ...callbacks ) {
		if( !cache )
			this.router.post( path, this._bindCustomResponses, this._getCallbacks( callbacks ) );
		else
			this.router.post( path, this.cache( cache ), this._bindCustomResponses, this._getCallbacks( callbacks ) );
	}

	getRouter() {
		return this.router;
	}

	_getCallbacks( callbacks ) {
		return callbacks.map( ( callback ) => async( ...params ) => {
			try {
				const startTime = new Date().getTime();
				const response = await callback.apply( this, params )
				const endTime = new Date().getTime();
				const latency = endTime - startTime;
				params[1].sendSuccess( response );
				this.logger.debug( `${params[0].method} ${params[0].path}`, {
					response: {
						status: 200,
						executionTime: latency
					},
					request: JSON.stringify( params[0].body )
				} );
				if( this.handleMetrics )
					this.metrics.setLatencyValue( params[0].path, latency );
			} catch( error ) {
				this.logger.error( `${params[0].method} ${params[0].path}`, {
					response: {
						status: 500,
						error:  error + ''
					},
					request: JSON.stringify( params[0].body )
				} );
				if( this.handleMetrics )
					this.metrics.incrementErrorCount( params[0].path );
				params[1].sendError( error + '' );
			}
		} );
	}

	_bindCustomResponses( req, res, next ) {
		res.sendSuccess = ( payload, executionTime ) => {
			res.status( 200 ).json( payload );
		};
		res.sendError = ( error ) => {
			res.status( 500 ).json( error );
		};
		next();
	}
}