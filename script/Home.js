
//Selection filters
var filterDict = {};
filterDict["Postcode.No"]="";
filterDict["SPEED_ZONE"] = 0;
filterDict["SafetyCheck"] = "";
filterDict["DayNight"] = "";
filterDict["Atmosph.Cond.Desc"] = "";
filterDict["BadLight"] = "";
filterDict["Year"] = 0;
filterDict["SEVERITY"] = 0;
filterDict["Age.Group"] = "";
filterDict["Day.Week.Description"] = "";
filterDict["Road.User.Type.Desc"] = "";
filterDict["SEX"] = "";
filterDict["Accident.Type.Desc"] = "";


var dataCollectionFull;
var zipData;

var firstLoad = true;

//Create map, set its view and add it to div
var map = L.map('mapBox').setView([-37.686043, 145.12], 8);
//Add g back
mapLink = 
    '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
    }).addTo(map);
        
// Initialize the SVG layer
map._initPathRoot();   

// We simply pick up the SVG from the map object for operations
var mapSvg = d3.select("#mapBox").select("svg"), g = mapSvg.append("g");

var dataCollectionFilter = [];
var zipDataFiltered = [];

d3.json("Data/main.json", function(collection) {
  
  // Add a LatLng object to each item in the dataset
  dataCollectionFull = collection;
  d3.json("Data/zip.json", function(datazip) {
		zipData = datazip;

		
		dataCollectionFilter = dataCollectionFull;
		zipDataFiltered = zipData;
		updateMain();
		executeMain();
	})
 })


//Apply filters and proceed
function updateMain(){
	
	if(!firstLoad){

		var filterCond = [];
		if (filterDict["SPEED_ZONE"] != 0){

			filterCond.push("SPEED_ZONE");

		}
		if (filterDict["Postcode.No"]!=""){

			filterCond.push("Postcode.No");

		}
		if (filterDict["SafetyCheck"] != ""){

			filterCond.push("SafetyCheck");

		}
		if (filterDict["DayNight"]!=""){

			filterCond.push("DayNight");

		}
		if (filterDict["Atmosph.Cond.Desc"]!=""){

			filterCond.push("Atmosph.Cond.Desc");

		}
		if (filterDict["BadLight"] != ""){

			filterCond.push("BadLight");

		}
		if (filterDict["Year"]!=""){

			filterCond.push("Year");
			
		}
		if (filterDict["SEVERITY"]!=0){

			filterCond.push("SEVERITY");
			
		}
		if (filterDict["Age.Group"]!=""){

			filterCond.push("Age.Group");

		}
		if (filterDict["Day.Week.Description"] != ""){

			filterCond.push("Day.Week.Description");

		}
		if (filterDict["Road.User.Type.Desc"]!=""){

			filterCond.push("Road.User.Type.Desc");
			
		}
		if (filterDict["SEX"]!=""){

			filterCond.push("SEX");

		}
		if (filterDict["Accident.Type.Desc"] != ""){

			filterCond.push("Accident.Type.Desc");

		}

		if (filterCond.length == 0){
			//No filters

			dataCollectionFilter = dataCollectionFull;
			zipDataFiltered = zipData;

		}else{

			//filter accident data and zip data
			 zipDictTemp = {}
			 zipData.forEach(function(d) {
			    
			    zipDictTemp[d["Zipcode"]] = 0;

			 })
			dataCollectionFilter = [];
			for (var i = 0; i < dataCollectionFull.length; i++) {
				
				var successFlag = true;
				filterCond.forEach(function(filterKey) {
		    		
		    		//filter on selected
	    			if(dataCollectionFull[i][filterKey] != filterDict[filterKey]){

						successFlag = false;
					}
				  })
				if(successFlag){

					dataCollectionFilter.push(dataCollectionFull[i]);
					var zipVal = dataCollectionFull[i]["Postcode.No"];
					var valNum = zipDictTemp[zipVal];
					valNum = valNum + 1;
					zipDictTemp[zipVal] = valNum;

				}
				
			}

			//zipdata filtered
			zipDataFiltered = [];
			zipData.forEach(function(d) {
			
				if(zipDictTemp[d["Zipcode"]] > 0){
					zipDataFiltered.push(d);
				}
			})

		}
		d3.select("svg").remove();
		map.remove();
		map = L.map('mapBox').setView([-37.686043, 145.12], 8);
		//Add g back
		mapLink = 
		    '<a href="http://openstreetmap.org">OpenStreetMap</a>';
		L.tileLayer(
		    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		    attribution: '&copy; ' + mapLink + ' Contributors',
		    maxZoom: 18,
		    }).addTo(map);

		// Initialize the SVG layer
		map._initPathRoot();   

		// We simply pick up the SVG from the map object for operations
		mapSvg = d3.select("#mapBox").select("svg"),g = mapSvg.append("g");

		executeMain();
	}else{
		firstLoad = false;
	}
	
}


