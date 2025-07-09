import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApiRequestSchema, insertApiConfigurationSchema } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Request History
  app.get("/api/requests", async (req, res) => {
    try {
      const requests = await storage.getApiRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.post("/api/requests", async (req, res) => {
    try {
      const validatedData = insertApiRequestSchema.parse(req.body);
      const request = await storage.createApiRequest(validatedData);
      res.json(request);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // API Configuration management
  app.get("/api/configurations", async (req, res) => {
    try {
      const configurations = await storage.getApiConfigurations();
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch configurations" });
    }
  });

  app.post("/api/configurations", async (req, res) => {
    try {
      const validatedData = insertApiConfigurationSchema.parse(req.body);
      const configuration = await storage.createApiConfiguration(validatedData);
      res.json(configuration);
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  app.put("/api/configurations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertApiConfigurationSchema.partial().parse(req.body);
      const configuration = await storage.updateApiConfiguration(id, validatedData);
      
      if (!configuration) {
        return res.status(404).json({ error: "Configuration not found" });
      }
      
      res.json(configuration);
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  app.delete("/api/configurations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteApiConfiguration(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Configuration not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete configuration" });
    }
  });

  // Proxy API requests
  app.post("/api/proxy", async (req, res) => {
    try {
      const { method, url, headers, body } = req.body;
      
      const startTime = Date.now();
      
      try {
        const response = await axios({
          method: method.toLowerCase(),
          url,
          headers: headers || {},
          data: body,
          timeout: 30000,
          validateStatus: () => true // Accept all status codes
        });
        
        const duration = Date.now() - startTime;
        
        // Save request to history
        await storage.createApiRequest({
          method,
          url,
          headers,
          body,
          response: response.data,
          status: response.status,
          duration
        });
        
        res.json({
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          duration
        });
      } catch (error: any) {
        const duration = Date.now() - startTime;
        
        // Save failed request to history
        await storage.createApiRequest({
          method,
          url,
          headers,
          body,
          response: { error: error.message },
          status: error.response?.status || 0,
          duration
        });
        
        res.status(error.response?.status || 500).json({
          error: error.message,
          status: error.response?.status || 0,
          duration
        });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid proxy request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
