
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { ProjectOrPipeline, isProject } from '@/lib/types';

interface ProjectDetailPanelProps {
  project: ProjectOrPipeline | null;
  fteValue: number;
  onFteChange: (value: number) => void;
  seniorityValue: number;
  onSeniorityChange: (value: number) => void;
  priorityValue: number;
  onPriorityChange: (value: number) => void;
}

export const ProjectDetailPanel = ({
  project,
  fteValue,
  onFteChange,
  seniorityValue,
  onSeniorityChange,
  priorityValue,
  onPriorityChange
}: ProjectDetailPanelProps) => {
  if (!project) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-full">
        <h3 className="font-semibold mb-4">Project Details</h3>
        <p className="text-gray-500 text-center py-8">Select a project to view details</p>
      </div>
    );    
  }

  // Generate some mock skills based on the project sector
  const getProjectSkills = () => {
    const sector = project.sector || '';
    const baseSkills = ['Project Management', 'Client Management'];
    
    const sectorSkills: Record<string, string[]> = {
      'Strategy': ['Digital Strategy', 'Market Analysis', 'Customer Experience'],
      'Technology': ['System Architecture', 'Cloud Computing', 'Data Engineering'],
      'Finance': ['Financial Analysis', 'Risk Management', 'Process Optimization'],
      'Operations': ['Supply Chain', 'Process Engineering', 'Operational Excellence'],
      'HR': ['Talent Management', 'Organizational Design', 'Change Management']
    };
    
    return [...baseSkills, ...(sectorSkills[sector] || ['Consulting', 'Business Analysis'])];
  };

  const projectSkills = getProjectSkills();
  const priorityLabels = ['Low', 'Medium', 'High'];

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full overflow-y-auto">
      <h3 className="font-semibold mb-4">Project Details</h3>
      
      <div id="project-details">
        <div className="mb-4">
          <h4 className="text-lg font-medium">{project.name}</h4>
          <p className="text-sm text-gray-500">
            {project.sector || 'General'} • Start Date: {new Date(project.startDate).toLocaleDateString()}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">Project Description:</p>
          <p className="text-sm">
            {isProject(project)
              ? `${project.clientName} project requiring ${project.resourcesNeeded} consultants.`
              : `Opportunity with ${project.clientName} at ${project.winPercentage}% likelihood.`
            }
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Required FTEs</span>
              <span className="text-sm text-gray-500">{fteValue}</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[fteValue]}
              onValueChange={(value) => onFteChange(value[0])}
              className="project-slider"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Seniority Mix</span>
              <span className="text-sm text-gray-500">{seniorityValue}% Senior</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[seniorityValue]}
              onValueChange={(value) => onSeniorityChange(value[0])}
              className="project-slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>More Junior</span>
              <span>More Senior</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Project Priority</span>
              <span className={`text-sm ${
                priorityValue === 3 ? 'text-red-500' : 
                priorityValue === 2 ? 'text-blue-500' : 'text-yellow-500'
              }`}>{priorityLabels[priorityValue - 1]}</span>
            </div>
            <Slider
              min={1}
              max={3}
              step={1}
              value={[priorityValue]}
              onValueChange={(value) => onPriorityChange(value[0])}
              className="project-slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-2">
              {projectSkills.map((skill, index) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
