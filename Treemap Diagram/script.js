// Data URL
const MOVIE_DATA_URL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

// Main visualization dimensions
const width = document.getElementById('treemap-container').clientWidth;
const height = 600;

// Create SVG for the treemap
const svg = d3.select('#treemap-container')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Create tooltip element
const tooltip = d3.select('#tooltip');

// Load and process data
d3.json(MOVIE_DATA_URL).then(data => {
  // Color scale for different categories
  const categoryColorScale = d3.scaleOrdinal()
    .domain([
      'Action', 'Drama', 'Adventure', 'Family', 'Animation', 
      'Comedy', 'Biography'
    ])
    .range([
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', 
      '#8c564b', '#e377c2'
    ]);
  
  // Create treemap layout
  const treemap = d3.treemap()
    .size([width, height])
    .paddingInner(1);
  
  // Prepare hierarchical data
  const root = d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);
  
  // Generate treemap layout
  treemap(root);
  
  // Create tree nodes
  const cell = svg.selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x0},${d.y0})`);
  
  // Add rectangles to each node
  cell.append('rect')
    .attr('class', 'tile')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value)
    .attr('fill', d => categoryColorScale(d.data.category))
    .on('mousemove', (event, d) => {
      const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(d.data.value);
      
      tooltip.style('opacity', 0.9)
        .attr('data-value', d.data.value)
        .html(`
          <strong>${d.data.name}</strong><br>
          Category: ${d.data.category}<br>
          Value: ${formattedValue}
        `)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });
  
  // Add text labels to tiles
  cell.append('text')
    .attr('class', 'tile-text')
    .selectAll('tspan')
    .data(d => {
      // Split movie name into words for better text wrapping
      const words = d.data.name.split(/(?=[A-Z][^A-Z])/g);
      return words.slice(0, 3); // Limit to 3 lines of text
    })
    .enter()
    .append('tspan')
    .attr('x', 4)
    .attr('y', (d, i) => 13 + i * 10)
    .text(d => d);
  
  // Create legend
  const legend = d3.select('#legend');
  const categories = categoryColorScale.domain();
  const LEGEND_RECT_SIZE = 15;
  const LEGEND_SPACING = 120;
  
  const legendItems = legend.selectAll('.legend-item-container')
    .data(categories)
    .enter()
    .append('div')
    .style('display', 'inline-flex')
    .style('align-items', 'center')
    .style('margin-right', '20px');
  
  legendItems.append('svg')
    .attr('width', LEGEND_RECT_SIZE + 2) // +2 for stroke
    .attr('height', LEGEND_RECT_SIZE + 2) // +2 for stroke
    .append('rect')
    .attr('class', 'legend-item')
    .attr('width', LEGEND_RECT_SIZE)
    .attr('height', LEGEND_RECT_SIZE)
    .attr('x', 1) // For stroke centering
    .attr('y', 1) // For stroke centering
    .attr('fill', d => categoryColorScale(d));
  
  legendItems.append('span')
    .style('margin-left', '5px')
    .text(d => d);
  
}).catch(error => {
  console.error('Error loading data:', error);
  document.getElementById('treemap-container').innerHTML = `
    <p style="color: red; text-align: center; padding: 2rem;">
      Error loading data. Please try again later.
    </p>
  `;
});

// Handle window resize
window.addEventListener('resize', () => {
  if (window.innerWidth !== width) {
    location.reload();
  }
});
