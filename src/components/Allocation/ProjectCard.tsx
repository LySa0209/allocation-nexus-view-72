
import { Calendar, Users, Building2, Briefcase } from 'lucide-react';
import { ProjectOrPipeline, isProject } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface ProjectCardProps {
  project: ProjectOrPipeline;
  isSelected: boolean;
  onClick: () => void;
}

export function ProjectCard({ project, isSelected, onClick }: ProjectCardProps) {
  const resourcesNeeded = isProject(project) 
    ? project.resourcesNeeded - project.resourcesAssigned 
    : project.resourcesNeeded;

  return (
    <Card 
      className={`w-[300px] cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold truncate">{project.name}</h3>
            <p className="text-sm text-muted-foreground">{project.id}</p>
          </div>
          {!isProject(project) && (
            <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
              {project.winPercentage}% Win
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{project.clientName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{resourcesNeeded} Resources Needed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
          </div>
          {project.sector && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{project.sector}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
