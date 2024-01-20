var dataset
var yearData = []

document.addEventListener('DOMContentLoaded', function () {
    //open new XMLHttp Request for the data
    var url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
    const req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.send();
    req.onload = function () {
        const json = JSON.parse(req.responseText);
        //set dataset to json data
        dataset = json.data;

        //Convert "%Y-%m-%d" to date objects add to yearData[]
        for (var i = 0; i < dataset.length; ++i) {
            yearData.push(new Date(dataset[i][0]));
        }

        //draw chart after updating the dataset variable
        drawChart();
    };

    //set width and height of SVG
    const width = 1250;
    const height = 600;

    //add xPadding for style
    const xPadding = 70

    // Padding between the SVG boundary and the plot
    const padding = 50;

    //space between each bar -> higher for less space
    const barGap = 125;

    function drawChart() {

        //Get the range for the X axis (years)
        var maxYear = d3.max(yearData, (d) => d)
        var minYear = d3.min(yearData, (d) => d)
        var maxDate = new Date(maxYear);

        //added to extend the x axis by 2 months so final value would fit
        maxDate = d3.timeMonth.offset(maxDate, 2)

        var minDate = new Date(minYear);

        //added to extend the x axis by 3 months so first value would fit
        minDate = d3.timeMonth.offset(minDate, -3)

        //Get the range for the Y axis
        var maxValue = Math.ceil(d3.max(dataset, (d) => d[1]) / 1000) * 1000;

        console.log("Max Year:", maxYear, "\nMax Value", maxValue)

        //set xScale with scaleTime
        var xScale = d3.scaleTime()
            .domain([minDate, maxDate])
            .range([padding, width - padding])

        //set xScale with scaleLinear
        var yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([height, 0])

        //define the axis
        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        //create the SVG
        var svg = d3.select("body")
            .append("svg")
            .attr("width", width + 100)
            .attr("height", height + 100)

        var tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("left", 0)
            .style("top", 0)


        //draw x axis
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(" + xPadding + "," + height + ")")
            .attr("class", "tick")
            .call(xAxis)

        //label x-axis
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2 + xPadding)
            .attr("y", height + 70)
            .text("Year");

        //draw y axis
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", "translate(" + (padding + xPadding) + ", 0)")
            .attr("class", "tick")
            .call(yAxis)

        //label y-axis
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", (-height / 2))
            .attr("y", padding - 20)
            .text("Gross Domestic Product");

        //Add bars for bar graph
        svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => xScale(yearData[i]) + (xPadding - 3)) //minus 3 to move bars back 1 quarter
            .attr("y", (d) => height - yScale(maxValue - d[1]))
            .attr("width", (width + barGap) / dataset.length - 1)
            .attr("height", 0)
            .attr("data-date", (d) => (d[0]))
            .attr("data-gdp", (d) => (d[1]))
            .on("mouseover", (d, i) => {
                // Update tooltip content dynamically on mouseover
                tooltip.html(`${yearData[i].toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}<br/>$${d[1]} Billion`)
                    .style("opacity", 1)
                if (yearData[i].getFullYear() >= '2000') {
                    tooltip.style("left", (d3.event.pageX - 180) + "px")
                        .style("top", 500 + "px")
                } else {
                    tooltip.style("left", (d3.event.pageX + 30) + "px")
                        .style("top", 500 + "px")
                }
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0)
            })
            .transition() // Apply the transition
            .duration(1000) // Set the duration of the transition in milliseconds
            .delay((d, i) => i * 10) // Add a delay for each bar to create a staggered effect
            .attr("height", (d) => yScale(maxValue - d[1]));
    }
});

