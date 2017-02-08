/*
* Licensed to the Apache Software Foundation (ASF) under one or more
* contributor license agreements.  See the NOTICE file distributed with
* this work for additional information regarding copyright ownership.
* The ASF licenses this file to You under the Apache License, Version 2.0
* (the "License"); you may not use this file except in compliance with
* the License.  You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
$(document).ready(function() {
  $.ajaxSetup({
    async: false
  });
  getMaster();
  getZK();
  getIngestRate();
  getScanEntries();
  getIngestByteRate();
  getQueryByteRate();
  getLoadAverage();
  getLookups();
  getMinorCompactions();
  getMajorCompactions();
  getIndexCacheHitRate();
  getDataCacheHitRate();
  $.ajaxSetup({
    async: true
  });
  createMasterTable();
  createZKTable();
  makePlots();
});

function createMasterTable() {
  var data = JSON.parse(sessionStorage.master);
  var items = [];
  items.push("<tr><th colspan='2'><a href='/master'>Accumulo&nbsp;Master</a></th></tr>");
  items.push("<tr><td class='left'><a href='/tables'>Tables</a></td><td class='right'>" + bigNumberForQuantity(data.tables) + "</td></tr>");
  items.push("<tr><td class='left'><a href='/tservers'>Tablet&nbsp;Servers</a></td><td class='right'>" + bigNumberForQuantity(data.totalTabletServers) + "</td></tr>");
  items.push("<tr><td class='left'><a href='/tservers'>Dead&nbsp;Tablet&nbsp;Servers</a></td><td class='right'>" + bigNumberForQuantity(data.deadTabletServersCount) + "</td></tr>");
  items.push("<tr><td class='left'>Tablets</td><td class='right'>" + bigNumberForQuantity(data.tablets) + "</td></tr>");
  items.push("<tr><td class='left'>Entries</td><td class='right'>" + bigNumberForQuantity(data.numentries) + "</td></tr>");
  items.push("<tr><td class='left'>Lookups</td><td class='right'>" + bigNumberForQuantity(data.lookups) + "</td></tr>");
  items.push("<tr><td class='left'>Uptime</td><td class='right'>" + timeDuration(data.uptime) + "</td></tr>");

  $("<table/>", {
    html: items.join(""),
    class: "table table-bordered table-striped table-condensed"
  }).appendTo("#master");
}

function createZKTable() {
  var data = JSON.parse(sessionStorage.zk);
  var items = [];
  items.push("<tr><th colspan='3'>Zookeeper</th></tr>");
  items.push("<tr><th>Server</th><th>Mode</th><th>Clients</th></tr>");
  if (data.zkServers.length === 0) {
    items.push("<td class='center' colspan='3'><i>No Zookeepers</i></td>");
  } else {
    $.each(data.zkServers, function(key, val) {
      items.push("<tr class='highlight'><td class='left'>" + val.server + "</td>");
      items.push("<td class='left'>" + val.mode + "</td>");
      items.push("<td class='right'>" + val.clients + "</td></tr>");
    });
  }
  
  $("<table/>", {
   html: items.join(""),
   class: "table table-bordered table-striped table-condensed"
  }).appendTo("#zookeeper");
}

//// Overview plot creation functions

function makePlots() {
  var ingestRate = {"ingestRate":[]};
  $.each(JSON.parse(sessionStorage.ingestRate), function(key, val) {
    var time = convertToTime(val.first);
    ingestRate.ingestRate.push({"x": val.first, "y": val.second});
  });
  makePlot("ingest_entries", ingestRate);
  
  var scanEntries = {"Read":[], "Returned":[]};
  $.each(JSON.parse(sessionStorage.scanEntries), function(key, val) {
    $.each(val.second, function(key2, val2) {
      scanEntries[val.first].push({"x": val2.first, "y": val2.second});
    });
               
  });
  makePlot("scan_entries", scanEntries);
  
  var ingestMB = {"ingestMB":[]};
  $.each(JSON.parse(sessionStorage.ingestMB), function(key, val) {
    ingestMB.ingestMB.push({"x": val.first, "y": val.second});
  });
  makePlot("ingest_mb", ingestMB);
  
  var queryMB = {"queryMB":[]};
  $.each(JSON.parse(sessionStorage.queryMB), function(key, val) {
  queryMB.queryMB.push({"x": val.first, "y": val.second});
  });
  makePlot("scan_mb", queryMB);

  var loadAvg = {"loadAvg":[]};
  $.each(JSON.parse(sessionStorage.loadAvg), function(key, val) {
    loadAvg.loadAvg.push({"x": val.first, "y": val.second});
  });
  makePlot("load_avg", loadAvg);
  
  var lookups = {"lookups":[]};
  $.each(JSON.parse(sessionStorage.lookups), function(key, val) {
    lookups.lookups.push({"x": val.first, "y": val.second});
  });
  makePlot("seeks", lookups);
  
  var minor = {"minor":[]};
  $.each(JSON.parse(sessionStorage.minorCompactions), function(key, val) {
    minor.minor.push({"x": val.first, "y": val.second});
  });
  makePlot("minor", minor);
  
  var major = {"major":[]};
  $.each(JSON.parse(sessionStorage.majorCompactions), function(key, val) {
    major.major.push({"x": val.first, "y": val.second});
  });
  makePlot("major", major);
  
  var indexCache = {"indexCache":[]};
  $.each(JSON.parse(sessionStorage.indexCache), function(key, val) {
    indexCache.indexCache.push({"x": val.first, "y": val.second});
  });
  makeDotPlot("index_cache", indexCache);
  
  var dataCache = {"dataCache":[]};
  $.each(JSON.parse(sessionStorage.dataCache), function(key, val) {
    dataCache.dataCache.push({"x": val.first, "y": val.second});
  });
  makeDotPlot("data_cache", dataCache);

}

function convertToTime(date) {
  var date = new Date(date)
  var time = date.getUTCHours() + ":" + date.getUTCMinutes();
  
  return time;
}

function makeDotPlot(plotID, object) {
  var data = object[Object.keys(object)[0]];
  
  var margin = {top: 20, right: 20, bottom: 20, left: 50},
      width = 450,
      height = 150;
      
  var xValue = function(d) { return d.x; },
      xScale = d3.scaleLinear().range([margin.left, width - margin.right]),
      xMap = function(d) { return xScale(xValue(d));},
      xRange = xScale.domain([d3.min(data, xValue), d3.max(data, xValue)]),
      xAxis = d3.axisBottom()
        .scale(xScale)
        .tickSize(3).tickFormat(function(d) {
          return convertToTime(d);
        });
  
  var yValue = function(d) { return d.y; },
      yScale = d3.scaleLinear().range([height - margin.top, margin.bottom]),
      yMap = function(d) { return yScale(yValue(d));},
      yRange = yScale.domain([d3.min(data, yValue), d3.max(data, yValue)]),
      yAxis = d3.axisLeft()
        .scale(yScale)
        .tickSize(3);
        
  var svg = d3.select("#" + plotID).append("svg");
  
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - margin.bottom) + ")")
      .call(xAxis);
  
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + (margin.left) + ",0)")
      .call(yAxis);
  
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 2)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", "red");
      
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .style("text-anchor", "middle")
      .text("UTC");
}

function makePlot(plotID, object) {
  var data = object[Object.keys(object)[0]];
  
  var WIDTH = 450,
      HEIGHT = 150,
      MARGINS = {top: 20, right: 20, bottom: 20, left: 50};
  
  var xValue = function(d) { return d.x; },
      xRange = d3.scaleLinear().range([MARGINS.left, WIDTH - MARGINS.right])
        .domain([d3.min(data, xValue), d3.max(data, xValue)]),
      xAxis = d3.axisBottom()
        .scale(xRange)
        .tickSize(3).tickFormat(function(d) {
          return convertToTime(d);
        });
  
  var yValue = function(d) { return d.y; },
      yRange = d3.scaleLinear().range([HEIGHT - MARGINS.top, MARGINS.bottom])
        .domain([d3.min(data, yValue), d3.max(data, yValue)]),
      yAxis = d3.axisLeft()
        .scale(yRange)
        .tickSize(3);
  
  var svg = d3.select("#" + plotID).append("svg");

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (MARGINS.left) + ",0)")
    .call(yAxis);

  var lineFunc = d3.line()
    .x(function (d) {
      return xRange(d.x);
    })
    .y(function (d) {
      return yRange(d.y);
    });
  
  svg.append("path")
    .attr("d", lineFunc(data))
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("fill", "none");

  if (Object.keys(object).length > 1) {
    var color_hash = {  0 : ["Read", "red"],
                        1 : ["Returned", "blue"]
                      }  
    /*
    Legend
    */
    var legend = svg.append("g")
      .attr("class", "legend")
      .attr("x", WIDTH - 65)
      .attr("y", 25)
      .attr("height", 100)
      .attr("width", 100);

    legend.selectAll('g').data(Object.keys(object))
      .enter()
      .append('g')
      .each(function(d, i) {
        var g = d3.select(this);
        g.append("rect")
          .attr("x", WIDTH - 65)
          .attr("y", i*25)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", color_hash[String(i)][1]);
        
        g.append("text")
          .attr("x", WIDTH - 50)
          .attr("y", i * 25 + 8)
          .attr("height",30)
          .attr("width",100)
          .style("fill", color_hash[String(i)][1])
          .text(color_hash[String(i)][0]);
      });
    /*
      End of legend
    */
    var data2 = object[Object.keys(object)[1]];
    svg.append("path")
      .attr("d", lineFunc(data2))
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("fill", "none");
  }
  
  svg.append("text")
      .attr("x", WIDTH / 2 )
      .attr("y",  HEIGHT + MARGINS.bottom)
      .style("text-anchor", "middle")
      .text("UTC");

}
