
// Consultant/Employee Types
export interface Consultant {
  id: string;
  name: string;
  role: string;
  serviceLine: string;
  expertise: string;
  status: "Allocated" | "Benched";
  currentProject?: string;
  rate?: number;
  preferredSector?: string;
  location?: string;
  startDate: string;
  endDate?: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  clientName: string;
  status: "Active" | "Completed" | "On Hold";
  startDate: string;
  endDate: string;
  resourcesNeeded: number;
  resourcesAssigned: number;
  staffingStatus: "Fully Staffed" | "Needs Resources";
  sector?: string;
  deliverables?: string;
  budget?: number;
}

// Pipeline Opportunity Types
export interface PipelineOpportunity {
  id: string;
  name: string;
  clientName: string;
  status: string;
  winPercentage: number;
  startDate: string;
  endDate: string;
  resourcesNeeded: number;
  sector?: string;
  estimatedValue?: number;
}

// Allocation Types
export interface Allocation {
  id: string;
  consultantId: string;
  projectId: string;
  startDate: string;
  endDate: string;
  percentage: number; // Allocation percentage (e.g., 50% = 0.5)
}

// Dashboard Metric Types
export interface DashboardMetrics {
  totalConsultants: number;
  allocatedConsultants: number;
  benchedConsultants: number;
  chargeability: number; // Percentage (e.g., 85% = 0.85)
  activeProjects: number;
  pipelineProjects: number;
  projectsNeedingResources: number;
}

// Move Modal Types
export interface MoveModalInitialDates {
  startDate: string;
  endDate: string;
}

