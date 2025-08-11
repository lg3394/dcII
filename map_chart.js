// map_chart.js - Fixed version without duplicate buttons
console.log('map_chart.js is loading...');

const containerWidth = Math.min(800, window.innerWidth - 100);
const containerHeight = Math.min(500, window.innerHeight * 0.7);
const margin = { top: 60, left: 20, right: 20, bottom: 40 };
const width = containerWidth;
const height = containerHeight;
const mapWidth = width - margin.left - margin.right;
const mapHeight = height - margin.top - margin.bottom;

// Clear any existing content and use the existing HTML structure
const mapContainer = d3.select('#map-chart')
  .style('position', 'relative')
  .style('width', width + 'px')
  .style('height', height + 'px')
  .style('margin', '0 auto');

// Clear existing content
mapContainer.selectAll('*').remove();

// Create SVG (no separate button container - use HTML buttons)
const svg = mapContainer
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('display', 'block');

// Create map group
const mapGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Better projection
const projection = d3.geoRobinson()
  .scale(120)
  .translate([mapWidth / 2, mapHeight / 2]);

const path = d3.geoPath().projection(projection);

// Enhanced tooltip
const tooltip = d3.select("body")
  .select(".map-tooltip");

// Create tooltip if it doesn't exist
if (tooltip.empty()) {
  d3.select("body")
    .append("div")
    .attr("class", "map-tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "rgba(255, 255, 255, 0.95)")
    .style("border", "1px solid #ddd")
    .style("padding", "12px")
    .style("border-radius", "8px")
    .style("font-size", "13px")
    .style("font-family", "'Roboto', sans-serif")
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)")
    .style("z-index", "1000")
    .style("max-width", "250px");
}

const mapTooltip = d3.select(".map-tooltip");

// Color scales
const colorScales = {
  PE: d3.scaleSequential()
    .domain([9, 15])
    .interpolator(d3.interpolateYlOrRd),
  ADPe: d3.scaleSequential()
    .domain([4e-8, 1e-7])
    .interpolator(d3.interpolateReds)
};

let currentMetric = 'PE';

// Country mappings
const europeanCountries = [
  "Germany", "Italy", "Spain", "Poland", "Romania", "Netherlands", 
  "Belgium", "Czech Republic", "Greece", "Portugal", "Sweden", 
  "Hungary", "Austria", "Bulgaria", "Serbia", "Switzerland", 
  "Slovakia", "Denmark", "Finland", "Norway", "Ireland", "Croatia", 
  "Bosnia and Herzegovina", "Albania", "Slovenia", "Lithuania", 
  "Latvia", "Estonia", "Moldova", "North Macedonia", "Armenia", 
  "Luxembourg", "Malta", "Iceland", "Ukraine", "Belarus"
];

function updateButtons() {
  // Update the existing HTML buttons
  const energyBtn = document.getElementById('energyBtn');
  const impactBtn = document.getElementById('impactBtn');
  
  if (energyBtn) {
    energyBtn.className = currentMetric === 'PE' ? 'active' : '';
  }
  if (impactBtn) {
    impactBtn.className = currentMetric === 'ADPe' ? 'active' : '';
  }
}

function updateMap(world, dataByCountry) {
  mapGroup.selectAll(".country")
    .transition()
    .duration(300)
    .attr("fill", d => {
      const countryName = d.properties.name;
      
      // Specific country data
      if (dataByCountry[countryName]) {
        return currentMetric === "PE"
          ? colorScales.PE(+dataByCountry[countryName].PE_MJ_per_kWh)
          : colorScales.ADPe(+dataByCountry[countryName].ADPe_kg_Sb_eq_per_kWh);
      }
      
      // European countries
      if (europeanCountries.includes(countryName) && dataByCountry["Europe (EEA)"]) {
        const baseColor = currentMetric === "PE"
          ? colorScales.PE(+dataByCountry["Europe (EEA)"].PE_MJ_per_kWh)
          : colorScales.ADPe(+dataByCountry["Europe (EEA)"].ADPe_kg_Sb_eq_per_kWh);
        return d3.color(baseColor).brighter(0.7);
      }
      
      return "#f5f5f5";
    });
  
  updateLegend(dataByCountry);
}

