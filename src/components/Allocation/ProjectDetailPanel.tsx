
import React from 'react';
import { Slider } from '@/components/ui/slider'; // Assuming this is a Shadcn/UI or similar slider
import { ProjectOrPipeline, isProject } from '@/lib/types';

// --- Constants defined outside the component ---
const BASE_SKILLS = ['Project Management', 'Client Management'];
const SECTOR_SPECIFIC_SKILLS: Record<string, string[]> = {
  'Strategy': ['Digital Strategy', 'Market Analysis', 'Customer Experience'],
  'Technology': ['System Architecture', 'Cloud Computing', 'Data Engineering'],
  'Finance': ['Financial Analysis', 'Risk Management', 'Process Optimization'],
  'Operations': ['Supply Chain', 'Process Engineering', 'Operational Excellence'],
  'HR': ['Talent Management', 'Organizational Design', 'Change Management'],
};
const DEFAULT_SECTOR_SKILLS = ['Consulting', 'Business Analysis'];

const PRIORITY_LABELS: { [key: number]: string } = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
};

const PRIORITY_TEXT_COLORS: { [key: number]: string } = {
  1: 'text-yellow-500', // Low
  2: 'text-blue-500',   // Medium
  3: 'text-red-500',    // High
};

// --- Helper function for skills (can be outside or memoized inside if preferred) ---
const getProjectSkills = (sector: string | undefined | null): string[] => {
  const currentSector = sector || '';
  return [...BASE_SKILLS, ...(SECTOR_SPECIFIC_SKILLS[currentSector] || DEFAULT_SECTOR_SKILLS)];
};

// --- Reusable Slider Control Sub-component ---
interface SliderControlProps {
  label: string;
  value: number;
  displayValueSuffix?: string; // e.g., "% Senior"
  displayValueOverride?: string; // For completely custom display like "High" for priority
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  leftLabel?: string;
  centerLabel?: string; // For things like the priority slider's "Medium"
  rightLabel?: string;
  valueClassName?: string; // To pass dynamic classes for the value display
  sliderClassName?: string;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  displayValueSuffix = '',
  displayValueOverride,
  onValueChange,
  min,
  max,
  step,
  leftLabel,
  centerLabel,
  rightLabel,
  valueClassName = 'text-gray-500',
  sliderClassName = 'project-slider',
}) => {
  const displayedValue = displayValueOverride !== undefined
    ? displayValueOverride
    : `${value}${displayValueSuffix}`;

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm ${valueClassName}`}>{displayedValue}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]} // Slider component likely expects an array
        onValueChange={(val) => onValueChange(val[0])}
        className={sliderClassName}
      />
      {(leftLabel || centerLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{leftLabel}</span>
          {centerLabel && <span>{centerLabel}</span>}
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
};

// --- Main Project Detail Panel Props ---
interface ProjectDetailPanelProps {
  project: ProjectOrPipeline | null;
  fteValue: number;
  onFteChange: (value: number) => void;
  seniorityValue: number;
  onSeniorityChange: (value: number) => void;
  priorityValue: number; // Assuming 1 for Low, 2 for Medium, 3 for High
  onPriorityChange: (value: number) => void;
}

export const ProjectDetailPanel: React.FC<ProjectDetailPanelProps> = ({
  project,
  fteValue,
  onFteChange,
  seniorityValue,
  onSeniorityChange,
  priorityValue,
  onPriorityChange,
}) => {
  // Memoize projectSkills to recompute only when project.sector changes
  const projectSkills = React.useMemo(() => {
    if (!project) return [];
    return getProjectSkills(project.sector);
  }, [project]);

  if (!project) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-full">
        <h3 className="text-xl font-bold mb-4">Project Details</h3>
        <p className="text-gray-500 text-center py-8">Select a project to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full overflow-y-auto">
      <h3 className="text-xl font-bold mb-1">Project Details</h3>
      <p className="text-xs text-gray-500 mb-4">Edit details to specify resource requirements</p>

      <div id="project-details"> {/* Keep id if used for e.g. e2e tests */}
        <div className="mb-4">
          <h4 className="text-lg font-medium">{project.name}</h4>
          <p className="text-sm text-gray-500">
            {project.sector || 'General'} • Start Date: {new Date(project.startDate).toLocaleDateString()}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-1">Project Description:</p>
          <p className="text-sm">
            {isProject(project)
              ? `${project.clientName} project requiring ${project.resourcesNeeded} consultants.`
              : `Opportunity with ${project.clientName} at ${project.winPercentage}% likelihood.`}
          </p>
        </div>

        <div className="space-y-6"> {/* Increased spacing a bit for clarity */}
          <SliderControl
            label="Required FTEs"
            value={fteValue}
            onValueChange={onFteChange}
            min={1}
            max={10}
            step={1}
          />

          <SliderControl
            label="Seniority Mix"
            value={seniorityValue}
            displayValueSuffix="% Senior"
            onValueChange={onSeniorityChange}
            min={0}
            max={100}
            step={5}
            leftLabel="More Junior"
            rightLabel="More Senior"
          />

          <SliderControl
            label="Project Priority"
            value={priorityValue}
            displayValueOverride={PRIORITY_LABELS[priorityValue]}
            valueClassName={PRIORITY_TEXT_COLORS[priorityValue]}
            onValueChange={onPriorityChange}
            min={1}
            max={3}
            step={1}
            leftLabel={PRIORITY_LABELS[1]} // Low
            centerLabel={PRIORITY_LABELS[2]} // Medium
            rightLabel={PRIORITY_LABELS[3]} // High
          />

          <div>
            <p className="text-sm font-medium mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-2">
              {projectSkills.map((skill) => ( // Use skill itself as key if unique, or index if not
                <span key={skill} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
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
