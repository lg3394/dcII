// map_chart.js - Fixed version combining best features
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
const width = 800, height = 450;
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

console.log('Creating SVG...');
const svg = d3.select('#map-chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

console.log('SVG created:', svg.node());

// Use Robinson projection like the working version
const projection = d3.geoRobinson()
  .scale(120)
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
    // Remove active class from both
    energyBtn.classList.remove('active');
    impactBtn.classList.remove('active');
    
    // Add active class to current metric button
    if (currentMetric === 'PE') {
      energyBtn.classList.add('active');
    } else {
      impactBtn.classList.add('active');
    }
  }
}

// Function to update the map colors
function updateMap(world, dataByCountry) {
  console.log('Updating map colors for metric:', currentMetric);
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

// Add legend function from working version
function addLegend(dataByCountry) {
  svg.select(".legend").remove(); // Remove existing legend
  
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(20, 20)");

  const legendData = [
    { 
      label: "Specific Country Data", 
      color: currentMetric === "PE" ? colorScales.PE(12) : colorScales.ADPe(7e-8) 
    },
    { 
      label: "Europe (EEA) Average", 
      color: d3.color(currentMetric === "PE" ? colorScales.PE(12.9) : colorScales.ADPe(6.423e-8)).brighter(0.5) 
    },
    { 
      label: "No Data Available", 
      color: "#e0e0e0" 
    }
  ];

  const legendItems = legend.selectAll(".legend-item")
    .data(legendData)
    .join("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

  legendItems.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => d.color)
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5);

  legendItems.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .style("font-size", "12px")
    .style("fill", "#333")
    .text(d => d.label);
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
    if (d.Area_or_Country === "USA") {
      dataByCountry["United States of America"] = d;
    } else if (d.Area_or_Country === "Europe (EEA)") {
      dataByCountry["Europe (EEA)"] = d;
    } else {
      dataByCountry[d.Area_or_Country] = d;
    }
    console.log(`Mapped ${d.Area_or_Country}`);
  });
  
  console.log('Final dataByCountry:', dataByCountry);

  // Check if we have the right data structure
  if (!world.features) {
    console.error('No features found in world data');
    return;
  }

  // Test a few country names from the geo data
  console.log('Sample country names from geo data:');
  world.features.slice(0, 5).forEach(d => {
    console.log(`- "${d.properties.name}"`);
  });

  // Draw countries
  console.log('Drawing countries...');
  const countries = svg.selectAll(".country")
    .data(world.features)
    .join("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", d => {
      const countryName = d.properties.name;
      
      // Specific country data (USA, China, France)
      if (dataByCountry[countryName]) {
        console.log(`Found data for ${countryName}:`, dataByCountry[countryName]);
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
      
      console.log(`No data for country: ${countryName}`);
      return "#e0e0e0";
    })
    .attr("stroke", "#333")
    .attr("stroke-width", 0.3)
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

  console.log('Countries drawn:', countries.size());

  // Add legend
  addLegend(dataByCountry);

  // Set up button event listeners
  const energyBtn = document.getElementById('energyBtn');
  const impactBtn = document.getElementById('impactBtn');
  
  if (energyBtn) {
    energyBtn.addEventListener('click', () => {
      console.log('Energy button clicked');
      currentMetric = 'PE';
      updateButtons();
      updateMap(world, dataByCountry);
      addLegend(dataByCountry);
    });
  }
  
  if (impactBtn) {
    impactBtn.addEventListener('click', () => {
      console.log('Impact button clicked');
      currentMetric = 'ADPe';
      updateButtons();
      updateMap(world, dataByCountry);
      addLegend(dataByCountry);
    });
  }
  
  // Initial button state
  updateButtons();

}).catch(error => {
  console.error('Error loading data:', error);
  console.error('Error details:', error.message, error.stack);
});
