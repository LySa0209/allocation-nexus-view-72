
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '../components/Layout/Navbar';
import { 
  consultants as initialConsultants, 
  allocations as initialAllocations,
  projects as initialProjects, 
  pipelineOpportunities as initialPipeline
} from '../data/mockData';
import { Consultant, Allocation, Project, PipelineOpportunity } from '@/lib/types';
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeftRight, 
  BarChart, 
  Brain, 
  Briefcase,
  Calendar, 
  Check, 
  Clock, 
  Filter, 
  RefreshCw, 
  Settings,
  Users,
  X 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import MoveConsultantModal from '@/components/Allocation/MoveConsultantModal';
import AllocationTimeline from '@/components/Allocation/AllocationTimeline';
import ProjectsNeedingStaffing from '@/components/Allocation/ProjectsNeedingStaffing';
import SuggestedConsultants from '@/components/Allocation/SuggestedConsultants';

// Helper function to calculate chargeability
const calculateChargeability = (consultants: Consultant[], allocations: Allocation[]): number => {
  if (consultants.length === 0) return 0;
  
  // Count allocated consultants
  const allocatedCount = consultants.filter(c => c.status === "Allocated").length;
  
  // Calculate percentage
  return Math.round((allocatedCount / consultants.length) * 100);
};

const Allocations: React.FC = () => {
  const { toast } = useToast();
  const [consultants, setConsultants] = useState<Consultant[]>(initialConsultants);
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [pipelineOpportunities, setPipelineOpportunities] = useState<PipelineOpportunity[]>(initialPipeline);
  const [chargeability, setChargeability] = useState<number>(0);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | PipelineOpportunity | null>(null);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [timeSlot, setTimeSlot] = useState<{ startDate: Date; endDate: Date } | null>(null);
  
  // Calculate metrics
  useEffect(() => {
    const newChargeability = calculateChargeability(consultants, allocations);
    setChargeability(newChargeability);
  }, [consultants, allocations]);
  
  // Filter consultants on bench
  const benchedConsultants = consultants.filter(c => c.status === "Benched");
  
  // Get pipeline projects needing resources
  const pipelineProjectsNeedingResources = pipelineOpportunities.filter(p => p.resourcesNeeded > 0);
  
  // Handle selection of project
  const handleSelectProject = (project: Project | PipelineOpportunity) => {
    setSelectedProject(project);
    setSelectedConsultant(null);
    setSelectedAllocation(null);
  };
  
  // Handle selection of consultant
  const handleSelectConsultant = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    // Don't reset selectedProject, we may want to allocate this consultant to it
  };
  
  // Handle selection of allocation
  const handleSelectAllocation = (allocation: Allocation) => {
    setSelectedAllocation(allocation);
    
    // Find the consultant and project
    const consultant = consultants.find(c => c.id === allocation.consultantId);
    if (consultant) {
      setSelectedConsultant(consultant);
    }
    
    const project = projects.find(p => p.id === allocation.projectId) || 
                  pipelineOpportunities.find(p => p.id === allocation.projectId);
    if (project) {
      setSelectedProject(project);
    }
  };
  
  // Handle time slot selection
  const handleSelectTimeSlot = (consultant: Consultant, startDate: Date, endDate: Date) => {
    setSelectedConsultant(consultant);
    setTimeSlot({ startDate, endDate });
    
    // If we have both a consultant and a project, open the allocation modal
    if (selectedProject) {
      setShowMoveModal(true);
    }
  };
  
  // Handle allocate consultant click
  const handleAllocateConsultant = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowMoveModal(true);
  };
  
  // Handle automatic allocation
  const handleAutoAllocate = () => {
    // Simple allocation algorithm: match benched consultants to pipeline projects
    if (benchedConsultants.length === 0 || pipelineProjectsNeedingResources.length === 0) {
      toast({
        title: "Auto-allocation Failed",
        description: "No consultants on bench or no pipeline projects needing resources.",
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
      if (index < pipelineProjectsNeedingResources.length) {
        const targetProject = pipelineProjectsNeedingResources[index];
        
        // Create a new allocation
        const newAllocation: Allocation = {
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
    setPipelineOpportunities(updatedPipelineOpportunities);
    
    // Notify user
    toast({
      title: "Auto-allocation Complete",
      description: `Successfully allocated ${allocationsCreated} consultants to pipeline projects.`,
    });
  };
  
  // Handle moving a consultant to a project
  const handleConfirmMove = (data: {
    consultantId: string;
    projectId: string;
    startDate: string;
    endDate: string;
    percentage: number;
  }) => {
    // Create a new allocation
    const newAllocation: Allocation = {
      id: `A${String(allocations.length + 1).padStart(3, '0')}`,
      ...data
    };
    
    // Update the consultant status
    const updatedConsultants = consultants.map(c => 
      c.id === data.consultantId ? {
        ...c,
        status: "Allocated" as const,
        currentProject: data.projectId
      } : c
    );
    
    // Check if the project is in the pipeline opportunities or confirmed projects
    const isPipelineProject = pipelineOpportunities.some(p => p.id === data.projectId);
    
    if (isPipelineProject) {
      // Update the pipeline opportunity
      const updatedPipelineOpportunities = pipelineOpportunities.map(p => 
        p.id === data.projectId ? {
          ...p,
          resourcesNeeded: Math.max(0, p.resourcesNeeded - 1)
        } : p
      );
      setPipelineOpportunities(updatedPipelineOpportunities);
    } else {
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
    }
    
    // Update state
    setConsultants(updatedConsultants);
    setAllocations([...allocations, newAllocation]);
    
    // Reset selected states and close modal
    setSelectedProject(null);
    setSelectedConsultant(null);
    setTimeSlot(null);
    setShowMoveModal(false);
    
    // Notify user
    toast({
      title: "Allocation Complete",
      description: "The consultant has been successfully allocated to the project.",
    });
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
                <h3 className="text-sm font-medium text-gray-700">Pipeline Projects</h3>
                <Briefcase className="h-4 w-4 text-gray-500" />
              </div>
              <span className="text-xl font-bold">{pipelineProjectsNeedingResources.length}</span>
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
        
        {/* Master Allocation Timeline */}
        <div className="mb-6">
          <AllocationTimeline
            consultants={consultants}
            allocations={allocations}
            projects={projects}
            pipelineOpportunities={pipelineOpportunities}
            onSelectAllocation={handleSelectAllocation}
            onSelectConsultant={handleSelectConsultant}
            onSelectTimeSlot={handleSelectTimeSlot}
          />
        </div>
        
        {/* Two-column layout for project needs and suggested consultants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ProjectsNeedingStaffing
              projects={projects}
              pipelineOpportunities={pipelineOpportunities}
              onSelectProject={handleSelectProject}
              selectedProjectId={selectedProject?.id || null}
            />
          </div>
          
          <div>
            <SuggestedConsultants
              consultants={consultants}
              selectedProject={selectedProject}
              onSelectConsultant={handleSelectConsultant}
              onAllocateConsultant={handleAllocateConsultant}
              selectedConsultantId={selectedConsultant?.id || null}
            />
          </div>
        </div>
      </main>
      
      {/* Move Consultant Modal */}
      {selectedConsultant && (
        <MoveConsultantModal
          isOpen={showMoveModal}
          onClose={() => {
            setShowMoveModal(false);
            setTimeSlot(null);
          }}
          onConfirm={handleConfirmMove}
          consultants={[selectedConsultant]}
          project={selectedProject || null}
          type={selectedProject ? "fromProject" : "toPipeline"}
          pipelineOpportunities={selectedProject ? undefined : pipelineOpportunities}
          preselectedConsultant={selectedConsultant}
          initialDates={timeSlot ? {
            startDate: timeSlot.startDate.toISOString().split('T')[0],
            endDate: timeSlot.endDate.toISOString().split('T')[0]
          } : undefined}
        />
      )}
    </div>
  );
};

export default Allocations;