function executeMain(){

  
  zipAccidentCountdataDict = {}
  zipDataFiltered.forEach(function(d) {
    
    d.LatLng = new L.LatLng(d.Lat,
                d.Long)
    zipAccidentCountdataDict[d["Zipcode"]] = 0;

  })

  for (var i = 0; i < dataCollectionFilter.length; i++) {
    
    var zipVal = dataCollectionFilter[i]["Postcode.No"];
    var valNum = zipAccidentCountdataDict[zipVal];
    valNum = valNum + 1;
    zipAccidentCountdataDict[zipVal] = valNum;
  }
  
  //add Accident count to zip code dict
  zipDataFiltered.forEach(function(d) {
    d["AccidentCount"] = zipAccidentCountdataDict[d["Zipcode"]]
  })

  //Maintain Zip list in order
  // convert object into array
  var sortable=[];
  for(var key in zipAccidentCountdataDict)
    if(zipAccidentCountdataDict.hasOwnProperty(key))
      sortable.push([key, zipAccidentCountdataDict[key]]); // each item is an array in format [key, value]
  
  // sort items by value
  sortable.sort(function(a, b)
  {
    return b[1]-a[1]; // compare numbers and sort in descending
  });
  
  var sortedPostalCode = sortable.slice(0,150);

  //add top zip codes to list
  topZipCode = [];
  for(var i=0; i<sortedPostalCode.length; i++){
    topZipCode.push(sortedPostalCode[i][0]);
  }
  

  //Append anchor tag to dropdown
  var postalDropdownContentDiv = d3.select("#postalDropdown");
  //remove anchor tag first
  $("#postalDropdown a").remove();

  postalDropdownContentDiv.selectAll("a")
  .data(zipDataFiltered)
  .enter().append("a")
  .on('click', selectedPostalCode)
  .text(function(d){ return d["Zipcode"];});

  //filter final display zip
  topDataZip = [];
  zipDataFiltered.forEach(function(d) {
    
    for(var i=0; i<topZipCode.length; i++){
      if(d["Zipcode"] == topZipCode[i]){
        topDataZip.push(d);
        break;
      }
    }
    })
    var maptip = d3.tip()
    .attr('class', 'd3-tip map-tip')
    .offset([-10, -70])
    .html(function(d) {
      return "<strong>Zip Code:</strong>" + d["Zipcode"] + 
      "<br/> <strong>Accident Count:</strong>" + d["AccidentCount"];
    })
    g.call(maptip);

  //plot display
  var feature = g.selectAll("circle")
    .data(zipDataFiltered)
    .enter().append("circle")
    .style("stroke", "black")  
    .style("opacity", .6) 
    .style("fill", "red")
    .attr("r", 4)
    .attr("id",function(d){return ("zip_" + d["Zipcode"])})
    .style("cursor", "pointer")
    .on('mouseover', maptip.show)
    .on('mouseout', maptip.hide);;

  map.on("viewreset", update);
  update();

  function update() {
      feature.attr("transform", 
      function(d) { 

        return "translate("+ 
          map.latLngToLayerPoint(d.LatLng).x +","+ 
          map.latLngToLayerPoint(d.LatLng).y +")";
        }
      )
    }

  d3.json("Data/RectPos.json", function(rectzip) {
  
    for(var i=0; i<topDataZip.length; i++){

      topDataZip[i]["x1"] = rectzip[i]["x1"];
      topDataZip[i]["x2"] = rectzip[i]["x2"];
      topDataZip[i]["y1"] = rectzip[i]["y1"];
      topDataZip[i]["y2"] = rectzip[i]["y2"];
    }
    d3.selectAll('#postalCode svg').remove();
    var svg = d3.select("#postalCode")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    var svgRect = d3.select("#postalCode").select("svg");
    
    var rectTip = d3.tip()
    .attr('class', 'd3-tip map-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>Zip Code:</strong>" + d["Zipcode"] + 
      "<br/> <strong>Accident Count:</strong>" + d["AccidentCount"];
    })
    svgRect.call(rectTip);

    var rects = svgRect.selectAll("rect")
      .data(topDataZip)
      .enter()
      .append("rect")
      .attr("x", function(d){return d["x1"]})
      .attr("y", function(d){return d["y1"]})
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("width", function(d){return d["x2"]-d["x1"]})
      .attr("height", function(d){return d["y2"]-d["y1"]})
      .attr("fill", "#2985d2")
      .attr("stroke","black")
      .attr("stroke-width",3)
      .on('click', postalCodeSelected)
      .on('mouseover', rectTip.show)
      .on('mouseout', rectTip.hide);

    var textObj = svgRect.selectAll("text")
      .data(topDataZip)
      .enter()
      .append("text")
      .attr("x",function(nodes){ return nodes["x1"] + 15;})
      .attr("y",function(nodes){ return nodes["y1"] + 12;})
      .attr("font-family", "sans-serif")
      .attr("font-size", "9px")
      .attr("fill", "white")
      .text(function(nodes){ return nodes["Zipcode"];});
    })

  



