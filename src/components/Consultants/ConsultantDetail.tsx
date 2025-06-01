
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
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-center py-4">Consultant not found</p>
        </div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === consultant.currentProject);

  return (
    <div className="space-y-6">
      {/* Consultant Info */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">{consultant.name}</h3>
        <p className="text-gray-500">{consultant.role}</p>
        <p className="text-gray-500">Service Line: {consultant.serviceLine}</p>
        <p className="text-gray-500">Expertise: {consultant.expertise}</p>
        <p className="text-gray-500">Status: {consultant.status}</p>
        {consultant.location && (
          <p className="text-gray-500">Location: {consultant.location}</p>
        )}
        {consultant.rate && (
          <p className="text-gray-500">Rate: ${consultant.rate}/day</p>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
          <div className="flex gap-2">
            {consultant.status === 'Allocated' && (
              <Button onClick={onMoveConsultant} variant="outline" size="sm">
                Move Consultant
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
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
      </div>

      {/* Current Assignment */}
      {consultant.status === 'Allocated' && currentProject && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Current Assignment</h3>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">{currentProject.name}</p>
            <p className="text-sm text-gray-500">Client: {currentProject.clientName}</p>
            <p className="text-sm text-gray-500">
              {new Date(currentProject.startDate).toLocaleDateString()} - {new Date(currentProject.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Profile Details */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Profile Details</h3>
        <p className="text-gray-500">
          Start Date: {new Date(consultant.startDate).toLocaleDateString()}
        </p>
        {consultant.endDate && (
          <p className="text-gray-500">
            End Date: {new Date(consultant.endDate).toLocaleDateString()}
          </p>
        )}
        {consultant.preferredSector && (
          <p className="text-gray-500 mt-2">
            Preferred Sector: {consultant.preferredSector}
          </p>
        )}
      </div>
    </div>
  );
};

export default ConsultantDetail;
