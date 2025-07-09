import { Button } from "@/components/ui/button";
import { Code, Download, Upload, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface ApiHeaderProps {
  onSaveConfig: () => void;
}

export default function ApiHeader({ onSaveConfig }: ApiHeaderProps) {
  const { toast } = useToast();

  const { data: configurations } = useQuery({
    queryKey: ["/api/configurations"],
  });

  const handleExport = () => {
    if (!configurations || configurations.length === 0) {
      toast({
        title: "No configurations to export",
        description: "Save some configurations first before exporting.",
        variant: "destructive",
      });
      return;
    }

    const dataStr = JSON.stringify(configurations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'vibecode-api-configs.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Configurations exported",
      description: "Your API configurations have been exported successfully.",
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const configurations = JSON.parse(e.target?.result as string);
            
            // Import each configuration
            for (const config of configurations) {
              await apiClient.post("/configurations", {
                name: config.name,
                description: config.description,
                endpoints: config.endpoints,
              });
            }
            
            toast({
              title: "Configurations imported",
              description: "Your API configurations have been imported successfully.",
            });
          } catch (error) {
            toast({
              title: "Import failed",
              description: "Failed to import configurations. Please check the file format.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-semibold text-slate-800">VibeCode</h1>
          </div>
          <span className="text-slate-500 text-sm">API Testing Interface</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-slate-600 hover:text-slate-800"
          >
            <Download className="mr-1" size={16} />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="text-slate-600 hover:text-slate-800"
          >
            <Upload className="mr-1" size={16} />
            Import
          </Button>
          
          <Button
            size="sm"
            onClick={onSaveConfig}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="mr-1" size={16} />
            Save Config
          </Button>
        </div>
      </div>
    </header>
  );
}