//Graph needs to be populated
 d3.selectAll('#graphBox svg').remove();
 var graphSBox = d3.select("#graphBox").append("svg")
      .attr("width", "960")
      .attr("height", "500")
      .attr("class", "graphSvg");

 var graphSvg = d3.select(".graphSvg");
 var margin = {top: 20, right: 20, bottom: 30, left: 40};
 var width = +graphSvg.attr("width") - margin.left - margin.right;
 var height = +graphSvg.attr("height") - margin.top - margin.bottom;


var x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1),
	y = d3.scaleLinear().rangeRound([height, 0]);

  var graphG = graphSvg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   var graphItem = {};  
  dataCollectionFilter.forEach(function(dataFilter) {
    
	if (graphItem.hasOwnProperty(dataFilter["Day.Week.Description"])) {
	    
	    var countVal = graphItem[dataFilter["Day.Week.Description"]];
	    countVal = countVal + 1;
	    graphItem[dataFilter["Day.Week.Description"]] = countVal;

	} else {

	    graphItem[dataFilter["Day.Week.Description"]] = 1;

	}
  })

  //set graph value
  var graphList = [];
  var weekDays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  for(var i=0; i<weekDays.length; i++){
  	var subItem = {};

    if (graphItem.hasOwnProperty(weekDays[i])) {
  	 subItem["xVal"] = weekDays[i];
  	 subItem["yVal"] = graphItem[weekDays[i]];
  	 graphList.push(subItem);
    }
  }
  
  x.domain(graphList.map(function(d) { return d["xVal"]; }));
  y.domain([0, d3.max(graphList, function(d) { return d["yVal"]; })]);

  graphG.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

var tip = d3.tip()
  .attr('class', 'd3-tip graph-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Accident Count:</strong> <span>" + d["yVal"] + "</span>";
  })
  graphG.call(tip);

  graphG.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");
	
  graphG.selectAll(".bar")
    .data(graphList)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d["xVal"]); })
      .attr("y", function(d) { return y(d["yVal"]); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d["yVal"]); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);



   //Set bubble chart for age group
    //dictionary for bubble
    var bubbleItem = {};  
  	dataCollectionFilter.forEach(function(dataFilter) {
    
		if (bubbleItem.hasOwnProperty(dataFilter["Age.Group"])) {
		    
		    var subDict = bubbleItem[dataFilter["Age.Group"]];
		    var countVal = subDict["Freq"];
		    var popVal = subDict["PopulationSum"]

		    countVal = countVal + 1;
		    var mystring = dataFilter["censusPopulation"]
			mystring = mystring.replace(/,/g , "");
		    popVal = popVal + parseInt(mystring);

		    subDict["Freq"] = countVal;
		    subDict["PopulationSum"] = popVal;

		    bubbleItem[dataFilter["Age.Group"]] = subDict;

		} else {

			subData = {};
			subData["Freq"]=1;

			var mystring = dataFilter["censusPopulation"]
			mystring = mystring.replace(/,/g , "");
			subData["PopulationSum"] = parseInt(mystring);
		    bubbleItem[dataFilter["Age.Group"]] = subData;

		}
  	})

  	var ageList = [];
  	var ageKey = ["0-4","05-12","13-15","16-17","17-21","22-25","26-29","30-39","40-49","50-59","60-64","64-69","70+"];
  	for(var i=0; i<ageKey.length; i++){


  		var subItem = {};
  		var item = ageKey[i];

  		if (bubbleItem.hasOwnProperty(item)) {
  			
  			subItem["id"] = item;
	  		subItem["count"]=bubbleItem[item]["Freq"];
	  		subItem["PopulationMean"]= bubbleItem[item]["PopulationSum"]/bubbleItem[item]["Freq"];
	  		ageList.push(subItem);
  		}
  	}

  d3.selectAll('#ageBubbleChart svg').remove();
	var graphAgeBox = d3.select("#ageBubbleChart").append("svg")
	      .attr("width", "960")
	      .attr("height", "500")
	      .attr("class", "ageGraphSvg");

	 var ageGraphSvg = d3.select(".ageGraphSvg");
	 var marginAge = {top: 20, right: 20, bottom: 30, left: 40};
	 var ageWidth = +ageGraphSvg.attr("width") - marginAge.left - marginAge.right;
	 var ageHeight = +ageGraphSvg.attr("height") - marginAge.top - marginAge.bottom;


	var x = d3.scaleBand().rangeRound([0, ageWidth]).paddingInner(0.1),
		y = d3.scaleLinear().rangeRound([ageHeight, 0]);

	var graphAgeG = ageGraphSvg.append("g")
	    .attr("transform", "translate(" + marginAge.left + "," + marginAge.top + ")");

	x.domain(ageList.map(function(d) { return d["id"]; }));
  	y.domain([0, d3.max(ageList, function(d) { return d["count"]; })]);
  	graphAgeG.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + ageHeight + ")")
      .call(d3.axisBottom(x));

  	graphAgeG.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");
	
    var agetip = d3.tip()
    .attr('class', 'd3-tip graph-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>Accident Count:</strong> <span>" + d["count"] + "</span> <br/>"
      + "<strong>% Population involved:</strong> <span>" + (d["count"]*100/d["PopulationMean"]) + 
      "</span> <br/>";
    })

    graphG.call(agetip);
  	graphAgeG.selectAll(".bar")
      .data(ageList)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d["id"]); })
      .attr("y", function(d) { return y(d["count"]); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return ageHeight - y(d["count"]); })
      .on('mouseover', agetip.show)
      .on('mouseout', agetip.hide);

    

}

