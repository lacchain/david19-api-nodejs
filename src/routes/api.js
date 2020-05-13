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

	}
}