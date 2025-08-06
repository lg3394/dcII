// map_chart.js - Interactive Map Chart for Regional Environmental Impact

const margin = { top: 20, right: 20, bottom: 50, left: 60 },
  width = 700 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;

// append svg object
const svg = d3.select('#map-chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Tooltip
const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)
  .style('position', 'absolute')
  .style('background', '#fff')
  .style('border', '1px solid #ccc')
  .style('padding', '8px')
  .style('border-radius', '4px')
  .style('pointer-events', 'none');

// Scales
const x = d3.scaleBand().range([0, width]).padding(0.2);
const y = d3.scaleLinear().range([height, 0]);

// Variable to keep track of current metric (default PE)
let currentMetric = 'PE_MJ_per_kWh';

// Load data
let dataMap;
d3.csv('data/environmental_impacts_with_both_metrics.csv').then(data => {
  dataMap = data;
  update(dataMap);

  // Button listeners
  d3.select('#showPE').on('click', () => {
    currentMetric = 'PE_MJ_per_kWh';
    update(dataMap);
  });

  d3.select('#showADPe').on('click', () => {
    currentMetric = 'ADPe_kg_Sb_eq_per_kWh';
    update(dataMap);
  });
});

// Update function
function update(data) {
  // Parse values
  data.forEach(d => {
    d[currentMetric] = +d[currentMetric];
  });

  // Set domains
  x.domain(data.map(d => d.Area_or_Country));
  y.domain([0, d3.max(data, d => d[currentMetric]) * 1.1]);

  // Remove previous elements if any
  svg.selectAll('.bar').remove();
  svg.selectAll('.x-axis').remove();
  svg.selectAll('.y-axis').remove();
  svg.selectAll('.y-label').remove();
  svg.selectAll('.title').remove();

  // X axis
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');

  // Y axis
  svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y));

  // Bars
  svg.selectAll('.bar')
    .data(data)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.Area_or_Country))
    .attr('y', d => y(d[currentMetric]))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d[currentMetric]))
    .attr('fill', currentMetric === 'PE_MJ_per_kWh' ? '#404080' : '#408040')
    .on('mouseover', (event, d) => {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`<strong>${d.Area_or_Country}</strong><br/>${currentMetric}: ${d[currentMetric]}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', () => {
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Y axis label
  svg.append('text')
    .attr('class', 'y-label')
    .attr('text-anchor', 'end')
    .attr('x', -20)
    .attr('y', -10)
    .text(currentMetric === 'PE_MJ_per_kWh' ? 'Primary Energy (MJ/kWh)' : 'Resource Depletion (kg Sb eq/kWh)')
    .attr('fill', 'black');

  // Chart title
  svg.append('text')
    .attr('class', 'title')
    .attr('x', width / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .text('Regional Environmental Impact of AI Energy Usage');
}
