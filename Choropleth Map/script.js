// Define dimensions
const width = 960;
const height = 600;
const legendWidth = 300;
const legendHeight = 50;

// Create SVG
const svg = d3.select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Create color scale
const colorScale = d3.scaleThreshold()
  .domain([10, 20, 30, 40, 50, 60, 70])
  .range(d3.schemeBlues[8]);

// Create legend SVG
const legendSvg = d3.select("#legend")
  .append("svg")
  .attr("width", legendWidth)
  .attr("height", legendHeight);

// Create tooltip
const tooltip = d3.select("#tooltip");

// Load data
Promise.all([
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
]).then(([usData, educationData]) => {
  
  // Draw counties
  svg.append("g")
    .selectAll("path")
    .data(topojson.feature(usData, usData.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr("data-education", d => {
      const county = educationData.find(item => item.fips === d.id);
      return county ? county.bachelorsOrHigher : 0;
    })
    .attr("fill", d => {
      const county = educationData.find(item => item.fips === d.id);
      return county ? colorScale(county.bachelorsOrHigher) : colorScale(0);
    })
    .attr("d", d3.geoPath())
    .on("mouseover", (event, d) => {
      const county = educationData.find(item => item.fips === d.id);
      if (county) {
        tooltip
          .style("opacity", 0.9)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 30) + "px")
          .attr("data-education", county.bachelorsOrHigher)
          .html(`
            <strong>${county.area_name}, ${county.state}</strong><br/>
            ${county.bachelorsOrHigher}% with Bachelor's degree or higher
          `);
      }
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // Draw state borders
  svg.append("path")
    .datum(topojson.mesh(usData, usData.objects.states, (a, b) => a !== b))
    .attr("class", "states")
    .attr("d", d3.geoPath());

  // Create legend
  const legendX = d3.scaleLinear()
    .domain([0, 70])
    .range([0, legendWidth - 50]);

  const legendAxis = d3.axisBottom(legendX)
    .tickValues(colorScale.domain())
    .tickFormat(d => `${d}%`);

  legendSvg.append("g")
    .attr("transform", "translate(25, 20)")
    .call(legendAxis)
    .select(".domain")
    .remove();

  const legendColors = colorScale.range().slice(0, -1);
  const legendBoxWidth = (legendWidth - 50) / legendColors.length;

  legendSvg.selectAll("rect")
    .data(legendColors)
    .enter()
    .append("rect")
    .attr("x", (d, i) => 25 + i * legendBoxWidth)
    .attr("y", 0)
    .attr("width", legendBoxWidth)
    .attr("height", 15)
    .attr("fill", d => d);

  // Legend title
  legendSvg.append("text")
    .attr("class", "legend-label")
    .attr("x", 25)
    .attr("y", 40)
    .text("Education level (%)");
}).catch(error => {
  console.error("Error loading data:", error);
});
