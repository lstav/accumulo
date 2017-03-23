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
package org.apache.accumulo.monitor.rest.resources;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;

import org.apache.accumulo.core.master.thrift.DeadServer;
import org.apache.accumulo.core.master.thrift.TabletServerStatus;
import org.apache.accumulo.monitor.Monitor;
import org.apache.accumulo.monitor.rest.api.StatusInformation;
import org.apache.accumulo.server.monitor.DedupedLogEvent;
import org.apache.accumulo.server.monitor.LogService;
import org.apache.log4j.Level;

public class StatusResource extends BasicResource {

  @GET
  public StatusInformation getTables() {

    StatusInformation status;
    String masterStatus;
    String gcStatus;
    String tServerStatus = "ERROR";

    if (Monitor.getMmi() != null) {
      if (Monitor.getGcStatus() != null) {
        gcStatus = "OK";
      } else {
        gcStatus = "ERROR";
      }

      List<String> tservers = new ArrayList<>();
      for (TabletServerStatus up : Monitor.getMmi().tServerInfo) {
        tservers.add(up.name);
      }
      for (DeadServer down : Monitor.getMmi().deadTabletServers) {
        tservers.add(down.server);
      }
      List<String> masters = Monitor.getContext().getInstance().getMasterLocations();

      masterStatus = masters.size() == 0 ? "ERROR" : "OK";

      int tServerUp = Monitor.getMmi().getTServerInfoSize();
      int tServerDown = Monitor.getMmi().getDeadTabletServersSize();
      int tServerBad = Monitor.getMmi().getBadTServersSize();

      if ((tServerDown > 0 || tServerBad > 0) && tServerUp > 0) {
        tServerStatus = "WARN";
      } else if ((tServerDown == 0 || tServerBad > 0) && tServerUp > 0) {
        tServerStatus = "OK";
      } else if (tServerUp == 0) {
        tServerStatus = "ERROR";
      }
    } else {
      masterStatus = "ERROR";
      if (null == Monitor.getGcStatus()) {
        gcStatus = "ERROR";
      } else {
        gcStatus = "OK";
      }
      tServerStatus = "ERROR"; // TODO Need to do this without the master
    }

    List<DedupedLogEvent> logs = LogService.getInstance().getEvents();
    boolean logsHaveError = false;
    for (DedupedLogEvent dedupedLogEvent : logs) {
      if (dedupedLogEvent.getEvent().getLevel().isGreaterOrEqual(Level.ERROR)) {
        logsHaveError = true;
        break;
      }
    }

    int numProblems = Monitor.getProblemSummary().entrySet().size();

    status = new StatusInformation(masterStatus, gcStatus, tServerStatus, logs.size(), logsHaveError, numProblems);

    return status;
  }
}
