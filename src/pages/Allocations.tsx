
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeftRight, 
  BarChart, 
  Brain, 
  Calendar, 
  Check, 
  Clock, 
  Filter, 
  RefreshCw, 
  Settings, 
  X 
} from 'lucide-react';
import MoveConsultantModal from '@/components/Allocation/MoveConsultantModal';

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
  const [activeTab, setActiveTab] = useState<'bench' | 'pipeline'>('bench');
  const [consultants, setConsultants] = useState<Consultant[]>(initialConsultants);
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [pipelineOpportunities, setPipelineOpportunities] = useState<PipelineOpportunity[]>(initialPipeline);
  const [chargeability, setChargeability] = useState<number>(0);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedProject, setSelectedProject] = useState<PipelineOpportunity | null>(null);
  
  // Calculate metrics
  useEffect(() => {
    const newChargeability = calculateChargeability(consultants, allocations);
    setChargeability(newChargeability);
  }, [consultants, allocations]);
  
  // Filter consultants on bench
  const benchedConsultants = consultants.filter(c => c.status === "Benched");
  
  // Get pipeline projects needing resources
  const pipelineProjectsNeedingResources = pipelineOpportunities.filter(p => p.resourcesNeeded > 0);
  
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
  
  // Handle opening the move modal
  const handleMoveConsultant = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowMoveModal(true);
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
        status: "Allocated",
        currentProject: data.projectId
      } : c
    );
    
    // Update the pipeline opportunity
    const updatedPipelineOpportunities = pipelineOpportunities.map(p => 
      p.id === data.projectId ? {
        ...p,
        resourcesNeeded: Math.max(0, p.resourcesNeeded - 1)
      } : p
    );
    
    // Update state
    setConsultants(updatedConsultants);
    setAllocations([...allocations, newAllocation]);
    setPipelineOpportunities(updatedPipelineOpportunities);
    
    // Notify user
    toast({
      title: "Allocation Complete",
      description: "The consultant has been successfully allocated to the project.",
    });
    
    // Close the modal
    setShowMoveModal(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Allocations</h1>
          <Button 
            onClick={handleAutoAllocate}
            className="flex items-center space-x-2 bg-primary2 hover:bg-primary2/90"
          >
            <Brain className="h-4 w-4" />
            <span>Auto Allocate</span>
          </Button>
        </div>
        
        <Tabs defaultValue="bench" className="w-full" onValueChange={(value) => setActiveTab(value as 'bench' | 'pipeline')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="bench">Consultants on Bench</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline Opportunities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bench" className="mt-0">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {benchedConsultants.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No consultants currently on bench.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Line
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expertise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {benchedConsultants.map((consultant) => (
                      <tr key={consultant.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{consultant.name}</div>
                          <div className="text-sm text-gray-500">{consultant.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {consultant.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {consultant.serviceLine}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {consultant.expertise}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleMoveConsultant(consultant)}
                            className="flex items-center space-x-1"
                          >
                            <ArrowLeftRight className="h-3 w-3" />
                            <span>Allocate</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pipeline" className="mt-0">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {pipelineProjectsNeedingResources.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No pipeline projects currently needing resources.</p>
                </div>
              ) : (
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
                    {pipelineProjectsNeedingResources.map((project) => (
                      <tr key={project.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {project.status} ({project.winPercentage}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {project.resourcesNeeded}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Move Consultant Modal */}
      {selectedConsultant && (
        <MoveConsultantModal
          isOpen={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          onConfirm={handleConfirmMove}
          consultants={consultants}
          project={null}
          type="toPipeline"
          pipelineOpportunities={pipelineOpportunities}
          preselectedConsultant={selectedConsultant}
        />
      )}
    </div>
  );
};

export default Allocations;
