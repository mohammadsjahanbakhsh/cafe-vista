import { useState } from "react";
import { Table, TableStatus } from "@/types/cafe";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableGridProps {
  tables: Table[];
  onTableClick: (table: Table) => void;
  className?: string;
}

const tableStatusConfig = {
  empty: {
    color: "table-empty",
    label: "خالی",
    textColor: "text-white",
  },
  reserved: {
    color: "table-reserved", 
    label: "رزرو",
    textColor: "text-coffee-dark",
  },
  occupied: {
    color: "table-occupied",
    label: "در حال سرویس",
    textColor: "text-white",
  },
  paid: {
    color: "table-paid",
    label: "تسویه شده", 
    textColor: "text-white",
  },
};

const TableCard = ({ table, onClick }: { table: Table; onClick: () => void }) => {
  const config = tableStatusConfig[table.status];
  
  return (
    <Card 
      className={cn(
        "relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-table border-0",
        "bg-gradient-to-br backdrop-blur-sm min-h-[120px] flex flex-col justify-between p-4",
        `from-${config.color} to-${config.color}/80`
      )}
      onClick={onClick}
    >
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className={cn("font-bold text-lg", config.textColor)}>
          {table.name}
        </div>
        <Badge 
          variant="secondary" 
          className={cn("text-xs font-medium", config.textColor, "bg-white/20")}
        >
          {config.label}
        </Badge>
      </div>
      
      {/* Table Info */}
      <div className="flex items-center justify-between mt-2">
        <div className={cn("flex items-center gap-1 text-sm", config.textColor)}>
          <Users className="w-4 h-4" />
          <span>{table.capacity} نفره</span>
        </div>
        
        {table.status === 'occupied' && table.lastActivity && (
          <div className={cn("flex items-center gap-1 text-xs", config.textColor)}>
            <Clock className="w-3 h-3" />
            <span>
              {Math.floor((Date.now() - table.lastActivity.getTime()) / 60000)}د
            </span>
          </div>
        )}
      </div>
      
      {/* Order Summary */}
      {table.currentOrder && (
        <div className={cn("mt-2 text-xs", config.textColor)}>
          <div className="flex items-center gap-1">
            <Coffee className="w-3 h-3" />
            <span>{table.currentOrder.items.length} آیتم</span>
          </div>
          <div className="font-medium">
            {table.currentOrder.totalAmount.toLocaleString()} تومان
          </div>
        </div>
      )}
    </Card>
  );
};

const TableGrid = ({ tables, onTableClick, className }: TableGridProps) => {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", className)}>
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onClick={() => onTableClick(table)}
        />
      ))}
    </div>
  );
};

export default TableGrid;