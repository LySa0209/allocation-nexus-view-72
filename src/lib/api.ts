
import { Consultant, Project, PipelineOpportunity } from '@/lib/types';

const API_URL = 'http://localhost:5000/api';

export async function fetchConsultants(): Promise<Consultant[]> {
  try {
    const response = await fetch(`${API_URL}/consultants`);
    if (!response.ok) {
      throw new Error('Failed to fetch consultants');
    }
    
    const data = await response.json();
    
    // Transform API data to match our application's Consultant type
    return data.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      role: item.role,
      serviceLine: item.service_line,
      expertise: item.expertise,
      status: item.allocations.length > 0 ? "Allocated" : "Benched",
      currentProject: item.allocations[0]?.project_id,
      rate: item.revenue_rate,
      preferredSector: item.preferred_sector,
      location: item.location,
      startDate: new Date().toISOString().split('T')[0], // Placeholder
      endDate: undefined,
    }));
  } catch (error) {
    console.error('Error fetching consultants:', error);
    throw error;
  }
}

export async function fetchProjects(): Promise<(Project | PipelineOpportunity)[]> {
  try {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    
    const data = await response.json();
    
    // Transform API data to match our application's Project/PipelineOpportunity types
    return data.map((item: any) => {
      const projectBase = {
        id: String(item.id),
        name: item.name,
        clientName: "Client", // Not available in API data
        startDate: new Date(item.start_date).toISOString().split('T')[0],
        endDate: new Date(item.end_date).toISOString().split('T')[0],
        resourcesNeeded: item.resources_needed,
      };
      
      if (item.is_pipeline) {
        return {
          ...projectBase,
          status: "Opportunity",
          winPercentage: 50, // Not available in API data
          estimatedValue: item.value,
          sector: "Unknown", // Not available in API data
        } as PipelineOpportunity;
      } else {
        return {
          ...projectBase,
          status: "Active",
          resourcesAssigned: (item.assigned_resources || []).length,
          staffingStatus: 
            (item.assigned_resources || []).length >= item.resources_needed 
              ? "Fully Staffed" 
              : "Needs Resources",
          sector: "Unknown", // Not available in API data
          deliverables: "Project deliverables", // Not available in API data
          budget: item.value,
        } as Project;
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}
