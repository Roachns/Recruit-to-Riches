function bubblePlot(star) {
    var element = document.getElementById("bubble");
    element.innerHTML = "";
    /*if(BUBBLE.innerHTML != "") {
        BUBBLE.innerHTML = "";
    }*/

    var route = "/draft/ratio/" + star;

    Plotly.d3.json(route, function(error, response) {
        if (error) return console.warn(error);

        var trace1 = {
            x: response.x,
            y: response.y,
            mode: 'markers',
            text: response.text,
            marker: response.marker
        };

        var data = [trace1];

        var layout = {
            title: 'School draft ratio: ' + star,
            showlegend: false
        }

        var BUBBLE = document.getElementById("bubble");
        Plotly.newPlot(BUBBLE, data, layout);

    })
}

bubblePlot(5);


function draftRndHeatmap() {
    var element = document.getElementById("rnd");
    element.innerHTML = "";

    var route = "/draft/rnd/";

    Plotly.d3.json(route, function(error, response) {
        if (error) return console.warn(error);

        var data = response;
        
        var RND = document.getElementById("rnd");
        Plotly.newPlot(RND, data);
    });
}

draftRndHeatmap();

function selectStar() {
    var dropdown = d3.select("#dropdown");
    var options = [
        {label: 'Five star', value: 5},
        {label: 'Four star', value: 4},
        {label: 'Three star', value: 3},
        {label: 'Two star', value: 2}
    ]

    dropdown
        .append('select')
        .attr('id','selectStar')
        .on('change', optionChanged)
        .selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .attr('value', d => d.value)
        .text(d => d.label)
}


function optionChanged() {
    let value = document.getElementById(this.id).value;

    bubblePlot(value);
}

selectStar();