//reset map all circles to orginal
function resetMapToOrginal(){

  g.selectAll("circle").attr("r", 4);
  map.setView([-37.686043, 145.12], 8);
  document.getElementById("postalDropdown").classList.remove("show");

  //reset dictionary
  filterDict = {};
	filterDict["Postcode.No"]="";
	filterDict["SPEED_ZONE"] = 0;
	filterDict["SafetyCheck"] = "";
	filterDict["DayNight"] = "";
	filterDict["Atmosph.Cond.Desc"] = "";
	filterDict["BadLight"] = "";
	filterDict["Year"] = 0;
	filterDict["SEVERITY"] = 0;
	filterDict["Age.Group"] = "";
	filterDict["Day.Week.Description"] = "";
	filterDict["Road.User.Type.Desc"] = "";
	filterDict["SEX"] = "";
	filterDict["Accident.Type.Desc"] = "";

  //Reset speed zone Btn
  $(".speedBtn").removeClass("speedBtnSelected");

  //Reset gender Btn
  $(".genderBtn").removeClass("genderBtnSelected");

  //reset age
  $(".ageBtn").removeClass("ageBtnSelected");

  //Reset user type
  $(".userTypeBtn").removeClass("userTypeBtnSelected");

  //Reset atmospheric condition type
  $(".atmCondBtn").removeClass("atmTypeBtnSelected");

  //Reset day night btn selection
  $(".dayNightBtn").removeClass("dayNightBtnSelected");

  //Reset year
  document.getElementById("yearDisBtn").innerText= "All Year";

  //reset zip
  document.getElementById("zipDispBtn").innerText= "Postal code";

  //reset reason btn
  document.getElementById("reasonDisBtn").innerText= "All Reasons";

  //reset safety check
  $(".safetyCheckBtn").removeClass("safetyCheckBtnSelected");

  //change main map
  updateMain();
}

//selected zip code function with from drop down
function selectedPostalCode(){

  //reset first
  g.selectAll("circle").attr("r", 4);
  document.getElementById("postalDropdown").classList.remove("show");
  var dataObj = this["__data__"];

  //get map object
  map.setView([dataObj["Lat"], dataObj["Long"]], 12);
  
  var idNameString = "#zip_" + dataObj["Zipcode"];
  var focusCircle = d3.select(idNameString).attr("r", 20);

  
  document.getElementById("zipDispBtn").innerText= dataObj["Zipcode"];
  document.getElementById("postalCodeSearch").value = "";
}


//Select year from drop down
function selectedYear(yearVal){

	filterDict["Year"]=yearVal;

	if (yearVal == 0){
		document.getElementById("yearDisBtn").innerText= "All Year";
	}else{
		document.getElementById("yearDisBtn").innerText= yearVal.toString();
	}

	$("#yearDropdown").removeClass("show");
	document.getElementById("yearSearch").value= "";

	//reset operation
	updateMain();
}

