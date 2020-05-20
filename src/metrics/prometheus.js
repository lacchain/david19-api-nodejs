import os from "os";
import Exporter from "@opentelemetry/exporter-prometheus";
import Metrics from "@opentelemetry/metrics";

export default class Prometheus {

	constructor( name, port ) {
		const hostname = os.hostname();
		const exporter = new Exporter.PrometheusExporter( {
			startServer: true,
			port: port
		}, () => {
			console.log( "Prometheus scrape endpoint: http://0.0.0.0:"
				+ port
				+ "/metrics" );
		} );
		this.meter = new Metrics.MeterProvider( {
			exporter,
			interval: 1000
		} ).getMeter( name );
		this.labels = { hostname };
	}
}