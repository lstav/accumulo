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
package org.apache.accumulo.monitor.rest.view;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.CookieParam;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;

import org.apache.accumulo.core.Constants;
import org.apache.accumulo.core.client.TableNotFoundException;
import org.apache.accumulo.core.client.impl.Tables;
import org.apache.accumulo.core.util.AddressUtil;
import org.apache.accumulo.monitor.Monitor;
import org.apache.accumulo.server.monitor.DedupedLogEvent;
import org.apache.accumulo.server.monitor.LogService;
import org.apache.log4j.Level;
import org.glassfish.jersey.server.mvc.Template;

@Path("/")
public class Index {

  private Map<String,Object> getModel(String refreshValue) {

    int refresh = -1;
    try {
      refresh = Integer.parseInt(refreshValue);
    } catch (NumberFormatException e) {}

    List<DedupedLogEvent> logs = LogService.getInstance().getEvents();
    boolean logsHaveError = false;
    for (DedupedLogEvent dedupedLogEvent : logs) {
      if (dedupedLogEvent.getEvent().getLevel().isGreaterOrEqual(Level.ERROR)) {
        logsHaveError = true;
        break;
      }
    }

    int numProblems = Monitor.getProblemSummary().entrySet().size();

    Map<String,Object> model = new HashMap<>();
    model.put("version", Constants.VERSION);
    model.put("refresh", refresh);
    model.put("instance_name", Monitor.cachedInstanceName.get());
    model.put("instance_id", Monitor.getContext().getInstance().getInstanceID());
    model.put("current_date", new Date().toString().replace(" ", "&nbsp;"));
    model.put("num_logs", logs.size());
    model.put("logs_have_error", logsHaveError);
    model.put("num_problems", numProblems);
    model.put("is_ssl", false);
    model.put("redirect", null);

    return model;
  }

  @GET
  @Template(name = "/index.ftl")
  public Map<String,Object> get(@CookieParam("page.refresh.rate ") @DefaultValue("-1") String refreshValue) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Accumulo Overview");
    model.put("template", "overview.ftl");
    model.put("js", "overview.js");

