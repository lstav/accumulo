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
var type, minutes;
function refreshListType() {
  $.ajaxSetup({
    async: false
  });
  getTraceOfType('/rest/trace/listType/'+type+'/'+minutes);
  $.ajaxSetup({
    async: true
  });
  refreshTypeTraceTable(minutes);
}

var timer;
function refresh() {
  if (sessionStorage.autoRefresh == 'true') {
    timer = setInterval('refreshListType()', 5000);
  } else {
    clearInterval(timer);
  }
}

function refreshTypeTraceTable(minutes) {
  clearTable('trace');
  
  var data = sessionStorage.traceType === undefined ? [] : JSON.parse(sessionStorage.traceType);
  
  if (data.length === 0 || data.traces.length === 0) {
    var items = [];
    items.push('<td class="center" colspan="3"><i>No traces in the last ' + minutes + ' minute(s)</i></td>');
    $('<tr/>', {
      html: items.join('')
    }).appendTo('#trace');
  } else {
    $.each(data.traces, function(key, val) {
    
      var items = [];
    
      var date = new Date(val.start);
      items.push('<td class="firstcell left"><a href="/trace/show?id=' + val.id + '">' + date.toLocaleString() + '</a></td>');
      items.push('<td class ="right">' + timeDuration(val.ms) + '</td>');
      items.push('<td class="left">' + val.source + '</td>');
    
      $('<tr/>', {
        html: items.join('')
      }).appendTo('#trace');
    });
  }
}

function sortTable(n) {
  if (sessionStorage.tableColumnSort !== undefined && sessionStorage.tableColumnSort == n && sessionStorage.direction !== undefined) {
      direction = sessionStorage.direction === 'asc' ? 'desc' : 'asc';
  } else {
    direction = sessionStorage.direction === undefined ? 'asc' : sessionStorage.direction;
  }
      
  sessionStorage.tableColumnSort = n;
      
  sortTables('trace', direction, n);
}
  
$(function() {
  $(document).tooltip();
});

function createHeader(type, minutes) {	
  var caption = [];
  this.type = type;
  this.minutes = minutes;
  
  caption.push('<span class="table-caption">Traces for ' + type + '</span><br />');

  $('<caption/>', {
    html: caption.join('')
  }).appendTo('#trace');
      
  var items = [];

  items.push('<th class="firstcell" title="'+descriptions['Trace Start']+'">Start&nbsp;</th>');
  items.push('<th title="'+descriptions['Span Time']+'">ms&nbsp;</th>');
  items.push('<th title="'+descriptions['Source']+'">Source&nbsp;</th>');
  
  $('<tr/>', {
    html: items.join('')
  }).appendTo('#trace');
}
