import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Play,
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import Modal from "../components/UI/Modal";
import { useTripDetails } from "../hooks/useTripDetails";
import { useTripMutations } from "../hooks/useTripMutations";

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [error, setError] = useState<string>("");

  const {
    trip,
    tripLoading,
    tripError,
    dutyStatuses,
    dutyStatusLoading,
    dutyStatusError,
    eldLogs,
    eldLogLoading,
    eldLogError,
  } = useTripDetails(id!);
  const { startTrip, deleteTrip, generateELDLog } = useTripMutations(id!);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getDutyStatusColor = (status: string) => {
    switch (status) {
      case "DRIVING":
        return "bg-green-500";
      case "ON_DUTY_NOT_DRIVING":
        return "bg-blue-500";
      case "OFF_DUTY":
        return "bg-red-500";
      case "SLEEPER_BERTH":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDutyStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleStartTrip = async () => {
    try {
      setError("");
      await startTrip.mutateAsync({ status: "IN_PROGRESS" });
    } catch (err) {
      setError("Failed to start trip: " + (err as Error).message);
    }
  };

  const handleUpdateTrip = async () => {
    if (!newStatus) {
      setError("Please select a status.");
      return;
    }
    try {
      setError("");
      await startTrip.mutateAsync({ status: newStatus });
      setUpdateModalOpen(false);
      setNewStatus("");
    } catch (err) {
      setError("Failed to update trip: " + (err as Error).message);
    }
  };

  const handleDeleteTrip = async () => {
    try {
      setError("");
      await deleteTrip.mutateAsync();
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to delete trip: " + (err as Error).message);
    }
  };

  const handleGenerateELDLog = async () => {
    try {
      setError("");
      await generateELDLog.mutateAsync();
    } catch (err) {
      setError("Failed to generate ELD log: " + (err as Error).message);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: MapPin },
    { id: "route", label: "Route", icon: MapPin },
    { id: "duty-status", label: "Duty Status", icon: Clock },
    { id: "eld-logs", label: "ELD Logs", icon: FileText },
  ];

  if (tripLoading || dutyStatusLoading || eldLogLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (tripError || dutyStatusError || eldLogError) {
    return (
      <div className="text-center py-12 text-red-600">
        Error:{" "}
        {tripError?.message || dutyStatusError?.message || eldLogError?.message}
      </div>
    );
  }

  if (!trip) {
    return <div className="text-center py-12">Trip not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-600">{error}</span>
        </motion.div>
      )}

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
              Trip #{trip.id}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {trip.pickup_location_name} → {trip.dropoff_location_name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
              trip.status
            )}`}
          >
            {trip.status.replace("_", " ")}
          </span>

          {trip.status === "PLANNED" && (
            <Button onClick={handleStartTrip} loading={startTrip.isLoading}>
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
                    ? "border-teal-500 text-teal-600 dark:text-teal-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    {trip.driver.user.username}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vehicle
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {trip.vehicle.vehicle_number} ({trip.vehicle.license_plate})
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Planned Start
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(trip.start_time).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cycle Hours Used
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {trip.current_cycle_hours}/70
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
                      {trip.pickup_location_name}
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
                      {trip.dropoff_location_name}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        185.2
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Miles
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        3h 45m
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Est. Time
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "route" && (
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

        {activeTab === "duty-status" && (
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
              {dutyStatuses?.map((status) => (
                <div
                  key={status.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div
                    className={`w-4 h-4 ${getDutyStatusColor(
                      status.status
                    )} rounded-full mt-1`}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDutyStatus(status.status)}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(status.start_time).toLocaleTimeString()} -{" "}
                        {new Date(status.end_time).toLocaleTimeString()}
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
              {!dutyStatuses?.length && (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No duty statuses found.
                </p>
              )}
            </div>
          </Card>
        )}

        {activeTab === "eld-logs" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                ELD Logs
              </h2>
              <Button
                onClick={handleGenerateELDLog}
                loading={generateELDLog.isLoading}
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Log
              </Button>
            </div>

            {eldLogs?.length ? (
              <div className="space-y-4">
                {eldLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div
                      className={`w-4 h-4 ${getDutyStatusColor(
                        log.status
                      )} rounded-full mt-1`}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDutyStatus(log.status)}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {log.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No ELD Logs Generated
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Generate your first ELD log for this trip to ensure
                  compliance.
                </p>
                <Button
                  onClick={handleGenerateELDLog}
                  loading={generateELDLog.isLoading}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate ELD Log
                </Button>
              </div>
            )}
          </Card>
        )}
      </motion.div>

      <Modal
        isOpen={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setError("");
          setNewStatus("");
        }}
        title="Update Trip"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trip Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="">Select status</option>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          {error && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setUpdateModalOpen(false);
                setError("");
                setNewStatus("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTrip} loading={startTrip.isLoading}>
              Update Trip
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setError("");
        }}
        title="Delete Trip"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this trip? This action cannot be
              undone.
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setError("");
              }}
              disabled={deleteTrip.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTrip}
              loading={deleteTrip.isLoading}
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
