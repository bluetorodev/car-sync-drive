import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  Plus, 
  LogOut, 
  Wrench, 
  IndianRupee, 
  Fuel, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Settings,
  MapPin,
  Gauge
} from 'lucide-react';
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

interface VehicleStats {
  totalFuelCost: number;
  totalExpenses: number;
  avgEfficiency: number;
  lastService: string;
  totalDistance: number;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [vehicleStats, setVehicleStats] = useState<VehicleStats>({
    totalFuelCost: 0,
    totalExpenses: 0,
    avgEfficiency: 0,
    lastService: '',
    totalDistance: 0
  });

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

  useEffect(() => {
    if (selectedVehicle) {
      loadVehicleStats(selectedVehicle.id);
    }
  }, [selectedVehicle]);

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

  const loadVehicleStats = async (vehicleId: string) => {
    try {
      // Load fuel data
      const { data: fuelData } = await supabase
        .from('fuel_logs')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });

      // Load expense data  
      const { data: expenseData } = await supabase
        .from('expenses')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });

      // Calculate stats
      const totalFuelCost = fuelData?.reduce((sum, log) => 
        sum + (log.liters || 0) * (log.price_per_liter || 0), 0) || 0;
      
      const totalExpenses = expenseData?.reduce((sum, exp) => 
        sum + parseFloat(exp.amount.toString()), 0) || 0;

      // Calculate average efficiency (simplified L/100km)
      let avgEfficiency = 0;
      if (fuelData && fuelData.length >= 2) {
        const latest = fuelData[0];
        const previous = fuelData[1];
        const kilometers = (latest.odometer - previous.odometer) * 1.60934;
        avgEfficiency = kilometers > 0 ? (latest.liters / kilometers) * 100 : 0;
      }

      setVehicleStats({
        totalFuelCost,
        totalExpenses,
        avgEfficiency,
        lastService: 'Due in 30 days', // This would come from maintenance data
        totalDistance: fuelData?.[0]?.odometer || 0
      });
    } catch (error: any) {
      console.error('Error loading vehicle stats:', error);
    }
  };

  const handleVehicleAdded = () => {
    loadVehicles();
    setIsVehicleDialogOpen(false);
  };

  const formatRupees = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDistance = (km: number): string => {
    return `${km.toLocaleString()} km`;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CarSync Drive</h1>
                <p className="text-xs text-gray-500">Vehicle Management Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500">Vehicle Owner</p>
              </div>
              <Button 
                onClick={signOut} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Track your vehicle's performance and expenses with ease</p>
        </div>

        {vehicles.length === 0 ? (
          /* No Vehicles State */
          <Card className="bg-white shadow-lg">
            <CardContent className="text-center py-16">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No vehicles yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start tracking your vehicle's maintenance, fuel consumption, and expenses. 
                Add your first vehicle to get insights and manage your car efficiently.
              </p>
              <Button 
                onClick={() => setIsVehicleDialogOpen(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Vehicle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Vehicle Cards Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Your Vehicles</h3>
                  <p className="text-sm text-gray-500">
                    {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} • 
                    {selectedVehicle ? ` Selected: ${selectedVehicle.make} ${selectedVehicle.model}` : ' Select a vehicle'}
                  </p>
                </div>
                <Button 
                  onClick={() => setIsVehicleDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </div>

              {/* Vehicle Selection */}
              {vehicles.length <= 5 ? (
                // Compact grid for 5 or fewer vehicles
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedVehicle?.id === vehicle.id
                          ? 'transform scale-105'
                          : ''
                      }`}
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <div className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                        selectedVehicle?.id === vehicle.id
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl ring-4 ring-blue-200 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                      }`}>
                        
                        {/* Vehicle Icon with Gradient Background */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                          selectedVehicle?.id === vehicle.id 
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg' 
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100'
                        }`}>
                          <Car className={`h-6 w-6 transition-colors duration-300 ${
                            selectedVehicle?.id === vehicle.id ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                          }`} />
                        </div>

                        {/* Vehicle Info */}
                        <div className="space-y-2">
                          <h4 className={`font-bold transition-colors duration-300 ${
                            selectedVehicle?.id === vehicle.id 
                              ? 'text-blue-900' 
                              : 'text-gray-900 group-hover:text-blue-700'
                          }`}>
                            {vehicle.make} {vehicle.model}
                          </h4>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              selectedVehicle?.id === vehicle.id ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              {vehicle.year}
                            </span>
                            {vehicle.vin && (
                              <div className="flex items-center space-x-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-600 font-medium">VIN</span>
                              </div>
                            )}
                          </div>

                          {vehicle.license_plate && (
                            <p className={`text-xs font-mono transition-colors duration-300 ${
                              selectedVehicle?.id === vehicle.id ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                              {vehicle.license_plate}
                            </p>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        {selectedVehicle?.id === vehicle.id && (
                          <div className="absolute -top-2 -right-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        )}

                        {/* Hover Indicator */}
                        {!selectedVehicle?.id === vehicle.id && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Horizontal scroll for 6+ vehicles
                <div className="relative">
                  <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className={`flex-shrink-0 w-56 group cursor-pointer transition-all duration-300 hover:scale-105 ${
                          selectedVehicle?.id === vehicle.id ? 'transform scale-105' : ''
                        }`}
                        onClick={() => setSelectedVehicle(vehicle)}
                      >
                        <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          selectedVehicle?.id === vehicle.id
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl ring-4 ring-blue-200 ring-opacity-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                        }`}>
                          
                          {/* Header with Icon and VIN Status */}
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              selectedVehicle?.id === vehicle.id 
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg' 
                                : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100'
                            }`}>
                              <Car className={`h-7 w-7 transition-colors duration-300 ${
                                selectedVehicle?.id === vehicle.id ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                              }`} />
                            </div>
                            
                            {vehicle.vin && (
                              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span>VIN</span>
                              </div>
                            )}
                          </div>

                          {/* Vehicle Details */}
                          <div className="space-y-3">
                            <div>
                              <h4 className={`text-lg font-bold transition-colors duration-300 ${
                                selectedVehicle?.id === vehicle.id 
                                  ? 'text-blue-900' 
                                  : 'text-gray-900 group-hover:text-blue-700'
                              }`}>
                                {vehicle.make} {vehicle.model}
                              </h4>
                              <p className={`text-sm font-medium mt-1 ${
                                selectedVehicle?.id === vehicle.id ? 'text-blue-700' : 'text-gray-600'
                              }`}>
                                {vehicle.year}
                              </p>
                            </div>

                            {vehicle.license_plate && (
                              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                                <p className={`text-xs font-mono font-medium ${
                                  selectedVehicle?.id === vehicle.id ? 'text-blue-700' : 'text-gray-600'
                                }`}>
                                  {vehicle.license_plate}
                                </p>
                              </div>
                            )}

                            {/* Status Bar */}
                            <div className="flex items-center justify-between pt-2">
                              <div className={`text-xs px-3 py-1 rounded-full font-medium ${
                                selectedVehicle?.id === vehicle.id 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                Active
                              </div>
                              
                              {selectedVehicle?.id === vehicle.id && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Selection Indicator Line */}
                          {selectedVehicle?.id === vehicle.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-b-2xl"></div>
                          )}

                          {/* Hover Gradient Overlay */}
                          {!selectedVehicle?.id === vehicle.id && (
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Scroll indicators */}
                  <div className="flex justify-center mt-4 space-x-1">
                    {Array.from({ length: Math.ceil(vehicles.length / 8) }).map((_, index) => (
                      <div
                        key={index}
                        className="w-2 h-2 rounded-full bg-gray-300"
                      ></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Quick stats for selected vehicle */}
              {selectedVehicle && (
                <div className="mt-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">
                        {selectedVehicle.make} {selectedVehicle.model}
                      </h4>
                      <p className="text-blue-100">
                        Quick Overview • {selectedVehicle.year}
                      </p>
                    </div>
                    {selectedVehicle.vin && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-white bg-opacity-20 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-white">VIN Registered</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <Fuel className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm text-blue-100">Fuel Cost</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatRupees(vehicleStats.totalFuelCost)}
                      </p>
                      <p className="text-xs text-blue-200 mt-1">This month</p>
                    </div>

                    <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <IndianRupee className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm text-blue-100">Expenses</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatRupees(vehicleStats.totalExpenses)}
                      </p>
                      <p className="text-xs text-blue-200 mt-1">All time</p>
                    </div>

                    <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <Gauge className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm text-blue-100">Efficiency</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {vehicleStats.avgEfficiency.toFixed(1)} L/100km
                      </p>
                      <p className="text-xs text-blue-200 mt-1">Fuel consumption</p>
                    </div>

                    <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-20">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm text-blue-100">Distance</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatDistance(vehicleStats.totalDistance * 1.60934)}
                      </p>
                      <p className="text-xs text-blue-200 mt-1">Total traveled</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            
            {selectedVehicle && (
              <div className="space-y-6">
                {/* Enhanced Vehicle Header */}
                

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-white shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Fuel Cost</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatRupees(vehicleStats.totalFuelCost)}
                          </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                          <Fuel className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">This month</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatRupees(vehicleStats.totalExpenses)}
                          </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                          <IndianRupee className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">All time</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg. Efficiency</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {vehicleStats.avgEfficiency.toFixed(1)} L/100km
                          </p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                          <Gauge className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Fuel consumption</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Distance</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatDistance(vehicleStats.totalDistance * 1.60934)}
                          </p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                          <MapPin className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Distance traveled</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Tabs */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="fuel" className="flex items-center gap-2">
                          <Fuel className="w-4 h-4" />
                          Fuel Logs
                        </TabsTrigger>
                        <TabsTrigger value="expenses" className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4" />
                          Expenses
                        </TabsTrigger>
                        <TabsTrigger value="maintenance" className="flex items-center gap-2">
                          <Wrench className="w-4 h-4" />
                          Maintenance
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-blue-600" />
                              Recent Activity
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium">Fuel Fill-up</p>
                                  <p className="text-sm text-gray-600">50.0 L at ₹110.50/L</p>
                                </div>
                                <p className="font-semibold text-green-600">{formatRupees(5525)}</p>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium">Maintenance Service</p>
                                  <p className="text-sm text-gray-600">Oil change & inspection</p>
                                </div>
                                <p className="font-semibold text-blue-600">{formatRupees(2500)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-green-600" />
                              Upcoming
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div>
                                  <p className="font-medium">Service Due</p>
                                  <p className="text-sm text-gray-600">Next maintenance service</p>
                                </div>
                                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                                  In 30 days
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div>
                                  <p className="font-medium">Insurance Renewal</p>
                                  <p className="text-sm text-gray-600">Annual insurance renewal</p>
                                </div>
                                <Badge variant="outline" className="text-blue-700 border-blue-300">
                                  In 120 days
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="fuel" className="mt-6">
                        <FuelLogsList vehicleId={selectedVehicle.id} />
                      </TabsContent>

                      <TabsContent value="expenses" className="mt-6">
                        <ExpensesList vehicleId={selectedVehicle.id} />
                      </TabsContent>

                      <TabsContent value="maintenance" className="mt-6">
                        <MaintenanceList vehicleId={selectedVehicle.id} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      <VehicleDialog
        isOpen={isVehicleDialogOpen}
        onClose={() => setIsVehicleDialogOpen(false)}
        onVehicleAdded={handleVehicleAdded}
      />
    </div>
  );
};

export default Dashboard;
