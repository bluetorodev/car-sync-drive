import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, DollarSign } from 'lucide-react';
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

export function ExpensesList({ vehicleId }: { vehicleId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">Total Spent</span>
        <span className="text-lg font-bold text-primary">${totalExpenses.toFixed(2)}</span>
      </div>

      {!showForm ? (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-xs">Type</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
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
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
                className="h-8 text-sm"
              />
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
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
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No expenses recorded yet
          </p>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {expense.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </span>
                </div>
                {expense.description && (
                  <p className="text-sm mt-1">{expense.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 font-semibold text-primary">
                <DollarSign className="w-4 h-4" />
                {parseFloat(expense.amount.toString()).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
