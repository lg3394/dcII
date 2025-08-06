;(function () {
  d3.csv("data/energy_consumption_per_task.csv")
    .then(visualizeData)
    .catch(function (error) {
      console.log("Failed with", error)
    })

  const width = 820
  const height = 450

  const margin = { top: 40, right: 40, bottom: 100, left: 70 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  function visualizeData(data) {
    // DATA FORMATTING

    data.forEach(d => d.Average_Wh = +d.Average_Wh)
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

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.Task))
      .range([0, chartWidth])
      .padding(0.15)

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
      .attr("transform", "rotate(-40)")
      .style("font-size", "14px")

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

    // Bars with animation
    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => xScale(d.Task))
      .attr("width", xScale.bandwidth())
      .attr("y", chartHeight)
      .attr("height", 0)
      .attr("fill", "#ffa500")
      .transition()
      .duration(900)
      .delay((d, i) => i * 100)
      .attr("y", d => yScale(d.Average_Wh))
      .attr("height", d => chartHeight - yScale(d.Average_Wh))

    // Interactivity (tooltips)
    svg
      .selectAll("rect")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#f06c00")
        tooltip.transition().duration(200).style("opacity", 0.94)
        tooltip
          .html(
            `<strong>${d.Task}</strong><br>
            Energy: <b>${d.Average_Wh} Wh</b>`
          )
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px")
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "#ffa500")
        tooltip.transition().duration(250).style("opacity", 0)
      })

    svg
      .selectAll(".label")
      .data(data)
      .join("text")
      .attr("class", "label")
      .attr("x", d => xScale(d.Task) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.Average_Wh) - 8)
      .attr("text-anchor", "middle")
      .text(d => d.Average_Wh)
      .style("font-size", "13px")
      .style("fill", "#333")
  }
})()
