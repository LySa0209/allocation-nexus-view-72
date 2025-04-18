import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '../components/Layout/Navbar';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProjectCard } from '@/components/Allocation/ProjectCard';
import MoveConsultantModal from '@/components/Allocation/MoveConsultantModal';
import { Brain, BarChart, Users, Briefcase } from 'lucide-react';
import { 
  consultants as initialConsultants,
  allocations as initialAllocations,
  projects as initialProjects,
  pipelineOpportunities as initialPipeline
} from '../data/mockData';
import { Consultant, ProjectOrPipeline, Project, PipelineOpportunity } from '@/lib/types';

const calculateChargeability = (consultants: Consultant[]): number => {
  if (consultants.length === 0) return 0;
  const allocatedCount = consultants.filter(c => c.status === "Allocated").length;
  return Math.round((allocatedCount / consultants.length) * 100);
};

const Allocations: React.FC = () => {
  const { toast } = useToast();
  const [consultants, setConsultants] = useState<Consultant[]>(initialConsultants);
  const [allocations, setAllocations] = useState(initialAllocations);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [pipelineOpportunities] = useState<PipelineOpportunity[]>(initialPipeline);
  const [selectedProject, setSelectedProject] = useState<ProjectOrPipeline | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [chargeability, setChargeability] = useState<number>(0);
  const [experienceFilter, setExperienceFilter] = useState<'junior' | 'average' | 'senior'>('average');

  // Calculate metrics
  useEffect(() => {
    const newChargeability = calculateChargeability(consultants);
    setChargeability(newChargeability);
  }, [consultants]);

  const benchedConsultants = consultants.filter(c => c.status === "Benched");
  const projectsNeedingResources = [
    ...projects.filter(p => p.staffingStatus === "Needs Resources"),
    ...pipelineOpportunities.filter(p => p.resourcesNeeded > 0)
  ];

  const handleAutoAllocate = () => {
    if (benchedConsultants.length === 0 || projectsNeedingResources.length === 0) {
      toast({
        title: "Auto-allocation Failed",
        description: "No consultants on bench or no projects needing resources.",
        variant: "destructive",
      });
      return;
    }

    let allocationsCreated = 0;
    const updatedConsultants = [...consultants];
    const updatedAllocations = [...allocations];
    const updatedPipelineOpportunities = [...pipelineOpportunities];
    
    // Try to allocate each benched consultant to a pipeline project
    benchedConsultants.forEach((consultant, index) => {
      if (index < projectsNeedingResources.length) {
        const targetProject = projectsNeedingResources[index];
        
        // Create a new allocation
        const newAllocation = {
          id: `A${String(updatedAllocations.length + 1).padStart(3, '0')}`,
          consultantId: consultant.id,
          projectId: targetProject.id,
          startDate: targetProject.startDate,
          endDate: targetProject.endDate,
          percentage: 1.0,
        };
        
        // Update the consultant status
        const consultantIndex = updatedConsultants.findIndex(c => c.id === consultant.id);
        if (consultantIndex !== -1) {
          updatedConsultants[consultantIndex] = {
            ...updatedConsultants[consultantIndex],
            status: "Allocated",
            currentProject: targetProject.id,
          };
        }
        
        // Update the pipeline opportunity
        const projectIndex = updatedPipelineOpportunities.findIndex(p => p.id === targetProject.id);
        if (projectIndex !== -1) {
          updatedPipelineOpportunities[projectIndex] = {
            ...updatedPipelineOpportunities[projectIndex],
            resourcesNeeded: Math.max(0, targetProject.resourcesNeeded - 1),
          };
        }
        
        updatedAllocations.push(newAllocation);
        allocationsCreated++;
      }
    });
    
    // Update state
    setConsultants(updatedConsultants);
    setAllocations(updatedAllocations);
    // setPipelineOpportunities(updatedPipelineOpportunities);
    
    // Notify user
    toast({
      title: "Auto-allocation Complete",
      description: `Successfully allocated ${allocationsCreated} consultants to pipeline projects.`,
    });
  };

  const handleAllocateConsultant = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowMoveModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Metrics Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Chargeability</h3>
                <BarChart className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-full">
                  <Progress value={chargeability} />
                </div>
                <span className="text-sm font-medium">{chargeability}%</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Consultants on Bench</h3>
                <Users className="h-4 w-4 text-gray-500" />
              </div>
              <span className="text-xl font-bold">{benchedConsultants.length}</span>
            </div>
            
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Projects Needing Resources</h3>
                <Briefcase className="h-4 w-4 text-gray-500" />
              </div>
              <span className="text-xl font-bold">{projectsNeedingResources.length}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Resource Allocation</h1>
          <Button 
            onClick={handleAutoAllocate}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="h-4 w-4" />
            <span>Auto Allocate</span>
          </Button>
        </div>

        {/* Projects Needing Resources */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Projects Needing Resources</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {projectsNeedingResources.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={selectedProject?.id === project.id}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        </div>

        {/* Experience Level Filter */}
        <div className="flex gap-2 mb-4">
          {(['junior', 'average', 'senior'] as const).map((level) => (
            <Button
              key={level}
              variant={experienceFilter === level ? 'default' : 'outline'}
              onClick={() => setExperienceFilter(level)}
              className="capitalize"
            >
              {level} Experience
            </Button>
          ))}
        </div>

        {/* Available Consultants */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Available Consultants</h2>
            <div className="space-y-4">
              {benchedConsultants.map(consultant => (
                <div
                  key={consultant.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium">{consultant.name}</h3>
                    <p className="text-sm text-gray-500">{consultant.role}</p>
                  </div>
                  <Button
                    onClick={() => handleAllocateConsultant(consultant)}
                    variant="outline"
                  >
                    Allocate
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Project Details</h2>
            {selectedProject ? (
              <div className="space-y-4">
                <h3 className="font-medium">{selectedProject.name}</h3>
                <p className="text-gray-600">{selectedProject.clientName}</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(selectedProject.startDate).toLocaleDateString()} - 
                    {new Date(selectedProject.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a project to view details</p>
            )}
          </div>
        </div>
      </main>

      {/* Move Consultant Modal */}
      {selectedConsultant && (
        <MoveConsultantModal
          isOpen={showMoveModal}
          onClose={() => {
            setShowMoveModal(false);
          }}
          onConfirm={(data) => {
            const newAllocation = {
              id: `A${String(allocations.length + 1).padStart(3, '0')}`,
              ...data
            };
            
            setAllocations([...allocations, newAllocation]);
            
            const updatedConsultants = consultants.map(c => 
              c.id === data.consultantId ? {
                ...c,
                status: 'Allocated' as const,
                currentProject: data.projectId
              } : c
            );
            setConsultants(updatedConsultants);
            
            // Update the confirmed project
            const updatedProjects = projects.map(p => 
              p.id === data.projectId ? {
                ...p,
                resourcesAssigned: p.resourcesAssigned + 1,
                staffingStatus: p.resourcesAssigned + 1 >= p.resourcesNeeded 
                  ? 'Fully Staffed' as const 
                  : 'Needs Resources' as const
              } : p
            );
            setProjects(updatedProjects);
            
            toast({
              title: "Consultant Added",
              description: "The consultant has been successfully added to the project.",
            });
            setShowMoveModal(false);
          }}
          consultants={[selectedConsultant]}
          project={selectedProject}
          type="fromProject"
          preselectedConsultant={selectedConsultant}
        />
      )}
    </div>
  );
};

export default Allocations;
