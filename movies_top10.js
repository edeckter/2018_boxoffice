var bar_padding={top: 50, bottom: 50, left: 50, right: 50};
var bh=600;
var bw=1000;
var plotWidth=bw-bar_padding.left-bar_padding.right;
var plotHeight=bh-bar_padding.top-bar_padding.bottom;

//Format date for tooltip
var DateFormat=d3.timeFormat("%A %B %d");
var parseGrossLong=d3.format("$,d");
var parseGrossShort=function(val) {
    if (val > 1e6) {return d3.format("$,.2s")(val).replace("G","B");}
    else {return d3.format("$,.2s");}
}
var parseTheaters=d3.format(",d");
var parseRating=d3.format(".1f");

//Create svg
var svg2=d3.select("#viz2")
          .append("svg")
          .attr("height",bh)
          .attr("width",bw)
          .attr("class","svg")
          .attr("id","bar_chart");
          
//Create x-scale
var widthScale=d3.scaleBand()
             .rangeRound([bar_padding.left,bar_padding.left+plotWidth])
             .paddingInner(0.05);

//Create y-scale
var heightScale=d3.scaleLinear()
             .range([plotHeight+bar_padding.top,bar_padding.top]);
             
// Define the div for the tooltip
var tooltip2=d3.select("#viz2")
            .append("div")	
            .attr("id","tooltip")
            .style("opacity",0)
            .style("background-color", "white")
            .style("padding", "5px")
            .style("position","absolute");

