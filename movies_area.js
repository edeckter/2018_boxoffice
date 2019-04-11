var padding={top: 100, bottom: 50, left: 50, right: 50};
var h=600;
var w=1000;
var plot_width=w-padding.left-padding.right;
var plot_height=h-padding.top-padding.bottom;

//Scaling function for x-axis
var xScale=d3.scaleTime()
             .range([padding.left,w-padding.right]);
            
//Scaling function for y-axis            
var yScale=d3.scaleLinear()
             .range([h-padding.bottom,padding.top]);           
             
//Create x-axis
var xAxis=d3.axisBottom()
            .scale(xScale)
            .tickFormat(d3.timeFormat("%b %d"));
                        
//Create y-axis
var yAxis=d3.axisLeft()
            .scale(yScale)
            .tickFormat(d3.format("$.2s"));          
           
//Create color palette
var colorPalette=["#FE4365","#FC9D9A","#F9CDAD","#C8C8A9","#83AF9B","#ECD078","#D95B43","#C02942","#542437","#53777A"];

//Create svg and tie to div
var svg1=d3.select("#viz1")
          .append("svg")
          .attr("class","svg")
          .attr("id","area_chart")
          .attr("width",w)
          .attr("height",h);
          
//Format date for tooltip
var fullDateFormat=d3.timeFormat("%A %B %d");
var dayOfYear=d3.timeFormat("%j%");
var parseGross=d3.format("$,d")

// Define the div for the tooltip
var tooltip1=d3.select("#viz1")
            .append("div")	
            .attr("class","tooltip")
            .style("opacity",0)
            .style("background-color", "white")
            .style("padding", "5px")
            .style("position","absolute");
          
