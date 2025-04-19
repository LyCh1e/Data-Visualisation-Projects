// Fetch the data
fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(response => response.json())
  .then(data => {
    const baseTemperature = data.baseTemperature;
    const monthlyData = data.monthlyVariance;
    
    // Extract years and months for scales
    const years = [...new Set(monthlyData.map(d => d.year))];
    const months = [...Array(12).keys()];
    
    // Define dimensions
    const margin = { top: 30, right: 40, bottom: 110, left: 90 };
    const width = 1100 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Calculate cell dimensions
    const cellWidth = width / (years.length);
    const cellHeight = height / months.length;
    
    // Create SVG element
    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, width]);
    
    const yScale = d3.scaleBand()
      .domain(months)
      .range([0, height]);
    
    // Create color scale for temperature variance
    const minVariance = d3.min(monthlyData, d => d.variance);
    const maxVariance = d3.max(monthlyData, d => d.variance);
    
    const colorScale = d3.scaleQuantize()
      .domain([minVariance + baseTemperature, maxVariance + baseTemperature])
      .range([
        '#313695', // deep blue (coldest)
        '#4575b4',
        '#74add1',
        '#abd9e9',
        '#e0f3f8',
        '#ffffbf', // neutral
        '#fee090',
        '#fdae61',
        '#f46d43',
        '#d73027',
        '#a50026'  // deep red (hottest)
      ]);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter(year => year % 10 === 0))
      .tickFormat(d3.format('d'));
    
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(month => {
        const date = new Date(0);
        date.setUTCMonth(month);
        return d3.timeFormat('%B')(date);
      });
    
    // Add x-axis
    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle');
    
    // Add y-axis
    svg.append('g')
      .attr('id', 'y-axis')
      .call(yAxis);
    
    // Add x-axis label
    svg.append('text')
      .attr('class', 'axis-label')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom / 1.5)
      .style('text-anchor', 'middle')
      .text('Year');
    
    // Add y-axis label
    svg.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left / 1.5)
      .style('text-anchor', 'middle')
      .text('Month');
    
    // Create tooltip
    const tooltip = d3.select('#tooltip');
    
    // Format temperature
    const formatTemp = d3.format('.1f');
    
    // Add cells
    svg.selectAll('.cell')
      .data(monthlyData)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(d.month - 1))
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => baseTemperature + d.variance)
      .style('fill', d => colorScale(baseTemperature + d.variance))
      .on('mouseover', function(event, d) {
        const temp = baseTemperature + d.variance;
        const date = new Date(0);
        date.setUTCMonth(d.month - 1);
        const month = d3.timeFormat('%B')(date);
        
        // Show tooltip
        tooltip.style('opacity', 1)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 25) + 'px')
          .attr('data-year', d.year)
          .html(`
            <strong>${d.year} - ${month}</strong><br>
            Temperature: ${formatTemp(temp)}°C<br>
            Variance: ${formatTemp(d.variance)}°C
          `);
      })
      .on('mouseout', function() {
        // Hide tooltip
        tooltip.style('opacity', 0);
      });
    
    // Create legend
    const legendWidth = 400;
    const legendHeight = 30;
    const legendColorScale = colorScale.range();
    const temperatureRange = colorScale.domain();
    const legendThreshold = d3.scaleThreshold()
      .domain(d3.range(temperatureRange[0], temperatureRange[1], 
                      (temperatureRange[1] - temperatureRange[0]) / legendColorScale.length))
      .range(legendColorScale);
    
    const legendX = d3.scaleLinear()
      .domain([temperatureRange[0], temperatureRange[1]])
      .range([0, legendWidth]);
    
    const legendXAxis = d3.axisBottom(legendX)
      .tickFormat(d3.format('.1f'))
      .tickValues(legendThreshold.domain())
      .tickSize(13);
    
    // Add legend SVG
    const legend = d3.select('#legend')
      .append('svg')
      .attr('width', legendWidth + 60)
      .attr('height', legendHeight + 30)
      .append('g')
      .attr('transform', 'translate(30, 0)')
      .attr('id', 'legend');
    
    // Add legend rectangles
    legend.selectAll('rect')
      .data(legendThreshold.range())
      .enter()
      .append('rect')
      .attr('x', (d, i) => legendX(legendThreshold.domain()[i]))
      .attr('y', 0)
      .attr('width', (d, i) => {
        if (i < legendThreshold.domain().length) {
          return legendX(legendThreshold.domain()[i+1]) - legendX(legendThreshold.domain()[i]);
        } else {
          return legendWidth - legendX(legendThreshold.domain()[i]);
        }
      })
      .attr('height', legendHeight)
      .style('fill', d => d);
    
    // Add legend axis
    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendXAxis)
      .selectAll('text')
      .attr('y', 10)
      .style('text-anchor', 'middle');
    
    // Add legend title
    legend.append('text')
      .attr('class', 'legend-label')
      .attr('x', legendWidth / 2)
      .attr('y', legendHeight + 25)
      .style('text-anchor', 'middle')
      .text('Temperature (°C)');
  })
  .catch(error => console.error('Error fetching or processing data:', error));