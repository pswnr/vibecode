import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreHorizontal } from "lucide-react";
import { ApiRequest, ApiConfiguration } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ApiSidebarProps {
  onLoadRequest: (request: ApiRequest) => void;
  onLoadConfiguration: (config: ApiConfiguration) => void;
}

export default function ApiSidebar({ onLoadRequest, onLoadConfiguration }: ApiSidebarProps) {
  const { data: requests = [] } = useQuery<ApiRequest[]>({
    queryKey: ["/api/requests"],
  });

  const { data: configurations = [] } = useQuery<ApiConfiguration[]>({
    queryKey: ["/api/configurations"],
  });

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-green-100 text-green-700";
      case "POST":
        return "bg-blue-100 text-blue-700";
      case "PUT":
        return "bg-amber-100 text-amber-700";
      case "DELETE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 400 && status < 500) return "text-amber-600";
    if (status >= 500) return "text-red-600";
    return "text-gray-600";
  };

  const getStatusText = (status: number) => {
    if (status === 200) return "OK";
    if (status === 201) return "Created";
    if (status === 404) return "Not Found";
    if (status === 500) return "Internal Server Error";
    return status.toString();
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800 mb-3">Request History</h2>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {requests.length === 0 ? (
              <p className="text-sm text-slate-500">No requests yet</p>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  onClick={() => onLoadRequest(request)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={`text-xs font-medium ${getMethodColor(request.method)}`}>
                      {request.method.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {request.timestamp ? formatDistanceToNow(new Date(request.timestamp), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <div className="text-sm text-slate-700 truncate" title={request.url}>
                    {request.url}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    <span className={getStatusColor(request.status || 0)}>
                      {request.status} {getStatusText(request.status || 0)}
                    </span>
                    {request.duration && (
                      <span> • {request.duration}ms</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800 mb-3">Saved Configurations</h2>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {configurations.length === 0 ? (
              <p className="text-sm text-slate-500">No configurations saved</p>
            ) : (
              configurations.map((config) => (
                <div
                  key={config.id}
                  className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  onClick={() => onLoadConfiguration(config)}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-700">{config.name}</div>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {Array.isArray(config.endpoints) ? config.endpoints.length : 0} endpoints
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
