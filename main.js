var dataset
var yearValues
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

        for (var i = 0; i < dataset.length; ++i) {
            yearData.push(new Date(dataset[i][0]));			//Convert "%Y-%m-%d" to date objects
        }
        // Call the function to draw the chart after updating the dataset variable
        drawChart();
    };

    //set width and height of SVG
    const width = 900;
    const height = 500;

    // Padding between the SVG boundary and the plot
    const padding = 50;

    function drawChart() {


        //Get the range for the X axis
        var maxYear = d3.max(yearData, (d) => d)
        var minYear = d3.min(yearData, (d) => d)
        var maxDate = new Date(maxYear);
        var minDate = new Date(minYear);

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

        svg.append("text")
            .attr("id", "title")
            .attr("x", width / 2)
            .attr("y", padding / 2)
            .attr("text-anchor", "middle")
            .text("United States GDP Over Time")

        //draw x axis
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(0, " + height + ")")
            .attr("class", "tick")
            .call(xAxis)

        //draw y axis
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", "translate(" + padding + ",0 )")
            .attr("class", "tick")
            .call(yAxis)

        var tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("display", "none")

        //Add bars for bar graph
        svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => xScale(yearData[i]))
            .attr("y", (d) => height - yScale(maxValue - d[1]))
            .attr("width", (width - padding) / dataset.length - 1)
            .attr("height", (d) => yScale(maxValue - d[1]))
            .attr("data-date", (d) => (d[0]))
            .attr("data-gdp", (d) => (d[1]))
            .on("mouseover", (d) => {
                // Update tooltip content dynamically on mouseover
                tooltip.html(`Date: ${d[0]}<br/>GDP Amount: ${d[1]}`)
                    .style("display", "block")
                    .style("left", (10) + "px")
                    .style("top", (10) + "px");
            })
            .on("mouseout", function () {
                // Hide the tooltip on mouseout
                tooltip.style("display", "none");
            })

    }



});

