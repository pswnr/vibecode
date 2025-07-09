import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Copy, Globe } from "lucide-react";
import { makeApiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function SimpleApiTester() {
  const { toast } = useToast();
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!url) {
      toast({
        title: "กรุณาใส่ URL",
        description: "กรุณาใส่ URL ที่ต้องการทดสอบ",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await makeApiRequest({
        method,
        url,
        headers: { "Content-Type": "application/json" },
        body: body || undefined,
      });
      
      setResponse(result);
      
      toast({
        title: "ส่งคำขอสำเร็จ",
        description: `${method} ${url} - ${result.status}`,
      });
    } catch (error: any) {
      const errorResponse = {
        data: error.response?.data || { error: error.message },
        status: error.response?.status || 0,
        statusText: error.response?.statusText || "Error",
        headers: error.response?.headers || {},
        duration: error.response?.data?.duration || 0,
      };
      
      setResponse(errorResponse);
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-100 text-green-700";
    if (status >= 400 && status < 500) return "bg-yellow-100 text-yellow-700";
    if (status >= 500) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const copyResponse = async () => {
    if (!response) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      toast({
        title: "คัดลอกแล้ว",
        description: "คัดลอกข้อมูล response ไปยัง clipboard แล้ว",
      });
    } catch (error) {
      toast({
        title: "คัดลอกไม่สำเร็จ",
        description: "ไม่สามารถคัดลอกข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  const quickTestApis = [
    {
      name: "JSONPlaceholder - Posts",
      method: "GET",
      url: "https://jsonplaceholder.typicode.com/posts/1",
      body: ""
    },
    {
      name: "JSONPlaceholder - Users",
      method: "GET", 
      url: "https://jsonplaceholder.typicode.com/users",
      body: ""
    },
    {
      name: "HTTPBin - GET Test",
      method: "GET",
      url: "https://httpbin.org/get",
      body: ""
    },
    {
      name: "HTTPBin - POST Test",
      method: "POST",
      url: "https://httpbin.org/post",
      body: JSON.stringify({ message: "Hello World", timestamp: Date.now() }, null, 2)
    }
  ];

  const loadQuickTest = (api: any) => {
    setMethod(api.method);
    setUrl(api.url);
    setBody(api.body);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Globe className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">API Tester</h1>
          </div>
          <p className="text-gray-600">เครื่องมือทดสอบ API ง่ายๆ สำหรับทุกคน</p>
        </div>

        {/* Quick Test APIs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">ตัวอย่าง API สำหรับทดสอบ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickTestApis.map((api, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto p-3 justify-start"
                  onClick={() => loadQuickTest(api)}
                >
                  <div>
                    <div className="font-medium">{api.name}</div>
                    <div className="text-sm text-gray-500">{api.method} {api.url}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ส่งคำขอ API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-3">
                <Select value={method} onValueChange={setMethod}>
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
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
              </div>

              {(method === "POST" || method === "PUT") && (
                <div>
                  <label className="block text-sm font-medium mb-2">Request Body (JSON)</label>
                  <Textarea
                    placeholder='{"key": "value"}'
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-[120px] font-mono text-sm"
                  />
                </div>
              )}

              <Button
                onClick={handleSendRequest}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    กำลังส่งคำขอ...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={16} />
                    ส่งคำขอ
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Response Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>ผลลัพธ์</span>
                {response && (
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(response.status)}>
                      {response.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{response.duration}ms</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!response ? (
                <div className="text-center py-8 text-gray-500">
                  <Globe size={48} className="mx-auto mb-4 opacity-50" />
                  <p>ส่งคำขอเพื่อดูผลลัพธ์</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Data:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyResponse}
                    >
                      <Copy className="mr-1" size={14} />
                      คัดลอก
                    </Button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">วิธีใช้งาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">เลือก Method</h4>
                  <p className="text-gray-600">เลือก GET, POST, PUT, หรือ DELETE</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">ใส่ URL</h4>
                  <p className="text-gray-600">ใส่ URL ของ API ที่ต้องการทดสอบ</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">ส่งคำขอ</h4>
                  <p className="text-gray-600">คลิก "ส่งคำขอ" และดูผลลัพธ์</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}