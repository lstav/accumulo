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
package org.apache.accumulo.monitor.rest;

import java.net.URI;

import org.apache.accumulo.core.client.AccumuloException;
import org.apache.accumulo.core.client.AccumuloSecurityException;
import org.apache.accumulo.core.client.Instance;
import org.apache.accumulo.server.AccumuloServerContext;
import org.apache.accumulo.server.client.HdfsZooInstance;
import org.apache.accumulo.server.conf.ServerConfigurationFactory;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.jetty.JettyHttpContainerFactory;
import org.glassfish.jersey.logging.LoggingFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.ServerProperties;
import org.glassfish.jersey.server.mvc.MvcFeature;
import org.glassfish.jersey.server.mvc.freemarker.FreemarkerMvcFeature;
import org.glassfish.jersey.servlet.ServletContainer;
import org.glassfish.jersey.servlet.ServletProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JettyMonitorApplication extends MonitorApplication {
  private static final Logger log = LoggerFactory.getLogger(JettyMonitorApplication.class);

  private JettyMonitorApplication() {}

  @Override
  public void run() {
    Instance instance = HdfsZooInstance.getInstance();
    ServerConfigurationFactory config = new ServerConfigurationFactory(instance);
    AccumuloServerContext serverContext = new AccumuloServerContext(config);

    // Set the objects on the old monitor and start daemons to regularly poll the data
    startDataDaemons(config, instance, serverContext);

    final ResourceConfig rc = new ResourceConfig().register(FreemarkerMvcFeature.class)
        .register(new LoggingFeature(java.util.logging.Logger.getLogger(this.getClass().getSimpleName())))
        .register(JacksonFeature.class)
        .register(AccumuloExceptionMapper.class)
        .packages("org.apache.accumulo.monitor.rest")
        .property(MvcFeature.TEMPLATE_BASE_PATH, "/templates")
        .property(ServerProperties.TRACING, "ALL")
        .property(ServletProperties.FILTER_FORWARD_ON_404, "true")
        .property(ServletProperties.FILTER_STATIC_CONTENT_REGEX, "/web/.*");

    final URI serverUri = getServerUri();
    String hostname = serverUri.getHost();
    int port = serverUri.getPort();

    Server server = null;

    try {
      server = new Server(port);
      ServletContextHandler handler = new ServletContextHandler();
      handler.addServlet(ServletContainer.class, "/rest/*");
      
      JettyHttpContainerFactory.createServer(serverUri, rc);

      server.start();
      if (0 == port) {
        port = ((ServerConnector) server.getConnectors()[0]).getLocalPort();
      }
      log.info("Server bound to " + hostname + ":" + port);

      try {
        advertiseHttpAddress(serverContext.getConnector().getInstance(), hostname, port);
      } catch (AccumuloException | AccumuloSecurityException e) {
        throw new RuntimeException("Failed to connect to Accumulo", e);
      }

      server.join();

    } catch (InterruptedException e) {
      log.info("Monitor service killed.");
      // restore current thread interrupted status
      Thread.currentThread().interrupt();
    } catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } finally {
      if (server != null) {
        server.destroy();
      }
    }

  }

  public static final void main(String[] args) throws Exception {
    new JettyMonitorApplication().run();
  }
}
