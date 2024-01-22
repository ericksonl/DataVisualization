var dataset
var yearData = []

document.addEventListener('DOMContentLoaded', function () {
    //fetch request for the data
    var url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
    console.log("Retrieving data...")
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response not ok", + response)
            }
            console.log("Data retrieved")
            return response.json()
        })
        .then(data => {
            dataset = data
            console.log(dataset)

            console.log("Creating chart...")
            drawChart();
        })
        .catch(error => console.log('Error fetching data', error))

    //set width and height of SVG
    const width = 1250;
    const height = 600;

    //add xPadding for style
    const xPadding = 70
    const yPadding = 10
    const yearOffset = 1
    const timeOffset = 10 * 1000 //10 seconds converted to milliseconds.
    const legendColors = ["#41EAD4", "#F25C54"]
    const legendLabels = ["- No Doping Allegations", "- Doping Allegations"]

    const svgPadding = 50;
    const timeFormat = d3.timeFormat('%M:%S')

    function drawChart() {

        d3.select("body")
            .append("h1")
            .attr('id', 'title')
            .text(`Doping in Professional Bicycle Racing`)

        //create the SVG
        var svg = d3.select("body")
            .append("svg")
            .attr("width", width + 100)
            .attr("height", height + 100)

        //Create a tooltip section when hovering over an element
        var tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("display", "none")

        //create the legend
        var legend = svg.append("g")
            .attr("id", "legend")
            .selectAll(".legend-entry")
            .data(legendColors)
            .enter()
            .append("g")
            .attr("class", "legend-entry")
            .attr("transform", (d, i) => "translate(0, " + (i * 20) + ")")

        //add the squares
        legend.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("x", width - xPadding - 50)
            .attr("y", svgPadding - 13)
            .attr("fill", (d) => d);

        legend.append("text")
            .attr("x", width - xPadding - 30)
            .attr("y", svgPadding)
            .text((d, i) => legendLabels[i])

        //Get the range for the X axis (years)
        var maxYear = d3.max(dataset, (d) => d.Year)
        var minYear = d3.min(dataset, (d) => d.Year)
        console.log("Min Year", minYear, "\nMax Year:", maxYear)

        //Formate to date
        var maxDate = new Date(maxYear + yearOffset, 0)
        var minDate = new Date(minYear - yearOffset, 0)
        console.log("Min Date:", minDate, "\nMax Date:", maxDate)

        //parse time and create a new date
        dataset.forEach(function (d) {
            let parsedTime = d.Time.split(':');
            d.parsedTime = new Date(0, 0, 1, 0, parsedTime[0], parsedTime[1]);
        });

        //Get the range for the Y axis
        var maxTime = d3.max(dataset, (d) => d.parsedTime)
        var minTime = d3.min(dataset, (d) => d.parsedTime)

        console.log("Min Time:", minTime.getMinutes() + ":" + minTime.getSeconds(),
            "\nMax Time:", maxTime.getMinutes() + ":" + maxTime.getSeconds())


        //set xScale with scaleTime
        var xScale = d3.scaleTime()
            .domain([minDate, maxDate])
            .range([svgPadding, width - svgPadding])

        //set yScale with scaleLinear
        var yScale = d3.scaleLinear()
            .domain([maxTime, new Date(minTime.getTime() - timeOffset)])
            .range([height, 0])

        //define the axis
        var xAxis = d3.axisBottom(xScale)
        var yAxis = d3.axisLeft(yScale)
            .tickFormat(timeFormat)

        //draw x axis
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(" + xPadding + "," + (height + yPadding) + ")")
            .attr("class", "tick")
            .call(xAxis)

        //draw y axis
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", "translate(" + (svgPadding + xPadding) + ", " + yPadding + ")")
            .attr("class", "tick")
            .call(yAxis)

        //label x-axis
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2 + xPadding)
            .attr("y", height + yPadding + 70)
            .text("Year");

        //label y-axis
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", (-height / 2))
            .attr("y", svgPadding - yPadding)
            .text("Time in Minutes");

        //Add dots for scatterplot
        svg.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", (d) => xScale(new Date(d.Year, 0)) + xPadding)
            .attr("cy", (d) => yScale(d.parsedTime) + yPadding)
            .attr("r", 0)
            .attr("data-xvalue", (d) => d.Year)
            .attr("data-yvalue", (d) => d.parsedTime)
            .each(function (d) {
                if (!d.Doping) {
                    d3.select(this)
                        .style("fill", legendColors[0] + "80") //80% opacity
                        .style("stroke", legendColors[0])
                        .style("stroke-width", "2px")
                } else {
                    d3.select(this)
                        .style("fill", (legendColors[1] + "80")) //80% opacity
                        .style("stroke", legendColors[1])
                        .style("stroke-width", "2px")
                }
            })
            .on("mouseover", function (d) {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("r", 15);

                tooltip.html(`<p class="tooltipInfo">` + d.Name + " - " + d.Nationality + `<br />`
                    + "Year: " + d.Year + `<br />` +
                    "Time: " + d.Time + (d.Doping ? '<br/>' + d.Doping : '') + `</p>`)
                    .style("display", "flex")
                    .attr("data-year", d.Year)

                //create ternary operator
                //condition ? expression_if_true : expression_if_false;
                //if d.Year <= 2010, result = left of : otherwise result = right of : (-180)
                const leftOffset = d.Year <= 2010 ? 10 : -180;
                tooltip.style("left", d3.event.pageX + leftOffset + "px");

                //create ternary operator
                //condition ? expression_if_true : expression_if_false;
                //if d.Year > 39:30, result = left of : (-50), otherwise result = right of : (0)
                const topOffset = d.parsedTime > new Date(0, 0, 1, 0, 39, 30) ? -50 : 0;
                tooltip.style("top", d3.event.pageY - svgPadding + topOffset + "px");
            })
            .on("mouseout", function () {
                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("r", 6);
                tooltip.style("display", "none")
                    .style("top", 0 + "px")
                    .style("left", 0 + "px")
            })
            .transition()
            .duration(1000)
            .attr("r", 6);
    }
});
