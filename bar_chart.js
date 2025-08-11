;(function () {
  d3.csv("data/energy_consumption_per_task.csv")
    .then(visualizeData)
    .catch(function (error) {
      console.log("Failed with", error)
    })
  
  const width = 820  // Same as original
  const height = 450  // Same as original
  const margin = { top: 40, right: 40, bottom: 110, left: 70 }  // Just slightly more bottom margin
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom
  
  // Task name mapping and descriptions
  const taskInfo = {
    "Image Generation": {
      shortName: "Image Gen",
      description: "Creating new images from text prompts using specific image-generation AI models like DALL-E or Stable Diffusion"
    },
    "Text Generation": {
      shortName: "Text Gen", 
      description: "Generating written content like articles, stories, or code using language models like ChatGPT or Claude"
    },
    "Question Answering": {
      shortName: "Q&A",
      description: "Providing accurate answers to questions based on context or knowledge"
    },
    "Automatic Speech Recognition": {
      shortName: "Speech-to-Text",
      description: "Converting spoken audio into written text transcription using models like Whisper (OpenAI), Google Speech-to-Text"
    },
    "Summarization": {
      shortName: "Summarization",
      description: "Creating concise summaries of longer documents or articles"
    },
    "Text Classification": {
      shortName: "Text Class",
      description: "Categorizing text into predefined groups like spam detection or sentiment analysis"
    },
    "Object Detection": {
      shortName: "Object Detect",
      description: "Identifying and locating objects within images or video frames"
    },
    "Sentence Similarity": {
      shortName: "Similarity",
      description: "Measuring how similar two pieces of text are in meaning"
    },
    "Image Classification": {
      shortName: "Image Class",
      description: "Categorizing images into predefined classes like animals, objects, or scenes"
    }
  }
  
  function visualizeData(data) {
    // DATA FORMATTING
    data.forEach(d => {
      d.Average_Wh = +d.Average_Wh
      d.shortName = taskInfo[d.Task]?.shortName || d.Task
      d.description = taskInfo[d.Task]?.description || "AI task description"
    })
    data.sort((a, b) => b.Average_Wh - a.Average_Wh)
    
    // CHART
    // Create SVG
    const svg = d3
      .select("#bar-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
    
    // Create color scale for value-based gradient
    const maxValue = d3.max(data, d => d.Average_Wh)
    const minValue = d3.min(data, d => d.Average_Wh)
    
    const colorScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range(["#ffcc99", "#ff5500"])  // Light orange to dark orange
    
    // Remove hover color scale - keeping original colors
    
    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.shortName))
      .range([0, chartWidth])
      .padding(0.25)  // Much more padding to make bars narrower and fit all labels
    
    const yMax = d3.max(data, d => d.Average_Wh)
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.15])
      .range([chartHeight, 0])
      .nice()
    
    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-45)")  // 45 degree rotation for better readability
      .style("font-size", "10px")  // Even smaller font to ensure all labels fit
      .style("font-weight", "500")
    
    // Y Axis
    svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(8))
      .selectAll("text")
      .style("font-size", "14px")
    
    // Y axis label
    svg
      .append("text")
      .attr("x", -chartHeight / 2)
      .attr("y", -margin.left + 17)
      .attr("transform", "rotate(-90)")
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .style("font-size", "15px")
      .text("Average Energy (Wh, per task)")
    
    // Chart title
    svg
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -12)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("Average Energy Consumption by AI Task")
    
    // Tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "6px")
      .style("font-size", "14px")
      .style("max-width", "300px")
      .style("line-height", "1.4")
      .style("pointer-events", "none")
      .style("z-index", "1000")
    
    // Bars with animation and value-based colors
    const bars = svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => xScale(d.shortName))
      .attr("width", xScale.bandwidth())
      .attr("y", chartHeight)
      .attr("height", 0)
      .attr("fill", d => colorScale(d.Average_Wh))
      .attr("stroke", d => d3.color(colorScale(d.Average_Wh)).darker(0.3))
      .attr("stroke-width", 1)
      .transition()
      .duration(900)
      .delay((d, i) => i * 100)
      .attr("y", d => yScale(d.Average_Wh))
      .attr("height", d => chartHeight - yScale(d.Average_Wh))
    
    // Interactivity (tooltips only - no color changes)
    svg
      .selectAll("rect")
      .on("mouseover", function (event, d) {
        // Keep original color, only show tooltip
        tooltip.transition().duration(200).style("opacity", 0.95)
        tooltip
          .html(
            `<strong>${d.Task}</strong><br><br>
            <em>${d.description}</em><br><br>
            <strong>Energy:</strong> ${d.Average_Wh} Wh per task`
          )
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 15) + "px")
      })
      .on("mouseout", function (d) {
        // No color change, just hide tooltip
        tooltip.transition().duration(250).style("opacity", 0)
      })
    
    // Value labels on bars
    svg
      .selectAll(".label")
      .data(data)
      .join("text")
      .attr("class", "label")
      .attr("x", d => xScale(d.shortName) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.Average_Wh) - 8)
      .attr("text-anchor", "middle")
      .text(d => d.Average_Wh)
      .style("font-size", "12px")
      .style("fill", "#333")
      .style("font-weight", "600")
  }
})()
