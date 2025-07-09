import { useState } from "react";
import ApiHeader from "@/components/api-header";
import ApiSidebar from "@/components/api-sidebar";
import RequestBuilder from "@/components/request-builder";
import ResponseDisplay from "@/components/response-display";
import SaveConfigModal from "@/components/save-config-modal";
import { ApiRequest, ApiConfiguration } from "@shared/schema";

export default function ApiTester() {
  const [currentRequest, setCurrentRequest] = useState<{
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string;
  }>({
    method: "GET",
    url: "",
    headers: {},
    body: "",
  });

  const [currentResponse, setCurrentResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeTab, setActiveTab] = useState("headers");
  const [responseTab, setResponseTab] = useState("body");

  const handleRequestChange = (updates: Partial<typeof currentRequest>) => {
    setCurrentRequest(prev => ({ ...prev, ...updates }));
  };

  const handleLoadRequest = (request: ApiRequest) => {
    setCurrentRequest({
      method: request.method,
      url: request.url,
      headers: (request.headers as Record<string, string>) || {},
      body: request.body || "",
    });
    if (request.response) {
      setCurrentResponse({
        data: request.response,
        status: request.status || 0,
        statusText: request.status === 200 ? "OK" : "Error",
        headers: {},
        duration: request.duration || 0,
      });
    }
  };

  const handleLoadConfiguration = (config: ApiConfiguration) => {
    // Load the first endpoint from the configuration
    const endpoints = config.endpoints as any[];
    if (endpoints && endpoints.length > 0) {
      const firstEndpoint = endpoints[0];
      setCurrentRequest({
        method: firstEndpoint.method || "GET",
        url: firstEndpoint.url || "",
        headers: firstEndpoint.headers || {},
        body: firstEndpoint.body || "",
      });
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      <ApiHeader onSaveConfig={() => setShowSaveModal(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        <ApiSidebar 
          onLoadRequest={handleLoadRequest}
          onLoadConfiguration={handleLoadConfiguration}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <RequestBuilder
            request={currentRequest}
            onRequestChange={handleRequestChange}
            onResponse={setCurrentResponse}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
            activeTab={activeTab}
            onActiveTabChange={setActiveTab}
          />
          
          <ResponseDisplay
            response={currentResponse}
            activeTab={responseTab}
            onActiveTabChange={setResponseTab}
          />
        </div>
      </div>

      <SaveConfigModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        currentRequest={currentRequest}
      />
    </div>
  );
}
