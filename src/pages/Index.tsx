import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Car, Wrench, DollarSign, Fuel, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Car className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Car Manager</h1>
          </div>
          <Button onClick={() => navigate('/auth')} variant="outline">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Manage Your Vehicle Fleet with Ease
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Track maintenance, monitor expenses, and log fuel consumption all in one place. 
            Stay on top of your vehicle care with smart reminders and detailed insights.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Maintenance Tracking</h3>
            <p className="text-muted-foreground">
              Never miss an oil change or tire rotation. Schedule and track all your vehicle maintenance tasks.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expense Management</h3>
            <p className="text-muted-foreground">
              Log and categorize all vehicle-related expenses to understand your total cost of ownership.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
              <Fuel className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fuel Economy</h3>
            <p className="text-muted-foreground">
              Track fuel consumption and calculate your vehicle's MPG to optimize efficiency and costs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
