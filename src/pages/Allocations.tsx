
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '../components/Layout/Navbar';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ProjectCard } from '@/components/Allocation/ProjectCard';
import MoveConsultantModal from '@/components/Allocation/MoveConsultantModal';
import { Brain, BarChart, Users, Briefcase } from 'lucide-react';
import { 
  consultants as initialConsultants,
  allocations as initialAllocations,
  projects as initialProjects,
  pipelineOpportunities as initialPipeline
} from '../data/mockData';
import { Consultant, ProjectOrPipeline, Project, PipelineOpportunity, isProject } from '@/lib/types';

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
  const [fteSlider, setFteSlider] = useState(3);
  const [seniorityMix, setSeniorityMix] = useState(60);

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

  // Get allocated consultants for a project
  const getAllocatedConsultants = (projectId: string): Consultant[] => {
    const projectAllocations = allocations.filter(a => a.projectId === projectId);
    return consultants.filter(c => 
      projectAllocations.some(a => a.consultantId === c.id)
    );
  };

  // Check if consultant is selected for current project
  const isConsultantSelected = (consultant: Consultant): boolean => {
    if (!selectedProject) return false;
    return allocations.some(a => 
      a.consultantId === consultant.id && 
      a.projectId === selectedProject.id
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4">
        {/* KPI Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Resource Allocation Dashboard</h3>
              <p className="text-sm text-gray-500">Last updated: Just now</p>
            </div>
            <div className="flex space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Consultants</p>
                <p className="text-xl font-bold">{consultants.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-xl font-bold text-green-500">{benchedConsultants.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Fully Allocated</p>
                <p className="text-xl font-bold text-red-500">
                  {consultants.filter(c => c.status === "Allocated").length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Chargeability</p>
                <p className="text-xl font-bold text-yellow-500">{chargeability}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Projects Needing Resources */}
          <div className="bg-white rounded-lg shadow p-6 max-h-[600px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Projects Needing Resources</h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {projectsNeedingResources.length} projects
              </span>
            </div>
            <div className="space-y-4">
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

          {/* Project Details and Allocated Consultants */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              {selectedProject ? `Consultants on ${selectedProject.name}` : 'Select a Project'}
            </h2>

            {selectedProject && (
              <>
                <div className="mb-6 space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Required FTEs</span>
                      <span className="text-sm text-gray-500">{fteSlider}</span>
                    </div>
                    <Slider 
                      value={[fteSlider]}
                      max={10}
                      step={1}
                      onValueChange={(value) => setFteSlider(value[0])}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Seniority Mix</span>
                      <span className="text-sm text-gray-500">{seniorityMix}% Senior</span>
                    </div>
                    <Slider 
                      value={[seniorityMix]}
                      max={100}
                      step={5}
                      onValueChange={(value) => setSeniorityMix(value[0])}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {getAllocatedConsultants(selectedProject.id).length > 0 ? (
                    getAllocatedConsultants(selectedProject.id).map(consultant => (
                      <Card key={consultant.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{consultant.name}</h3>
                            <p className="text-sm text-gray-500">{consultant.role}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              // Remove consultant logic would go here
                              toast({
                                title: "Not Implemented",
                                description: "Remove consultant functionality coming soon.",
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500">No consultants allocated to this project yet.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Experience Level Filter */}
        <div className="flex gap-2 my-4">
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
                  variant={isConsultantSelected(consultant) ? "destructive" : "outline"}
                >
                  {isConsultantSelected(consultant) ? 'Remove' : 'Allocate'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Move Consultant Modal */}
      {selectedConsultant && showMoveModal && (
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
            
            // Update the confirmed project if it's a project (not a pipeline)
            if (selectedProject && isProject(selectedProject)) {
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
            }
            
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
