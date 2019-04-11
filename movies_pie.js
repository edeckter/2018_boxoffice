//Create mini-pie chart
var height=400;
var width=300;
var pad={top: 50, bottom: 50, right: 50, left: 50};

var parseValue=function(val) {
    if (val > 1e6) {return d3.format("$,.3s")(val).replace("G","B");}
    else {return d3.format("$,.3s");}
}
var parsePercent=d3.format(".0%");

//Create tooltip div
var tooltip3=d3.select("#viz3")
            .append("div")	
            .attr("class","tooltip")
            .style("opacity",0)
            .style("background-color", "white")
            .style("padding", "5px")
            .style("position","absolute");

//Create color palette
var colors=["#53777A","#83AF9B","#3B8686","#79BD9A"];

d3.csv("data/quarters.csv").then(function(quarters) {
    quarters.forEach(function(d) {
        d.Quarter=d.Quarter;
        d.Gross=parseFloat(d.Gross);
        d.Percent=parseFloat(d.Percent);
    });

    //Define pie generator
    var pie=d3.pie()
              .value(function(d) {return d.Gross;});
    
    //Define arc generator
    var outerRadius=(width-pad.right-pad.left)/2;
    var innerRadius=0;
    var arc=d3.arc()
              .innerRadius(innerRadius)
              .outerRadius(outerRadius);
              
    //Create svg
    var svg3=d3.select("#viz3")
               .append("svg")
               .attr("class","svg")
               .attr("id","pie-chart")
               .attr("height",height)
               .attr("width",width);
       
    //Set up groups
    var translate_x=outerRadius+pad.left;
    var translate_y=outerRadius+pad.top;

    var arcs=svg3.selectAll("g.arc")
                 .data(pie(quarters))
                 .enter()
                 .append("g")
                 .attr("class", "arc")
                 .attr("transform", "translate("+translate_x+", "+translate_y+")");
                 
    //Draw arc paths
    arcs.append("g")
        .attr("class","pie")
        .append("path")
        .attr("fill", function(d, i) {
            return colors[i];
        })
        .attr("d", arc);
        
    //Add labels
    arcs.selectAll(".pie")
        .append("text")
        .attr("transform", function(d) {
    	    return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .style("stroke","black")
        .style("pointer-events","none")
        .text(function(d) {return d.data.Quarter;});
    
    //Add dynamic tooltip
    arcs.selectAll(".pie")
        .on("mousemove",function(d) {
            d3.select(this).select("path")
                           .style("stroke","white")
                           .style("stroke-width","5px");
            tooltip3.style("opacity",1)
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("left",(d3.event.pageX)+"px")
                    .style("top",(d3.event.pageY)+"px")
                    .style("pointer-events","none")
                    .html("Box Office Gross: "+parseValue(d.data.Gross)+"<br>Percent of Total Box Office: "+parsePercent(d.data.Percent));
        })
        .on("mouseout",function() {
            d3.select(this)
              .select("path")
              .style("stroke","none");
            tooltip3.style("opacity",0);
        });
        
    //Add chart title
    svg3.append("text")
        .attr("class","title")
        .attr("y",pad.top/4)
        .text("2018 Movie Attendance by Quarter")
        .style("font-weight","bold");
    
});

