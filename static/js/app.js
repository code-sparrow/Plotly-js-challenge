d3.json("data/samples.json").then((data)=> {

    // Populating dropdown menu with Subject ID's from data["names"]
    data.names.forEach(function(name) {
        d3.select("#selDataset").append("option").text(name).property("value");
    });

    // Getting first/default value from dropdown (940)
    let subjectID = d3.select('#selDataset option:checked').text();

    // Calling all the plotting functions, written below, based on the default subject ID
    plotBar(subjectID, data);

    plotBubble(subjectID, data);

    displayData(subjectID, data);

    plotGauge(subjectID, data);

});


// This function is called in index.html. It initiates changes based on the dropdown
// menu value selected, and calls all the plotting functions written below
let optionChanged = function(id) {

    // renaming function parameter
    let subjectID = id;

    // Loading data
    d3.json("data/samples.json").then((data)=> {

        // Plotting based on selected Subject ID
        plotBar(subjectID, data);

        plotBubble(subjectID, data);

        displayData(subjectID, data);

        plotGauge(subjectID, data);

    });
    
};


// function that filters data set based on a subject ID and plots a bar chart
let plotBar = function(subjectID, data) {

    // Get data for subject selected in dropdown
    let subjectData = data.samples.filter(subject => subject.id === subjectID)[0];
    let sampleValues = subjectData.sample_values.slice(0, 10).reverse();
    let otuIDs = subjectData.otu_ids.slice(0, 10).reverse().map(otuid => `OTU ${otuid}`);
    let labels = subjectData.otu_labels.slice(0, 10).reverse();

    let trace = [{
        x: sampleValues,
        y: otuIDs,
        type: "bar",
        orientation: "h",
        text: labels,
        bgcolor: "lavender",
        marker: {
            color: "#133F8D"
        }
    }];

    let layout = {
        title: { text: `<b>Top 10 Microbial Species</b> <br> Found in Subject ${subjectID} ` },
        paper_bgcolor: "rgb(190, 190, 216)",
        plot_bgcolor: "#A4DAD0",
        font: { color: "darkblue", family: "Arial", size: 14 }
    };
    let config = {responsive: true}

    Plotly.newPlot("bar", trace, layout, config);
};


// function that filters data set based on a subject ID and plots a bubble chart
let plotBubble = function(subjectID, data) {

    let subjectData = data.samples.filter(subject => subject.id === subjectID)[0];

    const desired_maximum_marker_size = 80;
    // Was trying to get a better bubble size to match the plot provided by trilogy
    // but ended up going with default for now

    let trace = [{
        x: subjectData.otu_ids,
        y: subjectData.sample_values,
        mode: "markers",
        marker: {
            size: subjectData.sample_values,
            color: subjectData.otu_ids,
            colorscale: 'Blackbody',
            sizeref: 2.0 * subjectData.sample_values[0] / (desired_maximum_marker_size**2),
            sizemode: 'area'
        },
        text: subjectData.otu_labels,
        bgcolor: "lavender"

    }];

    let layout = {
        xaxis:{title: "OTU ID"},
        autosize: true,
        //height: 700,
        plot_bgcolor: "#A4DAD0",
        paper_bgcolor: "rgb(190, 190, 216)",
        font: { color: "darkblue", family: "Arial", size: 18}
    };
    
    //
    let config = {responsive: true}

    Plotly.newPlot("bubble", trace, layout, config); 
};


// displaying the Demographic Info
let displayData = function(subjectID, data) {

    // can use == instead of === when types don't match
    // one set of id's are numbers, while the dropdown id is text
    let subjectData = data.metadata.filter(subject => subject.id == subjectID)[0];

    // select div with id="sample-metadata" and clear out any html
    d3.select("#sample-metadata").html("");

    // Repopulate list based on key-value pairs in the 
    // selected object from the metadata array
    for (const [key, value] of Object.entries(subjectData)) {

        // No horizontal rule <hr>, if it's the first item, id
        if (key === "id") {
            d3.select('#sample-metadata').append("p").text(`${key}: ${value}`);
        } else {
            d3.select('#sample-metadata').append("hr")
            d3.select('#sample-metadata').append("p").text(`${key}: ${value}`);
        }
    };
};


