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
  liters: z.number().min(0.01, { message: "Liters must be positive" }),
  price_per_liter: z.number().min(0, { message: "Price must be positive" }),
  date: z.string().min(1, { message: "Date is required" }),
});

interface FuelLog {
  id: string;
  date: string;
  odometer: number;
  liters: number;
  price_per_liter: number;
}

// Conversion constants
const GALLON_TO_LITER = 3.78541;
const MILES_TO_KILOMETERS = 1.60934;

// Currency formatting function for Indian Rupees
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Simple rupee formatting (fallback)
const formatRupees = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export function FuelLogsList({ vehicleId }: { vehicleId: string }) {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    odometer: '',
    liters: '',
    price_per_liter: '',
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
        liters: parseFloat(formData.liters),
        price_per_liter: parseFloat(formData.price_per_liter),
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
        liters: parseFloat(formData.liters),
        price_per_liter: parseFloat(formData.price_per_liter),
        date: new Date(formData.date).toISOString(),
      });

      if (error) throw error;
      toast.success('Fuel log added!');
      setFormData({
        odometer: '',
        liters: '',
        price_per_liter: '',
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

  const calculateL100km = () => {
    if (logs.length < 2) return null;

    const latest = logs[0];
    const previous = logs[1];

    const kilometers = (latest.odometer - previous.odometer) * MILES_TO_KILOMETERS;
    const liters100km = (latest.liters / kilometers) * 100;

    return liters100km.toFixed(1);
  };

  const l100km = calculateL100km();

  return (
    <div className="space-y-4">
      {l100km && (
        <div className="flex items-center justify-between rounded-md border p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Avg. L/100km</span>
          </div>
          <span className="text-lg font-bold">{l100km}</span>
        </div>
      )}

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Fill-up
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="odometer">Odometer (miles)</Label>
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
          <div className="space-y-1">
            <Label htmlFor="liters">Liters</Label>
            <Input
              id="liters"
              type="number"
              step="0.01"
              value={formData.liters}
              onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
              placeholder="47.5"
              required
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="price_per_liter">₹/Liter</Label>
            <Input
              id="price_per_liter"
              type="number"
              step="0.01"
              value={formData.price_per_liter}
              onChange={(e) => setFormData({ ...formData, price_per_liter: e.target.value })}
              placeholder="108.50"
              required
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="h-8 text-sm"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {logs.length === 0 ? (
        <div className="text-center text-sm text-gray-500">
          No fuel logs yet
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log: FuelLog) => (
            <div key={log.id} className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center space-x-2">
                <Fuel className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">{log.liters.toFixed(1)} L</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(log.date), 'MMM dd, yyyy')} • {log.odometer.toLocaleString()} mi
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatRupees(log.liters * log.price_per_liter)}</div>
                <div className="text-xs text-gray-500">{formatRupees(log.price_per_liter)}/L</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
