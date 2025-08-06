// map_chart.js

const margin = { top: 0, left: 0, right: 0, bottom: 0 };
const width = 900, height = 450;
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const svg = d3.select('#map-chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const projection = d3.geoNaturalEarth1()
  .scale(180)
  .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Tooltip div (HTML overlay)
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("background", "#fff")
  .style("border", "1px solid #ccc")
  .style("padding", "10px")
  .style("border-radius", "5px")
  .style("font-size", "14px")
  .style("z-index", 10);

const colorScales = {
  PE: d3.scaleSequential().domain([9, 15]).interpolator(d3.interpolateOranges),
  ADPe: d3.scaleSequential().domain([4e-8, 1e-7]).interpolator(d3.interpolateReds)
};

let currentMetric = 'PE'; // 'PE' or 'ADPe'
updateButtons();

const countryMap = {
  "USA": "United States",
  "China": "China",
  "France": "France"
  // More mappings if needed
};
// Europe/EU can be handled with a centroid label/annotation due to its regional nature

Promise.all([
  d3.json('data/world_countries.json'),
  d3.csv('data/environmental_impacts_with_both_metrics.csv')
]).then(([world, regionData]) => {
  let dataByCountry = {};
  regionData.forEach(d => {
    let name = countryMap[d.Area_or_Country] || d.Area_or_Country;
    dataByCountry[name] = d;
  });

  // Fit the projection for nicely centered zoom
  projection.fitSize([chartWidth, chartHeight], world);

  // Draw countries
  svg.selectAll(".country")
    .data(world.features)
    .join("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", d => {
      let ddata = dataByCountry[d.properties.name];
      if (!ddata) return "#cccccc";
      return currentMetric === "PE"
        ? colorScales.PE(+ddata.PE_MJ_per_kWh)
        : colorScales.ADPe(+ddata.ADPe_kg_Sb_eq_per_kWh);
