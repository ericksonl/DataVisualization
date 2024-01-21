var educationData
var countyData
var stateData

document.addEventListener('DOMContentLoaded', function () {
    //fetch Request for the data
    var educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'
    var countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
    console.log("Retrieving data...")

    //use d3.json to fetch and convert data into js objects
    d3.json(countyURL).then(
        (data, error) => {
            if (error) {
                console.log(log)
            } else {
                countyData = topojson.feature(data, data.objects.counties).features
                stateData = topojson.mesh(data, data.objects.states);
                console.log("County Data: ", countyData)

                d3.json(educationURL).then(
                    (data, error) => {
                        if (error) {
                            console.log(error)
                        } else {
                            educationData = data
                            console.log("Education Data: ", educationData)
                            drawMap()
                        }
                    })
            }
        }
    )

    //Set width and height of svg
    var width = 1500;
    var height = 600;

    async function drawMap() {

        //create title and description
        let title = d3.select("body")
            .append("h1")
            .attr('id', 'title')
            .text("United States Educational Attainment")

        let description = d3.select("body")
            .append("h3")
            .attr('id', 'description')
            .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)")

        //create the SVG
        let canvas = d3.select("body")
            .append("svg")
            .attr("id", "canvas")
            .attr("width", width)
            .attr("height", height)

        var svg = canvas.append("svg")
            .attr("x", 250)
            .attr("y", 5)
            .attr("id", "map")

        //Create a tooltip section when hovering over an element
        var tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("display", "none")

        const thresholdDomain = [3, 12, 21, 30, 39, 48, 57, 66] //Directly related to percent of bachelorsOrHigher

        const colorCodes = d3.schemeGreens[9]

        //create threshold for fill values
        var colors = d3.scaleThreshold()
            .domain(thresholdDomain)
            .range(colorCodes)

        //create counties with dynamic fill
        svg.selectAll("path")
            .data(countyData)
            .enter()
            .append("path")
            .attr("d", d3.geoPath())
            .attr("class", "county")
            .style("fill", (d, i) => {
                let countyID = d.id
                let county = educationData.find((item) =>
                    item.fips === countyID //if fips matches countyID set county to corresponding data element
                )
                let percent = county.bachelorsOrHigher
                return colors(percent)
            })
            .attr("data-fips", (d) => d.id)
            .attr("data-education", (d) => {
                return educationData.find((item) =>
                    item.fips === d.id
                ).bachelorsOrHigher
            })
            .on("mouseover", function (d, i) {
                // Update tooltip content dynamically on mouseover
                d3.select(this)
                    .style("stroke", "rgba(0,0,0,0.5")  // Set the outline color to black
                    .style("stroke-width", 2)  // Set the outline thickness

                //find cooresponding education data
                let educationTooltip = educationData.find((item) =>
                    item.fips === d.id
                )

                tooltip.html(`${educationTooltip.area_name}, ${educationTooltip.state}: ${educationTooltip.bachelorsOrHigher}%`)
                    .attr("data-year", d.year)
                    .style("display", "flex")
                    .attr("data-education", educationTooltip.bachelorsOrHigher)

                var tooltipSpecs = document.getElementById('tooltip').getBoundingClientRect()
                var rectSpecs = this.getBoundingClientRect()

                tooltip.style("left", (d3.event.pageX - (tooltipSpecs.width / 2)) + "px")
                    .style("top", ((rectSpecs.y - 50)) + "px")
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("stroke", "none") 
                tooltip.style("display", "none")
            })

        //create outlines for states
        svg.append("path")
            .datum(stateData)
            .attr("d", d3.geoPath())
            .attr("class", "states");

        // Create the legend
        var legendScale = d3.scaleLinear()
            .domain([.75, -0.06])
            .range([height - 329, 0])

        var legendAxis = d3.axisRight(legendScale)

        legendAxis.tickValues(thresholdDomain.map(value => value / 100)) //convert ticks to percentage
            .tickFormat(d3.format(".0%"))
            .tickSize(36)

        //create legend axis
        var legendAxisGroup = canvas.append("g")
            .attr("id", "legend-axis")
            .attr("transform", "translate(" + 1240 + "," + ((height / 3) - 6) + ")")
            .call(legendAxis);

        //add rectangles
        //put on svg to be below the legend axis
        var legendGroup = svg.append("g")
            .attr("class", "key")
            .attr("id", "legend")
            .attr("transform", "translate(" + (width - 480) + "," + 190 + ") rotate(90)");

        //Add the squares
        legendGroup.selectAll("rect")
            .data(colorCodes)
            .join("rect")
            .attr("width", 30)
            .attr("height", 30)
            .attr("x", (d, i) => i * 30)
            .attr("y", 0)
            .attr("fill", d => d);

    }
});
