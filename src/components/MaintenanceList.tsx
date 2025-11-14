import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Calendar, Check } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';

const maintenanceSchema = z.object({
  task_name: z.string().trim().min(1, { message: "Task name is required" }).max(200),
  scheduled_date: z.string().min(1, { message: "Date is required" }),
  notes: z.string().max(1000).optional(),
});

interface MaintenanceTask {
  id: string;
  task_name: string;
  scheduled_date: string;
  completed: boolean;
  notes?: string;
}

export function MaintenanceList({ vehicleId }: { vehicleId: string }) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    task_name: '',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  useEffect(() => {
    loadTasks();
  }, [vehicleId]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      maintenanceSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('maintenance_tasks').insert({
        vehicle_id: vehicleId,
        task_name: formData.task_name,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast.success('Maintenance task added!');
      setFormData({
        task_name: '',
        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
      setShowForm(false);
      loadTasks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .update({ completed: !completed })
        .eq('id', taskId);

      if (error) throw error;
      loadTasks();
    } catch (error: any) {
      toast.error('Failed to update task');
    }
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="task_name" className="text-xs">Task</Label>
            <Input
              id="task_name"
              value={formData.task_name}
              onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
              placeholder="Oil change"
              required
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduled_date" className="text-xs">Date</Label>
            <Input
              id="scheduled_date"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              required
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes"
              className="text-sm resize-none"
              rows={2}
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
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No maintenance tasks yet
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleComplete(task.id, task.completed)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.task_name}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(task.scheduled_date), 'MMM dd, yyyy')}
                </div>
                {task.notes && (
                  <p className="text-xs text-muted-foreground mt-1">{task.notes}</p>
                )}
              </div>
              {task.completed && (
                <Check className="w-4 h-4 text-success" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
