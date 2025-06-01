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
import { Project } from '@/lib/types';
import { Consultant } from '@/lib/types';

interface ProjectDetailProps {
  project: Project;
  onDeleteProject: (projectId: string) => void;
  onRemoveConsultant: (consultantId: string) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onDeleteProject,
  onRemoveConsultant
}) => {
  const assignedConsultants: Consultant[] = []; // Replace with actual data fetching/state

  return (
    <div className="space-y-6">
      {/* Project Info */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">{project.name}</h3>
        <p className="text-gray-500">{project.clientName}</p>
        <p className="text-gray-500">
          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
        </p>
        <p className="text-gray-700 mt-2">{project.deliverables}</p>
      </div>

      {/* Delete Project Button */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {project.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDeleteProject(project.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Assigned Consultants */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Assigned Consultants</h3>
        <div className="space-y-3">
          {assignedConsultants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No consultants assigned</p>
          ) : (
            assignedConsultants.map((consultant) => (
              <div key={consultant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{consultant.name}</p>
                  <p className="text-sm text-gray-500">{consultant.role} • {consultant.expertise}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onRemoveConsultant(consultant.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <p className="text-gray-500">
          Start Date: {new Date(project.startDate).toLocaleDateString()}
        </p>
        <p className="text-gray-500">
          End Date: {new Date(project.endDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ProjectDetail;
