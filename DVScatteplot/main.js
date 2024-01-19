var dataset
var yearData = []

document.addEventListener('DOMContentLoaded', function () {
    //open new XMLHttp Request for the data
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
    const yPadding = 20
    const yearOffset = 1
    const timeOffset = 30 * 1000 //30 seconds converted to milliseconds.

    // Padding between the SVG boundary and the plot
    const svgPadding = 50;
    const timeFormat = d3.timeFormat('%M:%S')

    function drawChart() {

        //create the SVG
        var svg = d3.select("body")
            .append("svg")
            .attr("width", width + 100)
            .attr("height", height + 100)

        // var tooltip = d3.select("body")
        //     .append("div")
        //     .attr("id", "tooltip")
        //     .style("position", "absolute")
        //     .style("opacity", 0)
        //     .style("left", 0)
        //     .style("top", 0)


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

        //set xScale with scaleLinear
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
            .attr("cy", (d) => yScale(d.parsedTime))
            .attr("r", 6)
    }
});



