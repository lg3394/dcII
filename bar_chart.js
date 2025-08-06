// bar_chart.js - Interactive Bar Chart for AI Task Energy Consumption

// Set up SVG dimensions and margins
const margin = { top: 30, right: 30, bottom: 70, left: 70 },
  width = 700 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// Append SVG object to the div
const svg = d3.select('#bar-chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Tooltip div
const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)
  .style('position', 'absolute')
  .style('background', '#fff')
  .style('border', '1px solid #ccc')
  .style('padding', '8px')
  .style('border-radius', '4px')
  .style('pointer-events', 'none');

// Load data
d3.csv('data/energy_consumption_per_task.csv').then(data => {

  // Convert Average_Wh to number
  data.forEach(d => { d.Average_Wh = +d.Average_Wh; });

  // X scale
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

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Average_Wh) * 1.1])
    .range([height, 0]);
  svg.append('g')
    .call(d3.axisLeft(y));

  // Bars
  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(d.Task))
    .attr('y', d => y(d.Average_Wh))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.Average_Wh))
    .attr('fill', '#69b3a2')
    .on('mouseover', (event, d) => {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`<strong>${d.Task}</strong><br/>Energy: ${d.Average_Wh} Wh`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', () => {
      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Y axis label
  svg.append('text')
    .attr('text-anchor', 'end')
    .attr('x', -20)
    .attr('y', -10)
    .text('Energy (Watt-hours)')
    .attr('fill', 'black');

  // Chart title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .text('Average Energy Consumption by AI Task');
});
