import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Truck, 
  Clock, 
  Calendar,
  Play,
  Square,
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';

// Mock trip data
const mockTrip = {
  id: 1,
  status: 'PLANNED',
  startTime: '2025-01-15T08:00:00Z',
  vehicle: { id: 1, vehicle_number: 'TRK001', license_plate: 'ABC123', state: 'VA' },
  pickup_location: 'Richmond, VA',
  dropoff_location: 'Norfolk, VA',
  current_cycle_hours: 20.5,
  created_at: '2025-01-14T18:28:00Z',
  driver: { id: 1, full_name: 'John Doe', license_number: 'DL123456789' },
};

const mockDutyStatuses = [
  {
    id: 1,
    status: 'ON_DUTY_NOT_DRIVING',
    start_time: '2025-01-15T08:00:00Z',
    end_time: '2025-01-15T09:00:00Z',
    location_description: 'Pickup Location - Richmond, VA',
    remarks: 'Pre-trip inspection and loading',
  },
  {
    id: 2,
    status: 'DRIVING',
    start_time: '2025-01-15T09:00:00Z',
    end_time: '2025-01-15T11:30:00Z',
    location_description: 'En route to rest area',
    remarks: 'Highway driving segment 1',
  },
  {
    id: 3,
    status: 'OFF_DUTY',
    start_time: '2025-01-15T11:30:00Z',
    end_time: '2025-01-15T12:00:00Z',
    location_description: 'Rest Area - I-64 Mile 200',
    remarks: 'Mandatory 30-minute break',
  },
  {
    id: 4,
    status: 'DRIVING',
    start_time: '2025-01-15T12:00:00Z',
    end_time: '2025-01-15T13:15:00Z',
    location_description: 'Final segment to Norfolk',
    remarks: 'Approaching dropoff location',
  },
];

const TripDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDutyStatusColor = (status: string) => {
    switch (status) {
      case 'DRIVING':
        return 'bg-green-500';
      case 'ON_DUTY_NOT_DRIVING':
        return 'bg-blue-500';
      case 'OFF_DUTY':
        return 'bg-red-500';
      case 'SLEEPER_BERTH':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDutyStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleStartTrip = async () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      console.log('Starting trip');
      setLoading(false);
    }, 1000);
  };

  const handleDeleteTrip = async () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      console.log('Deleting trip');
      setDeleteModalOpen(false);
      setLoading(false);
    }, 1000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'route', label: 'Route', icon: MapPin },
    { id: 'duty-status', label: 'Duty Status', icon: Clock },
    { id: 'eld-logs', label: 'ELD Logs', icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
              Trip #{mockTrip.id}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {mockTrip.pickup_location} → {mockTrip.dropoff_location}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(mockTrip.status)}`}>
            {mockTrip.status.replace('_', ' ')}
          </span>
          
          {mockTrip.status === 'PLANNED' && (
            <Button onClick={handleStartTrip} loading={loading}>
              <Play className="w-4 h-4 mr-2" />
              Start Trip
            </Button>
          )}
          
          <Button variant="outline" onClick={() => setUpdateModalOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Update
          </Button>
          
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trip Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Trip Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Driver
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {mockTrip.driver.full_name}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vehicle
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {mockTrip.vehicle.vehicle_number} ({mockTrip.vehicle.license_plate})
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Planned Start
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(mockTrip.startTime).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cycle Hours Used
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {mockTrip.current_cycle_hours}/70
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    HOS Compliance
                  </span>
                  <span className="text-sm text-green-800 dark:text-green-400 font-semibold flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Compliant
                  </span>
                </div>
              </div>
            </Card>

            {/* Route Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Route Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Pickup Location
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {mockTrip.pickup_location}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Dropoff Location
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {mockTrip.dropoff_location}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">185.2</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Miles</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">3h 45m</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Est. Time</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'route' && (
          <Card className="p-6 h-96">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Route Map
            </h2>
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Interactive Route Map
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Showing pickup, dropoff, and planned rest stops
                </p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'duty-status' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Duty Status Timeline
              </h2>
              <Button size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Add Status
              </Button>
            </div>
            
            <div className="space-y-4">
              {mockDutyStatuses.map((status, index) => (
                <div key={status.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-4 h-4 ${getDutyStatusColor(status.status)} rounded-full mt-1`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDutyStatus(status.status)}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(status.start_time).toLocaleTimeString()} - {new Date(status.end_time).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {status.location_description}
                    </p>
                    {status.remarks && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {status.remarks}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'eld-logs' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                ELD Logs
              </h2>
              <Link to={`/eld-logs/${mockTrip.id}`}>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Log
                </Button>
              </Link>
            </div>
            
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No ELD Logs Generated
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Generate your first ELD log for this trip to ensure compliance.
              </p>
              <Link to={`/eld-logs/${mockTrip.id}`}>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate ELD Log
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Update Modal */}
      <Modal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        title="Update Trip"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Update trip status or other details.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setUpdateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button>
              Update Trip
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Trip"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this trip? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTrip}
              loading={loading}
            >
              Delete Trip
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TripDetailsPage;