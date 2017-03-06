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

var QUANTITY_SUFFIX = ["", "K", "M", "B", "T", "e15", "e18", "e21"]
var SIZE_SUFFIX = ["", "K", "M", "G", "T", "P", "E", "Z"]

function toggle(selection) {
  var p = document.getElementById(selection);
  var style = p.className;
  p.className = style == "hide" ? "show" : "hide";
}

function bigNumberForSize(size) {
  if (size === null) 
    size = 0;
  return bigNumber(size, SIZE_SUFFIX, 1024);
}

function bigNumberForQuantity(quantity) {
  if (quantity === null)
    quantity = 0;
  return bigNumber(quantity, QUANTITY_SUFFIX, 1000);
}

function bigNumber(big, suffixes, base) {
  if (big < base) {
    return big + suffixes[0];
  }
  var exp = Math.floor(Math.log(big) / Math.log(base));
  var val = big / Math.pow(base, exp);
  return val.toFixed(2) + suffixes[exp];
}

function timeDuration(time) {
  var ms, sec, min, hr, day, yr;
  ms = sec = min = hr = day = yr = -1;
  
  time = Math.floor(time);
  if (time == 0) {
    return "&mdash;";
  }
  
  ms = time % 1000;
  time = Math.floor(time / 1000);
  if (time == 0) {
    return ms + "ms";
  }
  
  sec = time % 60;
  time = Math.floor(time / 60);
  if (time == 0) {
    return sec + "s" + "&nbsp;" + ms + "ms";
  }
    
  min = time % 60;
  time = Math.floor(time / 60);
  if (time == 0) {
    return min + "m" + "&nbsp;" + sec + "s";
  }
    
  hr = time % 24;
  time = Math.floor(time / 24);
  if (time == 0) {
    return hr + "h" + "&nbsp;" + min + "m";
  }
    
  day = time % 365;
  time = Math.floor(time / 365);
  if (time == 0) {
    return day + "d" + "&nbsp;" + hr + "h";
  }
    
  yr = Math.floor(time);
  return yr + "y" + "&nbsp;" + day + "d";
}

function sortTables(tableID, direction, n) {
  var table, rows, switching, i, x, y, h, shouldSwitch, dir, switchcount = 0, xOne, xTwo, xFinal, yOne, yTwo, yFinal;
  table = document.getElementById(tableID);
  switching = true;
  
  //Set the sorting direction to ascending:
  dir = direction;
  sessionStorage.direction = dir;
  
  rows = table.getElementsByTagName("TR");
  
  var count = 0;
  while (rows[0].getElementsByTagName("TH").length > count) {
    var tmpH = rows[0].getElementsByTagName("TH")[count];
    tmpH.classList.remove("sortable");
    if (rows.length > 2) {
        tmpH.classList.add("sortable");
    }
    $(tmpH.getElementsByTagName("img")).remove();
    count += 1;
  }
  
  if (rows.length <= 2) {
      switching = false;
  } else {
    h = rows[0].getElementsByTagName("TH")[n];
    if (dir == "asc") {
      $(h).append("<img width='10px' height='10px' src='web/up.gif' alt='v' />");
    } else if (dir == "desc") {
      $(h).append("<img width='10px' height='10px' src='web/down.gif' alt='^' />");
    }
  }
  
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName("TR");
    
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n].getAttribute("data-value");
      xFinal = (x === "-" || x === "&mdash;" ? null : (Number(x) == x ? Number(x) : x));
      y = rows[i + 1].getElementsByTagName("TD")[n].getAttribute("data-value");
      yFinal = (y === "-" || y === "&mdash;" ? null : (Number(y) == y ? Number(y) : y));
      
      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (xFinal > yFinal || (xFinal !== null && yFinal === null)) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if (xFinal < yFinal || (yFinal !== null && xFinal === null)) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount ++;
    }
  }
}

function clearTable(tableID) {      
  $("#" + tableID).find("tr:not(:first)").remove();
}

///// REST Calls /////////////
function getMaster() {
  $.getJSON("/rest/master", function(data) {
    sessionStorage.master = JSON.stringify(data);
  });
}    

function getZK() {
  $.getJSON("/rest/zk", function(data) {
    sessionStorage.zk = JSON.stringify(data);
  });
}

function getNamespaces() {
  $.getJSON("/rest/tables/namespaces", function(data) {
    NAMESPACES = JSON.stringify(data);
  });
}

