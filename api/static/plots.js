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

bubblePlot(3);


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