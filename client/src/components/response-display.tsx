import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Expand } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResponseDisplayProps {
  response: any;
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
}

export default function ResponseDisplay({ response, activeTab, onActiveTabChange }: ResponseDisplayProps) {
  const { toast } = useToast();

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-100 text-green-700";
    if (status >= 400 && status < 500) return "bg-amber-100 text-amber-700";
    if (status >= 500) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Response data has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadResponse = () => {
    if (!response) return;
    
    const dataStr = JSON.stringify(response.data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `response-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!response) {
    return (
      <Card className="flex-1 border-0 rounded-none">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="text-center text-slate-500">
            <p className="text-lg font-medium">No response yet</p>
            <p className="text-sm mt-1">Send a request to see the response here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const responseSize = JSON.stringify(response.data).length;

  return (
    <Card className="flex-1 border-0 rounded-none overflow-hidden">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Response</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Status:</span>
              <Badge className={`text-xs font-medium ${getStatusColor(response.status)}`}>
                {response.status} {response.statusText}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Time:</span>
              <span className="text-sm font-medium text-slate-700">{response.duration}ms</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Size:</span>
              <span className="text-sm font-medium text-slate-700">{formatBytes(responseSize)}</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={onActiveTabChange} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="body" className="flex-1 flex flex-col mt-4">
            <div className="bg-slate-900 rounded-lg p-4 overflow-auto flex-1">
              <pre className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="headers" className="flex-1 flex flex-col mt-4">
            <div className="bg-slate-900 rounded-lg p-4 overflow-auto flex-1">
              <pre className="text-sm text-slate-300 font-mono leading-relaxed">
                {JSON.stringify(response.headers, null, 2)}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="cookies" className="flex-1 flex flex-col mt-4">
            <div className="bg-slate-900 rounded-lg p-4 overflow-auto flex-1">
              <pre className="text-sm text-slate-300 font-mono leading-relaxed">
                {JSON.stringify({}, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
            >
              <Copy className="mr-1" size={16} />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadResponse}
            >
              <Download className="mr-1" size={16} />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const win = window.open('', '_blank');
                if (win) {
                  win.document.body.innerHTML = `<pre>${JSON.stringify(response.data, null, 2)}</pre>`;
                }
              }}
            >
              <Expand className="mr-1" size={16} />
              Expand
            </Button>
          </div>
          <div className="text-sm text-slate-500">
            Response received at {new Date().toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
