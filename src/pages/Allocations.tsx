import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '../components/Layout/Navbar';
import { AllocationKPI } from '@/components/Allocation/AllocationKPI';
import { ProjectNeedsList } from '@/components/Allocation/ProjectNeedsList';
import { ProjectDetailPanel } from '@/components/Allocation/ProjectDetailPanel';
import { ConsultantsList } from '@/components/Allocation/ConsultantsList';
import { AllocatedConsultants } from '@/components/Allocation/AllocatedConsultants';
import { 
  consultants as mockConsultants,
  allocations as mockAllocations,
  projects as mockProjects,
  pipelineOpportunities as mockPipeline
} from '../data/mockData';
import { useDataSource } from '@/context/DataSourceContext';
import { fetchConsultants, fetchProjects } from '@/lib/api';
import { Consultant, ProjectOrPipeline, Project, PipelineOpportunity, isProject } from '@/lib/types';

const calculateChargeability = (consultants: Consultant[]): number => {
  if (consultants.length === 0) return 0;
  const allocatedCount = consultants.filter(c => c.status === "Allocated").length;
  return Math.round((allocatedCount / consultants.length) * 100);
};

const Allocations: React.FC = () => {
  const { toast } = useToast();
  const { dataSource, setIsLoading } = useDataSource();
  
  const [consultants, setConsultants] = useState<Consultant[]>(mockConsultants);
  const [allocations, setAllocations] = useState(mockAllocations);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [pipelineOpportunities, setPipelineOpportunities] = useState<PipelineOpportunity[]>(mockPipeline);
  const [selectedProject, setSelectedProject] = useState<ProjectOrPipeline | null>(null);
  const [allocatedConsultants, setAllocatedConsultants] = useState<Consultant[]>([]);
  const [selectedConsultantIds, setSelectedConsultantIds] = useState<string[]>([]);
  
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
        const [consultantsData, projectsData] = await Promise.all([
          fetchConsultants(),
          fetchProjects()
        ]);
        
        setConsultants(consultantsData);
        
        // Split projects and pipeline opportunities
        const activeProjects = projectsData.filter(p => 'staffingStatus' in p) as Project[];
        const pipelineProjects = projectsData.filter(p => !('staffingStatus' in p)) as PipelineOpportunity[];
        
        setProjects(activeProjects);
        setPipelineOpportunities(pipelineProjects);
        
        // Keep using mock allocations as API doesn't provide them
        
        toast({
          title: "Data loaded successfully",
          description: `Loaded ${consultantsData.length} consultants and ${projectsData.length} projects from API.`,
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
  const handleSelectProject = (project: ProjectOrPipeline) => {
    console.log('Selected project:', project);
    setSelectedProject(project);
    
    // Reset project sliders
    setFteValue(isProject(project) 
      ? project.resourcesNeeded - project.resourcesAssigned 
      : project.resourcesNeeded);
    setSeniorityMix(60); // Default to 60% senior
    setPriorityValue(2); // Default to medium priority
    
    // Get currently allocated consultants for this project
    const projectConsultants = getConsultantsForProject(project.id);
    setAllocatedConsultants(projectConsultants);
    
    // Update selected consultants
    setSelectedConsultantIds(projectConsultants.map(c => c.id));
  };

  // Get consultants allocated to a specific project
  const getConsultantsForProject = (projectId: string): Consultant[] => {
    const projectAllocations = allocations.filter(a => a.projectId === projectId);
    return consultants.filter(c => 
      projectAllocations.some(a => a.consultantId === c.id)
    );
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-[auto,1fr,1fr] gap-4 h-[calc(100vh-100px)]">

          {/* KPI Bar */}
          <AllocationKPI 
            totalConsultants={consultants.length}
            availableConsultants={benchedConsultants.length}
            fullyAllocated={fullyAllocatedConsultants.length - partiallyAllocated}
            partiallyAllocated={partiallyAllocated}
          />
          
          {/* Top Left - Projects Needing Resources */}
          <ProjectNeedsList 
            projects={projects}
            pipelineOpportunities={pipelineOpportunities}
            onSelectProject={handleSelectProject}
            selectedProjectId={selectedProject?.id || null}
          />
          
          <div className="max-h-[calc(70vh-200px)]">
            {/* fixed height that adapts to screen size */}
          {/* Top Right - Project Details */}
          <ProjectDetailPanel 
            project={selectedProject}
            fteValue={fteValue}
            onFteChange={setFteValue}
            seniorityValue={seniorityMix}
            onSeniorityChange={setSeniorityMix}
            priorityValue={priorityValue}
            onPriorityChange={setPriorityValue}
          />
          </div>
          
          <div className="max-h-[calc(100vh-200px)]" ref={consultantsListRef}>
          {/* Bottom Left - Available Consultants */}
          <ConsultantsList 
            consultants={consultants}
            onAllocateConsultant={handleAllocateConsultant}
            selectedConsultants={selectedConsultantIds}
            selectedProjectId={selectedProject?.id || null}
          />
          </div>
          
          {/* Bottom Right - Allocated Consultants */}
          <div ref={allocatedConsultantsRef}>
            <AllocatedConsultants 
              consultants={allocatedConsultants}
              onRemoveConsultant={handleRemoveConsultant}
              requiredFTEs={fteValue}
            />
          </div>
          
        <div className="h-1" /> {/* Spacer below the last row */}
        </div>
      </main>
    </div>
  );
};

export default Allocations;
