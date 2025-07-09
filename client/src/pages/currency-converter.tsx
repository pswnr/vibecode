import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, TrendingUp, RefreshCw, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export default function CurrencyConverter() {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("usd");
  const [toCurrency, setToCurrency] = useState<string>("thb");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const currencies: CurrencyInfo[] = [
    { code: "usd", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
    { code: "eur", name: "Euro", symbol: "€", flag: "🇪🇺" },
    { code: "thb", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
    { code: "jpy", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
    { code: "gbp", name: "British Pound", symbol: "£", flag: "🇬🇧" },
    { code: "cad", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
    { code: "aud", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
    { code: "chf", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
    { code: "cny", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
    { code: "sgd", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
    { code: "hkd", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
    { code: "krw", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
    { code: "inr", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
    { code: "myr", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
    { code: "php", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭" },
    { code: "idr", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩" },
    { code: "vnd", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳" },
    { code: "nzd", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
    { code: "rub", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺" },
    { code: "brl", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" }
  ];

  const fetchExchangeRates = async (baseCurrency: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCurrency}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setExchangeRates(data[baseCurrency] || {});
      setLastUpdated(new Date().toLocaleString('th-TH'));
      
      toast({
        title: "อัปเดตอัตราแลกเปลี่ยนแล้ว",
        description: "ได้รับข้อมูลอัตราแลกเปลี่ยนล่าสุด",
      });
    } catch (error: any) {
      console.error("Error fetching exchange rates:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลอัตราแลกเปลี่ยนได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const convertCurrency = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "จำนวนเงินไม่ถูกต้อง",
        description: "กรุณาใส่จำนวนเงินที่ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    if (fromCurrency === toCurrency) {
      setConvertedAmount(numAmount);
      return;
    }

    const rate = exchangeRates[toCurrency];
    if (rate) {
      setConvertedAmount(numAmount * rate);
    } else {
      toast({
        title: "ไม่พบอัตราแลกเปลี่ยน",
        description: "กรุณาอัปเดตอัตราแลกเปลี่ยน",
        variant: "destructive",
      });
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  useEffect(() => {
    fetchExchangeRates(fromCurrency);
  }, [fromCurrency]);

  useEffect(() => {
    if (exchangeRates[toCurrency] && amount) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  const getCurrencyInfo = (code: string) => {
    return currencies.find(c => c.code === code) || { code, name: code.toUpperCase(), symbol: code.toUpperCase(), flag: "💱" };
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num);
  };

  const popularPairs = [
    { from: "usd", to: "thb", label: "USD → THB" },
    { from: "eur", to: "thb", label: "EUR → THB" },
    { from: "thb", to: "usd", label: "THB → USD" },
    { from: "jpy", to: "thb", label: "JPY → THB" },
    { from: "gbp", to: "thb", label: "GBP → THB" },
    { from: "sgd", to: "thb", label: "SGD → THB" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Currency Converter</h1>
          </div>
          <p className="text-gray-600">เครื่องมือแปลงสกุลเงินแบบเรียลไทม์</p>
          {lastUpdated && (
            <Badge variant="secondary" className="mt-2">
              อัปเดตล่าสุด: {lastUpdated}
            </Badge>
          )}
        </div>

        {/* Quick Access Pairs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2" size={20} />
              สกุลเงินยอดนิยม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {popularPairs.map((pair, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto p-3 justify-start"
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span>{getCurrencyInfo(pair.from).flag}</span>
                    <ArrowUpDown size={14} />
                    <span>{getCurrencyInfo(pair.to).flag}</span>
                    <span className="text-sm">{pair.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Converter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>แปลงสกุลเงิน</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchExchangeRates(fromCurrency)}
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} size={16} />
                  อัปเดต
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2">จำนวนเงิน</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* From Currency */}
              <div>
                <label className="block text-sm font-medium mb-2">จาก</label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center space-x-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code.toUpperCase()}</span>
                          <span className="text-sm text-gray-500">- {currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapCurrencies}
                  className="rounded-full"
                >
                  <ArrowUpDown size={16} />
                </Button>
              </div>

              {/* To Currency */}
              <div>
                <label className="block text-sm font-medium mb-2">เป็น</label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center space-x-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code.toUpperCase()}</span>
                          <span className="text-sm text-gray-500">- {currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Convert Button */}
              <Button
                onClick={convertCurrency}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    กำลังคำนวณ...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2" size={16} />
                    แปลงสกุลเงิน
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ผลลัพธ์</CardTitle>
            </CardHeader>
            <CardContent>
              {convertedAmount > 0 ? (
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">
                      {formatNumber(parseFloat(amount))} {getCurrencyInfo(fromCurrency).name}
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-2">
                      {getCurrencyInfo(toCurrency).symbol} {formatNumber(convertedAmount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getCurrencyInfo(toCurrency).name}
                    </div>
                  </div>

                  {/* Exchange Rate */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">อัตราแลกเปลี่ยน</div>
                    <div className="text-lg">
                      1 {getCurrencyInfo(fromCurrency).symbol} = {formatNumber(exchangeRates[toCurrency] || 0)} {getCurrencyInfo(toCurrency).symbol}
                    </div>
                  </div>

                  {/* Inverse Rate */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">อัตราย้อนกลับ</div>
                    <div className="text-lg">
                      1 {getCurrencyInfo(toCurrency).symbol} = {formatNumber(1 / (exchangeRates[toCurrency] || 1))} {getCurrencyInfo(fromCurrency).symbol}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
                  <p>ใส่จำนวนเงินเพื่อดูผลการแปลง</p>
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
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">ใส่จำนวนเงิน</h4>
                  <p className="text-gray-600">ระบุจำนวนเงินที่ต้องการแปลง</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">เลือกสกุลเงิน</h4>
                  <p className="text-gray-600">เลือกสกุลเงินต้นทางและปลายทาง</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">ดูผลลัพธ์</h4>
                  <p className="text-gray-600">ระบบจะแสดงผลการแปลงโดยอัตโนมัติ</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}