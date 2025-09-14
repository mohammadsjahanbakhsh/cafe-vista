import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Users, Building } from "lucide-react";
import { mockHalls } from "@/data/mockData";
import { Hall } from "@/types/cafe";
import { useToast } from "@/hooks/use-toast";

const HallManagement = () => {
  const [halls, setHalls] = useState<Hall[]>(mockHalls);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    floor: 1
  });
  const { toast } = useToast();

  const handleAddHall = () => {
    setSelectedHall(null);
    setFormData({ name: "", floor: 1 });
    setIsDialogOpen(true);
  };

  const handleEditHall = (hall: Hall) => {
    setSelectedHall(hall);
    setFormData({
      name: hall.name,
      floor: hall.floor
    });
    setIsDialogOpen(true);
  };

  const handleDeleteHall = (hallId: string) => {
    const hallToDelete = halls.find(h => h.id === hallId);
    if (hallToDelete && hallToDelete.tables.length > 0) {
      toast({
        title: "خطا در حذف سالن",
        description: "ابتدا تمام میزهای سالن را حذف کنید",
        variant: "destructive"
      });
      return;
    }

    setHalls(prev => prev.filter(h => h.id !== hallId));
    toast({
      title: "سالن حذف شد",
      description: "سالن با موفقیت حذف شد"
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "خطا در ثبت",
        description: "نام سالن الزامی است",
        variant: "destructive"
      });
      return;
    }

    if (selectedHall) {
      // Edit existing hall
      setHalls(prev => prev.map(hall => 
        hall.id === selectedHall.id 
          ? { ...hall, name: formData.name, floor: formData.floor }
          : hall
      ));
      toast({
        title: "سالن بروزرسانی شد",
        description: "اطلاعات سالن با موفقیت بروزرسانی شد"
      });
    } else {
      // Add new hall
      const newHall: Hall = {
        id: `hall-${Date.now()}`,
        name: formData.name,
        floor: formData.floor,
        tables: []
      };
      setHalls(prev => [...prev, newHall]);
      toast({
        title: "سالن اضافه شد",
        description: "سالن جدید با موفقیت اضافه شد"
      });
    }

    setIsDialogOpen(false);
    setFormData({ name: "", floor: 1 });
    setSelectedHall(null);
  };

  const getFloorLabel = (floor: number) => {
    return floor === 1 ? "طبقه اول" : "طبقه دوم";
  };

  return (
    <div className="space-y-6">
      {/* Add Hall Button */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddHall} className="gap-2">
              <Plus className="w-4 h-4" />
              افزودن سالن جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedHall ? "ویرایش سالن" : "افزودن سالن جدید"}
              </DialogTitle>
              <DialogDescription>
                اطلاعات سالن را وارد کنید
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="hall-name">نام سالن</Label>
                <Input
                  id="hall-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: سالن TV"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="hall-floor">طبقه</Label>
                <Select 
                  value={formData.floor.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, floor: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب طبقه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">طبقه اول</SelectItem>
                    <SelectItem value="2">طبقه دوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                انصراف
              </Button>
              <Button onClick={handleSubmit}>
                {selectedHall ? "بروزرسانی" : "افزودن"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Halls List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {halls.map((hall) => (
          <Card key={hall.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  {hall.name}
                </CardTitle>
                <Badge variant="secondary">
                  {getFloorLabel(hall.floor)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{hall.tables.length} میز</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditHall(hall)}
                  className="flex-1"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  ویرایش
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteHall(hall.id)}
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

      {halls.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            هیچ سالنی یافت نشد
          </h3>
          <p className="text-sm text-muted-foreground">
            برای شروع، یک سالن جدید اضافه کنید
          </p>
        </div>
      )}
    </div>
  );
};

export default HallManagement;