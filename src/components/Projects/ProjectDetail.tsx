
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, DollarSign, Building, Briefcase, 
  Users, ArrowLeft, Clock, Edit, Trash2
} from 'lucide-react';
import { 
  Project, PipelineOpportunity, Consultant 
} from '../../lib/types';
import { Button } from '@/components/ui/button';

interface ProjectDetailProps {
  item: Project | PipelineOpportunity;
  type: 'active' | 'pipeline';
  assignedConsultants?: Consultant[];
  onAddConsultant: () => void;
  onEditProject?: () => void;
  onRemoveConsultant?: (consultantId: string) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  item, 
  type,
  assignedConsultants = [],
  onAddConsultant,
  onEditProject,
  onRemoveConsultant
}) => {
  const navigate = useNavigate();
  const project = type === 'active' ? item as Project : null;
  const opportunity = type === 'pipeline' ? item as PipelineOpportunity : null;
  
  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with back button */}
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/projects')}
            className="mr-4 text-gray-400 hover:text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {type === 'active' ? 'Project Details' : 'Pipeline Opportunity'}
          </h3>
        </div>
        <div className="flex space-x-2">
          {type === 'active' && onEditProject && (
            <Button 
              onClick={onEditProject}
              variant="outline"
              className="flex items-center space-x-1"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          )}
          {type === 'active' && (
            <Button 
              onClick={onAddConsultant}
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={project?.staffingStatus === 'Fully Staffed'}
            >
              Add Consultant
            </Button>
          )}
        </div>
      </div>
      
      {/* Project/Opportunity information */}
      <div className="px-4 py-5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div className="mb-6 sm:mb-0">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
                <p className="text-sm text-gray-500">{item.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Client: {item.clientName}</span>
              </div>
              
              {item.sector && (
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Sector: {item.sector}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Start: {new Date(item.startDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">End: {new Date(item.endDate).toLocaleDateString()}</span>
              </div>
              
              {type === 'active' && project?.budget && (
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Budget: ${project.budget.toLocaleString()}</span>
                </div>
              )}
              
              {type === 'pipeline' && opportunity?.estimatedValue && (
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Est. Value: ${opportunity.estimatedValue.toLocaleString()}</span>
                </div>
              )}
              
              {type === 'pipeline' && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Win Probability: {opportunity?.winPercentage}%</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">
                  Resources Needed: {type === 'active' ? project?.resourcesNeeded : opportunity?.resourcesNeeded}
                </span>
              </div>
              
              {type === 'active' && (
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">
                    Resources Assigned: {project?.resourcesAssigned}
                  </span>
                </div>
              )}
            </div>
            
            {project?.deliverables && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Deliverables</h4>
                <p className="text-sm text-gray-700">{project.deliverables}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-between">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
              <div className="flex items-center">
                {type === 'active' ? (
                  <>
                    <span
                      className={`status-badge ${
                        project?.status === 'Active'
                          ? 'status-allocated'
                          : project?.status === 'On Hold'
                          ? 'status-bench'
                          : 'status-pipeline'
                      } mr-2`}
                    >
                      {project?.status}
                    </span>
                    <span
                      className={`status-badge ml-2 ${
                        project?.staffingStatus === 'Fully Staffed'
                          ? 'status-allocated'
                          : 'status-needed'
                      }`}
                    >
                      {project?.staffingStatus}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="status-badge status-pipeline mr-2">
                      {opportunity?.status}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Assigned Consultants (only for active projects) */}
      {type === 'active' && (
        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Assigned Consultants
          </h3>
          
          {assignedConsultants.length === 0 ? (
            <p className="text-sm text-gray-500">No consultants currently assigned to this project.</p>
          ) : (
            <div className="overflow-hidden">
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {assignedConsultants.map((consultant) => (
                  <li key={consultant.id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-primary">{consultant.name}</p>
                      <p className="text-xs text-gray-500">{consultant.role}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">{consultant.expertise}</span>
                        <span className="text-xs text-gray-400 mt-1">
                          {consultant.serviceLine}
                        </span>
                      </div>
                      {onRemoveConsultant && (
                        <Button
                          onClick={() => onRemoveConsultant(consultant.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
