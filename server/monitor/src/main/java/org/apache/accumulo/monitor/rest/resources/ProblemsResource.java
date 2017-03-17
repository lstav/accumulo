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
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.apache.accumulo.core.client.impl.Tables;
import org.apache.accumulo.monitor.Monitor;
import org.apache.accumulo.monitor.rest.api.ProblemDetailInformation;
import org.apache.accumulo.monitor.rest.api.ProblemSummaryInformation;
import org.apache.accumulo.server.client.HdfsZooInstance;
import org.apache.accumulo.server.problems.ProblemReport;
import org.apache.accumulo.server.problems.ProblemReports;
import org.apache.accumulo.server.problems.ProblemType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ProblemsResource extends BasicResource {

  @GET
  @Path("/summary")
  public Map<String,List<ProblemSummaryInformation>> getSummary() {

    Map<String,List<ProblemSummaryInformation>> jsonObj = new HashMap<String,List<ProblemSummaryInformation>>();

    List<ProblemSummaryInformation> problems = new ArrayList<>();

    Map<String,String> tidToNameMap = Tables.getIdToNameMap(HdfsZooInstance.getInstance());

    if (Monitor.getProblemException() == null) {
      for (Entry<String,Map<ProblemType,Integer>> entry : Monitor.getProblemSummary().entrySet()) {
        Integer readCount = null, writeCount = null, loadCount = null;

        for (ProblemType pt : ProblemType.values()) {
          Integer pcount = entry.getValue().get(pt);
          if (pt.equals(ProblemType.FILE_READ)) {
            readCount = pcount;
          } else if (pt.equals(ProblemType.FILE_WRITE)) {
            writeCount = pcount;
          } else if (pt.equals(ProblemType.TABLET_LOAD)) {
            loadCount = pcount;
          }
        }

        String tableName = Tables.getPrintableTableNameFromId(tidToNameMap, entry.getKey());

        problems.add(new ProblemSummaryInformation(tableName, entry.getKey(), readCount, writeCount, loadCount));

      }
    }

    jsonObj.put("problemSummary", problems);

    return jsonObj;
  }

  @POST
  @Consumes(MediaType.TEXT_PLAIN)
  @Path("/summary")
  public void clearTableProblems(@QueryParam("s") String table) {
    Logger log = LoggerFactory.getLogger(Monitor.class);
    try {
      ProblemReports.getInstance(Monitor.getContext()).deleteProblemReports(table);
    } catch (Exception e) {
      log.error("Failed to delete problem reports for table " + table, e);
    }
  }

  @GET
  @Path("/details")
  public Map<String,List<ProblemDetailInformation>> getDetails() {

    Map<String,List<ProblemDetailInformation>> jsonObj = new HashMap<String,List<ProblemDetailInformation>>();

    List<ProblemDetailInformation> problems = new ArrayList<>();

    Map<String,String> tidToNameMap = Tables.getIdToNameMap(HdfsZooInstance.getInstance());

    if (Monitor.getProblemException() == null) {
      for (Entry<String,Map<ProblemType,Integer>> entry : Monitor.getProblemSummary().entrySet()) {
        ArrayList<ProblemReport> problemReports = new ArrayList<>();
        Iterator<ProblemReport> iter = entry.getKey() == null ? ProblemReports.getInstance(Monitor.getContext()).iterator() : ProblemReports.getInstance(
            Monitor.getContext()).iterator(entry.getKey());
        while (iter.hasNext())
          problemReports.add(iter.next());
        for (ProblemReport pr : problemReports) {
          String tableName = Tables.getPrintableTableNameFromId(tidToNameMap, pr.getTableName());

          problems.add(new ProblemDetailInformation(tableName, entry.getKey(), pr.getProblemType().name(), pr.getServer(), pr.getTime(), pr.getResource(), pr
              .getException()));
        }
      }
    }

    jsonObj.put("problemDetails", problems);

    return jsonObj;
  }
  
  @POST
  @Consumes(MediaType.TEXT_PLAIN)
  @Path("/details")
  public void clearDetailsProblems(@QueryParam("table") String table, @QueryParam("resource") String resource, @QueryParam("ptype") String ptype) {
    Logger log = LoggerFactory.getLogger(Monitor.class);
    try {
      ProblemReports.getInstance(Monitor.getContext()).deleteProblemReport(table, ProblemType.valueOf(ptype), resource);
    } catch (Exception e) {
      log.error("Failed to delete problem reports for table " + table, e);
    }
  }

  @GET
  @Path("/exception")
  public Exception getException() {
    return Monitor.getProblemException();
  }

}
