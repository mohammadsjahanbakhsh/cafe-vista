import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Users, Table as TableIcon } from "lucide-react";
import { mockHalls } from "@/data/mockData";
import { Hall, Table, TableStatus } from "@/types/cafe";
import { useToast } from "@/hooks/use-toast";

const TableManagement = () => {
  const [halls, setHalls] = useState<Hall[]>(mockHalls);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 2,
    hallId: "",
    status: "empty" as TableStatus
  });
  const { toast } = useToast();

  const handleAddTable = () => {
    setSelectedTable(null);
    setFormData({ name: "", capacity: 2, hallId: "", status: "empty" });
    setIsDialogOpen(true);
  };

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity,
      hallId: table.hallId,
      status: table.status
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTable = (tableId: string) => {
    setHalls(prev => prev.map(hall => ({
      ...hall,
      tables: hall.tables.filter(table => table.id !== tableId)
    })));
    
    toast({
      title: "میز حذف شد",
      description: "میز با موفقیت حذف شد"
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "خطا در ثبت",
        description: "نام میز الزامی است",
        variant: "destructive"
      });
      return;
    }

    if (!formData.hallId) {
      toast({
        title: "خطا در ثبت", 
        description: "انتخاب سالن الزامی است",
        variant: "destructive"
      });
      return;
    }

    if (selectedTable) {
      // Edit existing table
      setHalls(prev => prev.map(hall => ({
        ...hall,
        tables: hall.tables.map(table => 
          table.id === selectedTable.id
            ? {
                ...table,
                name: formData.name,
                capacity: formData.capacity,
                hallId: formData.hallId,
                status: formData.status
              }
            : table
        )
      })));
      
      // If hall changed, move table to new hall
      if (selectedTable.hallId !== formData.hallId) {
        setHalls(prev => {
          // Remove from old hall
          const withoutOldTable = prev.map(hall => ({
            ...hall,
            tables: hall.tables.filter(table => table.id !== selectedTable.id)
          }));
          
          // Add to new hall
          return withoutOldTable.map(hall => 
            hall.id === formData.hallId
              ? {
                  ...hall,
                  tables: [...hall.tables, {
                    ...selectedTable,
                    name: formData.name,
                    capacity: formData.capacity,
                    hallId: formData.hallId,
                    status: formData.status
                  }]
                }
              : hall
          );
        });
      }
      
      toast({
        title: "میز بروزرسانی شد",
        description: "اطلاعات میز با موفقیت بروزرسانی شد"
      });
    } else {
      // Add new table
      const newTable: Table = {
        id: `table-${Date.now()}`,
        name: formData.name,
        capacity: formData.capacity,
        status: formData.status,
        hallId: formData.hallId,
        lastActivity: new Date()
      };
      
      setHalls(prev => prev.map(hall => 
        hall.id === formData.hallId
          ? { ...hall, tables: [...hall.tables, newTable] }
          : hall
      ));
      
      toast({
        title: "میز اضافه شد",
        description: "میز جدید با موفقیت اضافه شد"
      });
    }

    setIsDialogOpen(false);
    setFormData({ name: "", capacity: 2, hallId: "", status: "empty" });
    setSelectedTable(null);
  };

  const getStatusLabel = (status: TableStatus) => {
    const labels = {
      empty: "خالی",
      reserved: "رزرو شده",
      occupied: "در حال سرویس", 
      paid: "تسویه شده"
    };
    return labels[status];
  };

  const getStatusColor = (status: TableStatus) => {
    const colors = {
      empty: "bg-table-empty",
      reserved: "bg-table-reserved",
      occupied: "bg-table-occupied",
      paid: "bg-table-paid"
    };
    return colors[status];
  };

  const getAllTables = () => {
    return halls.flatMap(hall => 
      hall.tables.map(table => ({
        ...table,
        hallName: hall.name
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Table Button */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddTable} className="gap-2">
              <Plus className="w-4 h-4" />
              افزودن میز جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedTable ? "ویرایش میز" : "افزودن میز جدید"}
              </DialogTitle>
              <DialogDescription>
                اطلاعات میز را وارد کنید
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="table-name">نام میز</Label>
                <Input
                  id="table-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: A1"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="table-capacity">ظرفیت</Label>
                <Select 
                  value={formData.capacity.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, capacity: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب ظرفیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 نفره</SelectItem>
                    <SelectItem value="4">4 نفره</SelectItem>
                    <SelectItem value="6">6 نفره</SelectItem>
                    <SelectItem value="8">8 نفره</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="table-hall">سالن</Label>
                <Select 
                  value={formData.hallId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, hallId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب سالن" />
                  </SelectTrigger>
                  <SelectContent>
                    {halls.map((hall) => (
                      <SelectItem key={hall.id} value={hall.id}>
                        {hall.name} - طبقه {hall.floor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="table-status">وضعیت اولیه</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as TableStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empty">خالی</SelectItem>
                    <SelectItem value="reserved">رزرو شده</SelectItem>
                    <SelectItem value="occupied">در حال سرویس</SelectItem>
                    <SelectItem value="paid">تسویه شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                انصراف
              </Button>
              <Button onClick={handleSubmit}>
                {selectedTable ? "بروزرسانی" : "افزودن"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tables List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {getAllTables().map((table) => (
          <Card key={table.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TableIcon className="w-5 h-5 text-primary" />
                  {table.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`}></div>
                  <Badge variant="secondary" className="text-xs">
                    {getStatusLabel(table.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{table.capacity} نفره</span>
                </div>
                <div>
                  <span className="font-medium">سالن:</span> {table.hallName}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTable(table)}
                  className="flex-1"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  ویرایش
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteTable(table.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {getAllTables().length === 0 && (
        <div className="text-center py-12">
          <TableIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            هیچ میزی یافت نشد
          </h3>
          <p className="text-sm text-muted-foreground">
            برای شروع، یک میز جدید اضافه کنید
          </p>
        </div>
      )}
    </div>
  );
};

export default TableManagement;