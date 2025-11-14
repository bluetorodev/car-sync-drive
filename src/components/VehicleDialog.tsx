import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const vehicleSchema = z.object({
  make: z.string().trim().min(1, { message: "Make is required" }).max(100),
  model: z.string().trim().min(1, { message: "Model is required" }).max(100),
  year: z.number().min(1900).max(2100, { message: "Year must be between 1900 and 2100" }),
  vin: z.string().trim().max(17).optional(),
  license_plate: z.string().trim().max(20).optional(),
});

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VehicleDialog({ open, onOpenChange, onSuccess }: VehicleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    license_plate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    try {
      vehicleSchema.parse({
        ...formData,
        vin: formData.vin || undefined,
        license_plate: formData.license_plate || undefined,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to add a vehicle');
        return;
      }

      const { error } = await supabase.from('vehicles').insert({
        user_id: user.id,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        vin: formData.vin || null,
        license_plate: formData.license_plate || null,
      });

      if (error) throw error;

      toast.success('Vehicle added successfully!');
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        license_plate: '',
      });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Enter the details of your vehicle
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="Toyota"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Camry"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              min="1900"
              max="2100"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vin">VIN (Optional)</Label>
            <Input
              id="vin"
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              placeholder="1HGBH41JXMN109186"
              maxLength={17}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="license_plate">License Plate (Optional)</Label>
            <Input
              id="license_plate"
              value={formData.license_plate}
              onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
              placeholder="ABC-1234"
              maxLength={20}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
