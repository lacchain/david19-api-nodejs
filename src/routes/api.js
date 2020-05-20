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
			return user.points;
		} );

		this.get( '/points/user/:id/ranking', '1 minute', async req => {
			const { id } = req.params;
			const user = await this.dao.getUser( id );
			if( !user ) return {};

			const globalPosition = await this.dao.getUserRankPosition( id );
			const countryPosition = await this.dao.getUserRankPositionCountry( user.country, id );
			return {
				country: user.country,
				globalPosition: globalPosition[0].position,
				countryPosition: countryPosition[0].position
			};
		} );

		this.get( '/points/ranking', '1 minute', () => {
			return this.dao.getPointsRanking();
		} );

	}
}