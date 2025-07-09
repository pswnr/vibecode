import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Plus, X } from "lucide-react";
import { makeApiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface RequestBuilderProps {
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string;
  };
  onRequestChange: (updates: Partial<RequestBuilderProps['request']>) => void;
  onResponse: (response: any) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
}

export default function RequestBuilder({
  request,
  onRequestChange,
  onResponse,
  isLoading,
  onLoadingChange,
  activeTab,
  onActiveTabChange,
}: RequestBuilderProps) {
  const { toast } = useToast();
  const [headerPairs, setHeaderPairs] = useState<Array<{ key: string; value: string }>>([]);

  useEffect(() => {
    // Convert headers object to array of key-value pairs
    const pairs = Object.entries(request.headers).map(([key, value]) => ({ key, value }));
    if (pairs.length === 0) {
      pairs.push({ key: "", value: "" });
    }
    setHeaderPairs(pairs);
  }, [request.headers]);

  const handleSendRequest = async () => {
    if (!request.url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    onLoadingChange(true);
    
    try {
      const response = await makeApiRequest({
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body || undefined,
      });
      
      onResponse(response);
      
      toast({
        title: "Request completed",
        description: `${request.method} ${request.url} - ${response.status} ${response.statusText}`,
      });
    } catch (error: any) {
      const errorResponse = {
        data: error.response?.data || { error: error.message },
        status: error.response?.status || 0,
        statusText: error.response?.statusText || "Error",
        headers: error.response?.headers || {},
        duration: error.response?.data?.duration || 0,
      };
      
      onResponse(errorResponse);
      
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      onLoadingChange(false);
    }
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaderPairs = [...headerPairs];
    newHeaderPairs[index][field] = value;
    setHeaderPairs(newHeaderPairs);
    
    // Update the headers object
    const newHeaders: Record<string, string> = {};
    newHeaderPairs.forEach(({ key, value }) => {
      if (key && value) {
        newHeaders[key] = value;
      }
    });
    
    onRequestChange({ headers: newHeaders });
  };

  const addHeaderPair = () => {
    setHeaderPairs([...headerPairs, { key: "", value: "" }]);
  };

  const removeHeaderPair = (index: number) => {
    if (headerPairs.length > 1) {
      const newHeaderPairs = headerPairs.filter((_, i) => i !== index);
      setHeaderPairs(newHeaderPairs);
      
      const newHeaders: Record<string, string> = {};
      newHeaderPairs.forEach(({ key, value }) => {
        if (key && value) {
          newHeaders[key] = value;
        }
      });
      
      onRequestChange({ headers: newHeaders });
    }
  };

  return (
    <Card className="border-0 rounded-none border-b border-slate-200">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">API Request Builder</h2>
        
        <div className="flex space-x-3 mb-4">
          <Select value={request.method} onValueChange={(method) => onRequestChange({ method })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="url"
            placeholder="https://api.example.com/endpoint"
            value={request.url}
            onChange={(e) => onRequestChange({ url: e.target.value })}
            className="flex-1"
          />
          
          <Button
            onClick={handleSendRequest}
            disabled={isLoading}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2" size={16} />
                Send Request
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={onActiveTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="params">Params</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
          </TabsList>
          
          <TabsContent value="headers" className="mt-4">
            <div className="space-y-3">
              {headerPairs.map((pair, index) => (
                <div key={index} className="flex space-x-3 items-center">
                  <Input
                    placeholder="Header Key"
                    value={pair.key}
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Header Value"
                    value={pair.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHeaderPair(index)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={addHeaderPair}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="mr-1" size={16} />
                Add Header
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="body" className="mt-4">
            <div className="space-y-3">
              <Label>Request Body</Label>
              <Textarea
                placeholder="Enter request body (JSON, XML, etc.)"
                value={request.body}
                onChange={(e) => onRequestChange({ body: e.target.value })}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="params" className="mt-4">
            <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
              URL parameters functionality coming soon...
            </div>
          </TabsContent>
          
          <TabsContent value="auth" className="mt-4">
            <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
              Authentication options coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
