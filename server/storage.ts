import { 
  users, 
  apiRequests, 
  apiConfigurations,
  type User, 
  type InsertUser,
  type ApiRequest,
  type InsertApiRequest,
  type ApiConfiguration,
  type InsertApiConfiguration
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // API Request methods
  createApiRequest(request: InsertApiRequest): Promise<ApiRequest>;
  getApiRequests(): Promise<ApiRequest[]>;
  getApiRequest(id: number): Promise<ApiRequest | undefined>;
  
  // API Configuration methods
  createApiConfiguration(config: InsertApiConfiguration): Promise<ApiConfiguration>;
  getApiConfigurations(): Promise<ApiConfiguration[]>;
  getApiConfiguration(id: number): Promise<ApiConfiguration | undefined>;
  updateApiConfiguration(id: number, config: Partial<InsertApiConfiguration>): Promise<ApiConfiguration | undefined>;
  deleteApiConfiguration(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiRequests: Map<number, ApiRequest>;
  private apiConfigurations: Map<number, ApiConfiguration>;
  private currentUserId: number;
  private currentRequestId: number;
  private currentConfigId: number;

  constructor() {
    this.users = new Map();
    this.apiRequests = new Map();
    this.apiConfigurations = new Map();
    this.currentUserId = 1;
    this.currentRequestId = 1;
    this.currentConfigId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createApiRequest(insertRequest: InsertApiRequest): Promise<ApiRequest> {
    const id = this.currentRequestId++;
    const request: ApiRequest = { 
      ...insertRequest, 
      id,
      timestamp: new Date(),
      body: insertRequest.body || null,
      duration: insertRequest.duration || null,
      status: insertRequest.status || null,
      headers: insertRequest.headers || {},
      response: insertRequest.response || null
    };
    this.apiRequests.set(id, request);
    return request;
  }

  async getApiRequests(): Promise<ApiRequest[]> {
    return Array.from(this.apiRequests.values())
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime());
  }

  async getApiRequest(id: number): Promise<ApiRequest | undefined> {
    return this.apiRequests.get(id);
  }

  async createApiConfiguration(insertConfig: InsertApiConfiguration): Promise<ApiConfiguration> {
    const id = this.currentConfigId++;
    const config: ApiConfiguration = { 
      ...insertConfig, 
      id,
      createdAt: new Date(),
      description: insertConfig.description || null
    };
    this.apiConfigurations.set(id, config);
    return config;
  }

  async getApiConfigurations(): Promise<ApiConfiguration[]> {
    return Array.from(this.apiConfigurations.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getApiConfiguration(id: number): Promise<ApiConfiguration | undefined> {
    return this.apiConfigurations.get(id);
  }

  async updateApiConfiguration(id: number, updateConfig: Partial<InsertApiConfiguration>): Promise<ApiConfiguration | undefined> {
    const existing = this.apiConfigurations.get(id);
    if (!existing) return undefined;
    
    const updated: ApiConfiguration = { ...existing, ...updateConfig };
    this.apiConfigurations.set(id, updated);
    return updated;
  }

  async deleteApiConfiguration(id: number): Promise<boolean> {
    return this.apiConfigurations.delete(id);
  }
}

export const storage = new MemStorage();
