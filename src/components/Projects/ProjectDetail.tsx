
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
import { Project, PipelineOpportunity, Consultant } from '@/lib/types';

interface ProjectDetailProps {
  item: Project | PipelineOpportunity;
  type: 'active' | 'pipeline';
  assignedConsultants: Consultant[];
  onAddConsultant: () => void;
  onEditProject: () => void;
  onRemoveConsultant: (consultantId: string) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  item,
  type,
  assignedConsultants,
  onAddConsultant,
  onEditProject,
  onRemoveConsultant,
  onDeleteProject
}) => {
  if (!item) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-center py-4">Project not found</p>
        </div>
      </div>
    );
  }

  const isProject = 'staffingStatus' in item;

  return (
    <div className="space-y-6">
      {/* Project Info */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">{item.name}</h3>
        <p className="text-gray-500">{item.clientName}</p>
        <p className="text-gray-500">
          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
        </p>
        {isProject && (
          <p className="text-gray-700 mt-2">{(item as Project).deliverables}</p>
        )}
        {!isProject && (
          <p className="text-gray-700 mt-2">Win Percentage: {(item as PipelineOpportunity).winPercentage}%</p>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
          <div className="flex gap-2">
            {isProject && (
              <Button onClick={onEditProject} variant="outline" size="sm">
                Edit Project
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {type === 'active' ? 'Project' : 'Opportunity'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {type === 'active' ? 'Project' : 'Opportunity'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {item.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDeleteProject(item.id)}
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

      {/* Assigned Consultants - only for active projects */}
      {isProject && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Assigned Consultants</h3>
            <Button onClick={onAddConsultant} size="sm">
              Add Consultant
            </Button>
          </div>
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
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <p className="text-gray-500">
          Start Date: {new Date(item.startDate).toLocaleDateString()}
        </p>
        <p className="text-gray-500">
          End Date: {new Date(item.endDate).toLocaleDateString()}
        </p>
        {isProject && (
          <>
            <p className="text-gray-500 mt-2">
              Resources Needed: {(item as Project).resourcesNeeded}
            </p>
            <p className="text-gray-500">
              Resources Assigned: {(item as Project).resourcesAssigned}
            </p>
          </>
        )}
        {!isProject && (
          <p className="text-gray-500 mt-2">
            Resources Needed: {(item as PipelineOpportunity).resourcesNeeded}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
