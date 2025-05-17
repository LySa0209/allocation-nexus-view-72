
import React from 'react';
import { Project, PipelineOpportunity } from '@/lib/types';
import { 
  Calendar, 
  Briefcase, 
  ArrowUpDown,
  Filter,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectsNeedingStaffingProps {
  projects: Project[];
  pipelineOpportunities: PipelineOpportunity[];
  onSelectProject: (project: Project | PipelineOpportunity) => void;
  selectedProjectId: string | null;
}

const ProjectsNeedingStaffing: React.FC<ProjectsNeedingStaffingProps> = ({
  projects,
  pipelineOpportunities,
  onSelectProject,
  selectedProjectId
}) => {
  // Filter to only include projects and opportunities that need resources
  const confirmedProjectsNeedingResources = projects.filter(
    project => project.staffingStatus === 'Needs Resources'
  );
  
  const pipelineProjectsNeedingResources = pipelineOpportunities.filter(
    pipeline => pipeline.resourcesNeeded > 0
  );
  
  // Combine and sort by start date
  const allProjectsNeedingResources = [
    ...confirmedProjectsNeedingResources.map(project => ({
      ...project,
      type: 'confirmed' as const,
      probability: 100
    })),
    ...pipelineProjectsNeedingResources.map(pipeline => ({
      ...pipeline,
      type: 'pipeline' as const,
      probability: pipeline.winPercentage
    }))
  ].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  if (allProjectsNeedingResources.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-xl font-bold mb-4">Projects Needing Resources</h3>
        <p className="text-gray-500">All projects are fully staffed</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Projects Needing Resources</h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span>Sort</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resources Needed
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allProjectsNeedingResources.map(project => (
              <tr 
                key={project.id} 
                onClick={() => onSelectProject(project)}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedProjectId === project.id ? 'bg-purple-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Briefcase className={`h-4 w-4 mr-2 ${
                      project.type === 'confirmed' ? 'text-green-500' : 'text-orange-500'
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500">{project.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    project.type === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.type === 'confirmed' 
                      ? 'Confirmed' 
                      : `Pipeline (${project.probability}%)`
                    }
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm font-medium text-blue-600">
                    <Users className="h-4 w-4 mr-1" />
                    {project.type === 'confirmed' 
                      ? project.resourcesNeeded - project.resourcesAssigned
                      : project.resourcesNeeded
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsNeedingStaffing;
