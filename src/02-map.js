import * as d3 from 'd3'
import * as topojson from 'topojson'
import { scaleBand } from 'd3-scale'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3
  .geoEqualEarth()
  .rotate([-10, 0])
  .scale(150)

let path = d3.geoPath().projection(projection)

// read in the data
Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/flights.csv')),
  d3.csv(require('./data/airport-codes-subset.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

let coordinateStore = d3.map()

function ready([json, datapointsFlights, datapointsAirports]) {

  datapointsAirports.forEach(d => {
    let name = d.name
    let coords = [d.longitude, d.latitude]
    coordinateStore.set(name, coords)
  })

  // console.log(json.objects)
  let countries = topojson.feature(json, json.objects.countries)

  // making the world map visible
  svg
    .selectAll('.country')
    .data(countries.features) // always going to be .features when you bind data. that's the list of objects you can draw inside of a geojson
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', 'lightgrey')
    .attr('stroke', 'black')
    .attr('stroke-width', 0.5)

  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('fill', 'lightblue')
    .attr('stroke', 'black')
    .lower()

  // adding the airport dots

  // console.log(datapointsAirports)
  svg
    .selectAll('.airports')
    .data(datapointsAirports)
    .enter()
    .append('circle')
    .attr('r', 2)
    .attr('fill', 'white')
    .attr('transform', d => {
      let coords2 = projection([d.longitude, d.latitude])
      return `translate(${coords2})`
    })

  // adding the flight paths
  let geoLine = {
    type: 'LineString',
    coordinates: [[-74, 40], coordinateStore]
  }

  svg
  .selectAll('.flightPaths')
  .data(datapointsAirports)
  .enter().append('path')
  .attr('d', d => path(geoLine))
  .attr('stroke', 'white')
  .attr('stroke-width', 1)

}
