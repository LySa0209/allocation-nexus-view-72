
import React from 'react';
import { Project, PipelineOpportunity, isProject } from '@/lib/types';

interface ProjectNeedsListProps {
  projects: Project[];
  pipelineOpportunities: PipelineOpportunity[];
  onSelectProject: (project: Project | PipelineOpportunity) => void;
  selectedProjectId: string | null;
}

export const ProjectNeedsList = ({
  projects,
  pipelineOpportunities,
  onSelectProject,
  selectedProjectId
}: ProjectNeedsListProps) => {
  // Filter to only include projects and opportunities that need resources
  const confirmedProjectsNeedingResources = projects.filter(project => project.staffingStatus === 'Needs Resources');
  const pipelineProjectsNeedingResources = pipelineOpportunities.filter(pipeline => pipeline.resourcesNeeded > 0);

  // Combine all projects needing resources
  const projectsNeedingResources = [...confirmedProjectsNeedingResources, ...pipelineProjectsNeedingResources];

  const getPriorityLevel = (project: Project | PipelineOpportunity): number => {
    const isPipeline = !isProject(project);
    if (isPipeline) {
      const winPercent = (project as PipelineOpportunity).winPercentage;
      if (winPercent > 80) return 3; // Critical
      else if (winPercent > 60) return 2; // High Priority
      else return 1; // Medium Priority
    } else {
      const resourcesGap = (project as Project).resourcesNeeded - (project as Project).resourcesAssigned;
      if (resourcesGap > 3) return 3; // Critical
      else if (resourcesGap > 1) return 2; // High Priority
      else return 1; // Medium Priority
    }
  };

  const getPriorityBadge = (project: Project | PipelineOpportunity) => {
    const priorityLevel = getPriorityLevel(project);
    if (priorityLevel === 3) {
      return <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Critical</span>;
    } else if (priorityLevel === 2) {
      return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">High Priority</span>;
    } else {
      return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Medium Priority</span>;
    }
  };

  // Sort projects by priority (Critical first, then High Priority, then Medium Priority)
  const sortedProjectsNeedingResources = projectsNeedingResources.sort((a, b) => {
    return getPriorityLevel(b) - getPriorityLevel(a);
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-y-auto h-full">
      <h3 className="font-semibold mb-1 flex justify-between items-center">
        <span className="text-xl text-black font-bold">Projects Needing Resources</span>
        <span className="text-xs bg-[#ffe704] text-[#0f161e] px-2 py-1 rounded-full font-normal">
          {sortedProjectsNeedingResources.length} projects
        </span>
      </h3>
      <p className="text-xs text-gray-500 mb-3">Select a project to view details and allocate consultants</p>
      
      <div className="space-y-2">
        {sortedProjectsNeedingResources.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No projects need resources at this time</p>
        ) : (
          sortedProjectsNeedingResources.map(project => {
            const resourcesNeeded = isProject(project) 
              ? project.resourcesNeeded - project.resourcesAssigned 
              : project.resourcesNeeded;
            
            return (
              <div 
                key={project.id} 
                className={`project-item p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
                  selectedProjectId === project.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`} 
                onClick={() => onSelectProject(project)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-gray-500">
                      {project.sector || (isProject(project) ? 'Project' : 'Pipeline')} • {resourcesNeeded} FTE needed
                    </p>
                  </div>
                  {getPriorityBadge(project)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
