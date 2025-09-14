import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coffee, Users, LogOut, Settings, BarChart3, Clock } from "lucide-react";
import TableGrid from "@/components/TableGrid";
import OrderModal from "@/components/OrderModal";
import { mockHalls, getAllTables } from "@/data/mockData";
import { Table, User, TableStatus } from "@/types/cafe";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [allTables, setAllTables] = useState(getAllTables());
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/');
      return;
    }
    setCurrentUser(JSON.parse(user));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast({
      title: "خروج موفق",
      description: "با موفقیت از سیستم خارج شدید"
    });
    navigate('/');
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setOrderModalOpen(true);
  };

  const handleUpdateTableStatus = (tableId: string, newStatus: TableStatus) => {
    setAllTables(prevTables => 
      prevTables.map(table => 
        table.id === tableId 
          ? { ...table, status: newStatus, lastActivity: new Date() }
          : table
      )
    );
    
    toast({
      title: "وضعیت میز بروزرسانی شد",
      description: `میز ${tableId} به وضعیت ${getTableStatusLabel(newStatus)} تغییر کرد`,
    });
  };

  const getTableStatusLabel = (status: string) => {
    const labels = {
      empty: "خالی",
      reserved: "رزرو شده", 
      occupied: "در حال سرویس",
      paid: "تسویه شده"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTableStatusCounts = () => {
    return allTables.reduce((acc, table) => {
      acc[table.status] = (acc[table.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getTableStatusCounts();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cream/30 to-coffee-light/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mah.World Café</h1>
                <p className="text-sm text-muted-foreground">
                  خوش آمدید، {currentUser.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {currentUser.role === 'admin' ? 'مدیر سیستم' : 'سالن‌دار'}
              </Badge>
              
              {currentUser.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  تنظیمات
                </Button>
              )}
              
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                گزارشات
              </Button>
              
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-table-empty/10 border-table-empty/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">میزهای خالی</p>
                  <p className="text-2xl font-bold text-table-empty">{statusCounts.empty || 0}</p>
                </div>
                <div className="w-8 h-8 bg-table-empty rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-table-occupied/10 border-table-occupied/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">در حال سرویس</p>
                  <p className="text-2xl font-bold text-table-occupied">{statusCounts.occupied || 0}</p>
                </div>
                <div className="w-8 h-8 bg-table-occupied rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-table-reserved/10 border-table-reserved/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">رزرو شده</p>
                  <p className="text-2xl font-bold text-table-reserved">{statusCounts.reserved || 0}</p>
                </div>
                <div className="w-8 h-8 bg-table-reserved rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-table-paid/10 border-table-paid/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تسویه شده</p>
                  <p className="text-2xl font-bold text-table-paid">{statusCounts.paid || 0}</p>
                </div>
                <div className="w-8 h-8 bg-table-paid rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables by Floor */}
        <Tabs defaultValue="floor1" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="floor1">طبقه اول</TabsTrigger>
            <TabsTrigger value="floor2">طبقه دوم</TabsTrigger>
          </TabsList>
          
          <TabsContent value="floor1" className="space-y-6">
            {mockHalls
              .filter(hall => hall.floor === 1)
              .map((hall) => (
                <Card key={hall.id} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {hall.name}
                    </CardTitle>
                    <CardDescription>
                      {hall.tables.length} میز • طبقه {hall.floor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TableGrid 
                      tables={hall.tables}
                      onTableClick={handleTableClick}
                    />
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
          
          <TabsContent value="floor2" className="space-y-6">
            {mockHalls
              .filter(hall => hall.floor === 2)
              .map((hall) => (
                <Card key={hall.id} className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {hall.name}
                    </CardTitle>
                    <CardDescription>
                      {hall.tables.length} میز • طبقه {hall.floor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TableGrid 
                      tables={hall.tables}
                      onTableClick={handleTableClick}
                    />
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* Order Modal */}
        <OrderModal
          table={selectedTable}
          open={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          onUpdateTableStatus={handleUpdateTableStatus}
        />
      </div>
    </div>
  );
};

export default Dashboard;