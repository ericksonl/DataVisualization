const DATASETS = {
    videoGames: {
        TITLE: 'Video Game Sales',
        DESCRIPTION: 'Top 100 most sold video games grouped by platform',
        URL: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
    },
    movies: {
        TITLE: 'Movie Sales',
        DESCRIPTION: 'Top 95 highest grossing movies grouped by genre',
        URL: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
    },
    kickstarter: {
        TITLE: 'Kickstarter Pledges',
        DESCRIPTION: 'Top 100 most pledged kickstarter campaigns grouped by category',
        URL: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
    }
}

const defaultDataset = DATASETS.videoGames

const width = 1300
const height = 625

const legendW = 350
const legendH = 320

var dataset

var svg
var colorsScale
var legend
var colorArray = []

document.addEventListener('DOMContentLoaded', function () {

    initCall()
    loadData(defaultDataset.URL)
    updateData(defaultDataset.TITLE, defaultDataset.DESCRIPTION)
})

function loadData(url) {
    console.log("Retrieving data...")
    d3.json(url).then(
        (data, error) => {
            if (error) {
                console.log(log)
            } else {
                dataset = data
                console.log(`Loaded Dataset "${dataset.name}"\n`, dataset)
                drawDiagram()
            }
        }
    )
}

function initCall() {
    console.log("Color", d3.schemeBrBG[2])
    colorArray = d3.schemePastel2.concat(d3.schemeSet3)

    colorsScale = d3.scaleOrdinal()
        .domain([1, 20])
        .range(colorArray)

    d3.select('#heading')
        .append('h1')
        .attr('id', 'title')
        .text(defaultDataset.TITLE)

    d3.select('#heading')
        .append('h3')
        .attr('id', 'description')
        .text(defaultDataset.DESCRIPTION)

    var div = d3.select('#heading')
        .append('div')
        .attr('id', 'buttons')

    div.selectAll('button')
        .data(Object.keys(DATASETS)) //.data expects an array, Object.keys(DATASETS) returns an array of keys from the DATASETS object
        .enter()
        .append('button')
        .attr('class', 'buttons')
        .text((index) => DATASETS[index].TITLE)
        .on('click', (index) => {
            //set dataset to DATASET[index]
            dataset = DATASETS[index]
            //load new dataset
            loadData(DATASETS[index].URL)
            //update HTML elements
            updateData(DATASETS[index].TITLE, DATASETS[index].DESCRIPTION)
        })

    svg = d3.select('#main-content')
        .append('div')
        .attr('id', 'canvas')
        .append('svg')
        .attr('id', 'svg')
        .attr('width', width)
        .attr('height', height)

    legend = d3.select('#main-content')
        .append('div')
        .attr('id', 'legend')
        .append('svg')
        .attr('width', legendW)
        .attr('height', legendH)
}


function drawDiagram() {
    //setup dataset hierarchy
    const hierarchy = d3.hierarchy(dataset, (node) =>
        node['children'])
        .sum((node) => node['value'])
        .sort((node1, node2) => node2['value'] - node1['value']) //returns integer. If positive, node2 comes before node1. If negative, node1 before node2

    const createTreeMap = d3.treemap()
        .size([width, height])

    createTreeMap(hierarchy)//gives all leaf nodes coordinates

    let titles = hierarchy.leaves()//contains leaf nodes

    var tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("display", "none")

    //create g elements to contain rects
    let group = svg.selectAll('g')
        .data(titles)
        .enter()
        .append('g')
        .attr('transform', (d) => 'translate(' + d.x0 + ', ' + d.y0 + ')')

    //create rectangles
    group.append('rect')
        .attr('class', 'tile')
        .style('fill', (d, i) => colorsScale(d.data.category))
        .attr('data-name', (d) => d.data.name)
        .attr('data-category', (d) => d.data.category)
        .attr('data-value', (d) => d.data.value)
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)
        .on("mouseover", function (d, i) {
            //update tooltip content dynamically on mouseover
            d3.select(this)
                .style("stroke", "rgba(0,0,0,0.5")
                .style("stroke-width", 2)

            tooltip.html(`${d.data.name}<br />${d.data.category}<br />${d.value}`)
                .style("display", "flex")
                .attr('data-value', d.value)

                console.log("fuck",d)

            var tooltipSpecs = document.getElementById('tooltip').getBoundingClientRect()
            var rectSpecs = this.getBoundingClientRect()
            console.log(rectSpecs)

            //perfectly centered tooltip I FINALLY DID IT
            tooltip.style("left", ((rectSpecs.x + rectSpecs.width / 2)-tooltipSpecs.width/2) + "px")
                .style("top", ((rectSpecs.y - tooltipSpecs.height - 20)) + "px")
        })
        .on("mouseout", function () {
            d3.select(this)
                .style("stroke", "none")
            tooltip.style("display", "none")
        })

    group.append("text")
        .attr('class', 'tile-text')
        .selectAll("tspan")
        .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter().append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 20 + i * 15)
        .style('pointer-events', 'none')
        .text((d) => d);

    //create an array of categories
    const categories = Array.from(new Set(dataset.children.flatMap(child => child.children.map(innerChild => innerChild.category))));

    //Create legend rects
    var legendGroup = legend.selectAll('g')
        .data(categories)
        .enter()
        .append('g')
        .attr('transform', (d, i) => {
            let xVal = i < 9 ? 0 : 200  //After 9th iteration begin new line
            let yVal = i < 9 ? i * 35 : (i * 35) - 350
            return (`translate(${xVal}, ${yVal})`)
        })
        .append('rect')
        .attr('width', 35) //set width and height of rectangles
        .attr('height', 35)
        .attr('class', 'legend-item')
        .style('stroke', 'black') //add stroke around rects
        .style('fill', d => colorsScale(d));

    //Add text labels for each category in the legend
    legend.selectAll('text')
        .data(categories)
        .enter()
        .append('text', (d, i) => categories[i])
        .text(d => `-${d}`)
        .attr('x', (d, i) => i < 9 ? 40 : 240) //After 9th iteration begin new line
        .attr('y', (d, i) => i < 9 ? (i * 35) + 25 : (i * 35) - 325)
        .attr('class', 'legend-text')
}


function updateData(dataTitle, dataDescr) {
    //remove current data
    d3.selectAll('svg > *').remove();

    //Change page title
    d3.select('#title')
        .text(dataTitle)

    //change page description
    d3.select('#description')
        .text(dataDescr)

    if (dataTitle === 'Movie Sales') {
        legend.attr("width", legendW / 2)
            .attr("height", legendH / 1.2)
    } else {
        legend.attr("width", legendW)
            .attr("height", legendH)
    }
}