import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import ConsultantList from '../components/Consultants/ConsultantList';
import ConsultantDetail from '../components/Consultants/ConsultantDetail';
import AddConsultantDialog from '../components/Consultants/AddConsultantDialog';
import MoveConsultantModal from '../components/Allocation/MoveConsultantModal';
import { Button } from '@/components/ui/button';
import { 
  consultants as mockConsultants, 
  getConsultantById, 
  getAllocationsForConsultant, 
  projects as mockProjects,
  allocations as mockAllocations
} from '../data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useDataSource } from '@/context/DataSourceContext';
import { fetchConsultants, fetchProjects } from '@/lib/api';
import { Consultant } from '@/lib/types';

const Consultants: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { dataSource, setIsLoading } = useDataSource();
  
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [localConsultants, setLocalConsultants] = useState(mockConsultants);
  const [localAllocations, setLocalAllocations] = useState(mockAllocations);
  const [localProjects, setLocalProjects] = useState(mockProjects);
  
  useEffect(() => {
    if (dataSource === 'mock') {
      // Use mock data
      setLocalConsultants(mockConsultants);
      setLocalProjects(mockProjects);
      setLocalAllocations(mockAllocations);
      return;
    }
    
    // Fetch data from API
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [consultantsData, projectsData] = await Promise.all([
          fetchConsultants(),
          fetchProjects()
        ]);
        
        setLocalConsultants(consultantsData);
        
        // Only use projects with staffingStatus property (active projects)
        const allProjects = projectsData.filter(p => 'staffingStatus' in p);
        setLocalProjects(allProjects);
        
        // Keep using mock allocations for now as API doesn't provide them
        
        toast({
          title: "Data loaded successfully",
          description: `Loaded ${consultantsData.length} consultants from API.`,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error loading data",
          description: "Could not connect to the API. Using mock data instead.",
          variant: "destructive"
        });
        // Fall back to mock data
        setLocalConsultants(mockConsultants);
        setLocalProjects(mockProjects);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dataSource, toast, setIsLoading]);
  
  // Helper function to get consultant by ID from the current data source
  const getCurrentConsultant = (id: string): Consultant | undefined => {
    return localConsultants.find(c => c.id === id);
  };
  
  // Helper function to get allocations for a consultant (still using mock data)
  const getCurrentAllocationsForConsultant = (id: string) => {
    return localAllocations.filter(a => a.consultantId === id);
  };
  
  const consultant = id ? getCurrentConsultant(id) : undefined;
  
  const consultantAllocations = id 
    ? getCurrentAllocationsForConsultant(id) 
    : [];
  
  const handleMoveConsultant = () => {
    setShowMoveModal(true);
  };
  
  const handleSaveConsultant = (consultantData: Omit<Consultant, 'id'>) => {
    const newConsultant: Consultant = {
      id: `C${String(localConsultants.length + 1).padStart(3, '0')}`,
      ...consultantData
    };
    
    setLocalConsultants([...localConsultants, newConsultant]);
    
    toast({
      title: "Consultant Added",
      description: `${newConsultant.name} has been successfully added to the system.`,
    });
  };
  
  const handleConfirmMove = (data: {
    consultantId: string;
    projectId: string;
    startDate: string;
    endDate: string;
    percentage: number;
  }) => {
    const newAllocation = {
      id: `A${String(localAllocations.length + 1).padStart(3, '0')}`,
      ...data
    };
    
    setLocalAllocations([...localAllocations, newAllocation]);
    
    const updatedConsultants = localConsultants.map(c => 
      c.id === data.consultantId ? {
        ...c,
        status: 'Allocated' as const,
        currentProject: data.projectId
      } : c
    );
    setLocalConsultants(updatedConsultants);
    
    const updatedProjects = localProjects.map(p => 
      p.id === data.projectId ? {
        ...p,
        resourcesAssigned: p.resourcesAssigned + 1,
        staffingStatus: p.resourcesAssigned + 1 >= p.resourcesNeeded 
          ? 'Fully Staffed' as const 
          : 'Needs Resources' as const
      } : p
    );
    setLocalProjects(updatedProjects);
    
    toast({
      title: "Consultant Allocated",
      description: "The consultant has been successfully allocated to the project.",
    });
  };
  
  const handleDeleteConsultant = (id: string) => {
    const updatedConsultants = localConsultants.filter(c => c.id !== id);
    setLocalConsultants(updatedConsultants);
    
    // Also remove any allocations for this consultant
    const updatedAllocations = localAllocations.filter(a => a.consultantId !== id);
    setLocalAllocations(updatedAllocations);
    
    toast({
      title: "Consultant Deleted",
      description: "The consultant has been successfully deleted.",
    });
  };
  
  const handleDeleteAllocation = (allocationId: string) => {
    const allocation = localAllocations.find(a => a.id === allocationId);
    if (!allocation) return;
    
    // Remove the allocation
    const updatedAllocations = localAllocations.filter(a => a.id !== allocationId);
    setLocalAllocations(updatedAllocations);
    
    // Update consultant status if they have no more allocations
    const remainingAllocations = updatedAllocations.filter(a => a.consultantId === allocation.consultantId);
    if (remainingAllocations.length === 0) {
      const updatedConsultants = localConsultants.map(c => 
        c.id === allocation.consultantId ? {
          ...c,
          status: 'Benched' as const,
          currentProject: undefined
        } : c
      );
      setLocalConsultants(updatedConsultants);
    }
    
    // Update project resources
    const updatedProjects = localProjects.map(p => 
      p.id === allocation.projectId ? {
        ...p,
        resourcesAssigned: Math.max(0, p.resourcesAssigned - 1),
        staffingStatus: p.resourcesAssigned - 1 < p.resourcesNeeded 
          ? 'Needs Resources' as const 
          : 'Fully Staffed' as const
      } : p
    );
    setLocalProjects(updatedProjects);
    
    toast({
      title: "Allocation Removed",
      description: "The allocation has been successfully removed.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {id && consultant ? (
          <ConsultantDetail 
            consultant={consultant} 
            allocations={consultantAllocations}
            projects={localProjects}
            onMoveConsultant={handleMoveConsultant}
            onDeleteAllocation={handleDeleteAllocation}
          />
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consultants</h1>
                <p className="text-gray-500">Manage your consulting resources</p>
              </div>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Consultant
              </Button>
            </div>
            <ConsultantList 
              consultants={localConsultants} 
              onDeleteConsultant={handleDeleteConsultant}
            />
          </>
        )}
      </main>
      
      {consultant && (
        <MoveConsultantModal
          isOpen={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          onConfirm={handleConfirmMove}
          consultants={[consultant]}
          project={null}
          type="fromProject"
          preselectedConsultant={consultant}
        />
      )}
      
      <AddConsultantDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSaveConsultant={handleSaveConsultant}
      />
    </div>
  );
};

export default Consultants;
