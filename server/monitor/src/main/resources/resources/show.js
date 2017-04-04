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
var id;
/**
 * Makes the REST calls, generates the tables with the new information
 */
function refreshTraceShow() {
  $.ajaxSetup({
    async: false
  });
  getTraceShow(id);
  $.ajaxSetup({
    async: true
  });
  refreshTraceShowTable();
}

/**
 * Used to redraw the page
 */
function refresh() {
  refreshTraceShow();
}

/**
 * Generates the trace show table
 */
function refreshTraceShowTable() {
  clearTable('trace');
  $('#trace caption span span').remove();
  var data = JSON.parse(sessionStorage.traceShow);

  var date = new Date(data.start);
  $('#caption').append('<span>' + date.toLocaleString() + '</span>');

  $.each(data.traces, function(key, val) {
    var id = val.spanID.toString(16);
    var items = [];

    items.push('<tr>');
    items.push('<td class="right">' + val.time + '+</td>');
    items.push('<td class="left">' + val.start + '</td>');
    items.push('<td style="text-indent: ' + val.level + '0px">' +
        val.location + '</td>');
    items.push('<td>' + val.name + '</td>');

    if (val.addlData.data.length !== 0 ||
        val.addlData.annotations.length !== 0) {

      items.push('<td><input type="checkbox" id="' + id +
          '_checkbox" onclick="toggle(\'' + id + '\')"></td>');
      items.push('</tr>');
      items.push('<tr id="' + id + '" style="display:none">');
      items.push('<td colspan="5">');
      items.push('<table class="table table-bordered table-striped' +
          ' table-condensed">');

      if (val.addlData.data.length !== 0) {
        items.push('<tr><th>Key</th><th>Value</th></tr>');

        $.each(val.addlData.data, function(key2, val2) {
          items.push('<tr><td>' + val2.key + '</td><td>' + val2.value +
              '</td></tr>');
        });
      }

      if (val.addlData.annotations.length !== 0) {
        items.push('<tr><th>Annotation</th><th>Time Offset</th></tr>');

        $.each(val.addlData.annotations, function(key2, val2) {
          items.push('<tr><td>' + val2.annotation + '</td><td>' + val2.time +
              '</td></tr>');
        });
      }

      items.push('</table>');
      items.push('</td>');
    } else {
      items.push('<td></td>');
    }

    items.push('</tr>');

    $('#trace').append(items.join(''));
  });

}

/**
 * Sorts the trace table on the selected column
 *
 * @param {number} n Column number to sort by
 */
function sortTable(n) {
  if (sessionStorage.tableColumnSort !== undefined &&
      sessionStorage.tableColumnSort == n &&
      sessionStorage.direction !== undefined) {
    direction = sessionStorage.direction === 'asc' ? 'desc' : 'asc';
  } else {
    direction = sessionStorage.direction === undefined ?
        'asc' : sessionStorage.direction;
  }
  sessionStorage.tableColumnSort = n;
  sortTables('trace', direction, n);
}

/**
 * Create tooltip for table column information
 */
$(function() {
  $(document).tooltip();
});

/**
 * Creates the trace show header
 *
 * @param {string} ID ID of the trace
 */
function createHeader(ID) {
  id = ID;
  var caption = [];

  caption.push('<span id="caption" class="table-caption">Trace ' + id +
      ' started at<br></span>');

  $('<caption/>', {
    html: caption.join('')
  }).appendTo('#trace');

  var items = [];

  items.push('<th>Time&nbsp;</th>');
  items.push('<th>Start&nbsp;</th>');
  items.push('<th>Service@Location&nbsp;</th>');
  items.push('<th>Name&nbsp;</th>');
  items.push('<th>Addl&nbsp;Data&nbsp;</th>');

  $('<tr/>', {
    html: items.join('')
  }).appendTo('#trace');
}
