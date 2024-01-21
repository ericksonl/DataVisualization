const DATASET = {
    videoGames: {
        TITLE: 'Video Game Sales',
        DESCRIPTION: 'Top 100 most sold video games grouped by platform',
        URL: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
    },
    movies: {
        TITLE: 'Movie Sales',
        DESCRIPTION: 'Top 100 highest grossing movies grouped by genre',
        URL: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
    },
    kickstarter: {
        TITLE: 'Kickstarter Pledges',
        DESCRIPTION: 'Top 100 most pledged kickstarter campaigns grouped by category',
        URL: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
    }
}

const defaultDataset = DATASET.videoGames

var dataset
const width = 1200
const height = 600

document.addEventListener('DOMContentLoaded', function () {
    var div = d3.select(".heading")
        .append("div")
        .attr("id", "buttons")

    div.selectAll("button")
        .data(Object.keys(DATASET)) //.data expects an array, Object.keys(DATASET) returns an array of keys from the DATASET object
        .enter()
        .append("button")
        .attr("class", "buttons")
        .text((index) => DATASET[index].TITLE)
        .on("click", (d) => {
            dataset = DATASET[d]
            loadData(DATASET[d].URL)
            changeData(DATASET[d].TITLE, DATASET[d].DESCRIPTION)
        })

    d3.select("body")
        .append("h1")
        .attr('id', 'title')
        .text(defaultDataset.TITLE)

    d3.select("body")
        .append("h3")
        .attr('id', 'description')
        .text(defaultDataset.DESCRIPTION)

    loadData(defaultDataset.URL)
    changeData(defaultDataset.TITLE, defaultDataset.DESCRIPTION)
    drawDiagram()
})

function loadData(url) {
    d3.json(url).then(
        (data, error) => {
            if (error) {
                console.log(log)
            } else {
                dataset = data
                console.log("Loaded Dataset:", dataset)
            }
        }
    )
}


function drawDiagram() {
    //create the SVG
    let svg = d3.select("body")
        .append("svg")
        .attr("id", "canvas")
        .attr("width", width)
        .attr("height", height)
}


function changeData(dataTitle, dataDescr) {
    d3.select('#title')
        .text(dataTitle)

    d3.select('#description')
        .text(dataDescr)
}