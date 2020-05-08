import request from "request";
import csv from "csv-parser";
import MongoDAO from "./dao.js";

const dao = new MongoDAO();

const date = moment().format( 'MM-DD-YYYY' )
request( `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/${date}.csv` )
	.pipe( csv() )
	.on( 'data', async( row ) => {
		const uid = row.UID;
		const keys = Object.keys( row );
		const dates = keys.filter( key => !isNaN( key.charAt( 0 ) ) );
		const current = await dao.getByUID( uid, 'stat' )

		if( !current )
			return dao.insert( {
				uid,
				country: row.iso3,
				state: row.Province_State,
				region: row.Admin2,
				lat: row.Lat,
				lon: row.Long_,
				confirmed: row[keys[keys.length - 1]]
			}, 'stat' );

		current.confirmed = row[keys[keys.length - 1]]
		current.save();
	} )
	.on( 'end', () => {
		console.log( 'CSV file successfully processed' );
	} );