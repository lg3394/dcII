// map_chart.js - Fixed version keeping original working settings
const margin = { top: 0, left: 0, right: 0, bottom: 0 };
const width = 800, height = 450;  // Keep original dimensions
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const svg = d3.select('#map-chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Keep original projection that was working
const projection = d3.geoRobinson()
  .scale(140)
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

// European countries (for visual highlighting but using Europe EEA data)
const europeanCountries = [
  "Germany", "Italy", "Spain", "Poland", "Romania", "Netherlands", 
  "Belgium", "Czech Republic", "Greece", "Portugal", "Sweden", 
  "Hungary", "Austria", "Bulgaria", "Serbia", "Switzerland", 
  "Slovakia", "Denmark", "Finland", "Norway", "Ireland", "Croatia", 
  "Bosnia and Herzegovina", "Albania", "Slovenia", "Lithuania", 
  "Latvia", "Estonia", "Moldova", "North Macedonia", "Armenia", 
  "Luxembourg", "Malta", "Iceland", "Ukraine", "Belarus"
];

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
      const countryName = d.properties.name;
      
      // Check for specific country data first
      if (dataByCountry[countryName]) {
        return currentMetric === "PE"
          ? colorScales.PE(+dataByCountry[countryName].PE_MJ_per_kWh)
          : colorScales.ADPe(+dataByCountry[countryName].ADPe_kg_Sb_eq_per_kWh);
      }
      
      // European countries (lighter shade using Europe EEA data)
      if (europeanCountries.includes(countryName) && dataByCountry["Europe (EEA)"]) {
        const baseColor = currentMetric === "PE"
          ? colorScales.PE(+dataByCountry["Europe (EEA)"].PE_MJ_per_kWh)
          : colorScales.ADPe(+dataByCountry["Europe (EEA)"].ADPe_kg_Sb_eq_per_kWh);
        // Make it lighter to distinguish from specific country data
        return d3.color(baseColor).brighter(0.5);
      }
      
      // All other countries - light gray
      return "#e0e0e0";
    });
}

// No legend needed - color gradient speaks for itself

// Load data and create map
Promise.all([
  d3.json('data/world_countries.json'),
  d3.csv('data/environmental_impacts_with_both_metrics.csv')
]).then(([world, regionData]) => {
  
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

  // Fit the projection for nicely centered zoom (keep this from original)
  projection.fitSize([chartWidth, chartHeight], world);

  // Draw countries
  svg.selectAll(".country")
    .data(world.features)
    .join("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", d => {
      const countryName = d.properties.name;
      
      // Specific country data (USA, China, France)
      if (dataByCountry[countryName]) {
        return currentMetric === "PE"
          ? colorScales.PE(+dataByCountry[countryName].PE_MJ_per_kWh)
          : colorScales.ADPe(+dataByCountry[countryName].ADPe_kg_Sb_eq_per_kWh);
      }
      
      // European countries (using Europe EEA data, but lighter)
      if (europeanCountries.includes(countryName) && dataByCountry["Europe (EEA)"]) {
        const baseColor = currentMetric === "PE"
          ? colorScales.PE(+dataByCountry["Europe (EEA)"].PE_MJ_per_kWh)
          : colorScales.ADPe(+dataByCountry["Europe (EEA)"].ADPe_kg_Sb_eq_per_kWh);
        return d3.color(baseColor).brighter(0.5);
      }
      
      return "#e0e0e0";
    })
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5)
    .on("mouseover", function(event, d) {
      const countryName = d.properties.name;
      let tooltipContent = `<strong>${countryName}</strong><br>`;
      
      if (dataByCountry[countryName]) {
        // Specific country data
        tooltipContent += `Energy: ${dataByCountry[countryName].PE_MJ_per_kWh} MJ/kWh<br>
                          Impact: ${parseFloat(dataByCountry[countryName].ADPe_kg_Sb_eq_per_kWh).toExponential(2)} kg Sb eq/kWh<br>
                          <em>Specific country data</em>`;
      } else if (europeanCountries.includes(countryName) && dataByCountry["Europe (EEA)"]) {
        // European average
        tooltipContent += `Energy: ${dataByCountry["Europe (EEA)"].PE_MJ_per_kWh} MJ/kWh<br>
                          Impact: ${parseFloat(dataByCountry["Europe (EEA)"].ADPe_kg_Sb_eq_per_kWh).toExponential(2)} kg Sb eq/kWh<br>
                          <em>Europe (EEA) average</em>`;
      } else {
        tooltipContent += `<em>No data available</em>`;
      }
      
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(tooltipContent)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition().duration(250).style("opacity", 0);
    });

  // No legend needed

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
