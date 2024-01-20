var dataset
var baseTemp
var dateData = []

document.addEventListener('DOMContentLoaded', function () {
    //open new XMLHttp Request for the data
    var url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
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
            baseTemp = data.baseTemperature
            console.log(dataset)

            console.log("Creating chart...")
            drawChart();
        })
        .catch(error => console.log('Error fetching data', error))

    //set width and height of SVG
    const width = 1600;
    const height = 700;

    //add xPadding for style
    const xPadding = 100
    const yPadding = 5
    const svgPadding = 20;
    const legendPadding = 100
    const legendTicks = [0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5]
    const legendColors = ["#0001B2", "#2F43FF", "#6373FF", "#8F9CFF", "#CDDBFF", "#FFF2CE", "#FD9415", "#E23201", "#D00800", "#9E0007"]

    function drawChart() {

        d3.select("body")
            .append("h3")
            .text(`1753 - 2015: base temperature ${baseTemp}℃`)

        //create the SVG
        var svg = d3.select("body")
            .append("svg")
            .attr("width", width + legendPadding)
            .attr("height", height + legendPadding)

        //Create a tooltip section when hovering over an element
        var tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("display", "none")

        // Create the legend
        var legendGroup = svg.append("g")
            .attr("id", "legend")
            .selectAll(".legend-entry")
            .data(legendColors)
            .enter()
            .append("g")
            .attr("class", "legend-entry")
            .attr("transform", (color, i) => "translate(" + ((i * 30) - width + 150) + "," + height + ")"); // 50 move on x-axis, height to move on y-axis

        // Add the squares
        legendGroup.append("rect")
            .attr("width", 30)
            .attr("height", 30)
            .attr("x", width - 60)
            .attr("y", yPadding)
            .attr("fill", (color) => color);

        //Find max and min for legend-axis range
        var maxVariance = d3.max(dataset.monthlyVariance, (d) => d.variance)
        var minVariance = d3.min(dataset.monthlyVariance, (d) => d.variance)
        console.log("Max Variance: ", maxVariance, "\nMin Variance: ", minVariance)

        var legendScale = d3.scaleLinear()
            .domain([-1.5, 15])
            .range([svgPadding, (30 * 10) + 50]);

        var legendAxis = d3.axisBottom(legendScale);

        legendAxis.tickValues(legendTicks)
            .tickFormat(d3.format(".1f"));

        svg.append("g")
            .attr("id", "legend-axis")
            .attr("transform", "translate(" + 70 + "," + (height + yPadding + svgPadding + 10) + ")")
            .attr("class", "tick")
            .call(legendAxis);


        //create a new Date with each year and month
        //While we're here, add a new overall temp data point
        dataset.monthlyVariance.forEach(element => {
            dateData.push(new Date(element.year, element.month - 1, 1))
            temp = element.variance + baseTemp
            element.temp = Math.round(temp * 10) / 10
        })

        //Get the range for the x-axis
        var maxYear = d3.max(dateData, (d) => d)
        var minYear = d3.min(dateData, (d) => d)
        console.log("Max Year: ", maxYear, "\nMin Year: ", minYear)


        //Create the range for y-axis
        //0 represents January, 11 for december
        var maxMonth = new Date(0, 0, 1)
        var minMonth = new Date(0, 11, 1)
        console.log("Min Date:", minMonth, "\nMax Date:", maxMonth)

        //set xScale with scaleTime
        var xScale = d3.scaleTime()
            .domain([minYear, maxYear])
            .rangeRound([svgPadding, width - svgPadding - yPadding])

        var months = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"]

        //set yScale with scaleLinear
        var yScale = d3.scaleBand()
            .domain(months)
            .range([height - svgPadding - yPadding - legendPadding, 0])

        //define the x and y axis
        var xAxis = d3.axisBottom(xScale)
        var yAxis = d3.axisLeft(yScale)

        //create threshold for fill values
        d3.scaleThreshold()
            .domain(legendTicks)
            .range(legendColors)

        svg.append("g")
            .selectAll("rect")
            .data(dataset.monthlyVariance)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(new Date(dateData[i].getFullYear(), 0)) + xPadding)
            .attr("y", (d, i) => yScale(months[dateData[i].getMonth()]) + yPadding)
            .attr("width", (d, i) => 5.8)
            .attr("height", (d, i) => 48)
            .attr("class", "cell")
            .style("fill", (d) => {
                switch (true) {
                    case (d.temp < 0):
                        return legendColors[0];
                    case (d.temp < 3):
                        return legendColors[1];
                    case (d.temp < 4.5):
                        return legendColors[2];
                    case (d.temp < 6):
                        return legendColors[3];
                    case (d.temp < 7.5):
                        return legendColors[4];
                    case (d.temp < 9):
                        return legendColors[5];
                    case (d.temp < 10.5):
                        return legendColors[6];
                    case (d.temp < 12):
                        return legendColors[7];
                    case (d.temp < 13.5):
                        return legendColors[8];
                    case (d.temp < 15):
                        return legendColors[9];
                    default:
                        return legendColors[10];
                }
            })
            .on("mouseover", function (d, i) {
                // Update tooltip content dynamically on mouseover
                d3.select(this)
                    .style("stroke", "black")  // Set the outline color to black
                    .style("stroke-width", 2)  // Set the outline thickness
                tooltip.html(`${d.year}<br/>${d.month}<br/>${d.temp}<br/>${Math.round(d.variance * 10)/10}`)
                    .style("display", "flex")
                    .style("left", (d3.event.pageX - 15) + "px")
                    .style("top", (d3.event.pageY - legendPadding) + "px")
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("stroke", "none")  // Set the outline color to black
                tooltip.style("display", "none")
            })
        //draw x axis
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(" + xPadding + "," + (height - legendPadding - svgPadding) + ")")
            .attr("class", "tick")
            .call(xAxis.tickFormat(d3.utcFormat('%Y'))
                .tickPadding(10))

        //draw y axis
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", "translate(" + (svgPadding + xPadding) + ", " + yPadding + ")")
            .attr("class", "tick")
            .call(yAxis.tickPadding(10))

        //label x-axis
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2 + xPadding - 2)
            .attr("y", height + yPadding - 30)
            .text("Year");

        //label y-axis
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", ((-legendPadding * 2) - 43))
            .attr("y", svgPadding - yPadding)
            .text("Month");
    }
});
