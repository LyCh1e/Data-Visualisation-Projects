    fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
      .then(response => response.json())
      .then(data => {

        // Set up dimensions for the chart
        const margin = { top: 20, right: 30, bottom: 80, left: 80 };
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        // Create SVG element
        const svg = d3.select('#chart')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Format the data
        data.forEach(d => {
          // Parse time string into Date object for Y axis
          const timeString = d.Time;
          const [minutes, seconds] = timeString.split(':').map(Number);
          d.TimeObject = new Date();
          d.TimeObject.setMinutes(minutes);
          d.TimeObject.setSeconds(seconds);
        });

        // Set up scales
        const xScale = d3.scaleLinear()
          .domain([d3.min(data, d => d.Year - 1), d3.max(data, d => d.Year + 1)])
          .range([0, width]);

        const yScale = d3.scaleTime()
          .domain(d3.extent(data, d => d.TimeObject))
          .range([0, height])
          .nice();

        // Set up axes
        const xAxis = d3.axisBottom(xScale)
          .tickFormat(d3.format('d'))
          .ticks(10);

        const yAxis = d3.axisLeft(yScale)
          .tickFormat(d3.timeFormat('%M:%S'));

        // Add x-axis
        svg.append('g')
          .attr('id', 'x-axis')
          .attr('transform', `translate(0, ${height})`)
          .call(xAxis);

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
          .text('Time (MM:SS)');

        // Create tooltip
        const tooltip = d3.select('#tooltip');

        // Add dots
        svg.selectAll('.dot')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('r', 8)
          .attr('cx', d => xScale(d.Year))
          .attr('cy', d => yScale(d.TimeObject))
          .attr('data-xvalue', d => d.Year)
          .attr('data-yvalue', d => d.TimeObject.toISOString())
          .style('fill', d => d.Doping ? '#e74c3c' : '#2ecc71')
          .on('mouseover', function(event, d) {
            // Show tooltip
            tooltip.style('opacity', 1)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 15) + 'px')
              .attr('data-year', d.Year)
              .html(`
                <strong>${d.Name}: ${d.Nationality}</strong><br>
                Year: ${d.Year}, Time: ${d.Time}<br>
                ${d.Doping ? `<br><em>${d.Doping}</em>` : '<br><em>No doping allegations</em>'}
              `);
          })
          .on('mouseout', function() {
            // Hide tooltip
            tooltip.style('opacity', 0);
          });

        // Add legend
        const legend = d3.select('#legend');
        
        // Legend items
        const legendData = [
          {color: '#2ecc71', text: 'No doping allegations'},
          {color: '#e74c3c', text: 'Riders with doping allegations'}
        ];
        
        legend.selectAll('.legend-item')
          .data(legendData)
          .enter()
          .append('div')
          .attr('class', 'legend-item')
          .html(d => `
            <span class="legend-color" style="background-color: ${d.color}"></span>
            <span>${d.text}</span>
          `);
      })
      .catch(error => console.error('Error fetching or processing data:', error));