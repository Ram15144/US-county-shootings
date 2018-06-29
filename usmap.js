var width=1200,height=500;
var json;
var vOneLS_county;
var vOneLS_count;
var projection=d3.geo.albersUsa()
              .translate([width/2,250])
              .scale([1000]);

var path=d3.geo.path()
          .projection(projection);

var svg=d3.select("body")
          .append("svg")
          .attr("width",width)
          .attr("height",height);
//svg.attr()


var mapping;
var t = d3.json("data/results.json",function(data1)
{
  mapping = data1;
});

var mapping_county_specific;
var t1 = d3.json("data/results3.json",function(data1)
{
  mapping_county_specific = data1;
});

//Defining shades
var c1="#fff5f0";
var c2="#fee0d2";
var c3="#fcbba1";
var c4="#fc9272";
var c5="#fb6a4a";
var c6="#ef3b2c";
var c7="#cb181d";
var c8="#99000d";

var tempColor;

var tooltip = d3.select('body').append('div')
  .style('position','absolute') // Follow in relationship with the page
  .style('padding', '0 10px')
  .style('background', 'white')
  .style('opacity', 0)

var us=d3.json("data/us.json",function(data){
  var features = topojson.feature(data, data.objects.counties).features;
  var cData = data;
  var us_counties_map=d3.tsv("data/us-county-names.tsv",function(county_names)
  {
    json = data;
  })
  var paths=svg.selectAll("path")
    .data(features);

  paths.enter()
    .append("path");

  paths.attr("d",path)
      .attr('fill',fill_color)
      .attr("stroke","black")
      .on("mouseover",handleMouseOver)
      .on("mouseout",handleMouseOut)
      .on("click",analyzeCounty)
});

var idx=0;
function fill_color(d)
{
  //console.log(d);
  var id1 = d["id"];
  //console.log(id_1);
  //var id_1 = temp["id"];
  var death_count=0;
  //var id_1 = cData.objects.counties.geometries[i]["id"];
  var id_1 = id1.toString().padStart(5,"0");
  if(id_1 in mapping)
  {
    //console.log(mapping[id1]["county_name"]+" : "+ mapping[id1]["crime_count"]+"\n");
    death_count=parseInt(mapping[id_1]["crime_count"]);
  }
  idx = idx + 1;
  if(death_count==0)
    return c1;
  else if(death_count>0 && death_count<=2)
    return c2;
  else if(death_count>2 && death_count<=5)
    return c3;
  else if(death_count>5 && death_count<=20)
    return c4;
  else if(death_count>20 && death_count<=30)
    return c5;
  else if(death_count>30 && death_count<=50)
    return c6;
  else if(death_count>50 && death_count<=80)
    return c7;
  else
    return c8;

  
}

function handleMouseOut(d,i)
{
  d3.select(this)
      //.transition().dely(500).duration(800)
      .style('opacity',1)
      .style('fill',tempColor);
  tooltip.transition()
      .style('opacity', 0);
}

var temp = "";
function handleMouseOver(d,i)
{
  var id1 = json.objects.counties.geometries[i]["id"];
  var id = json.objects.counties.geometries[i]["id"];
  var disp_data;
  var str = id1.toString().padStart(5,"0");
  
  

  if(str in mapping)
  {
    console.log(id1+" : "+mapping[str]["county_name"]+" : "+ mapping[str]["crime_count"]+"\n");
    disp_data = mapping[str]["county_name"]+" : "+ mapping[str]["crime_count"];
  }
  else
  {
    d3.tsv("data/us-county-names.tsv",
      function(error, data) 
      {
        for(var i=0;i<data.length;i++)
        {
          var temp_id = data[i]["id"];
          if(temp_id==id)
          {
            var temp_county = data[i]["name"];
            temp = temp_county;
            //console.log(id1+" : "+temp_county+" :  0 \n");
            disp_data = temp_county+" :  0";
          }
        }
      });
    console.log(id1+" : "+temp+" :  0 \n");
    disp_data = temp+" :  0";
    d_count = 0;
  }

  tooltip.transition()
      .style('opacity', 0.9);


    tooltip.html(disp_data)
      .style('left', (d3.event.pageX-20) + 'px')
      .style('top',  (d3.event.pageY+40) + 'px')
    tempColor = this.style.fill;
      
  d3.select(this)
    .style("fill","black");
}

