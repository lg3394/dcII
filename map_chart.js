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

const countryMap = {
  "USA": "United States",
  "China": "China", 
  "France": "France"
  // More mappings if needed
};

// Function to update button states
function updateButtons() {
  const energyBtn = document.getElementById('energyBtn');
  const impactBtn = document.getElementById('impactBtn');
  
  if (energyBtn && impactBtn) {
    energyBtn.classList.toggle('active', currentMetric === 'PE');
    impactBtn.classList.toggle('active', currentMetric === 'ADPe');
  }
}

// Function to update the map colors
function updateMap(world, dataByCountry) {
  svg.selectAll(".country")
    .attr("fill", d => {
      let ddata = dataByCountry[d.properties.name];
      if (!ddata) return "#cccccc";
      return currentMetric === "PE"
        ? colorScales.PE(+ddata.PE_MJ_per_kWh)
        : colorScales.ADPe(+ddata.ADPe_kg_Sb_eq_per_kWh);
    });
}

// Load data and create map
Promise.all([
  d3.json('data/world_countries.json'),
  d3.csv('data/environmental_impacts_with_both_metrics.csv')
]).then(([world, regionData]) => {
  console.log('Data loaded successfully:', world, regionData);
  
  let dataByCountry = {};
  regionData.forEach(d => {
    let name = countryMap[d.Area_or_Country] || d.Area_or_Country;
    dataByCountry[name] = d;
  });

  console.log('Data by country:', dataByCountry);

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
    })
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5)
    .on("mouseover", function(event, d) {
      let ddata = dataByCountry[d.properties.name];
      if (ddata) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          `<strong>${d.properties.name}</strong><br>
          Energy: ${ddata.PE_MJ_per_kWh} MJ/kWh<br>
          Impact: ${parseFloat(ddata.ADPe_kg_Sb_eq_per_kWh).toExponential(2)} kg Sb eq/kWh`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      }
    })
    .on("mouseout", function() {
      tooltip.transition().duration(250).style("opacity", 0);
    });

  // Set up button event listeners
  const energyBtn = document.getElementById('energyBtn');
  const impactBtn = document.getElementById('impactBtn');
  
  if (energyBtn) {
    energyBtn.addEventListener('click', () => {
      currentMetric = 'PE';
      updateButtons();
      updateMap(world, dataByCountry);
    });
  }
  
  if (impactBtn) {
    impactBtn.addEventListener('click', () => {
      currentMetric = 'ADPe';
      updateButtons();
      updateMap(world, dataByCountry);
    });
  }
  
  // Initial button state
  updateButtons();

}).catch(error => {
  console.error('Error loading data:', error);
});
