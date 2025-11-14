import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Plus, LogOut, Wrench, DollarSign, Fuel } from 'lucide-react';
import { VehicleDialog } from '@/components/VehicleDialog';
import { VehicleCard } from '@/components/VehicleCard';
import { MaintenanceList } from '@/components/MaintenanceList';
import { ExpensesList } from '@/components/ExpensesList';
import { FuelLogsList } from '@/components/FuelLogsList';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  license_plate?: string;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadVehicles();
    }
  }, [user]);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
      if (data && data.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleAdded = () => {
    loadVehicles();
    setIsVehicleDialogOpen(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Car className="w-12 h-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Car Manager</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Vehicles Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Vehicles</h2>
            <p className="text-muted-foreground">Manage your vehicle fleet</p>
          </div>
          <Button onClick={() => setIsVehicleDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {vehicles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No vehicles yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first vehicle to track maintenance and expenses
              </p>
              <Button onClick={() => setIsVehicleDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Vehicle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Vehicle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={selectedVehicle?.id === vehicle.id}
                  onSelect={() => setSelectedVehicle(vehicle)}
                  onUpdate={loadVehicles}
                />
              ))}
            </div>

            {/* Vehicle Details Tabs */}
            {selectedVehicle && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      <CardTitle>Maintenance</CardTitle>
                    </div>
                    <CardDescription>Track service and repairs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MaintenanceList vehicleId={selectedVehicle.id} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <CardTitle>Expenses</CardTitle>
                    </div>
                    <CardDescription>Monitor spending</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExpensesList vehicleId={selectedVehicle.id} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Fuel className="w-5 h-5 text-primary" />
                      <CardTitle>Fuel Logs</CardTitle>
                    </div>
                    <CardDescription>Track fuel efficiency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FuelLogsList vehicleId={selectedVehicle.id} />
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      <VehicleDialog
        open={isVehicleDialogOpen}
        onOpenChange={setIsVehicleDialogOpen}
        onSuccess={handleVehicleAdded}
      />
    </div>
  );
};

export default Dashboard;
