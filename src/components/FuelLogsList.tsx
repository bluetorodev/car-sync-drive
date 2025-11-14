import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Fuel, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';

const fuelLogSchema = z.object({
  odometer: z.number().min(0, { message: "Odometer must be positive" }),
  gallons: z.number().min(0.01, { message: "Gallons must be positive" }),
  price_per_gallon: z.number().min(0, { message: "Price must be positive" }),
  date: z.string().min(1, { message: "Date is required" }),
});

interface FuelLog {
  id: string;
  date: string;
  odometer: number;
  gallons: number;
  price_per_gallon: number;
}

export function FuelLogsList({ vehicleId }: { vehicleId: string }) {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    odometer: '',
    gallons: '',
    price_per_gallon: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadLogs();
  }, [vehicleId]);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('fuel_logs')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error loading fuel logs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      fuelLogSchema.parse({
        odometer: parseInt(formData.odometer),
        gallons: parseFloat(formData.gallons),
        price_per_gallon: parseFloat(formData.price_per_gallon),
        date: formData.date,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('fuel_logs').insert({
        vehicle_id: vehicleId,
        odometer: parseInt(formData.odometer),
        gallons: parseFloat(formData.gallons),
        price_per_gallon: parseFloat(formData.price_per_gallon),
        date: new Date(formData.date).toISOString(),
      });

      if (error) throw error;

      toast.success('Fuel log added!');
      setFormData({
        odometer: '',
        gallons: '',
        price_per_gallon: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      setShowForm(false);
      loadLogs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add fuel log');
    } finally {
      setLoading(false);
    }
  };

  const calculateMPG = () => {
    if (logs.length < 2) return null;
    const latest = logs[0];
    const previous = logs[1];
    const miles = latest.odometer - previous.odometer;
    const mpg = miles / latest.gallons;
    return mpg.toFixed(1);
  };

  const mpg = calculateMPG();

  return (
    <div className="space-y-4">
      {mpg && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm font-medium">Avg. MPG</span>
          </div>
          <span className="text-lg font-bold text-primary">{mpg}</span>
        </div>
      )}

      {!showForm ? (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Fill-up
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="odometer" className="text-xs">Odometer</Label>
            <Input
              id="odometer"
              type="number"
              value={formData.odometer}
              onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
              placeholder="125000"
              required
              className="h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="gallons" className="text-xs">Gallons</Label>
              <Input
                id="gallons"
                type="number"
                step="0.01"
                value={formData.gallons}
                onChange={(e) => setFormData({ ...formData, gallons: e.target.value })}
                placeholder="12.5"
                required
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs">$/Gallon</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price_per_gallon}
                onChange={(e) => setFormData({ ...formData, price_per_gallon: e.target.value })}
                placeholder="3.50"
                required
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading} className="flex-1">
              Add
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No fuel logs yet
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Fuel className="w-4 h-4 text-primary mt-1" />
                <div>
                  <p className="text-sm font-medium">{log.gallons} gal</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.date), 'MMM dd, yyyy')} • {log.odometer.toLocaleString()} mi
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">
                  ${(log.gallons * log.price_per_gallon).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  ${log.price_per_gallon.toFixed(2)}/gal
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
