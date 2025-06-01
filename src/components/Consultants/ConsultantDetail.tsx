
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Consultant, Project } from '@/lib/types';

interface ConsultantDetailProps {
  consultant: Consultant;
  projects: Project[];
  onMoveConsultant: () => void;
  onDeleteAllocation: (allocationId: string) => void;
  onDeleteConsultant: (id: string) => void;
}

const ConsultantDetail: React.FC<ConsultantDetailProps> = ({
  consultant,
  projects,
  onMoveConsultant,
  onDeleteAllocation,
  onDeleteConsultant
}) => {
  if (!consultant) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center py-8">Consultant not found</p>
        </div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === consultant.currentProject);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Consultant Info */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{consultant.name}</h1>
          <div className="flex items-center gap-4 text-lg">
            <span className="text-gray-700">{consultant.role}</span>
            <span className="text-gray-400">•</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              consultant.status === 'Allocated' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {consultant.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Service Line:</span>
              <p className="mt-1">{consultant.serviceLine}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Expertise:</span>
              <p className="mt-1">{consultant.expertise}</p>
            </div>
            {consultant.preferredSector && (
              <div>
                <span className="font-medium text-gray-700">Preferred Sector:</span>
                <p className="mt-1">{consultant.preferredSector}</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {consultant.location && (
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <p className="mt-1">{consultant.location}</p>
              </div>
            )}
            {consultant.rate && (
              <div>
                <span className="font-medium text-gray-700">Daily Rate:</span>
                <p className="mt-1">${consultant.rate.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
          <div>
            <span className="font-medium text-gray-700">Start Date:</span>
            <p className="mt-1">{new Date(consultant.startDate).toLocaleDateString()}</p>
          </div>
          {consultant.endDate && (
            <div>
              <span className="font-medium text-gray-700">End Date:</span>
              <p className="mt-1">{new Date(consultant.endDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Current Assignment */}
      {consultant.status === 'Allocated' && currentProject && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Assignment</h2>
          <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-400">
            <h3 className="font-semibold text-blue-900 text-lg mb-2">{currentProject.name}</h3>
            <div className="space-y-2 text-blue-800">
              <p><span className="font-medium">Client:</span> {currentProject.clientName}</p>
              <p><span className="font-medium">Duration:</span> {new Date(currentProject.startDate).toLocaleDateString()} - {new Date(currentProject.endDate).toLocaleDateString()}</p>
              {currentProject.sector && (
                <p><span className="font-medium">Sector:</span> {currentProject.sector}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {consultant.status === 'Allocated' && (
          <Button onClick={onMoveConsultant} variant="outline">
            Move Consultant
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Consultant
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Consultant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {consultant.name}? This action cannot be undone and will remove all allocation history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDeleteConsultant(consultant.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ConsultantDetail;
