import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-4b')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoAlbersUsa()

let path = d3.geoPath().projection(projection)

let colorScale = d3
  .scaleOrdinal()
  .domain(['OBAMA', 'ROMNEY'])
  .range(['green', 'purple'])

// let colorScale = d3.scaleOrdinal(d3.interpolatePiYG).domain(['OBAMA', 'ROMNEY'])

let opacityScale = d3
  .scaleLinear()
  .domain([0, 300000])
  .range([0, 1])

// read in the data
d3.json(require('./data/counties.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(json) {
  console.log(json.objects)
  let counties = topojson.feature(json, json.objects.elpo12p010g)

  // projection.fitSize([width, height], counties)

  svg
    .selectAll('.county')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', path)
    // .attr('stroke', 'white')
    .attr('fill', d => {
      // console.log(d)
      return colorScale(d.properties.WINNER)
    })
    .attr('opacity', d => opacityScale(d.properties.TTL_VT))
}