// function that filters data set based on a subject ID and plots a Gauge Chart
let plotGauge = function(subjectID, data) {
    let subjectData = data.metadata.filter(subject => subject.id == subjectID)[0];
    let wFreq = subjectData.wfreq;

    // Center circle for needle of gauge
    
    let trace1 = { type: 'scatter',
    x: [0], y:[0],
    marker: {size: 14, color:'850000'},
    showlegend: false
    };

    let trace2 = {
        //domain: { x: [-1, 1], y: [-0.375, 1.375] },
        value: wFreq,
        title: { text: `<b>Belly Button Washing Frequency</b> <br> (scrubs per week) ` },
        type: "indicator",
        
        mode: "gauge",
        gauge: { axis: { range: [null, 9], tickwidth: 2, tickcolor: "darkblue"},
                bar: { color: "#133F8D", thickness: 0.35},
                bgcolor: "lavender",
                borderwidth: 2,
                bordercolor: "gray",
                steps: [
                { range: [0, 1], color: "#F0FDFA" },
                { range: [1, 2], color: "#CAF8ED" },
                { range: [2, 3], color: "#A0F1DE" },
                { range: [3, 4], color: "#6BCEB7" },
                { range: [4, 5], color: "#41B298" },
                { range: [5, 6], color: "#27997F" },
                { range: [6, 7], color: "#168E72" },
                { range: [7, 8], color: "#0C6953" },
                { range: [8, 9], color: "#034233" }
                ],
                threshold: {
                    line: { color: "850000", width: 3 },
                    thickness: 0.65,
                    value: wFreq},
            }
            
    };

    
    let traces = [trace1, trace2];

    //Defining coordinates to define an svg path for the gauge needle
    var myScale = d3.scaleLinear()
        .domain([0, 9])
        .range([0, 180]);
    var level = myScale(wFreq);
    var degrees = 180 - level,
    radius = 0.75;
    var radians = degrees * Math.PI / 180;
    var aX = 0.025 * Math.cos((degrees-90) * Math.PI / 180);
    var aY = 0.025 * Math.sin((degrees-90) * Math.PI / 180);
    var bX = -0.025 * Math.cos((degrees-90) * Math.PI / 180);
    var bY = -0.025 * Math.sin((degrees-90) * Math.PI / 180);
    var cX = radius * Math.cos(radians);
    var cY = radius * Math.sin(radians);
    var path = 'M ' + aX + ' ' + aY +
            ' L ' + bX + ' ' + bY +
            ' L ' + cX + ' ' + cY +
            ' Z';

    let layout = {

        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
        }],

        autosize: true,
        margin: { t: 75, b: 40, l: 40, r: 40 },
        plot_bgcolor: "rgb(190, 190, 216)",
        paper_bgcolor: "rgb(190, 190, 216)",
        font: { color: "darkblue", family: "Arial" }, 

        xaxis: {
            zeroline:false,
            showticklabels:false,
            showgrid: false, 
            range: [-1, 1],

        },

        yaxis: {
            zeroline:false,
            showticklabels:false,
            showgrid: false,
            range: [-0.375, 1.375]}
            /*
            Had to offset range because origin for needle did not line up with origin for gauge,
            or we we would want the needle to pivot rather.
            Plot is responsive and it doesn't work as well with phone screens
            Is there a way to dynamically offset range based on plot height?
            */

        };

        let config = {responsive: true}

    Plotly.newPlot("gauge", traces, layout, config);
    
};



// colorscales available in Plotly
//Greys,YlGnBu,Greens,YlOrRd,Bluered,RdBu,Reds,Blues,Picnic,Rainbow,
//Portland,Jet,Hot,Blackbody,Earth,Electric,Viridis,Cividis