const width = 900, height = 450;

const svg = d3.select('#map-chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const projection = d3.geoNaturalEarth1()
  .scale(180)
  .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute");

const colorScales = {
  PE: d3.scaleSequential().domain([9,15]).interpolator(d3.interpolateOranges),
  ADPe: d3.scaleSequential().domain([4e-8,1e-7]).interpolator(d3.interpolateReds)
};

let currentMetric = 'PE'; // 'PE' or 'ADPe'
updateButtons();

// Data mapping for your table
let countryMap = {
  "USA": "United States",
  "China": "China",
  "France": "France"
};
// Europe-wide stats can be added as an overlay/annotation if desired

Promise.all([
  d3.json('data/world_countries.json'),
  d3.csv('data/environmental_impacts_with_both_metrics.csv')
]).then(([world, regionData]) => {

  // Index CSV data by country
  let dataByCountry = {};
  regionData.forEach(d => {
    let name = countryMap[d.Area_or_Country] || d.Area_or_Country;
    dataByCountry[name] = d;
  });

  // Draw the world map
  svg.append("g")
    .selectAll("path")
    .data(world.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
      let ddata = dataByCountry[d.properties.name];
      if (!ddata) return "#cccccc";
      if (currentMetric === "PE")
        return colorScales.PE(+ddata.PE_MJ_per_kWh);
      else
        return colorScales.ADPe(+ddata.ADPe_kg_Sb_eq_per_kWh);
    })
    .attr("stroke", "#bbbbbb")
    .attr("class", "country-path")
    .on("mouseover", function(event, d) {
      let ddata = dataByCountry[d.properties.name];
      tooltip.transition().duration(150).style("opacity", 0.92);
      if (ddata) {
        tooltip.html(
          `<b>${d.properties.name}</b><br>${
            currentMetric === "PE"
            ? `Primary Energy: ${(+ddata.PE_MJ_per_kWh).toFixed(2)} MJ/kWh`
            : `Resource Depletion: ${(+ddata.ADPe_kg_Sb_eq_per_kWh).toExponential(2)} kg Sb eq/kWh`
          }`
        )
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 30) + 'px');
      } else {
        tooltip.html(`<b>${d.properties.name}</b><br>No data`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 30) + 'px');
      }
      d3.select(this).attr("stroke", "#111").attr("stroke-width", 2);
    })
    .on("mouseout", function() {
      tooltip.transition().duration(200).style("opacity", 0);
      d3.select(this).attr("stroke", "#bbb").attr("stroke-width", 1);
    });

  // Recolor map on toggle
  d3.select("#energyBtn").on("click", () => {
    currentMetric = 'PE'; updateButtons();
    svg.selectAll(".country-path")
      .transition().duration(800)
      .attr("fill", d => {
        let ddata = dataByCountry[d.properties.name];
        if (!ddata) return "#cccccc";
        return colorScales.PE(+ddata.PE_MJ_per_kWh);
      });
  });
  d3.select("#impactBtn").on("click", () => {
    currentMetric = 'ADPe'; updateButtons();
    svg.selectAll(".country-path")
      .transition().duration(800)
      .attr("fill", d => {
        let ddata = dataByCountry[d.properties.name];
        if (!ddata) return "#cccccc";
        return colorScales.ADPe(+ddata.ADPe_kg_Sb_eq_per_kWh);
      });
  });
});

// Update button styling
function updateButtons() {
  d3.select("#energyBtn").classed("active", currentMetric === 'PE');
  d3.select("#impactBtn").classed("active", currentMetric === 'ADPe');
}
