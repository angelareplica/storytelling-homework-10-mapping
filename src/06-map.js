import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 300 - margin.top - margin.bottom
let width = 330 - margin.left - margin.right

let container = d3.select('#chart-6')

let projection = d3.geoAlbersUsa()

let path = d3.geoPath().projection(projection)

let colorScale = d3.scaleOrdinal(d3.schemeDark2)

let radiusScale = d3.scaleSqrt().range([0, 15])

Promise.all([
  d3.json(require('./data/us_states.topojson')),
  d3.csv(require('./data/powerplants.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  console.log(json.objects) // find out what all the layers are called
  let states = topojson.feature(json, json.objects.us_states)

  projection.fitSize([width, height], states)

  // sizing the points based on minimum and maximum output

  var outputs = datapoints.map(function(d) {
    return +d.Total_MW
  })

  var maxOutput = d3.max(outputs)
  var minOutput = d3.min(outputs)

  radiusScale.domain([minOutput, maxOutput])

  var nested = d3
    .nest()
    .key(d => d.PrimSource)
    .entries(datapoints)

  console.log('nested', nested)

  container
    .selectAll('.usMap')
    .data(nested)
    .enter()
    .append('svg')
    .attr('class', 'usMap')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    // .attr('transform', function(d) {
    //   return `translate(${xPositionScale(d.key)}, 200)`
    // })
    .each(function(d) {
      let holder = d3.select(this)

      holder
        .selectAll('.state')
        .data(states.features)
        .enter()
        .append('path')
        .attr('class', 'state')
        .attr('d', path)
        .attr('fill', 'lightgrey')

      holder
        .selectAll('.powerplant')
        .data(d.values)
        .enter()
        .append('circle')
        .attr('class', 'powerplant')
        .attr('r', d => radiusScale(d.Total_MW))
        .attr('transform', d => {
          let coords = projection([d.Longitude, d.Latitude])
          return `translate(${coords})`
        })
        .attr('fill', d => colorScale(d.PrimSource))
        .attr('opacity', 0.3)

      holder
        .append('text')
        .datum(d.key)
        .text(d => d.charAt(0).toUpperCase() + d.slice(1))
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
    })
}
