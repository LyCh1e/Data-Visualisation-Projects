fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then((response) => response.json())
  .then((data) => {
    const dataset = data.data;

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Parse dates and set up scales
    const parseDate = d3.timeParse("%Y-%m-%d");
    const dates = dataset.map((d) => parseDate(d[0]));

    const xScale = d3
      .scaleTime()
      .domain([d3.min(dates), d3.max(dates)])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d[1])])
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add x-axis
    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    // Add y-axis
    svg.append("g").attr("id", "y-axis").call(yAxis);

    // Add y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#555")
      .text("Gross Domestic Product (Billions of Dollars)");

    // Calculate bar width
    const barWidth = width / dataset.length;

    // Format GDP values for tooltip
    const formatGDP = d3.format("$,.1f");

    // Create tooltip
    const tooltip = d3.select("#tooltip");

    // Add bars
    svg
      .selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => xScale(parseDate(d[0])))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", barWidth - 1)
      .attr("height", (d) => height - yScale(d[1]))
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .on("mouseover", function (event, d) {
        // Format date for display
        const dateObj = parseDate(d[0]);
        const year = dateObj.getFullYear();
        const quarter = Math.floor(dateObj.getMonth() / 3) + 1;

        // Show tooltip
        tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .attr("data-date", d[0]).html(`
                <strong>${year} Q${quarter}</strong><br>
                ${formatGDP(d[1])} Billion
              `);
      })
      .on("mouseout", function () {
        // Hide tooltip
        tooltip.style("opacity", 0);
      });
  })
  .catch((error) => console.error("Error fetching or processing data:", error));