// map_chart.js - Improved styling and layout
console.log('map_chart.js is loading...');

const containerWidth = Math.min(800, window.innerWidth - 100); // Responsive width
const containerHeight = Math.min(500, window.innerHeight * 0.7); // Responsive height
const margin = { top: 60, left: 20, right: 20, bottom: 40 };
const width = containerWidth;
const height = containerHeight;
const mapWidth = width - margin.left - margin.right;
const mapHeight = height - margin.top - margin.bottom;

// Create main container
const container = d3.select('#map-chart')
  .style('position', 'relative')
  .style('width', width + 'px')
  .style('height', height + 'px')
  .style('margin', '0 auto');

// Create button container at the top
const buttonContainer = container
  .append('div')
  .style('position', 'absolute')
  .style('top', '10px')
  .style('left', '50%')
  .style('transform', 'translateX(-50%)')
  .style('z-index', '10')
  .style('display', 'flex')
  .style('gap', '8px');

// Style the buttons
const energyBtn = buttonContainer
  .append('button')
  .attr('id', 'energyBtn')
  .style('padding', '8px 16px')
  .style('border', '2px solid #2563eb')
  .style('border-radius', '6px')
  .style('background', '#2563eb')
  .style('color', 'white')
  .style('font-size', '14px')
  .style('font-weight', '500')
  .style('cursor', 'pointer')
  .style('transition', 'all 0.2s ease')
  .text('Energy Consumption');

const impactBtn = buttonContainer
  .append('button')
  .attr('id', 'impactBtn')
  .style('padding', '8px 16px')
  .style('border', '2px solid #2563eb')
  .style('border-radius', '6px')
  .style('background', 'white')
  .style('color', '#2563eb')
  .style('font-size', '14px')
  .style('font-weight', '500')
  .style('cursor', 'pointer')
  .style('transition', 'all 0.2s ease')
  .text('Environmental Impact');

// Add hover effects
[energyBtn, impactBtn].forEach(btn => {
  btn.on('mouseenter', function() {
    d3.select(this).style('transform', 'translateY(-1px)').style('box-shadow', '0 4px 8px rgba(0,0,0,0.1)');
  })
  .on('mouseleave', function() {
    d3.select(this).style('transform', 'translateY(0)').style('box-shadow', 'none');
  });
});

// Create SVG
const svg = container
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('position', 'absolute')
  .style('top', '0')
  .style('left', '0');

// Create map group
const mapGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Better projection for cleaner world view
const projection = d3.geoRobinson()
  .scale(120)
  .translate([mapWidth / 2, mapHeight / 2]);

const path = d3.geoPath().projection(projection);

// Enhanced tooltip
const tooltip = d3.select("body")
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

// Color scales with better ranges
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
const countryMap = {
  "USA": "United States of America",
  "China": "China", 
  "France": "France"
};

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
  energyBtn
    .style('background', currentMetric === 'PE' ? '#2563eb' : 'white')
    .style('color', currentMetric === 'PE' ? 'white' : '#2563eb');
  
  impactBtn
    .style('background', currentMetric === 'ADPe' ? '#2563eb' : 'white')
    .style('color', currentMetric === 'ADPe' ? 'white' : '#2563eb');
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

  // Add title
  addTitle();

  // Draw countries
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
      
      // Highlight country
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
      
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(tooltipContent)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);
      
      tooltip.transition().duration(300).style("opacity", 0);
    });

  // Add legend
  updateLegend(dataByCountry);

  // Button event listeners
  energyBtn.on('click', () => {
    currentMetric = 'PE';
    updateButtons();
    updateMap(world, dataByCountry);
  });
  
  impactBtn.on('click', () => {
    currentMetric = 'ADPe';
    updateButtons();
    updateMap(world, dataByCountry);
  });
  
  updateButtons();

}).catch(error => {
  console.error('Error loading data:', error);
});
