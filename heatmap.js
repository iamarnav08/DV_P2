// Set the dimensions and margins of the graph
const margin = { top: 30, right: 100, bottom: 100, left: 150 },
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data
d3.csv("data.csv").then(function(data) {

    // Labels of row and columns
    const players = data.map(d => d.Player);
    const categories = data.columns.slice(1);

    // Build X scales and axis
    const x = d3.scaleBand()
        .range([0, width])
        .domain(players)
        .padding(0.1); // Add padding to avoid overlap
    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "middle")
        .each(function(d) {
            const text = d3.select(this);
            const words = d.split(" ");
            text.text("");
            for (let i = 0; i < words.length; i++) {
                text.append("tspan")
                    .attr("x", 0)
                    .attr("dy", i === 0 ? "1.2em" : "1.2em") // Adjust dy to shift text down
                    .style("font-size", "15px")
                    .text(words[i]);
            }
        });

    // Add X axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom / 1.1)
        .attr("text-anchor", "middle")
        .style("font-size", "25px") // Ensure font size is set correctly
        .text("Players");

    // Build Y scales and axis
    const y = d3.scaleBand()
        .range([height, 0])
        .domain(categories)
        .padding(0.05); // Add padding to avoid overlap
    const yAxis = svg.append("g")
        .style("font-size", "15px")
        .call(d3.axisLeft(y));
        
   

    // Add Y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left / 1.15)
        .attr("text-anchor", "middle")
        .style("font-size", "25px")
        .text("Times");

    // Build color scales for each category
    const colorScales = {};
    categories.forEach(category => {
        const values = data.map(d => +d[category]);
        colorScales[category] = d3.scaleSequential(d3.interpolateRdYlGn)
            .domain([d3.max(values), d3.min(values)]);
    });

    // Create a tooltip
    const tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function(event, d) {
        tooltip.style("opacity", 1);
        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", "3px"); // Thicker border on hover
    };
    const mousemove = function(event, d) {
        tooltip
            .html(`Player: ${d.Player}<br>Category: ${d.category}<br>Value: ${d.value}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    };
    const mouseleave = function(event, d) {
        tooltip.style("opacity", 0);
        d3.select(this)
            .style("stroke", "black") // Keep border black
            .style("stroke-width", "1px"); // Revert border width
    };
    
    // Function to update the heatmap based on the selected time type
    window.updateHeatmap = function(timeType) {
        const filteredCategories = categories.filter(c => c.includes(timeType));
        y.domain(filteredCategories);
    
        svg.selectAll("rect").remove();
        svg.selectAll("g.cell").remove();
    
        const cellGroup = svg.selectAll()
            .data(data.flatMap(d => filteredCategories.map(c => ({ Player: d.Player, category: c, value: +d[c] }))))
            .enter()
            .append("g")
            .attr("class", "cell")
            .attr("transform", d => `translate(${x(d.Player)}, ${y(d.category)})`);
    
        const mainRect = cellGroup.append("rect")
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .attr("rx", 5) // Rounded corners
            .attr("ry", 5) // Rounded corners
            .style("fill", d => colorScales[d.category](d.value))
            .style("stroke", "black") // Add border to each cell
            .style("stroke-width", "1px") // Border width
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    
        // const subCellSize = x.bandwidth() / 3;
    
        // cellGroup.selectAll("rect.subcell")
        //     .data(d => {
        //         const subCells = [];
        //         for (let i = 0; i < 3; i++) {
        //             for (let j = 0; j < 3; j++) {
        //                 subCells.push({ x: i * subCellSize, y: j * subCellSize });
        //             }
        //         }
        //         return subCells;
        //     })
        //     .enter()
        //     .append("rect")
        //     .attr("class", "subcell")
        //     .attr("x", d => d.x)
        //     .attr("y", d => d.y)
        //     .attr("width", subCellSize)
        //     .attr("height", subCellSize)
        //     .attr("rx", 4) // Rounded corners for subcells
        //     .attr("ry", 4) // Rounded corners for subcells
        //     .style("fill", "none")
        //     .style("stroke", "black")
        //     .style("stroke-width", "0.5px");
        
    
        yAxis.call(d3.axisLeft(y));
    }

    // Initial display
    updateHeatmap("single");
});