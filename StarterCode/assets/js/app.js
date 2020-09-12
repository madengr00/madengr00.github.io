var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initialize default axis Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

/* Initialize tooltip */
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function(d) { return (`State: <strong>${d.state}</strong><hr>${chosenXAxis}: ${d[chosenXAxis]}<hr>${chosenYAxis}: ${d[chosenYAxis]}`)});


// //**********************************************//

// Retrieve data from the csv file and execute everything below
d3.csv("assets/data/data.csv")
    .then(function(data){
        //Step1:  parse data
        data.forEach(function(data) {
            //x values
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            //y values
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
            data.healthcare = +data.healthcare;
            //state abbreviation and name
            data.abbr = data.abbr;
            data.state = data.state;
            console.log(data.abbr);
        });
        
        //Step2: Create scale functions
        // Create function to update scale functions upon click
            //create xscale
        function xScale(data, chosenXaxis){
            var xLinearScale = d3.scaleLinear()
                .domain([d3.min(data, d => d[chosenXaxis]),
                         d3.max(data, d => d[chosenXaxis])])
                .range(([0, width]));
            return xLinearScale;
        }
            //create yscale
        function yScale(data, chosenYAxis){
            var yLinearScale = d3.scaleLinear()
                .domain([d3.min(data, d => d[chosenYAxis]),
                         d3.max(data, d => d[chosenYAxis])])
                .range(([height,0]));
            return yLinearScale;
        }
            // define x and y Linear scale
        var xLinearScale = xScale(data, chosenXAxis);
        var yLinearScale = yScale(data, chosenYAxis);

        //Step3: Create axis functions
        //Create function to update xAxis upon click
        function renderXAxis(newXScale, xAxis) {
            var bottomAxis = d3.axisBottom(newXScale);
            xAxis.transition()
                .duration(1000)
                .call(bottomAxis);
            return xAxis;
        }
        //Create function to update yAxis upon click
        function renderYAxis(newYScale, yAxis) {
            var leftAxis = d3.axisLeft(newYScale);
            yAxis.transition()
                .duration(1000)
                .call(leftAxis);
            return yAxis;
        }
        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);
        

        //Step4:  Create function to update marker group with a transition
            //new markers
        function renderMarkers(markersGroup, circles, texts, newXScale, chosenXAxis, newYScale, chosenYAxis) {
            
            circles.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]))
                .attr("cy", d => newYScale(d[chosenYAxis]))

            texts.transition()
                .duration(1000)
                .attr("x", d => newXScale(d[chosenXAxis]))
                .attr("y", d => newYScale(d[chosenYAxis]))
            
            return markersGroup;
        }

            //function used to update markers group with new tooltip
        function updateToolTip(chosenXAxis, chosenYAxis, markersGroup) {
            //tip defined / intitialized at the top
            //invoke the tip in the context of the visualization
            markersGroup.call(tip)
            return markersGroup;
        }

        //Step5:  Append Axes
            //Append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
        
            // append y axis
        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis)
        
        //Step6: Transform a g element with the location of the data point
        var markersGroup = chartGroup.append("g");
            
        //Step7: Add markers and text to the g element above
        var circles = markersGroup.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 12)
            .attr("fill", "black")
            .attr("opacity", ".4")
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        var texts = markersGroup.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'central')
            .text(function(d) {return d.abbr});
            
    
        // // Create group for 3 x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);
        
        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income(Median)");
        
        // // // Create group for 3 y-axis labels
        var ylabelsGroup = chartGroup.append("g")
            
        var obesityLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")    
            .attr("y", -60)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("value", "obesity") // value to grab for event listener
            .classed("active", true)
            .text("Obesity (%)");

        var smokesLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")    
            .attr("y", -80)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("value", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smokes (%)");

        var healthcareLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")    
            .attr("y", -100)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("value", "healthcare") // value to grab for event listener
            .classed("inactive", true)
            .text("Lacks Healthcare (%)");

        //see updateToolTip function
        var markersGroup = updateToolTip(chosenXAxis, chosenYAxis, markersGroup); 

        // x axis labels event listener
        xlabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;
                console.log(chosenXAxis)

                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);

                // updates markers with new x values
                markersGroup = renderMarkers(markersGroup, circles, texts, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                markersGroup = updateToolTip(chosenXAxis, chosenYAxis, markersGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
                else if (chosenXAxis === "poverty") {
                    ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
            }
        });
        
        // y axis labels event listener
        ylabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;
                console.log(chosenYAxis)

                // updates x scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates x axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);

                // updates markers with new y values
                markersGroup = renderMarkers(markersGroup,circles,texts, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                // markersGroup = updateToolTip(chosenYAxis, markersGroup);

                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }
                else if (chosenYAxis === "healthcare") {
                    obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
            }
        });

    
    
});


