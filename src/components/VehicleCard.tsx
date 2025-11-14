import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  license_plate?: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: () => void;
}

export function VehicleCard({ vehicle, isSelected, onSelect }: VehicleCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-md"
      )}
      onClick={onSelect}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            isSelected ? "bg-primary" : "bg-secondary"
          )}>
            <Car className={cn(
              "w-6 h-6",
              isSelected ? "text-primary-foreground" : "text-foreground"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {vehicle.license_plate && (
                <Badge variant="outline">{vehicle.license_plate}</Badge>
              )}
              {vehicle.vin && (
                <Badge variant="secondary" className="text-xs">
                  VIN: {vehicle.vin.slice(-6)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
