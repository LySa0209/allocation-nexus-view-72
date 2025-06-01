import React, { useState, useEffect } from 'react';
import { Consultant, Allocation, Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface ConsultantDetailProps {
  consultant: Consultant;
  onDeleteConsultant: (consultantId: string) => void;
  onDeleteAllocation: (allocationId: string) => void;
}

const ConsultantDetail: React.FC<ConsultantDetailProps> = ({
  consultant,
  onDeleteConsultant,
  onDeleteAllocation
}) => {
  const [consultantAllocations, setConsultantAllocations] = useState<Allocation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Mock allocations and projects for now
    const mockAllocations: Allocation[] = [
      {
        id: 'a1',
        consultantId: consultant.id,
        projectId: 'p1',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        percentage: 100
      }
    ];

    const mockProjects: Project[] = [
      {
        id: 'p1',
        name: 'Project Alpha',
        clientName: 'Client A',
        status: 'Active',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        resourcesNeeded: 5,
        resourcesAssigned: 3,
        staffingStatus: 'Needs Resources'
      }
    ];

    setConsultantAllocations(mockAllocations);
    setProjects(mockProjects);
  }, [consultant.id]);

  return (
    <div className="space-y-6">
      {/* Consultant Info */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Consultant Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-gray-900">{consultant.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Role</p>
            <p className="text-gray-900">{consultant.role}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Service Line</p>
            <p className="text-gray-900">{consultant.serviceLine}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Expertise</p>
            <p className="text-gray-900">{consultant.expertise}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="text-gray-900">{consultant.status}</p>
          </div>
        </div>
      </div>

      {/* Delete Consultant Button */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
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
                  Are you sure you want to delete {consultant.name}? This action cannot be undone.
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

      {/* Current Allocation */}
      {consultant.currentProject && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Current Allocation</h3>
          <p>Currently allocated to project: {consultant.currentProject}</p>
        </div>
      )}

      {/* Allocation History */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Allocation History</h3>
        <div className="space-y-3">
          {consultantAllocations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No allocation history</p>
          ) : (
            consultantAllocations.map((allocation) => {
              const project = projects.find(p => p.id === allocation.projectId);
              return (
                <div key={allocation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{project?.name || 'Unknown Project'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(allocation.startDate).toLocaleDateString()} - 
                      {new Date(allocation.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">{allocation.percentage}% allocation</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDeleteAllocation(allocation.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-sm">
            Skill 1
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-sm">
            Skill 2
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-sm">
            Skill 3
          </span>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Availability</h3>
        <p>Available from: Immediately</p>
      </div>
    </div>
  );
};

export default ConsultantDetail;