function getNamespaceTables(namespaces) {
  
  var jsonObj = {};
  jsonObj.tables = [];
  
  if (namespaces.indexOf("*") != -1) {
    getTables();
  } else {
    $.each(namespaces, function(key, val) {
      if (val !== "*") {
        var call = "/rest/tables/namespace/" + val;
        $.getJSON(call, function(data) {
          $.each(data.tables, function(key2, val2) {
            jsonObj.tables.push(val2);
          });
        });
      }
    });
    sessionStorage.tables = JSON.stringify(jsonObj);
  }
}

function getTables() {
  $.getJSON("/rest/tables", function(data) {
    sessionStorage.tables = JSON.stringify(data);
  });
}    

function getTServers() {
  $.getJSON("/rest/tservers", function(data) {
    sessionStorage.tservers = JSON.stringify(data);
  });
}

function getTServer(server) {
  $.getJSON(server, function(data) {
    sessionStorage.server = JSON.stringify(data);
  });
}

function getScans() {
  $.getJSON("/rest/scans", function(data) {
    sessionStorage.scans = JSON.stringify(data);
  });
}

function getBulkImports() {
  $.getJSON("/rest/bulkImports", function(data) {
    sessionStorage.bulkImports = JSON.stringify(data);
  });
}

function getGarbageCollector() {
  $.getJSON("/rest/gc", function(data) {
    sessionStorage.gc = JSON.stringify(data);
  });
}

function getServerStats() {
  $.getJSON("/rest/tservers/serverStats", function(data) {
    sessionStorage.serverStats = JSON.stringify(data);
  });
}
      
function getTableServers(table) {
  $.getJSON(table, function(data) {
    sessionStorage.tableServers = JSON.stringify(data);
  });
}

function getTraceSummary(trace) {
  $.getJSON(trace, function(data) {
    sessionStorage.traceSummary = JSON.stringify(data);
  });
}

function getTraceOfType(trace) {
  $.getJSON(trace, function(data) {
    sessionStorage.traceType = JSON.stringify(data);
  });
}

function getTraceShow(trace) {
  $.getJSON(trace, function(data) {
    sessionStorage.traceShow = JSON.stringify(data);
  });
}

function getLogs() {
  $.getJSON("/rest/logs", function(data) {
    sessionStorage.logs = JSON.stringify(data);
  });
}

function getProblems() {
  $.getJSON("/rest/problems", function(data) {
    sessionStorage.problems = JSON.stringify(data);
  });
}

function getReplication() {
  $.getJSON("/rest/replication", function(data) {
    sessionStorage.replication = JSON.stringify(data);
  });
}

function doBanner(id, bannerClass, text) {
  $("<h2/>", {
   html: text,
   class: bannerClass
  }).appendTo("#" + id);
}

//// Overview Plots Rest Calls

function getIngestRate() {
  $.getJSON("/rest/statistics/time/ingestRate", function(data) {
    sessionStorage.ingestRate = JSON.stringify(data);
  });
}

function getScanEntries() {
  $.getJSON("/rest/statistics/time/scanEntries", function(data) {
    sessionStorage.scanEntries = JSON.stringify(data);
  });
}

function getIngestByteRate() {
  $.getJSON("/rest/statistics/time/ingestByteRate", function(data) {
    sessionStorage.ingestMB = JSON.stringify(data);
  });
}

function getQueryByteRate() {
  $.getJSON("/rest/statistics/time/queryByteRate", function(data) {
    sessionStorage.queryMB = JSON.stringify(data);
  });
}

function getLoadAverage() {
  $.getJSON("/rest/statistics/time/load", function(data) {
    sessionStorage.loadAvg = JSON.stringify(data);
  });
}

function getLookups() {
  $.getJSON("/rest/statistics/time/lookups", function(data) {
    sessionStorage.lookups = JSON.stringify(data);
  });
}

function getMinorCompactions() {
  $.getJSON("/rest/statistics/time/minorCompactions", function(data) {
    sessionStorage.minorCompactions = JSON.stringify(data);
  });
}

function getMajorCompactions() {
  $.getJSON("/rest/statistics/time/majorCompactions", function(data) {
    sessionStorage.majorCompactions = JSON.stringify(data);
  });
}

function getIndexCacheHitRate() {
  $.getJSON("/rest/statistics/time/indexCacheHitRate", function(data) {
    sessionStorage.indexCache = JSON.stringify(data);
  });
}

function getDataCacheHitRate() {
  $.getJSON("/rest/statistics/time/dataCacheHitRate", function(data) {
    sessionStorage.dataCache = JSON.stringify(data);
  });
}