//Load data
d3.csv("data/ranks.csv").then(function(ranks) {
    ranks.forEach(function(d) {
        d.Rank=parseInt(d.Rank);
        d.IMDBid=parseInt(d.IMDBid);
        d.movie=d.movie;
        d.distributor=d.distributor;
        d.IMDBRating=parseFloat(d.IMDBRating);
        d.MPAA=d.MPAA;
        d.RunTime=parseInt(d.RunTime);
        d.movie_gross=parseFloat(d.movie_gross);
        d.max_theaters=parseInt(d.max_theaters);
        d.days=parseInt(d.days);
        d.top_distributors=d.top_distributors;
        d.distributor_gross=parseFloat(d.distributor_gross);
        d.movies_released=parseInt(d.movies_released);
        d.top_days=new Date(d.top_days);
        d.days_gross=parseFloat(d.days_gross);
        d.top_movie=d.top_movie;
        d.days_released=parseInt(d.days_released);
    });
    
    var key=function(d) {return d.Rank;};
    
    //Create drop-down menu
    var menu2=d3.select("#viz2_dropdown")
               .append("select")
               .attr("id","bar_control")
               .on("change",function() {
                   return updateBars();
               });
               
    menu2.selectAll("option")
        .data(["Movies","Film Distributors","Days"])
        .enter()
        .append("option")
        .attr("id",function(d) {return d;})
        .text(function(d) {return d;});
        
    //Set initial key
    var option="Movies";
    
    //Update scale domains
    widthScale.domain(d3.range(ranks.length));
          
    heightScale.domain([0,d3.max(ranks,function(d) {return d.movie_gross;})])
          .nice();
    
    //Draw axis line and label bars
    svg2.append("line")
       .attr("x1",bar_padding.left)
       .attr("x2",bar_padding.left+plotWidth)
       .attr("y1",plotHeight+bar_padding.top)
       .attr("y2",plotHeight+bar_padding.top)
       .style("stroke","black");
       
    svg2.append("g")
       .attr("class","bars")
       .selectAll("rect")
       .data(ranks,key)
       .enter()
       .append("rect")
       .attr("x",function(d,i) {return widthScale(i);})
       .attr("y",function(d) {return heightScale(d.movie_gross);})
       .attr("width",widthScale.bandwidth())
       .attr("height",function(d) {return plotHeight+bar_padding.top-heightScale(d.movie_gross);})
       .style("fill","#53777A")
       .on("mousemove",function(d) {
            d3.select(this).style("fill","#83AF9B");
            tooltip2.style("opacity",1)
                   .style("border", "solid")
                   .style("border-width", "2px")
                   .style("border-radius", "5px")
                   .style("left",(d3.event.pageX)+"px")
                   .style("top",(d3.event.pageY)+"px")
                   .style("pointer-events","none")
                   .html("Movie Title: <b>"+d.movie+"</b><br>Distributor: "+d.distributor+"<br>Total 2018 Gross: "+parseGrossLong(d.movie_gross)+
                    "<br>MPAA Rating: "+d.MPAA+
                    "<br>Maximum Number of Simultaneous Theaters: "+parseTheaters(d.max_theaters)+"<br>Total Days in Theaters: "+d.days+
                    "<br>IMDB Rating: "+parseRating(d.IMDBRating));
               })
        .on("mouseout",function(d) {
            d3.select(this).style("fill","#53777A");
            tooltip2.style("opacity",0)
                   .style("border", "none");
        });
        //Add labels
        svg2.append("g")
           .attr("class","labels")
           .selectAll("text")
           .data(ranks)
           .enter()
           .append("text")
           .attr("x",function(d,i) {return widthScale(i)+widthScale.bandwidth()/2;})
           .attr("y",function(d) {return heightScale(d.movie_gross)-15;})
           .text(function(d) {return parseGrossShort(d.movie_gross);})
           .attr("text-anchor","middle")
           .attr("dominant-baseline","central");
           
        //Add chart title
        svg2.append("g")
            .attr("class","title")
            .append("text")
            .text("Superheroes and Action Dominated 2018")
            .attr("x",bar_padding.left)
            .attr("y",bar_padding.top/2)
            .attr("text-anchor","start")
            .attr("dominant-baseline","central")
            .attr("font-weight","bold");
        
        //Add comments to comments div
        d3.select("#bar_comments")
          .html("Disney released the top three movies of 2018:<br><ul><li><i><a href='https://www.imdb.com/title/tt1825683' target='_blank'>Black Panther</a></li><li><a href='https://www.imdb.com/title/tt4154756' target='_blank'>Avengers: Infinity War</a></li><li><a href='https://www.imdb.com/title/tt3606756' target='_blank'>Incredibles 2</a></i></li></ul><br><br><i>Black Panther</i> was a critical and commercial success for Disney's Marvel division, winning Marvel its first 3 Oscars and earning a Best Picture nomination for the film.<br><br><i>Avengers: Infinity War</i> was the culmination of 10 years of Marvel superhero movies, which began with 2008's <i>Iron Man</i>.<br><br><i>Incredibles 2</i> was the long-awaited sequel to Pixar's 2004 hit <i>The Incredibles</i>.<br><br>In total, Disney released half of the top 10 movies of the year.");
    
    
    //Set columns and descriptors for each key
    var updateBars=function() {
    var option=d3.select("select#bar_control").property("value");
    var bars=svg2.selectAll("rect");
    switch(option) {
        case "Movies":
            //Update y-scale
            heightScale.domain([0,d3.max(ranks,function(d) {return d.movie_gross;})])
                  .nice();
            
            bars.transition()
               .duration(500)
               .attr("y",function(d) {return heightScale(d.movie_gross);})
               .attr("height",function(d) {return plotHeight+bar_padding.top-heightScale(d.movie_gross);});
            bars.on("mousemove",function(d) {
                   d3.select(this).style("fill","#83AF9B");
                   tooltip2.style("opacity",1)
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("left",(d3.event.pageX)+"px")
                        .style("top",(d3.event.pageY)+"px")
                        .style("pointer-events","none")
                        .html("Movie Title: <b>"+d.movie+"</b><br>Distributor: "+d.distributor+"<br>Total 2018 Gross: "+parseGrossLong(d.movie_gross)+
                        "<br>MPAA Rating: "+d.MPAA+
                        "<br>Maximum Number of Simultaneous Theaters: "+parseTheaters(d.max_theaters)+"<br>Total Days in Theaters: "+d.days+
                        "<br>IMDB Rating: "+parseRating(d.IMDBRating));
               })
               .on("mouseout",function(d) {
                   d3.select(this).style("fill","#53777A");
                   tooltip2.style("opacity",0)
                          .style("border", "none");
               });
               //Add labels
               svg2.select(".labels")
                  .selectAll("text")
                  .transition()
                  .duration(500)
                  .attr("y",function(d) {return heightScale(d.movie_gross)-15;})
                  .text(function(d) {return parseGrossShort(d.movie_gross);});
                //Update comments
                d3.select("#bar_comments")
                  .html("Disney released the top three movies of 2018:<br><ul><li><i><a href='https://www.imdb.com/title/tt1825683' target='_blank'>Black Panther</a></li><li><a href='https://www.imdb.com/title/tt4154756' target='_blank'>Avengers: Infinity War</a></li><li><a href='https://www.imdb.com/title/tt3606756' target='_blank'>Incredibles 2</a></i></li></ul><br><br><i>Black Panther</i> was a critical and commercial success for Disney's Marvel division, winning Marvel its first 3 Oscars and earning a Best Picture nomination for the film.<br><br><i>Avengers: Infinity War</i> was the culmination of 10 years of Marvel superhero movies, which began with 2008's <i>Iron Man</i>.<br><br><i>Incredibles 2</i> was the long-awaited sequel to Pixar's 2004 hit <i>The Incredibles</i>.<br><br>In total, Disney released half of the top 10 movies of the year.");
                //Update chart title
                svg2.select(".title")
                    .select("text")
                    .text("Superheroes and Action Dominated 2018");
            break;
        case "Film Distributors":
            //Update y-scale
            heightScale.domain([0,d3.max(ranks,function(d) {return d.distributor_gross;})])
                  .nice();
            
            bars.transition()
               .duration(500)
               .attr("y",function(d) {return heightScale(d.distributor_gross);})
               .attr("height",function(d) {return plotHeight+bar_padding.top-heightScale(d.distributor_gross);});
            bars.on("mousemove",function(d) {
                   d3.select(this).style("fill","#83AF9B");
                   tooltip2.style("opacity",1)
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("left",(d3.event.pageX)+"px")
                        .style("top",(d3.event.pageY)+"px")
                        .style("pointer-events","none")
                        .html("Distributor: <b>"+d.top_distributors+"</b><br>Total 2018 Gross: "+parseGrossLong(d.distributor_gross)+
                        "<br>Movies Released in 2018: "+d.movies_released);
               })
               .on("mouseout",function(d) {
                   d3.select(this).style("fill","#53777A");
                   tooltip2.style("opacity",0)
                          .style("border", "none");
               });
               //Add labels
               svg2.select(".labels")
                  .selectAll("text")
                  .transition()
                  .duration(500)
                  .attr("y",function(d) {return heightScale(d.distributor_gross)-15;})
                  .text(function(d) {return parseGrossShort(d.distributor_gross);});
                //Update comments
                d3.select("#bar_comments")
                  .html("<span style='color:#53777A; font-weight:bold; font-size:20px'>Disney</span> films received a whopping <span style='color:#53777A; font-weight:bold; font-size:20px'>27%</span> of the US box office in 2018.  This market share is only expected to grow with Disney's takeover of 20th Century Fox (number 5 with $1.1B in box office receipts in 2018).<br><br>Warner Brothers was second, with 16% of the box office, but needed to release more than twice as many films as Disney to reach this total.  The top 5 distributors took in 78% of the total box office and the top 9 took in 90% of the total, despite 75 different distributors releasing films in the US market in 2018.");
                //Update chart title
                svg2.select(".title")
                    .select("text")
                    .text("Disney Topped 2018's Box Office with Nearly a Third of the Total Take");
            break;
        case "Days":
            //Update y-scale
            heightScale.domain([0,d3.max(ranks,function(d) {return d.days_gross;})])
                  .nice();
            
            bars.transition()
               .duration(500)
               .attr("y",function(d) {return heightScale(d.days_gross);})
               .attr("height",function(d) {return plotHeight+bar_padding.top-heightScale(d.days_gross);});
            bars.on("mousemove",function(d) {
                   d3.select(this).style("fill","#83AF9B");
                   tooltip2.style("opacity",1)
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("left",(d3.event.pageX)+"px")
                        .style("top",(d3.event.pageY)+"px")
                        .style("pointer-events","none")
                        .html("Date: <b>"+DateFormat(d.top_days)+"</b><br>Daily Gross: "+parseGrossLong(d.days_gross)+
                        "<br>Top Movie of the Day: <i>"+d.top_movie+
                        "</i><br>Release Day of Top Movie: "+d.days_released);
               })
               .on("mouseout",function(d) {
                   d3.select(this).style("fill","#53777A");
                   tooltip2.style("opacity",0)
                          .style("border", "none");
               });
               //Add labels
               svg2.select(".labels")
                  .selectAll("text")
                  .transition()
                  .duration(500)
                  .attr("y",function(d) {return heightScale(d.days_gross)-15;})
                  .text(function(d) {return parseGrossShort(d.days_gross);});
            //Update comments
                d3.select("#bar_comments")
                  .html("Only 4 different movies took the top box office spot on the 10 biggest box office days of the year.<br><br>The top 8 spots went to movies in their first or second day in theaters, with the top 2 spots going to <i>Avengers: Infinity War</i> on its first two days.");
            //Update chart title
                svg2.select(".title")
                    .select("text")
                    .text("Marvel Kicked Off the Summer Movie Season by Topping the Box Office on Two Consecutive Days");
            break;
    };
    
    };   
});