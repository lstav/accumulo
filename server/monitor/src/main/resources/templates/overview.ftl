<#--
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
      <div><h3>${title}</h3></div>
      <table class='noborder'>
        <tr>
          <td class='noborder' id='master'></td>
          <td class='noborder' id='zookeeper'></td>
        </tr>
      </table>
      <br />
      <table class="noborder">          
        <tr>
          <td>
            <div class="plotHeading">Ingest (Entries/s)</div></br><svg id="ingest_entries" width="450px" height="200px"></svg>
          </td>
          <td>
            <div class="plotHeading">Scan (Entries/s)</div></br><svg id="scan_entries" width="450px" height="200px"></svg>
          </td>
        </tr>
        <tr>
          <td>
            <div class="plotHeading">Ingest (MB/s)</div></br><svg id="ingest_mb" width="450px" height="200px"></svg>
          </td>
          <td>
            <div class="plotHeading">Scan (MB/s)</div></br><svg id="scan_mb" width="450px" height="200px"></svg>
          </td>
        </tr>
        <tr>
          <td>
            <div class="plotHeading">Load Average</div></br><svg id="load_avg" width="450px" height= "200px"></svg>
          </td>
          <td>
            <div class="plotHeading">Seeks</div></br><svg id="seeks" width="450px" height="200px"></svg>
          </td>
        </tr>
        <tr>
          <td>
            <div class="plotHeading">Minor Compactions</div></br><svg id="minor" width="450px" height="200px"></svg>
          </td>
          <td>
            <div class="plotHeading">Major Compactions</div></br><svg id="major" width="450px" height="200px"></svg>
          </td>
        </tr>
        <tr>
          <td>
            <div class="plotHeading">Index Cache Hit Rate</div></br><svg id="index_cache" width="450px" height="200px"></svg>
          </td>
          <td>
            <div class="plotHeading">Data Cache Hit Rate</div></br><svg id="data_cache" width="450px" height="200px"></svg>
          </td>
        </tr>
      </table> 