//Select reason from drop down
function selectedReason(reasonVal){

	filterDict["Accident.Type.Desc"]=reasonVal;

	if (reasonVal == ''){
		document.getElementById("reasonDisBtn").innerText= "All Reasons";
	}else{
		document.getElementById("reasonDisBtn").innerText= reasonVal;
	}
	$("#reasonDropdown").removeClass("show");

	//reset operation
	updateMain();
}

//selected zip code value from tile
function postalCodeSelected(){

  g.selectAll("circle").attr("r", 4);

  var dataObj = this["__data__"];

  //change map center
  map.setView([dataObj["Lat"], dataObj["Long"]], 12);

  var idNameString = "#zip_" + dataObj["Zipcode"];
  var focusCircle = d3.select(idNameString).attr("r", 20);

  document.getElementById("zipDispBtn").innerText= dataObj["Zipcode"];

}

//speedZone Selected with Value
function speedZoneSelectedWithVal(speedValue){

  $(".speedBtn").removeClass("speedBtnSelected");
  filterDict["SPEED_ZONE"] = speedValue;
  
  var elementId = "#speed_" + speedValue.toString();
  $(elementId).addClass("speedBtnSelected");
  
  //reset operation
  updateMain();
}

//function safety check
function safetyCheckSelected(safetyVal){

	$(".safetyCheckBtn").removeClass("safetyCheckBtnSelected");
	
  filterDict["SafetyCheck"] = safetyVal;
	
	var elementId = "#safety_" + safetyVal;
	$(elementId).addClass("safetyCheckBtnSelected");
	
	//reset operation
	updateMain();
}

function ageSelectedWithVal(ageValue){

	$(".ageBtn").removeClass("ageBtnSelected");
	filterDict["Age.Group"] = ageValue;
	
	var elementId = "";
	if(ageValue == "70+"){

		elementId = "#age_70";
	}else{
		elementId = "#age_" + ageValue;
	}
	
	$(elementId).addClass("ageBtnSelected");
	
	//reset operation
	updateMain();
}

//gender Selected
function genderValSelected(genderVal){

	$(".genderBtn").removeClass("genderBtnSelected");
	
	filterDict["SEX"] = genderVal;
	
	var elementId = "#gender_" + genderVal;
	$(elementId).addClass("genderBtnSelected");
	
	//reset operation
	updateMain();
}

//usertype selected
function userTypeSelected(userTypeVal){

	$(".userTypeBtn").removeClass("userTypeBtnSelected");
	
	filterDict["Road.User.Type.Desc"] = userTypeVal;
	
	var elementId = "#" + userTypeVal;
	$(elementId).addClass("userTypeBtnSelected");
	
	//reset operation
	updateMain();
}

//Atmospheric condition selected
function atmTypeSelected(atmVal){

	$(".atmCondBtn").removeClass("atmTypeBtnSelected");
	
	filterDict["Atmosph.Cond.Desc"] = atmVal;
	
	var elementId = "";
	if(atmVal == "Low Vision"){

		elementId = "#Low";
	}else if(atmVal == "Strong winds"){
		elementId = "#wind";
	}else{
		elementId = "#" + atmVal;
	}

	$(elementId).addClass("atmTypeBtnSelected");
	
	//reset operation
	updateMain();
}

//Day Night condition selected
function dayNightSelected(dayNightVal){

	$(".dayNightBtn").removeClass("dayNightBtnSelected");
	
	filterDict["DayNight"] = dayNightVal;
	
	var elementId = "#" + dayNightVal;

	$(elementId).addClass("dayNightBtnSelected");
	
	//reset operation
	updateMain();
}

//Show postal dropdown contents
function postalDropDownBtnClicked(){
  document.getElementById("postalDropdown").classList.toggle("show");
}

//year drop down button clicked(){
function yearDropDownBtnClicked(){
	document.getElementById("yearDropdown").classList.toggle("show");
}

//reason button clicked
function reasonSearchBtnClicked(){
	document.getElementById("reasonDropdown").classList.toggle("show");
}

//Filter drop down field on serach field entry
function filterPostalCodeFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("postalCodeSearch");
    filter = input.value.toUpperCase();
    div = document.getElementById("postalDropdown");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

//Filter drop down year
function filterYearFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("yearSearch");
    filter = input.value.toUpperCase();
    div = document.getElementById("yearDropdown");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

//Filter drop down year
function filterReasonFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("reasonSearch");
    filter = input.value.toUpperCase();
    div = document.getElementById("reasonDropdown");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}