    return model;
  }

  @GET
  @Path("{parameter: master|monitor}")
  @Template(name = "/index.ftl")
  public Map<String,Object> getMaster(@CookieParam("page.refresh.rate ") @DefaultValue("-1") String refreshValue) {

    List<String> masters = Monitor.getContext().getInstance().getMasterLocations();

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Master Server" + (masters.size() == 0 ? "" : ":" + AddressUtil.parseAddress(masters.get(0), false).getHostText()));
    model.put("template", "master.ftl");
    model.put("js", "master.js");
    return model;
  }

  @GET
  @Path("tservers")
  @Template(name = "/index.ftl")
  public Map<String,Object> getTabletServers(@QueryParam("s") String server, @CookieParam("page.refresh.rate") @DefaultValue("-1") String refreshValue) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Tablet Server Status");
    if (server != null) {
      model.put("template", "server.ftl");
      model.put("js", "server.js");
      model.put("server", server);
      return model;
    }
    model.put("template", "tservers.ftl");
    model.put("js", "tservers.js");
    return model;
  }

  @GET
  @Path("scans")
  @Template(name = "/index.ftl")
  public Map<String,Object> getScans(@CookieParam("page.refresh.rate ") @DefaultValue("-1") String refreshValue) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Scans");
    model.put("template", "scans.ftl");
    model.put("js", "scans.js");

    return model;
  }

  @GET
  @Path("bulkImports")
  @Template(name = "/index.ftl")
  public Map<String,Object> getBulkImports(@CookieParam("page.refresh.rate") @DefaultValue("-1") String refreshValue) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Bulk Imports");
    model.put("template", "bulkImport.ftl");
    model.put("js", "bulkImport.js");

    return model;
  }

  @GET
  @Path("gc")
  @Template(name = "/index.ftl")
  public Map<String,Object> getGC(@CookieParam("page.refresh.rate") @DefaultValue("-1") String refreshValue) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Garbage Collector Status");
    model.put("template", "gc.ftl");
    model.put("js", "gc.js");

    return model;
  }

  @GET
  @Path("vis")
  @Template(name = "/index.ftl")
  public Map<String,Object> getServerActivity(@CookieParam("page.refresh.rate") @DefaultValue("-1") String refreshValue,
      @QueryParam("shape") @DefaultValue("circles") String shape, @QueryParam("size") @DefaultValue("40") String size,
      @QueryParam("motion") @DefaultValue("") String motion, @QueryParam("color") @DefaultValue("allavg") String color) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Server Activity");
    model.put("template", "vis.ftl");
    // model.put("js", "vis.js");

    model.put("shape", shape);
    model.put("size", size);
    model.put("motion", motion);
    model.put("color", color);

    return model;
  }

  @GET
  @Path("tables")
  @Template(name = "/index.ftl")
  public Map<String,Object> getTables(@CookieParam("page.refresh.rate ") @DefaultValue("-1") String refreshValue) throws TableNotFoundException {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Table Status");
    model.put("template", "tables.ftl");
    model.put("js", "tables.js");

    return model;
  }

  @GET
  @Path("tables/{tableID}")
  @Template(name = "/index.ftl")
  public Map<String,Object> getTables(@PathParam("tableID") String tableID, @CookieParam("page.refresh.rate ") @DefaultValue("-1") String refreshValue)
      throws TableNotFoundException {

    String table = Tables.getTableName(Monitor.getContext().getInstance(), tableID);

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Table Status");

    model.put("template", "table.ftl");
    model.put("js", "table.js");
    model.put("tableID", tableID);
    model.put("table", table);

    return model;
  }

  @GET
  @Path("trace/summary")
  @Template(name = "/index.ftl")
  public Map<String,Object> getTracesSummary(@QueryParam("minutes") @DefaultValue("10") String minutes,
      @CookieParam("page.refresh.rate ") @DefaultValue("-1") String refreshValue) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Traces for the last&nbsp;" + minutes + "&nbsp;minute(s)");

    model.put("template", "summary.ftl");
    model.put("js", "summary.js");
    model.put("minutes", minutes);

    return model;
  }

  @GET
  @Path("trace/listType")
  @Template(name = "/index.ftl")
  public Map<String,Object> getTracesForType(@QueryParam("type") String type, @QueryParam("minutes") @DefaultValue("10") String minutes,
      @CookieParam("page.refresh.rate ") @DefaultValue("-1") String refreshValue) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Traces for " + type + " for the last " + minutes + " minute(s)");

    model.put("template", "listType.ftl");
    model.put("js", "listType.js");
    model.put("type", type);
    model.put("minutes", minutes);

    return model;
  }

  @GET
  @Path("trace/show")
  @Template(name = "/index.ftl")
  public Map<String,Object> getTraceShow(@QueryParam("id") String id, @CookieParam("page.refresh.rate ") @DefaultValue("-1") String refreshValue) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Trace ID " + id);

    model.put("template", "show.ftl");
    model.put("js", "show.js");
    model.put("id", id);

    return model;
  }

  @GET
  @Path("log")
  @Template(name = "/index.ftl")
  public Map<String,Object> getLogs(@CookieParam("page.refresh.rate ") @DefaultValue("-1") String refreshValue) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Recent Logs");

    model.put("template", "log.ftl");
    model.put("js", "log.js");

    return model;
  }

  @GET
  @Path("problems")
  @Template(name = "/index.ftl")
  public Map<String,Object> getProblems(@CookieParam("page.refresh.rate ") @DefaultValue("-1") String refreshValue) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Per-Table Problem Report");

    model.put("template", "problems.ftl");
    model.put("js", "problems.js");

    return model;
  }

  @GET
  @Path("replication")
  @Template(name = "/index.ftl")
  public Map<String,Object> getReplication(@CookieParam("page.refresh.rate ") @DefaultValue("-1") String refreshValue) {

    Map<String,Object> model = getModel(refreshValue);
    model.put("title", "Replication Overview");

    model.put("template", "replication.ftl");
    model.put("js", "replication.js");

    return model;
  }
}
