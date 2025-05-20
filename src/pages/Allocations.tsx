import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '../components/Layout/Navbar';
import { AllocationKPI } from '@/components/Allocation/AllocationKPI';
import { ProjectNeedsList } from '@/components/Allocation/ProjectNeedsList';
import { ProjectDetailPanel } from '@/components/Allocation/ProjectDetailPanel';
import { ConsultantsList } from '@/components/Allocation/ConsultantsList';
import { AllocatedConsultants } from '@/components/Allocation/AllocatedConsultants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { consultants as mockConsultants, allocations as mockAllocations, projects as mockProjects, pipelineOpportunities as mockPipeline } from '../data/mockData';
import { useDataSource } from '@/context/DataSourceContext';
import { fetchConsultants, fetchProjects, setConsultantsToProject, fetchProjectConsultants } from '@/lib/api';
import { Consultant, ProjectOrPipeline, Project, PipelineOpportunity, isProject } from '@/lib/types';
const calculateChargeability = (consultants: Consultant[]): number => {
  if (consultants.length === 0) return 0;
  const allocatedCount = consultants.filter(c => c.status === "Allocated").length;
  return Math.round(allocatedCount / consultants.length * 100);
};
const Allocations: React.FC = () => {
  const {
    toast
  } = useToast();
  const {
    dataSource,
    setIsLoading
  } = useDataSource();
  const [consultants, setConsultants] = useState<Consultant[]>(mockConsultants);
  const [allocations, setAllocations] = useState(mockAllocations);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [pipelineOpportunities, setPipelineOpportunities] = useState<PipelineOpportunity[]>(mockPipeline);
  const [selectedProject, setSelectedProject] = useState<ProjectOrPipeline | null>(null);
  const [allocatedConsultants, setAllocatedConsultants] = useState<Consultant[]>([]);
  const [selectedConsultantIds, setSelectedConsultantIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("projects");

  // Project detail sliders state
  const [fteValue, setFteValue] = useState(3);
  const [seniorityMix, setSeniorityMix] = useState(60);
  const [priorityValue, setPriorityValue] = useState(2);

  // Metrics for KPI bar
  const [chargeability, setChargeability] = useState<number>(0);
  const [partiallyAllocated, setPartiallyAllocated] = useState<number>(0);
  const consultantsListRef = useRef<HTMLDivElement>(null);
  const allocatedConsultantsRef = useRef<HTMLDivElement>(null);
  const [consultantsListMinHeight, setConsultantsListMinHeight] = useState<number | undefined>(undefined);

  // Confirm allocation loading state
  const [confirmLoading, setConfirmLoading] = useState(false);
  useEffect(() => {
    if (dataSource === 'mock') {
      // Use mock data
      setConsultants(mockConsultants);
      setProjects(mockProjects);
      setPipelineOpportunities(mockPipeline);
      setAllocations(mockAllocations);
      return;
    }

    // Use API data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [consultantsData, projectsData] = await Promise.all([fetchConsultants(), fetchProjects()]);
        setConsultants(consultantsData);

        // Split projects and pipeline opportunities
        const activeProjects = projectsData.filter(p => 'staffingStatus' in p) as Project[];
        const pipelineProjects = projectsData.filter(p => !('staffingStatus' in p)) as PipelineOpportunity[];
        setProjects(activeProjects);
        setPipelineOpportunities(pipelineProjects);

        // Keep using mock allocations as API doesn't provide them

        toast({
          title: "Data loaded successfully",
          description: `Loaded ${consultantsData.length} consultants and ${projectsData.length} projects from API.`
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error loading data",
          description: "Could not connect to the API. Using mock data instead.",
          variant: "destructive"
        });
        // Fall back to mock data
        setConsultants(mockConsultants);
        setProjects(mockProjects);
        setPipelineOpportunities(mockPipeline);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dataSource, toast, setIsLoading]);

  // Benchmarking metrics
  const benchedConsultants = consultants.filter(c => c.status === "Benched");
  const fullyAllocatedConsultants = consultants.filter(c => c.status === "Allocated");

  // Calculate metrics
  useEffect(() => {
    const newChargeability = calculateChargeability(consultants);
    setChargeability(newChargeability);

    // Simulate partially allocated (would normally come from real allocation data)
    setPartiallyAllocated(Math.floor(fullyAllocatedConsultants.length * 0.25));
  }, [consultants, fullyAllocatedConsultants.length]);
  useEffect(() => {
    if (consultantsListRef.current && allocatedConsultantsRef.current) {
      const allocatedHeight = allocatedConsultantsRef.current.offsetHeight;
      const consultantsHeight = consultantsListRef.current.offsetHeight;
      if (allocatedHeight > consultantsHeight) {
        setConsultantsListMinHeight(allocatedHeight);
        consultantsListRef.current.style.minHeight = allocatedHeight + 'px';
      } else {
        setConsultantsListMinHeight(undefined);
        consultantsListRef.current.style.minHeight = '';
      }
    }
  }, [allocatedConsultants]);

  // Handle project selection
  const handleSelectProject = async (project: ProjectOrPipeline) => {
    console.log('Selected project:', project);
    setSelectedProject(project);

    // Reset project sliders
    setFteValue(isProject(project) ? project.resourcesNeeded - project.resourcesAssigned : project.resourcesNeeded);
    setSeniorityMix(60); // Default to 60% senior
    setPriorityValue(2); // Default to medium priority

    // Switch to the project details tab
    setActiveTab("projects");
    if (dataSource === 'api') {
      try {
        setIsLoading(true);
        const projectConsultants = await fetchProjectConsultants(project.id);
        setAllocatedConsultants(projectConsultants);
        setSelectedConsultantIds(projectConsultants.map(c => c.id));
      } catch (error) {
        toast({
          title: 'Error loading allocated consultants',
          description: 'Could not fetch allocated consultants from API.',
          variant: 'destructive'
        });
        setAllocatedConsultants([]);
        setSelectedConsultantIds([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Get currently allocated consultants for this project (mock)
      const projectConsultants = getConsultantsForProject(project.id);
      setAllocatedConsultants(projectConsultants);
      setSelectedConsultantIds(projectConsultants.map(c => c.id));
    }
  };

  // Handle continue to consultants tab
  const handleContinueToConsultants = () => {
    // Switch to the consultants tab when continue button is clicked
    setActiveTab("consultants_allocation");
  };

  // Get consultants allocated to a specific project
  const getConsultantsForProject = (projectId: string): Consultant[] => {
    const projectAllocations = allocations.filter(a => a.projectId === projectId);
    return consultants.filter(c => projectAllocations.some(a => a.consultantId === c.id));
  };

  // Handle consultant allocation
  const handleAllocateConsultant = (consultant: Consultant) => {
    if (selectedConsultantIds.includes(consultant.id)) {
      // Remove the consultant
      setSelectedConsultantIds(prev => prev.filter(id => id !== consultant.id));
      setAllocatedConsultants(prev => prev.filter(c => c.id !== consultant.id));
    } else {
      // Add the consultant
      setSelectedConsultantIds(prev => [...prev, consultant.id]);
      setAllocatedConsultants(prev => [...prev, consultant]);
    }
  };

  // Handle consultant removal
  const handleRemoveConsultant = (consultantId: string) => {
    setSelectedConsultantIds(prev => prev.filter(id => id !== consultantId));
    setAllocatedConsultants(prev => prev.filter(c => c.id !== consultantId));
  };

  // Handle confirm allocation
  const handleConfirmAllocation = async () => {
    if (!selectedProject || allocatedConsultants.length === 0) return;
    setConfirmLoading(true);
    try {
      // Log the request payload
      console.log('Confirm Allocation Payload:', {
        consultantIds: allocatedConsultants.map(c => c.id),
        projectId: selectedProject.id
      });
      await setConsultantsToProject(allocatedConsultants.map(c => c.id), selectedProject.id);
      toast({
        title: 'Allocation successful',
        description: `Allocated ${allocatedConsultants.length} consultant(s) to project ${selectedProject.name}.`,
        variant: 'default'
      });
      // Refresh allocated consultants from API after allocation
      if (dataSource === 'api') {
        const projectConsultants = await fetchProjectConsultants(selectedProject.id);
        setAllocatedConsultants(projectConsultants);
        setSelectedConsultantIds(projectConsultants.map(c => c.id));
      }
    } catch (error: any) {
      toast({
        title: 'Allocation failed',
        description: error.message || 'Could not allocate consultants.',
        variant: 'destructive'
      });
    } finally {
      setConfirmLoading(false);
    }
  };
  return <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="consultants_allocation">Consultants & Allocation</TabsTrigger>
          </TabsList>
          
          {/* Projects Tab (Merged with KPI) */}
          <TabsContent value="projects" className="space-y-4">
            <AllocationKPI totalConsultants={consultants.length} availableConsultants={benchedConsultants.length} fullyAllocated={fullyAllocatedConsultants.length - partiallyAllocated} partiallyAllocated={partiallyAllocated} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProjectNeedsList projects={projects} pipelineOpportunities={pipelineOpportunities} onSelectProject={handleSelectProject} selectedProjectId={selectedProject?.id || null} />
              
              <ProjectDetailPanel project={selectedProject} fteValue={fteValue} onFteChange={setFteValue} seniorityValue={seniorityMix} onSeniorityChange={setSeniorityMix} priorityValue={priorityValue} onPriorityChange={setPriorityValue} onContinue={handleContinueToConsultants} />
            </div>
          </TabsContent>
          
          {/* Combined Consultants & Allocation Tab */}
          <TabsContent value="consultants_allocation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div ref={consultantsListRef}>
                <ConsultantsList consultants={consultants} onAllocateConsultant={handleAllocateConsultant} selectedConsultants={selectedConsultantIds} selectedProjectId={selectedProject?.id || null} />
              </div>
              
              <div ref={allocatedConsultantsRef}>
                {/* Add a custom div with the allocated consultants title and guidance text */}
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                  <h3 className="font-semibold mb-1 text-xl">Allocated to Project</h3>
                  <p className="text-sm text-gray-500">Consultants added to this project</p>
                </div>
                <AllocatedConsultants consultants={allocatedConsultants} onRemoveConsultant={handleRemoveConsultant} requiredFTEs={fteValue} onConfirmAllocation={handleConfirmAllocation} confirmLoading={confirmLoading} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>;
};
export default Allocations;