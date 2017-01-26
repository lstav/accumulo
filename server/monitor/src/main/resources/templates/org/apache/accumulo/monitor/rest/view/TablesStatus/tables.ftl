<!--
  Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<html>
  <head>
    <title>${title} - Accumulo ${version}</title>
    <#if refresh gt 0 ><meta http-equiv='refresh' content='${refresh}' /></#if>
    <meta http-equiv='Content-Type' content='test/html"' />
    <meta http-equiv='Content-Script-Type' content='text/javascript' />
    <meta http-equiv='Content-Style-Type' content='text/css' />
    <link rel='shortcut icon' type='image/jpg' href='http://localhost:9995/web/favicon.png' />
    <link rel='stylesheet' type='text/css' href='http://localhost:9995/web/screen.css' media='screen' />
    <script src='http://localhost:9995/web/functions.js' type='text/javascript'></script>

    <!--[if lte IE 8]><script language="javascript" type="text/javascript" src="http://localhost:9995/web/flot/excanvas.min.js"></script><![endif]-->
    <script language="javascript" type="text/javascript" src="http://localhost:9995/web/flot/jquery.js"></script>
    <script language="javascript" type="text/javascript" src="http://localhost:9995/web/flot/jquery.flot.js"></script>
  </head>

  <body>
  	<script type="text/javascript">
        
        function populateTable(namespace) {
            console.log(namespace);
        }
        
        // Put json inside the populateTable, if the namespace matches *, then show all tables, if it only matches a specific namespace, then just show those tables
        
  		$.getJSON("rest/tables", function(data) {
            
            var count = 0;
            
            $.each(data.tables, function(keyT, tab) {
              var namespace = [];
              
              namespace.push("<a onclick=populateTable('" + (tab.namespace === "" ? "-" : tab.namespace) + "')>" + (tab.namespace === "" ? "-&nbsp;(DEFAULT)" : tab.namespace) + "</a>");
              
              $("<li/>", {
                html: namespace.join(""),
                id: tab.namespace === "" ? "-" : tab.namespace
              }).appendTo("#namespaces"); 
              
              $.each(tab.table, function(key, val) {
                
                var row = [];
                row.push("<td class='firstcell left'><a href='/tables/" + val.tableId + "'>" + val.tablename + "</a></td>");
                row.push("<td class='center'><span>" + val.tableState + "</span></td>");
                
                if (val.tableState === "ONLINE") {
                  row.push("<td class='right'>" + bigNumberForQuantity(val.tablets) + "</td>");
                  row.push("<td class='right'>" + bigNumberForQuantity(val.offlineTablets) + "</td>");
                  row.push("<td class='right'>" + bigNumberForQuantity(val.recs) + "</td>");
                  row.push("<td class='right'>" + bigNumberForQuantity(val.recsInMemory) + "</td>");
                  row.push("<td class='right'>" + bigNumberForQuantity(Math.floor(val.ingest)) + "</td>");
                  row.push("<td class='right'>" + bigNumberForQuantity(Math.floor(val.entriesRead)) + "</td>");
                  row.push("<td class='right'>" + bigNumberForQuantity(Math.floor(val.entriesReturned)) + "</td>");
                  row.push("<td class='right'>" + timeDuration(val.holdTime) + "</td>");
                  row.push("<td class='right'>" + bigNumberForQuantity(val.scans.running) + "&nbsp;(" + val.scans.queued + ")</td>");
                  row.push("<td class='right'>" + bigNumberForQuantity(val.minorCompactions.running) + "&nbsp;(" + val.minorCompactions.queued + ")</td>");
                  row.push("<td class='right'>" + bigNumberForQuantity(val.majorCompactions.running) + "&nbsp;(" + val.majorCompactions.queued + ")</td>");
                } else {
                  row.push("<td class='right'>-</td>");
                  row.push("<td class='right'>-</td>");
                  row.push("<td class='right'>-</td>");
                  row.push("<td class='right'>-</td>");
                  row.push("<td class='right'>-</td>");
                  row.push("<td class='right'>-</td>");
                  row.push("<td class='right'>-</td>");
                  row.push("<td class='right'>&mdash;</td>");
                  row.push("<td class='right'>-</td>");
                  row.push("<td class='right'>-</td>");
                  row.push("<td class='right'>-</td>");
                }
                
                if (count % 2 == 0) {
                  $("<tr/>", {
                    html: row.join(""),
                    class: "highlight"
                  }).appendTo("#tableList");
                } else {
                  $("<tr/>", {
                    html: row.join("")
                  }).appendTo("#tableList");  
                }
                count += 1;
              });
            });
		});
		
  	</script>  	
    <div id='content-wrapper'>
      <div id='content'>
        <div id='header'>
          <#include "/templates/header.ftl">
        </div>

        <#include "/templates/sidebar.ftl">

        <div id='main' style='bottom:0'>
          <div id="filters">
			<div class="table-caption">Namespaces</div>
			<hr />
			<div class='left show'>
			  <dl>
			    <ul id="namespaces">
                    <li id='*'><a onclick=populateTable("*")>*&nbsp;(All&nbsp;Tables)</a></li>
			    </ul>
			  </dl>
			</div>
		  </div>
          <div id="tables">
            <a name='tableList'>&nbsp;</a>
            <table id='tableList' class='sortable'>
              <caption>
                <span class='table-caption'>Table&nbsp;List</span><br />
                <a href='/op?action=toggleLegend&redir=%2Ftables&page=/tables&table=tableList&show=true'>Show&nbsp;Legend</a>
              </caption>
              <tr><th class='firstcell'><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&asc=false'>Table&nbsp;Name&nbsp;<img width='10px' height='10px' src='/web/up.gif' alt='v' /></a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=1'>State</a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=2'>#&nbsp;Tablets</a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=3'>#&nbsp;Offline<br />Tablets</a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=4'>Entries</a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=5'>Entries<br />In&nbsp;Memory</a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=6'>Ingest</a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=7'>Entries<br />Read</a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=8'>Entries<br />Returned</a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=9'>Hold&nbsp;Time</a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=10'>Running<br />Scans</a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=11'>Minor<br />Compactions</a></th><th><a href='/op?action=sortTable&redir=%2Ftables&page=/tables&table=tableList&col=12'>Major<br />Compactions</a></th></tr>
            </table>
          </div>
        </div>
      </div>    
    </div>
  </body>
</html>
