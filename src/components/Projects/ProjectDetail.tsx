
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
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center py-8">Project not found</p>
        </div>
      </div>
    );
  }

  const isProject = 'staffingStatus' in item;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Project Info */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
          <div className="flex items-center gap-4 text-lg">
            <span className="text-gray-700">{item.clientName}</span>
            <span className="text-gray-400">•</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isProject 
                ? (item as Project).staffingStatus === 'Fully Staffed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isProject ? (item as Project).staffingStatus : 'Pipeline Opportunity'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Timeline:</span>
              <p className="mt-1">
                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
              </p>
            </div>
            {item.sector && (
              <div>
                <span className="font-medium text-gray-700">Sector:</span>
                <p className="mt-1">{item.sector}</p>
              </div>
            )}
            {isProject && (item as Project).deliverables && (
              <div>
                <span className="font-medium text-gray-700">Deliverables:</span>
                <p className="mt-1">{(item as Project).deliverables}</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Resources Needed:</span>
              <p className="mt-1">
                {isProject ? (item as Project).resourcesNeeded : (item as PipelineOpportunity).resourcesNeeded}
              </p>
            </div>
            {isProject && (
              <div>
                <span className="font-medium text-gray-700">Resources Assigned:</span>
                <p className="mt-1">{(item as Project).resourcesAssigned}</p>
              </div>
            )}
            {!isProject && (
              <div>
                <span className="font-medium text-gray-700">Win Percentage:</span>
                <p className="mt-1">{(item as PipelineOpportunity).winPercentage}%</p>
              </div>
            )}
            {isProject && (item as Project).budget && (
              <div>
                <span className="font-medium text-gray-700">Budget:</span>
                <p className="mt-1">${(item as Project).budget?.toLocaleString()}</p>
              </div>
            )}
            {!isProject && (item as PipelineOpportunity).estimatedValue && (
              <div>
                <span className="font-medium text-gray-700">Estimated Value:</span>
                <p className="mt-1">${(item as PipelineOpportunity).estimatedValue?.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assigned Consultants - only for active projects */}
      {isProject && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Assigned Consultants</h2>
            <Button onClick={onAddConsultant} size="sm">
              Add Consultant
            </Button>
          </div>
          <div className="space-y-3">
            {assignedConsultants.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <p>No consultants assigned to this project</p>
              </div>
            ) : (
              assignedConsultants.map((consultant) => (
                <div key={consultant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <h3 className="font-medium text-gray-900">{consultant.name}</h3>
                    <p className="text-sm text-gray-600">{consultant.role} • {consultant.expertise}</p>
                    {consultant.location && (
                      <p className="text-sm text-gray-500">{consultant.location}</p>
                    )}
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {isProject && (
          <Button onClick={onEditProject} variant="outline">
            Edit Project
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
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
  );
};

export default ProjectDetail;