d3.csv("data/daily_gross.csv").then(function(daily_gross) {
    daily_gross.forEach(function(d) {
        d.date=new Date(d.date);
        d.G=parseFloat(d.G);
        d.PG=parseFloat(d.PG);
        d.R=parseFloat(d.R);
        d['PG-13']=parseFloat(d['PG-13']);
        d['Not Rated']=parseFloat(d['Not Rated']);
        d['20th Century Fox']=parseFloat(d['20th Century Fox']);
        d['All Others']=parseFloat(d['All Others']);
        d['Lionsgate']=parseFloat(d['Lionsgate']);
        d['Paramount Pictures']=parseFloat(d['Paramount Pictures']);
        d['Sony Pictures']=parseFloat(d['Sony Pictures']);
        d['STX Entertainment']=parseFloat(d['STX Entertainment']);
        d['Universal']=parseFloat(d['Universal']);
        d['Walt Disney']=parseFloat(d['Walt Disney']);
        d['Warner Bros.']=parseFloat(d['Warner Bros.']);
        d.daily_total=parseFloat(d.daily_total);
    });

    //Draw buttons
    var mpaa=svg1.append("g")
                        .attr("class","button")
                        .style("cursor","pointer")
                        .on("click",function() {
                            button=1;
                            d3.select("#mpaa").attr("fill","gray");
                            d3.select("#distributors").attr("fill","white");
                            return toggle_keys();});
    var distributors=svg1.append("g")
                        .attr("class","button")
                        .style("cursor","pointer")
                        .on("click",function() {
                            button=2;
                            d3.select("#distributors").attr("fill","gray");
                            d3.select("#mpaa").attr("fill","white");
                            return toggle_keys();});
                            
    var reset_button=svg1.append("g")
                        .attr("class","button")
                        .style("cursor","pointer")
                        .on("click",function() {
                            var reset=1;
                            zooming(reset);
                        });
                        
    //Set indicator
    var button=1;
    var keys=["G","PG","PG-13","R","Not Rated"];
    var stack=d3.stack()
                .keys(keys)
                .order(d3.stackOrderDescending);
    var series=stack(daily_gross);

    //Add xScale domain
    xScale.domain([d3.min(daily_gross,function(d) {return d.date;}),
                d3.max(daily_gross,function(d) {return d.date;})])
           .nice();
                
    //Add yScale domain
    yScale.domain([0,d3.max(daily_gross,function(d) {return d.daily_total;})])
          .nice();
    
    //Display x-axis
    svg1.append("g")
    .attr("class","axis")
    .attr("id","x-axis")
    .attr("transform","translate(0,"+(h-padding.bottom)+")")
    .call(xAxis);
    
    //Display y-axis
    svg1.append("g")
        .attr("class","axis")
        .attr("id","y-axis")
        .attr("transform","translate("+padding.left+",0)")
        .call(yAxis);
        
    //Add chart title
    svg1.append("g")
       .attr("class","title")
       .append("text")
       .text("2018 Domestic Box Office Grouped by MPAA Rating")
       .attr("x",padding.left)
       .attr("y",padding.top/6)
       .attr("text-anchor","start")
       .attr("dominant-baseline","central")
       .attr("font-weight","bold"); 

    //Add chart subtitle
    svg1.append("g")
       .attr("class","subtitle")
       .append("text")
       .text("Click and drag on the chart to zoom")
       .attr("x",padding.left)
       .attr("y",padding.top/3)
       .attr("text-anchor","start")
       .attr("dominant-baseline","central");
    
    //Area function
    var area=d3.area()
               .x(function(d) {return xScale(d.data.date);})
               .y0(function(d) {return yScale(d[0]);})
               .y1(function(d) {return yScale(d[1]);});

    //Create clipping path for area chart                  
    svg1.append("clipPath")
       .attr("id","clip")
       .append("rect")
       .attr("x",padding.right)
       .attr("y",padding.top)
       .attr("width",plot_width)
       .attr("height",plot_height);
    
    //Draw area chart
    var area_chart=svg1.append("g")
                      .attr("class","areas")
                      .attr("clip-path","url(#clip)")
     
    area_chart.selectAll("path")
              .data(series)
              .enter()
              .append("path")
              .attr("d",area)
              .on("mousemove",function(d) {
                  var date=xScale.invert(d3.mouse(this)[0])
                  date=parseFloat(dayOfYear(date))-1;
       
                  tooltip1.style("opacity",1)
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("left",(d3.event.pageX)+"px")
                        .style("top",(d3.event.pageY)+"px")
                        .style("pointer-events","none")
                        .html("Date: <b>"+fullDateFormat(xScale.invert(d3.mouse(this)[0]))+"</b><br>"+d.key+" Daily Gross: "+parseGross(d[date].data[d.key])
                                +"<br>Total Daily Gross: "+parseGross(d[date].data.daily_total));  
              })
              .on("mouseout",function() {
                tooltip1.style("opacity",0)
               .style("border", "none");
              })
              .attr("fill",function(d,i) {return colorPalette[i];});
              //.append("title")
              //.text(function(d) {return d.button;});
              
    
    //Draw buttons
    mpaa.append("rect")
                .attr("id","mpaa")
                .attr("x",padding.left+50)
                .attr("y",padding.top/2)
                .attr("width",150)
                .attr("height",padding.top/4)
                .attr("fill","grey")
                .attr("stroke","black");
    distributors.append("rect")
                .attr("id","distributors")
                .attr("x",padding.left+210)
                .attr("y",padding.top/2)
                .attr("width",150)
                .attr("height",padding.top/4)
                .attr("fill","white")
                .attr("stroke","black");
    reset_button.append("rect")
                .attr("id","reset")
                .attr("x",w-padding.left-80)
                .attr("y",padding.top/2)
                .attr("width",100)
                .attr("height",padding.top/4)
                .attr("fill","white")
                .attr("stroke","black");
    //Add text to key buttons
    mpaa.append("text")
                .attr("x",padding.left+125)
                .attr("y",5*padding.top/8)
                .attr("text-anchor","middle")
                .attr("dominant-baseline","central")
                .text("MPAA Ratings");
    distributors.append("text")
                .attr("x",padding.left+285)
                .attr("y",5*padding.top/8)
                .attr("text-anchor","middle")
                .attr("dominant-baseline","central")
                .text("Film Distributor");
    reset_button.append("text")
                .attr("x",w-padding.left-30)
                .attr("y",5*padding.top/8)
                .attr("text-anchor","middle")
                .attr("dominant-baseline","central")
                .text("Reset Zoom");            
    var toggle_keys=function() {
        //Set keys
        if (button==1) {
            var keys=["G","PG","PG-13","R","Not Rated"];
            //Update chart title
            svg1.select(".title")
               .select("text")
               .text("2018 Domestic Box Office Grouped by MPAA Rating");
        };
        if (button==2) {
            var keys=["20th Century Fox","All Others","Lionsgate","Paramount Pictures","Sony Pictures","STX Entertainment","Universal","Walt Disney","Warner Bros."];
            //Update chart title
            svg1.select(".title")
               .select("text")
               .text("2018 Domestic Box Office Grouped by Top Film Distributors");
        };
        
        stack=d3.stack()
                    .keys(keys)
                    .order(d3.stackOrderDescending);
        series=stack(daily_gross);
        
        //Update area chart
        var update=area_chart.selectAll("path")
                             .data(series)
        
        update.enter()
              .append("path")
              .merge(update)
              .attr("d",area)
              .on("mousemove",function(d) {
                  var date=xScale.invert(d3.mouse(this)[0])
                  date=parseFloat(dayOfYear(date))-1;
                  
                  tooltip1.style("opacity",1)
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("left",(d3.event.pageX)+"px")
                        .style("top",(d3.event.pageY)+"px")
                        .style("pointer-events","none")
                        .html("Date: <b>"+fullDateFormat(xScale.invert(d3.mouse(this)[0]))+"</b><br>"+d.key+" Daily Gross: "+parseGross(d[date].data[d.key])
                                +"<br>Total Daily Gross: "+parseGross(d[date].data.daily_total));  
              })
              .on("mouseout",function() {
                tooltip1.style("opacity",0)
               .style("border", "none");
              })
              .attr("fill",function(d,i) {return colorPalette[i];});
              
        update.exit().remove();
        

    };
    
    //Add zoom by rectangle function
    var zooming=function(reset) {
        if (reset==1) {
            var new_min=d3.min(daily_gross,function(d) {return d.date;});
            var new_max=d3.max(daily_gross,function(d) {return d.date;});
        } else {
            var x1=parseFloat(d3.select(".zoom").attr("x"));
            var x2=parseFloat(d3.select(".zoom").attr("width"));
            var new_min=xScale.invert(x1);
            var new_max=xScale.invert(x1+x2);
        };
        //Update x-scale
        xScale.domain([new_min,new_max])
              .nice();

        //Update y-scale
        var filtered_data=daily_gross.filter(function(d) {return d.date<=new_max && d.date>=new_min;});
        yScale.domain([0,d3.max(filtered_data,function(d) {return d.daily_total;})])
          .nice();
          
        /*var stack=d3.stack()
                .keys(keys)
                .order(d3.stackOrderDescending);
        var series=stack(daily_gross);*/
       
        //Redraw area chart       
        area_chart.selectAll("path")
                  .attr("d",area);
               
        //Redraw axes
        svg1.select("#x-axis")
           .call(xAxis)
        svg1.select("#y-axis")        
           .call(yAxis);
    };
    
    svg1.on("mousedown", function() {
            d3.event.preventDefault(); // disable text dragging
            var e=this;
            var origin = d3.mouse(e);
            var rect = svg1.append("rect").attr("class", "zoom");
            //d3.select("body").classed("noselect", true);
            origin[0] = Math.max(0, Math.min(plot_width, origin[0]));
            origin[1] = Math.max(0, Math.min(plot_height, origin[1]));
            d3.select(window)
              .on("mousemove",mousemove)
              .on("mouseup",function() {
                  d3.select(window).on("mousemove",null).on("mouseup",null);
                  var m=d3.mouse(e);
                  m[0] = Math.max(0, Math.min(plot_width+padding.left, m[0]));
                  m[1] = Math.max(0, Math.min(plot_height+padding.top, m[1]));
                  if (m[0] !== origin[0] && m[1] !== origin[1]) {
                      zooming(0);
                  }
                  rect.remove();
               });
            
            function mousemove() {
                var m=d3.mouse(e);
                m[0] = Math.max(0, Math.min(plot_width+padding.left, m[0]));
                m[1] = Math.max(0, Math.min(plot_height+padding.top, m[1]));
                rect.attr("x", Math.min(origin[0], m[0]))
                    .attr("y", Math.min(origin[1], m[1]))
                    .attr("width", Math.abs(m[0] - origin[0]))
                    .attr("height", Math.abs(m[1] - origin[1]))
                    .attr("fill","none")
                    .attr("stroke","blue");
            }
    });
});
            
