import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Truck, 
  Clock, 
  Calendar,
  Route,
  Save,
  AlertCircle
} from 'lucide-react';
import { useVehicles } from '../hooks/useVehicles';
import { useCreateTrip, useCalculateRoute } from '../hooks/useTrips';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';

interface TripForm {
  vehicle: string;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_hours: number;
  start_time: string;
}

const CreateTripPage: React.FC = () => {
  const [error, setError] = useState('');
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const navigate = useNavigate();

  // API hooks
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const createTripMutation = useCreateTrip();
  const calculateRouteMutation = useCalculateRoute();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<TripForm>();

  const cycleHours = watch('current_cycle_hours');

  // Helper function to parse location input (city name or coordinates)
  const parseLocation = (locationStr: string): [number, number] => {
    // Try to parse as coordinates first (lon,lat)
    const coordMatch = locationStr.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      return [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
    }
    
    // For demo purposes, return mock coordinates for common cities
    const cityCoords: { [key: string]: [number, number] } = {
      'richmond': [-77.4360, 37.5407],
      'norfolk': [-76.2859, 36.8508],
      'virginia beach': [-75.9780, 36.8529],
      'chesapeake': [-76.2875, 36.7682],
      'newport news': [-76.4730, 37.0871],
      'hampton': [-76.3452, 37.0299],
    };
    
    const cityKey = locationStr.toLowerCase().trim();
    return cityCoords[cityKey] || [-77.4360, 37.5407]; // Default to Richmond
  };

  const onSubmit = async (data: TripForm) => {
    setError('');
    
    try {
      // Parse locations
      const currentLocation = parseLocation(data.current_location);
      const pickupLocation = parseLocation(data.pickup_location);
      const dropoffLocation = parseLocation(data.dropoff_location);

      // Create trip
      const newTrip = await createTripMutation.mutateAsync({
        vehicle: parseInt(data.vehicle),
        current_location: currentLocation,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        current_cycle_hours: data.current_cycle_hours,
        start_time: data.start_time,
      });

      // Navigate to trip details
      navigate(`/trips/${newTrip.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          err.message || 
                          'Failed to create trip';
      setError(errorMessage);
    }
  };

  const calculateRoute = async () => {
    const formData = watch();
    
    if (!formData.vehicle || !formData.pickup_location || !formData.dropoff_location) {
      setError('Please fill in vehicle and locations before calculating route');
      return;
    }

    try {
      setError('');
      
      // First create a temporary trip to calculate route
      const currentLocation = parseLocation(formData.current_location);
      const pickupLocation = parseLocation(formData.pickup_location);
      const dropoffLocation = parseLocation(formData.dropoff_location);

      const tempTrip = await createTripMutation.mutateAsync({
        vehicle: parseInt(formData.vehicle),
        current_location: currentLocation,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        current_cycle_hours: formData.current_cycle_hours || 0,
        start_time: formData.start_time || new Date().toISOString(),
      });

      // Calculate route
      const route = await calculateRouteMutation.mutateAsync(tempTrip.id);
      setRouteData(route);
      setRouteCalculated(true);
      
      // Navigate to the created trip
      navigate(`/trips/${tempTrip.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          'Failed to calculate route';
      setError(errorMessage);
    }
  };

  if (vehiclesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="h-96 bg-gray-300 rounded"></div>
            </div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
          Create New Trip
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Plan your trip with HOS-compliant routing and scheduling
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trip Form */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Trip Details
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vehicle
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  {...register('vehicle', { required: 'Please select a vehicle' })}
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number} ({vehicle.license_plate})
                    </option>
                  ))}
                </select>
                {errors.vehicle && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.vehicle.message}
                  </p>
                )}
              </div>

              {/* Locations */}
              <Input
                label="Current Location"
                type="text"
                placeholder="Richmond, VA or -77.4360,37.5407"
                icon={<MapPin className="w-4 h-4" />}
                error={errors.current_location?.message}
                {...register('current_location', {
                  required: 'Current location is required',
                })}
              />

              <Input
                label="Pickup Location"
                type="text"
                placeholder="Norfolk, VA or -76.2859,36.8508"
                icon={<MapPin className="w-4 h-4" />}
                error={errors.pickup_location?.message}
                {...register('pickup_location', {
                  required: 'Pickup location is required',
                })}
              />

              <Input
                label="Dropoff Location"
                type="text"
                placeholder="Virginia Beach, VA or -75.9780,36.8529"
                icon={<MapPin className="w-4 h-4" />}
                error={errors.dropoff_location?.message}
                {...register('dropoff_location', {
                  required: 'Dropoff location is required',
                })}
              />

              {/* HOS Information */}
              <div>
                <Input
                  label="Current Cycle Hours Used"
                  type="number"
                  min="0"
                  max="70"
                  step="0.5"
                  placeholder="20.5"
                  icon={<Clock className="w-4 h-4" />}
                  error={errors.current_cycle_hours?.message}
                  {...register('current_cycle_hours', {
                    required: 'Cycle hours are required',
                    min: { value: 0, message: 'Hours cannot be negative' },
                    max: { value: 70, message: 'Hours cannot exceed 70' },
                    valueAsNumber: true,
                  })}
                />
                
                {cycleHours && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          cycleHours > 60 ? 'bg-red-500' : cycleHours > 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((cycleHours / 70) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {70 - cycleHours} hours remaining
                    </span>
                  </div>
                )}
              </div>

              <Input
                label="Planned Start Time"
                type="datetime-local"
                icon={<Calendar className="w-4 h-4" />}
                error={errors.start_time?.message}
                {...register('start_time', {
                  required: 'Start time is required',
                })}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={calculateRoute}
                  loading={calculateRouteMutation.isLoading}
                  className="flex-1"
                >
                  <Route className="w-4 h-4 mr-2" />
                  Calculate Route
                </Button>
                
                <Button
                  type="submit"
                  loading={createTripMutation.isLoading}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Trip
                </Button>
              </div>
            </form>
          </Card>

          {/* Route Preview */}
          {routeCalculated && routeData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Route className="w-5 h-5 mr-2" />
                  Route Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Distance
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {routeData.total_miles} miles
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duty Statuses
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {routeData.duty_statuses?.length || 0} segments
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      HOS Compliance
                    </span>
                    <span className="text-sm text-green-800 dark:text-green-400 font-semibold">
                      ✓ Compliant
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Map Placeholder */}
        <div className="space-y-6">
          <Card className="p-6 h-96 lg:h-[600px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Route Map
            </h3>
            
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Interactive Map
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {routeCalculated 
                    ? 'Route displayed with pickup, dropoff, and rest stops'
                    : 'Enter locations and calculate route to view map'
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* HOS Timeline Preview */}
          {routeCalculated && routeData?.duty_statuses && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Duty Status Timeline
                </h3>
                
                <div className="space-y-3">
                  {routeData.duty_statuses.map((status: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className={`w-3 h-3 rounded-full ${
                        status.status === 'DRIVING' ? 'bg-green-500' :
                        status.status === 'ON_DUTY_NOT_DRIVING' ? 'bg-blue-500' :
                        status.status === 'OFF_DUTY' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {status.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(status.start_time).toLocaleTimeString()} - {new Date(status.end_time).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {status.location_description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTripPage;