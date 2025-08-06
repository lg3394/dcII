// bar_chart.js
const margin = { top: 30, right: 30, bottom: 70, left: 70 },
  width = 700 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

const svg = d3.select('#bar-chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)
  .style('position', 'absolute')
  .style('background', '#fff')
  .style('border', '1px solid #ccc')
  .style('padding', '8px')
  .style('border-radius', '4px')
  .style('pointer-events', 'none');

d3.csv('data/energy_consumption_per_task.csv').then(data => {
  data.forEach(d => { d.Average_Wh = +d.Average_Wh; });

  const x = d3.scaleBand()
    .domain(data.map(d => d.Task))
    .range([0, width])
    .padding(0.2);

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Average_Wh) * 1.1])
    .range([height, 0]);
  svg.append('g')
    .call(d3.axisLeft(y));
