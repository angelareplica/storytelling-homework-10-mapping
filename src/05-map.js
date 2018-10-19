import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 150, right: 0, bottom: 0 }

let height = 600 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoAlbersUsa()

let path = d3.geoPath().projection(projection)

let colorScale = d3.scaleOrdinal(d3.schemeDark2)

let radiusScale = d3.scaleSqrt().range([1, 20])

var yPositionScale = d3.scaleBand().range([450, 150])

// read in the data
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

  // making a list of powerplant types for the legend

  let powerplants = datapoints.map(d => d.PrimSource)

  let powerplantCategories = d3.set(powerplants).values()
  yPositionScale.domain(powerplantCategories)

  svg
    .selectAll('.state')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('fill', 'lightgrey')

  svg
    .selectAll('.powerplant')
    .data(datapoints)
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

  // console.log('states', states)
  // console.log('datspoints', datapoints)

  svg
    .selectAll('.state-label')
    .data(states.features)
    .enter()
    .append('text')
    .attr('class', 'state-label')
    .text(d => d.properties.abbrev)
    .attr('transform', d => {
      let coords = projection(d3.geoCentroid(d))
      return `translate(${coords})`
    })
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('font-size', 15)
    .style(
      'text-shadow',
      '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff'
    )

  svg
    .selectAll('.legend-circles')
    .data(powerplantCategories)
    .enter()
    .append('circle')
    .attr('class', 'legend-circles')
    .attr('cx', -120)
    .attr('cy', d => yPositionScale(d))
    .attr('r', 10)
    .attr('fill', d => colorScale(d))
    .attr('opacity', 0.8)

  svg
    .selectAll('.legend-text')
    .data(powerplantCategories)
    .enter()
    .append('text')
    .attr('class', 'legend-text')
    .attr('x', -100)
    .attr('y', d => yPositionScale(d))
    .text(d => d.charAt(0).toUpperCase() + d.slice(1))
    .attr('alignment-baseline', 'middle')
}
