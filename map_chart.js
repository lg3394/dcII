// map_chart.js - Debug version
console.log('map_chart.js is loading...');

// Check if D3 is available
if (typeof d3 === 'undefined') {
  console.error('D3 is not loaded!');
} else {
  console.log('D3 is available:', d3.version);
}

// Check if the target element exists
const mapContainer = document.getElementById('map-chart');
console.log('Map container element:', mapContainer);

if (!mapContainer) {
  console.error('Element with id "map-chart" not found!');
} else {
  console.log('Map container found, proceeding...');
}

const margin = { top: 0, left: 0, right: 0, bottom: 0 };
const width = 900, height = 450;
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

console.log('Creating SVG...');
const svg = d3.select('#map-chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

console.log('SVG created:', svg.node());

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
  "USA": "United States of America",
  "China": "China", 
  "France": "France"
  // More mappings if needed
};

// Function to update button states
function updateButtons() {
  const energyBtn = document.getElementById('energyBtn');
  const impactBtn = document.getElementById('impactBtn');
  
  console.log('Updating buttons - Energy:', energyBtn, 'Impact:', impactBtn);
  
  if (energyBtn && impactBtn) {
    energyBtn.classList.toggle('active', currentMetric === 'PE');
    impactBtn.classList.toggle('active', currentMetric === 'ADPe');
  }
}

// Function to update the map colors
function updateMap(world, dataByCountry) {
  console.log('Updating map colors for metric:', currentMetric);
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
console.log('Starting to load data...');

Promise.all([
  d3.json('data/world_countries.json'),
  d3.csv('data/environmental_impacts_with_both_metrics.csv')
]).then(([world, regionData]) => {
  console.log('Data loaded successfully!');
  console.log('World data:', world);
  console.log('Region data:', regionData);
  console.log('Number of countries in world data:', world.features ? world.features.length : 'No features');
  
  let dataByCountry = {};
  regionData.forEach(d => {
    let name = countryMap[d.Area_or_Country] || d.Area_or_Country;
    dataByCountry[name] = d;
    console.log(`Mapped ${d.Area_or_Country} to ${name}`);
  });

  console.log('Final dataByCountry:', dataByCountry);

  // Check if we have the topojson structure vs geojson
  let features;
  if (world.features) {
    features = world.features;
    console.log('Using GeoJSON format');
  } else if (world.objects) {
    console.log('Detected TopoJSON format - need to convert');
    // If you have topojson, you'd need to convert it
    console.error('TopoJSON detected but conversion not implemented');
    return;
  } else {
    console.error('Unknown data format:', world);
    return;
  }

  // Test a few country names from the geo data
  console.log('Sample country names from geo data:');
  features.slice(0, 5).forEach(d => {
    console.log('Country name:', d.properties.name);
  });

  // Fit the projection for nicely centered zoom
  projection.fitSize([chartWidth, chartHeight], world);

  // Draw countries
  console.log('Drawing countries...');
  const countries = svg.selectAll(".country")
    .data(features)
    .join("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", d => {
      let ddata = dataByCountry[d.properties.name];
      if (!ddata) {
        console.log(`No data for country: ${d.properties.name}`);
        return "#cccccc";
      }
      console.log(`Found data for ${d.properties.name}:`, ddata);
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

  console.log('Countries drawn:', countries.size());

  // Set up button event listeners
  const energyBtn = document.getElementById('energyBtn');
  const impactBtn = document.getElementById('impactBtn');
  
  if (energyBtn) {
    energyBtn.addEventListener('click', () => {
      console.log('Energy button clicked');
      currentMetric = 'PE';
      updateButtons();
      updateMap(world, dataByCountry);
    });
  }
  
  if (impactBtn) {
    impactBtn.addEventListener('click', () => {
      console.log('Impact button clicked');
      currentMetric = 'ADPe';
      updateButtons();
      updateMap(world, dataByCountry);
    });
  }
  
  // Initial button state
  updateButtons();

}).catch(error => {
  console.error('Error loading data:', error);
  console.error('Error details:', error.message, error.stack);
});