function updateLegend(dataByCountry) {
  mapGroup.select(".legend").remove();
  
  const legend = mapGroup.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(20, ${mapHeight - 100})`);

  // Legend background
  legend.append("rect")
    .attr("x", -10)
    .attr("y", -10)
    .attr("width", 200)
    .attr("height", 90)
    .attr("fill", "rgba(255, 255, 255, 0.9)")
    .attr("stroke", "#ddd")
    .attr("stroke-width", 1)
    .attr("rx", 6);

  const legendData = [
    { 
      label: "Specific Data", 
      color: currentMetric === "PE" ? colorScales.PE(12) : colorScales.ADPe(7e-8),
      description: "USA, China, France"
    },
    { 
      label: "Europe (EEA) Avg", 
      color: d3.color(currentMetric === "PE" ? colorScales.PE(12.9) : colorScales.ADPe(6.423e-8)).brighter(0.7),
      description: "European countries"
    },
    { 
      label: "No Data", 
      color: "#f5f5f5",
      description: "Other countries"
    }
  ];

  const legendItems = legend.selectAll(".legend-item")
    .data(legendData)
    .join("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 22})`);

  legendItems.append("circle")
    .attr("cx", 8)
    .attr("cy", 8)
    .attr("r", 6)
    .attr("fill", d => d.color)
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5);

  legendItems.append("text")
    .attr("x", 20)
    .attr("y", 8)
    .style("font-size", "12px")
    .style("font-weight", "500")
    .style("fill", "#333")
    .style("alignment-baseline", "middle")
    .text(d => d.label);

  legendItems.append("text")
    .attr("x", 20)
    .attr("y", 20)
    .style("font-size", "10px")
    .style("fill", "#666")
    .style("alignment-baseline", "middle")
    .text(d => d.description);
}

// Add title
function addTitle() {
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "600")
    .style("fill", "#333")
    .style("font-family", "'Roboto', sans-serif")
    .text("AI Energy Impact by Region");
}

// Load data and create map
Promise.all([
  d3.json('data/world_countries.json'),
  d3.csv('data/environmental_impacts_with_both_metrics.csv')
]).then(([world, regionData]) => {
  console.log('Data loaded successfully!');
  console.log('World features:', world.features ? world.features.length : 'No features');
  console.log('Region data:', regionData);
  
  let dataByCountry = {};
  regionData.forEach(d => {
    if (d.Area_or_Country === "USA") {
      dataByCountry["United States of America"] = d;
    } else if (d.Area_or_Country === "Europe (EEA)") {
      dataByCountry["Europe (EEA)"] = d;
    } else {
      dataByCountry[d.Area_or_Country] = d;
    }
  });

  console.log('Processed data:', dataByCountry);

  // Add title
  addTitle();

  // Draw countries
  console.log('Drawing countries...');
  const countries = mapGroup.selectAll(".country")
    .data(world.features)
    .join("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", d => {
      const countryName = d.properties.name;
      
      if (dataByCountry[countryName]) {
        return currentMetric === "PE"
          ? colorScales.PE(+dataByCountry[countryName].PE_MJ_per_kWh)
          : colorScales.ADPe(+dataByCountry[countryName].ADPe_kg_Sb_eq_per_kWh);
      }
      
      if (europeanCountries.includes(countryName) && dataByCountry["Europe (EEA)"]) {
        const baseColor = currentMetric === "PE"
          ? colorScales.PE(+dataByCountry["Europe (EEA)"].PE_MJ_per_kWh)
          : colorScales.ADPe(+dataByCountry["Europe (EEA)"].ADPe_kg_Sb_eq_per_kWh);
        return d3.color(baseColor).brighter(0.7);
      }
      
      return "#f5f5f5";
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      const countryName = d.properties.name;
      
      d3.select(this)
        .attr("stroke", "#333")
        .attr("stroke-width", 1.5);
      
      let tooltipContent = `<div style="font-weight: 600; margin-bottom: 6px; color: #333;">${countryName}</div>`;
      
      if (dataByCountry[countryName]) {
        const data = dataByCountry[countryName];
        tooltipContent += `
          <div style="margin-bottom: 4px;">
            <span style="color: #666;">Energy:</span> <strong>${data.PE_MJ_per_kWh} MJ/kWh</strong>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #666;">Impact:</span> <strong>${parseFloat(data.ADPe_kg_Sb_eq_per_kWh).toExponential(2)} kg Sb eq/kWh</strong>
          </div>
          <div style="color: #2563eb; font-size: 11px; font-style: italic;">Specific country data</div>`;
      } else if (europeanCountries.includes(countryName) && dataByCountry["Europe (EEA)"]) {
        const data = dataByCountry["Europe (EEA)"];
        tooltipContent += `
          <div style="margin-bottom: 4px;">
            <span style="color: #666;">Energy:</span> <strong>${data.PE_MJ_per_kWh} MJ/kWh</strong>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #666;">Impact:</span> <strong>${parseFloat(data.ADPe_kg_Sb_eq_per_kWh).toExponential(2)} kg Sb eq/kWh</strong>
          </div>
          <div style="color: #2563eb; font-size: 11px; font-style: italic;">Europe (EEA) average</div>`;
      } else {
        tooltipContent += `<div style="color: #999; font-style: italic;">No specific data available</div>`;
      }
      
      mapTooltip.transition().duration(200).style("opacity", 1);
      mapTooltip.html(tooltipContent)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mousemove", function(event) {
      mapTooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);
      
      mapTooltip.transition().duration(300).style("opacity", 0);
    });

  console.log('Countries drawn:', countries.size());

  // Add legend
  updateLegend(dataByCountry);

  // Set up event listeners for existing HTML buttons
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
  
  updateButtons();

}).catch(error => {
  console.error('Error loading data:', error);
  console.error('Error details:', error.message);
});