var fCount=0;
var lat, lon;
var male_deaths=0, female_deaths=0;
var county_name;

function analyzeCounty(d,i)
{
  fCount=0;
  male_deaths=0;
  female_deaths=0;
  var id = json.objects.counties.geometries[i]["id"];
  //console.log(id);
  var str = id.toString().padStart(5,"0");
  if(str in mapping_county_specific)
  {
    female_deaths=mapping_county_specific[str]["f_deaths"];
    male_deaths=mapping_county_specific[str]["m_deaths"];
    fCount=mapping_county_specific[str]["crime_count"];
    county_name=mapping_county_specific[str]["county_name"];
    console.log("Male Deaths : "+male_deaths+"\n female_deaths : "+female_deaths+ "\n total :"+ fCount);
  }
  if(bar==1)
    svgBar.remove();
  LineBar();  
  
}

var startGap=d3.select("body").append("div").attr("class","new").attr("width",900).attr("height",100);
var svgBar;
var w = 200, bar=0;
function LineBar()
{   
    if(male_deaths!=0 && female_deaths!=0)
    {
      bar=1;
      svgBar=startGap.append("svg").attr("class","stacked-bar").attr("width",1250).attr("height",100);
      svgBar.append("g").attr("transform","translate(140,25)").append("text").attr("class","gender").attr("fill","#000000").text("Deaths in "+county_name+" county").attr('stroke','black')
      .attr('strokewidth','3')
      .attr('font-size',20);
      svgBar.append("g").attr("transform","translate(0,75)").append("text").attr("class","gender").attr("fill","#ffbaff").text("Female");
      svgBar.append("g").attr("transform","translate(0,100)").append("text").attr("class","gender").attr("fill","#000000").text(female_deaths+" deaths");
      svgBar.append("g").attr("transform","translate(75,55)").append("rect").attr("x","40").attr("y","0").attr("width",w/fCount * female_deaths).attr("height","20")
        .attr("fill","#fca671");
        //.on("mouseover", mouse_over_female)
        //.on("mouseout", mouse_out)
      svgBar.append("g").attr("transform","translate(75,55)").append("rect").attr("x",40+w/fCount * female_deaths).attr("y","0").attr("width",w/fCount * male_deaths).attr("height","20")
        .attr("fill","#6298ef");
        //.on("mouseover", mouse_over_male)
        //.on("mouseout", mouse_out)
      svgBar.append("g").attr("transform","translate(450,75)").append("text").attr("class","gender").attr("fill","#abbaff").text("Male");
      svgBar.append("g").attr("transform","translate(450,100)").append("text").attr("class","gender").attr("fill","#000000").text(male_deaths+" deaths");
  }
}
/*
function mouse_over_male()
{
  tooltip.transition()
      .style('opacity', 1);


    tooltip.html("Male Deaths :"+male_deaths)
      .style('left', (d3.event.pageX-20) + 'px')
      .style('top',  (d3.event.pageY+40) + 'px')
    tempColor = this.style.fill;
}
function mouse_over_female()
{
  tooltip.transition()
      .style('opacity', 1);


    tooltip.html("Female Deaths :"+female_deaths)
      .style('left', (d3.event.pageX-20) + 'px')
      .style('top',  (d3.event.pageY+40) + 'px')
    tempColor = this.style.fill;
}
function mouse_out()
{
  tooltip.transition()
      .style('opacity', 0);
}
*/
//console.log(us);

// Legend
var le_colors=["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"];
var le_val=["0 deaths","1-2 deaths","3-5 deaths","6-20 deaths","21-30 deaths","31-50 deaths","51-80 deaths",">81 deaths"];

for(var i =0 ;i<8;i++)
{
  d3.select('svg')
    .append('circle')
    .attr('cx','250') 
    .attr('cy','100')
    .attr('r','20')
    .text("Hello")
    .style('fill', le_colors[i])
    .transition()
    .attr("transform", "translate(800,"+i*50+" )").duration(1000); 

  d3.select('svg')
    .append('text')
    .attr('x','250')
    .attr('y','105')
    .attr('stroke','black')
    .attr('strokewidth','3')
    .attr('font-size',20)
    .text(le_val[i]) 
    .transition()
    .attr("transform", "translate(830,"+i*50+" )").duration(1000); 
}