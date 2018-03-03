selectStar(); //dropdown for bubble chart
bubblePlot(5); //bubble chart
draftRndHeatmap(); //draft round heatmap
waffleStar(); //waffle chart
initPlot4(); //stacked vertical bar chart
initPlot3(); //pie chart
initPlot2(); //recruit map
initPlot1(); //stacked horizontal bar chart



/*
----------------------------------------------------------------------------------------------
    DRAFT/RECRUIT BUBBLE CHART
     bubble divID = bubble
     dropdown divID = dropdown
----------------------------------------------------------------------------------------------
*/
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
            marker: response.marker,
            name: '# drafted'
        };

        var data = [trace1];

        var layout = {
            title: 'Draftee to Recruit Ratio per School: ' + star + " Star",
            titlefont: {size: 24},
            showlegend: true,
            xaxis: {
                title: 'College',
                titlefont: {size: 20}
            },
            yaxis: {title: '#drafted / #recruited'}
        }

        var BUBBLE = document.getElementById("bubble");
        Plotly.newPlot(BUBBLE, data, layout);

    })
}

// Drop down for bubble chart
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

// Change on selection for drop down
function optionChanged() {
    let value = document.getElementById(this.id).value;

    bubblePlot(value);
}


/*
----------------------------------------------------------------------------------------------
    DRAFT ROUND HEATMAP
    divID = draft-round
----------------------------------------------------------------------------------------------
*/
function draftRndHeatmap() {
    var element = document.getElementById("draft-round");
    //element.innerHTML = "";

    var route = "/draft/rnd/";

    Plotly.d3.json(route, function(error, response) {
        if (error) return console.warn(error);

        var data = response;

        var layout = {
            title: '# College players drafted in each round of NFL Draft',
            titlefont: {size: 24},

        }
        
        var RND = document.getElementById("draft-round");
        Plotly.newPlot(RND, data, layout);
    });
}




/*
----------------------------------------------------------------------------------------------
    RECRUIT WAFFLE CHART
    divCLASS = chart
----------------------------------------------------------------------------------------------
*/
function waffleStar() {
    var element = document.getElementsByClassName('chart');
    element.innerHTML = "";

    var route = "/recruits/waffle";


    d3.json(route, function(error, data) {
        if (error) return console.warn(error);
        console.log(data);
        var waffle = new WaffleChart()
          .selector(".chart")
          .data(data)
          .useWidth(false)
          .label("Average College Football Recruits per Year (1 block = 10 recruits)")
          .size(20)
          .gap(6)
          .rows(10)
          .columns(25)
          .rounded(true)();

          

    });
}

