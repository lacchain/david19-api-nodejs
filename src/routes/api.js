import Router from "./router.js";
import { Zoom } from "../util/constants.js";

export default class APIRouter extends Router {

	constructor( logger, metrics, dao ) {
		super( logger, metrics );
		this.dao = dao;
	}

	init() {

		this.get( '/', '1 minute', () => {
			return this.dao.getCountryRanking()
		} );

		this.post( '/ages', '1 minute', req => {
			const { status, filter } = req.body;
			return this.dao.getAgeRanges( parseInt( status ), filter );
		} );

		this.post( '/map', '1 minute', req => {
			const { box, zoom, filter } = req.body;
			return this.dao.getClusters( box, Zoom[zoom], filter );
		} );

		this.post( '/query', '1 minute', req => {
			const { box, zoom, filter } = req.body;
			return this.dao.getQuery( box, Zoom[zoom], filter );
		} );

		this.get( '/points', '1 minute', () => {
			return this.dao.getCountryPoints();
		} );

		this.get( '/points/user/:id', '1 minute', async req => {
			const { id } = req.params;
			const user = await this.dao.getUser( id );
			if( !user ) return { points: 0 };

			return {
				points: user.points || 0
			};
		} );

		this.get( '/points/user/:id/stats', '1 minute', async req => {
			const { id } = req.params;
			const user = await this.dao.getUser( id );
			if( !user ) throw new Error( "Invalid subjectId" )
			const totalUsers = await this.dao.getTotalUsers();
			const countryUsers = await this.dao.getCountryUsers( user.country );
			const regionUsers = await this.dao.getRegionUsers( user.country, user.region );
			const globalPosition = await this.dao.getUserRankPosition( id );
			const countryPosition = await this.dao.getUserRankPositionCountry( user.country, id );
			const regionPosition = await this.dao.getUserRankPositionRegion( user.country, user.region, id );
			const averagePoints = await this.dao.getAveragePoints();

			return {
				totalUsers,
				countryUsers,
				regionUsers,
				globalPosition,
				countryPosition,
				regionPosition,
				averagePoints,
				histogram: user.histogram || [],
				points: user.points || 0,
				level: user.level || 0
			};
		} );

		this.get( '/points/user/:id/ranking', '1 minute', async req => {
			const { id } = req.params;
			const user = await this.dao.getUser( id );
			if( !user ) return {};

			const globalPosition = await this.dao.getUserRankPosition( id );
			const countryPosition = await this.dao.getUserRankPositionCountry( user.country, id );
			return {
				country: user.country,
				globalPosition,
				countryPosition
			};
		} );

		this.get( '/points/ranking', '1 minute', () => {
			return this.dao.getPointsRanking();
		} );

	}
}