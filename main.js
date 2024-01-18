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

        console.log(dataset);
        
        for (var i = 0; i < dataset.length; ++i) {
            yearData.push(new Date(dataset[i][0]));			//Convert "%Y-%m-%d" to date objects
        }
        // Call the function to draw the chart after updating the dataset variable
        console.log(dataset);
        drawChart();
    };

    //set width and height of SVG
    let width = 700;
    let height = 500;

    // Padding between the SVG boundary and the plot
    const padding = 50;

    function drawChart() {

        //Get the range for the X axis
        var maxYear = d3.max(dataset, (d) => d[0])

        //Get the range for the Y axis
        var maxValue = Math.ceil(d3.max(dataset, (d) => d[1]))


        console.log("Max Year:", maxYear, "\nMax Value", maxValue)


    }

});