// Build waffle chart
var WaffleChart = function() {

    var $_selector,
        $_data,
        $_label,
        $_cellSize,
        $_cellGap,
        $_rows,
        $_columns,
        $_rounded,
        $_keys,
        $_useWidth;
  
    var defaults = {
      size: 6,
      rows: 50,
      columns: 100,
      rounded: false,
      gap: 2
    };
  
    function generatedWaffleChart() {
  
      $_keys = d3.keys($_data[0]);
  
      var obj = {
        selector: $_selector,
        data: $_data,
        label: $_label,
        size: $_cellSize,
        gap: $_cellGap,
        rows: $_rows,
        columns: $_columns,
        rounded: $_rounded
      };
      
      drawWaffleChart(obj);
  
    }
  
    function drawWaffleChart(_obj) {
  
      if (!_obj.size) { _obj.size = defaults.size; }
      if (!_obj.rows) { _obj.rows = defaults.rows; }
      if (!_obj.columns) { _obj.columns = defaults.columns; }
      if (_obj.gap === undefined) { _obj.gap = defaults.gap; }
      if (_obj.rounded === undefined) { _obj.columns = defaults.rounded; }
  
      var formattedData = [];
      var domain = [];
      var value = $_keys[$_keys.length - 1];
      var total = d3.sum(_obj.data, function(d) { return d[value]; });
  
      if ($_useWidth) {
        var forcedWidth = d3.select(_obj.selector).node().getBoundingClientRect().width;
        _obj.columns = Math.floor(forcedWidth / (_obj.size + _obj.gap));
      }
  
      var squareVal = total / (_obj.rows * _obj.columns);
  
      _obj.data.forEach(function(d, i) {
        d[value] = +d[value];
        d.units = Math.floor(d[value] / squareVal);
        Array(d.units + 1).join(1).split('').map(function() {
          formattedData.push({
            squareVal: squareVal,
            units: d.units,
            value: d[value],
            groupIndex: i
          });
        });
        domain.push(d[$_keys[0]]);
      });
  
      var red = "#CE2A23";
      
      var color = d3.scaleLinear()
        .domain([1, _obj.data.length - 1])
        .interpolate(d3.interpolateRgb)
        .range(["#ecc753", "#23c7ce"]);
      
  
      // add label
  
      if (_obj.label) {
        d3.select(_obj.selector)
          .append("div")
          .attr("class", "label")
          .text(_obj.label);
      }
  
      // add legend
  
      var legend = d3.select($_selector)
        .append("div")
        .attr("class", "legend");
  
      var legendItem = legend.selectAll("div")
        .data(_obj.data);
      
       
      
      legendItem.enter()
        .append("div")
        .attr("class", function(d, i) {
          return "legend_item legend_item_" + (i + 1);
        });
    
        var L_icon = d3.selectAll('.legend_item')
        L_icon
        .append('div')
        .attr('class','legend_item_icon')
        .style("background-color", function(d, i) {
            if (i === 0) {
                return red;
            } else {
                return color(i);
            }
            });

        /*var legendIcon = legendItem.append("div")
        .attr("class", "legend_item_icon")
        .style("background-color", function(d, i) {
          if (i === 0) {
            return red;
          } else {
            return color(i);
          }
        });*/
      

      if (_obj.rounded) {
        L_icon.style("border-radius", "50%");
      }
      
      var L_text = d3.selectAll('.legend_item')
      L_text
        .append('span')
        .attr("class", "legend_item_text")
        .text(function(d) { return d[$_keys[0]]; });

      /*legendItem.append("span")
        .attr("class", "legend_item_text")
        .text(function(d) { return d[$_keys[0]]; });*/
  
      // set up the dimensions
  
      var width = (_obj.size * _obj.columns) + (_obj.columns * _obj.gap) - _obj.gap;
      var height = (_obj.size * _obj.rows) + (_obj.rows * _obj.gap) - _obj.gap;
  
      if ($_useWidth) {
        width = d3.select(_obj.selector).node().getBoundingClientRect().width;
      }
  
      var svg = d3.select(_obj.selector)
        .append("svg")
        .attr("class", "waffle")
        .attr("width", width)
        .attr("height", height);
  
      var g = svg.append("g")
        .attr("transform", "translate(0,0)");
  
      // insert dem items
  
      var item = g.selectAll(".unit")
        .data(formattedData);
  
      item.enter()
        .append("rect")
        .attr("class", "unit")
        .attr("width", _obj.size)
        .attr("height", _obj.size)
        .attr("fill", function(d) {
          if (d.groupIndex === 0) {
            return red;
          } else {
            return color(d.groupIndex);
          }
        })
        .attr("x", function(d, i) {
          var col = Math.floor(i / _obj.rows);
          return (col * (_obj.size)) + (col * _obj.gap);
        })
        .attr("y", function(d, i) {
          var row = i % _obj.rows;
          return (_obj.rows * (_obj.size + _obj.gap)) - ((row * _obj.size) + (row * _obj.gap)) - _obj.size - _obj.gap;
        })
        .append("title")
        .text(function (d, i) {
          return _obj.data[d.groupIndex][$_keys[0]] + ": " + Math.round((d.units / formattedData.length) * 100) + "%";
        });
  
      if (_obj.rounded) {
        item
          .attr("rx", (_obj.size / 2))
          .attr("ry", (_obj.size / 2));
      }
  
    }
  
    generatedWaffleChart.selector = function(value){
      if (!arguments.length) { return $_selector; }
      $_selector = value;
      return generatedWaffleChart;
    }
  
    generatedWaffleChart.data = function(value){
      if (!arguments.length) { return $_data; }
      $_data = value;
      return generatedWaffleChart;
    }
  
    generatedWaffleChart.useWidth = function(value){
      if (!arguments.length) { return $_useWidth; }
      $_useWidth = value;
      return generatedWaffleChart;
    }
  
    generatedWaffleChart.label = function(value){
      if (!arguments.length) { return $_label; }
      $_label = value;
      return generatedWaffleChart;
    }
  
    generatedWaffleChart.size = function(value){
      if (!arguments.length) { return $_cellSize; }
      $_cellSize = value;
      return generatedWaffleChart;
    }
  
    generatedWaffleChart.gap = function(value){
      if (!arguments.length) { return $_cellGap; }
      $_cellGap = value;
      return generatedWaffleChart;
    }
  
    generatedWaffleChart.rows = function(value){
      if (!arguments.length) { return $_rows; }
      $_rows = value;
      return generatedWaffleChart;
    }
  
    generatedWaffleChart.columns = function(value){
      if (!arguments.length) { return $_columns; }
      $_columns = value;
      return generatedWaffleChart;
    }
  
    generatedWaffleChart.rounded = function(value){
      if (!arguments.length) { return $_rounded; }
      $_rounded = value;
      return generatedWaffleChart;
    }
  
    return generatedWaffleChart;
  
};


