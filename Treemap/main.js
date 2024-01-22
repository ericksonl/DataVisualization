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
const height = 665

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

    for (i = 0; i < 1; i += 0.05) {
        let color = d3.interpolateRainbow(i)
        colorArray.push(color)
    }

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

    group.append('text')
        .text((d) => d.data.name)
        .attr('x', 5)
        .attr('y', 20)


    //create an array of categories
    const categories = Array.from(new Set(dataset.children.flatMap(child => child.children.map(innerChild => innerChild.category))));

    dataset.children.forEach(element => {
        console.log("child", element.children)
    });

    //Output: what (18) ['2600', 'Wii', 'NES', 'GB', 'DS', 'X360', 'PS3', 'PS2', 'SNES', 'GBA', 'PS4', '3DS', 'N64', 'PS', 'XB', 'PC', 'PSP', 'XOne']

    var legendGroup = legend.selectAll('g')
        .data(categories) // Example data, you can replace it with your own
        .enter()
        .append('g')
        .attr('transform', (d, i) => {
            let xVal = i < 9 ? 0 : 200
            let yVal = i < 9 ? i * 35 : (i * 35) - 350
            return (`translate(${xVal}, ${yVal})`)
        })
        .append('rect')
        .attr('width', 35) // Set the width of the rectangle
        .attr('height', 35) // Set the height of the rectangle
        .attr('class', 'legend-item')
        .style('stroke', 'black')
        .style('fill', d => colorsScale(d));

    //Add text labels for each category in the legend
    legend.selectAll('text')
        .data(categories)
        .enter()
        .append('text', (d, i) => categories[i])
        .text(d => `-${d}`)
        .attr('x', (d, i) => i < 9 ? 50 : 250)
        .attr('y', (d, i) => i < 9 ? (i * 35) + 25 : (i * 35) - 325)
        .attr('class', 'legend-text')

    console.log(hierarchy.leaves())
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
}