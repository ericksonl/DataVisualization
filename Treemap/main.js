const DATASET = {
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

const defaultDataset = DATASET.movies

var dataset
const width = 1000
const height = 600
var svg

var colorArray = []

for (i = 0; i < 1; i += 0.05) {
    let color = d3.interpolateRainbow(i)
    colorArray.push(color)
}

console.log(colorArray)

//create threshold for fill values
var colors = d3.scaleOrdinal()
    .domain([1, 20])
    .range(colorArray)

console.log(colors[0])


document.addEventListener('DOMContentLoaded', function () {
    var div = d3.select('.heading')
        .append('div')
        .attr('id', 'buttons')

    div.selectAll('button')
        .data(Object.keys(DATASET)) //.data expects an array, Object.keys(DATASET) returns an array of keys from the DATASET object
        .enter()
        .append('button')
        .attr('class', 'buttons')
        .text((index) => DATASET[index].TITLE)
        .on('click', (d) => {
            dataset = DATASET[d]
            loadData(DATASET[d].URL)
            changeData(DATASET[d].TITLE, DATASET[d].DESCRIPTION)
        })

    initCall()
    loadData(defaultDataset.URL)
    changeData(defaultDataset.TITLE, defaultDataset.DESCRIPTION)
})

function loadData(url) {
    d3.json(url).then(
        (data, error) => {
            if (error) {
                console.log(log)
            } else {
                dataset = data
                console.log('Loaded Dataset:', dataset)
                drawDiagram()
            }
        }
    )
}

function initCall() {
    d3.select('body')
        .append('h1')
        .attr('id', 'title')
        .text(defaultDataset.TITLE)

    d3.select('body')
        .append('h3')
        .attr('id', 'description')
        .text(defaultDataset.DESCRIPTION)

    svg = d3.select('body')
        .append('svg')
        .attr('id', 'canvas')
        .attr('width', width)
        .attr('height', height)
}


function drawDiagram() {
    //setup dataset hierarchy
    let hierarchy = d3.hierarchy(dataset, (node) =>
        node['children'])
        .sum((node) => node['value'])
        .sort((node1, node2) => node2['value'] - node1['value']) //returns integer. If positive, node2 comes before node1. If negative, node1 before node2

    let createTreeMap = d3.treemap()
        .size([width, height])

    createTreeMap(hierarchy)//gives all leaf nodes coordinates

    let titles = hierarchy.leaves()//contains leaf nodes

    //create g elements to contain rects
    let group = svg.selectAll('g')
        .data(titles)
        .enter()
        .append('g')
        .attr('transform', (d) => 'translate(' + d.x0 + ', ' + d.y0 + ')')

    //create rectangles
    group.append('rect')
        .attr('class', 'tile')
        .style('fill', (d, i) => colors(d.data.category))
        .attr('data-name', (d) => d.data.name)
        .attr('data-category', (d) => d.data.category)
        .attr('data-value', (d) => d.data.value)
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)

    group.append("text")
        .attr('class', 'tile-text')
        .selectAll("tspan")
        .data(function (d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
        .enter().append("tspan")
        .attr("x", 4)
        .attr("y", function (d, i) { return 13 + i * 10; })
        .text(function (d) { return d; });

    console.log(hierarchy.leaves())
}


function changeData(dataTitle, dataDescr) {
    d3.select('#title')
        .text(dataTitle)

    d3.select('#description')
        .text(dataDescr)
}