/*
----------------------------------------------------------------------------------------------
    DRAFTED STACKED VERTICAL BAR CHART
    divID = stackVBar
----------------------------------------------------------------------------------------------
*/
var url4 = "/plot4";
function initPlot4() {
    Plotly.d3.json(url4, function (error, data) { 
        var plot04_data = data;
        plot4(plot04_data);
    });
    
}

function plot4(plot04_data) {
    console.log(plot04_data);
    var data = [];
    for (i = 0; i < plot04_data.length; i++) { 
        data.push(plot04_data[i]);
    }
      console.log(data)
      var layout = {
            barmode: 'stack',
            title: 'Stacked Bar Chart: Percentage of Drafted Recruits (All States)',
            xaxis: {title: 'Star'},
            yaxis: {title: 'Percentage(%)'},
            legend: {"orientation": "h"}
    };
      Plotly.newPlot("stackVBar", data, layout);
}


/*
----------------------------------------------------------------------------------------------
    DRAFTED PIE CHART
    divID = pie
----------------------------------------------------------------------------------------------
*/
var url3 = "/plot3";
function initPlot3() {
    Plotly.d3.json(url3, function (error, data) { 
        var plot03_data = data;
        plot3(plot03_data);
    });
}

function plot3(plot03_data) {

    console.log(plot03_data);
    data = plot03_data
    var layout = {

      title: 'Pie Chart: Percentage of Drafted Recruits from all Players (about 8% Drafted)',

    };
    Plotly.newPlot("pie", data, layout);
}


/*
----------------------------------------------------------------------------------------------
    RECRUIT MAP
    divID = map
----------------------------------------------------------------------------------------------
*/
var url2 = "/plot2";
function initPlot2() {
    Plotly.d3.json(url2, function (error, data) { 
        var plot02_data = data;
        plot2(plot02_data);
    });    
}

function plot2(plot02_data) {

    console.log(plot02_data);

    var mapbox = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ.T6YbdDixkOBWH_k9GbS8JQ'

        var myMap = L.map('map', {
            center: [39.8283, -98.5795],
            zoom: 4
        });


        L.tileLayer(mapbox).addTo(myMap);

        var heatArray = plot02_data;
        console.log(heatArray)

        var heat = L.heatLayer(heatArray, {
            radius:10,
            blur: 2.5
        }).addTo(myMap)
}


/*
----------------------------------------------------------------------------------------------
    RECRUIT STATES STACKED HORIZONTAL BAR CHART
    divID = stackHBar
----------------------------------------------------------------------------------------------
*/
var url1 = "/plot1";
function initPlot1() {
    Plotly.d3.json(url1, function (error, data) { 
        var plot01_data = data;
        plot1(plot01_data);
    });
}

function plot1(plot01_data) {

    var data = [];
    for (i = 0; i < plot01_data.length; i++) { 
        data.push(plot01_data[i]);
    }
      console.log(data)
      var layout = {
          barmode: 'stack',
          title: 'Star (1 to 5) Stacked Bar Chart - Recruits Origin',
          xaxis: {title: 'Number of Players'},
          yaxis: {title: 'State of Origin'},
          legend: {"orientation": "v"}

        };
      Plotly.newPlot("stackHBar", data, layout);
}