// InfluxDB Client Object
import {
	InfluxDB
} from 'https://unpkg.com/@influxdata/influxdb-client/dist/index.browser.mjs'
const token = 'YOUR TOKEN'
const org = 'TestOrg'
const bucket = 'TestBucket'
const client = new InfluxDB({
	url: 'http://localhost:8086',
	token: token
})
const queryApi = client.getQueryApi(org)


// Query Data From InfluxDB for single stock
const query = stock => `from(bucket:"Stocks") |> range(start: 0) |> filter(fn: (r) => r._field == "High")|> filter(fn: (r) => r.stock == "${stock}")`
const dates = []
const high_vals = []
const observer = {
	next(row, tableMeta) {
		const r = tableMeta.toObject(row)
		const date = new Date(r['_time']).toLocaleDateString()
		dates.push(date)
		const value = r['_value']
		high_vals.push(value)
	},
	error(error) {
		console.error(error)
		console.log('\nFinished ERROR')
	},
	complete() {
		// Line Chart
		const data = {
			labels: dates,
			datasets: [{
				label: 'Stock High',
				backgroundColor: 'rgb(255, 99, 132)',
				borderColor: 'rgb(255, 99, 132)',
				data: high_vals
			}]
		}
		const config_line = {
			type: 'line',
			data: data,
			options: {
				responsive: false
			}
		};
		const myLineChart = new Chart(document.getElementById('lineChart'), config_line);
	}
}
queryApi.queryRows(query('AAPL'), observer)


// Query High Values for AAPL and MSFT from 3rd Jan,2021 to 31st Jan,2021
const query_open = 'from(bucket:"Stocks") |> range(start: 2021-01-03, stop: 2021-01-31) |> filter(fn: (r) => r._field == "Open") |> sort(columns: ["_time"])'
const dates_open = []
const aapl_open = []
const msft_open = []
const observer_2 = {
	next(row, tableMeta) {
		const r = tableMeta.toObject(row)
		const date = new Date(r['_time']).toLocaleDateString()
		if (!dates_open.includes(date))
			dates_open.push(date)
		const value = r['_value']
		if (r['stock'] == 'AAPL') 
			aapl_open.push(value)
		else 
			msft_open.push(value)
	},
	error(error) {
		console.error(error)
		console.log('\nFinished ERROR')
	},
	complete() {
		// Line Chart
		const data = {
			labels: dates_open,
			datasets: [
				{
					label: 'AAPL',
					backgroundColor: 'rgb(255, 99, 132)',
					borderColor: 'rgb(255, 99, 132)',
					data: aapl_open
				},
				{
					label: 'MSFT',
					backgroundColor: 'rgb(0, 0, 255)',
					borderColor: 'rgb(0, 0, 255)',
					data: msft_open
				}
		]
		}
		const config_line = {
			type: 'bar',
			data: data,
			options: {
				responsive: false
			}
		};
		const myBarChart = new Chart(document.getElementById('barChart'), config_line);
	}
}
queryApi.queryRows(query_open,observer_2)


// Query High Values and the Relative Percentage increase of High as compared to the Open Value
const query_high_open = 'from(bucket: "Stocks") |> range(start: 2021-01-03, stop:2021-01-31)|> filter(fn: (r) => r._field == "High" or r._field == "Open")|> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value") |> map(fn: (r) => ({ r with "Percentage": 100.0*(r.High- r.Open)/r.Open }))'
const aapl_high_open = []
let appl_count = 1
const msft_high_open = []
let msft_count = 1
const observer_3 = {
	next(row, tableMeta) {
		const r = tableMeta.toObject(row)
		let obj = {
			y: r['High'],
			r: 2*r['Percentage']
		}
		if (r['stock'] == 'AAPL') {
			obj['x'] = appl_count
			aapl_high_open.push(obj)
			appl_count+=1
		}
		else {
			obj['x'] = msft_count
			msft_high_open.push(obj)
			msft_count+=1
		}
			
	},
	error(error) {
		console.error(error)
		console.log('\nFinished ERROR')
	},
	complete() {
		// Line Chart
		console.log(msft_high_open)
		const data = {
			datasets: [
				{
					label: 'AAPL',
					backgroundColor: 'rgb(255, 99, 132)',
					data: aapl_high_open
				},
				{
					label: 'MSFT',
					backgroundColor: 'rgb(0, 0, 255)',
					data: msft_high_open
				}
			]
		}
		const config_bubble = {
			type: 'bubble',
			data: data,
			options: {
				responsive: false
			}
		};
		const myBarChart = new Chart(document.getElementById('bubbleChart'), config_bubble);
	}
}
queryApi.queryRows(query_high_open,observer_3)