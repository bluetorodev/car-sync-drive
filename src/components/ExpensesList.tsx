import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';

const expenseSchema = z.object({
  type: z.enum(['fuel', 'maintenance', 'repair', 'insurance', 'other']),
  amount: z.number().min(0, { message: "Amount must be positive" }),
  date: z.string().min(1, { message: "Date is required" }),
  description: z.string().max(500).optional(),
});

interface Expense {
  id: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
}

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

export function ExpensesList({ vehicleId }: { vehicleId: string }) {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'maintenance' as const,
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  });

  useEffect(() => {
    loadExpenses();
  }, [vehicleId]);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });
      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      expenseSchema.parse({
        ...formData,
        amount: parseFloat(formData.amount),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('expenses').insert({
        vehicle_id: vehicleId,
        type: formData.type,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description || null,
      });
      if (error) throw error;
      toast.success('Expense added!');
      setFormData({
        type: 'maintenance',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
      });
      setShowForm(false);
      loadExpenses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-md border p-4">
        <div className="flex items-center space-x-2">
          <IndianRupee className="h-4 w-4" />
          <span className="text-sm font-medium">Total Spent</span>
        </div>
        <span className="text-lg font-bold">{formatRupees(totalExpenses)}</span>
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expense type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fuel">Fuel</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="2500.00"
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

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
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

      {expenses.length === 0 ? (
        <div className="text-center text-sm text-gray-500">
          No expenses recorded yet
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense: Expense) => (
            <div key={expense.id} className="flex items-center justify-between rounded-md border p-3">
              <div className="flex-1">
                <div className="text-sm font-medium capitalize">{expense.type}</div>
                <div className="text-xs text-gray-500">
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
                </div>
                {expense.description && (
                  <div className="text-xs text-gray-600 mt-1">
                    {expense.description}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatRupees(parseFloat(expense.amount.toString()))}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
