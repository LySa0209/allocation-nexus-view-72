
import { Consultant, Project, PipelineOpportunity, Allocation, DashboardMetrics } from "../lib/types";

// Mock Consultants Data
export const consultants: Consultant[] = [
  {
    id: "C001",
    name: "John Smith",
    role: "Senior Consultant",
    serviceLine: "Strategy",
    expertise: "Digital Transformation",
    status: "Allocated",
    currentProject: "P001",
    rate: 1200,
    preferredSector: "Financial Services",
    location: "New York",
    startDate: "2022-01-15",
  },
  {
    id: "C002",
    name: "Sarah Johnson",
    role: "Consultant",
    serviceLine: "Technology",
    expertise: "Data Science",
    status: "Allocated",
    currentProject: "P002",
    rate: 900,
    preferredSector: "Healthcare",
    location: "Boston",
    startDate: "2022-03-10",
  },
  {
    id: "C003",
    name: "Michael Chen",
    role: "Senior Manager",
    serviceLine: "Operations",
    expertise: "Supply Chain",
    status: "Benched",
    rate: 1500,
    preferredSector: "Manufacturing",
    location: "Chicago",
    startDate: "2021-08-20",
  },
  {
    id: "C004",
    name: "Emily Davis",
    role: "Associate",
    serviceLine: "Strategy",
    expertise: "Market Analysis",
    status: "Allocated",
    currentProject: "P003",
    rate: 800,
    preferredSector: "Retail",
    location: "Seattle",
    startDate: "2022-05-15",
  },
  {
    id: "C005",
    name: "David Wilson",
    role: "Manager",
    serviceLine: "Technology",
    expertise: "Cloud Architecture",
    status: "Benched",
    rate: 1300,
    preferredSector: "Technology",
    location: "San Francisco",
    startDate: "2021-11-05",
  },
  {
    id: "C006",
    name: "Jennifer Lee",
    role: "Senior Consultant",
    serviceLine: "Human Capital",
    expertise: "Change Management",
    status: "Allocated",
    currentProject: "P004",
    rate: 1100,
    preferredSector: "Public Sector",
    location: "Washington DC",
    startDate: "2022-02-10",
  }
];

// Mock Projects Data
export const projects: Project[] = [
  {
    id: "P001",
    name: "Financial Services Digital Transformation",
    clientName: "Global Bank Inc.",
    status: "Active",
    startDate: "2023-01-10",
    endDate: "2023-06-30",
    resourcesNeeded: 5,
    resourcesAssigned: 3,
    staffingStatus: "Needs Resources",
    sector: "Financial Services",
    deliverables: "Digital Strategy, Process Optimization, Technology Implementation",
    budget: 1200000,
  },
  {
    id: "P002",
    name: "Healthcare Data Analytics Platform",
    clientName: "MediHealth Systems",
    status: "Active",
    startDate: "2023-02-15",
    endDate: "2023-08-15",
    resourcesNeeded: 4,
    resourcesAssigned: 4,
    staffingStatus: "Fully Staffed",
    sector: "Healthcare",
    deliverables: "Data Architecture, Analytics Dashboard, ML Models",
    budget: 950000,
  },
  {
    id: "P003",
    name: "Retail Customer Experience Enhancement",
    clientName: "SuperMart Stores",
    status: "Active",
    startDate: "2023-03-01",
    endDate: "2023-07-31",
    resourcesNeeded: 3,
    resourcesAssigned: 2,
    staffingStatus: "Needs Resources",
    sector: "Retail",
    deliverables: "Customer Journey Mapping, Experience Design, Technology Roadmap",
    budget: 750000,
  },
  {
    id: "P004",
    name: "Government Agency Modernization",
    clientName: "Federal Department",
    status: "Active",
    startDate: "2023-01-05",
    endDate: "2023-12-20",
    resourcesNeeded: 7,
    resourcesAssigned: 4,
    staffingStatus: "Needs Resources",
    sector: "Public Sector",
    deliverables: "IT Modernization Strategy, Process Reengineering, Change Management",
    budget: 2500000,
  },
  {
    id: "P005",
    name: "Manufacturing Supply Chain Optimization",
    clientName: "Industrial Products Co",
    status: "On Hold",
    startDate: "2023-04-01",
    endDate: "2023-09-30",
    resourcesNeeded: 4,
    resourcesAssigned: 0,
    staffingStatus: "Needs Resources",
    sector: "Manufacturing",
    deliverables: "Supply Chain Assessment, Optimization Strategy, Implementation Roadmap",
    budget: 850000,
  }
];

// Mock Pipeline Opportunities Data
export const pipelineOpportunities: PipelineOpportunity[] = [
  {
    id: "PL001",
    name: "Tech Company M&A Advisory",
    clientName: "TechGrowth Inc.",
    status: "Proposal",
    winPercentage: 70,
    startDate: "2023-07-15",
    endDate: "2023-12-31",
    resourcesNeeded: 5,
    sector: "Technology",
    estimatedValue: 1800000,
  },
  {
    id: "PL002",
    name: "Energy Company Sustainability Transformation",
    clientName: "GreenEnergy Corp",
    status: "Discovery",
    winPercentage: 40,
    startDate: "2023-08-01",
    endDate: "2024-02-28",
    resourcesNeeded: 6,
    sector: "Energy",
    estimatedValue: 2200000,
  },
  {
    id: "PL003",
    name: "Insurance Digital Claims Transformation",
    clientName: "SecureInsurance Group",
    status: "Negotiation",
    winPercentage: 85,
    startDate: "2023-06-10",
    endDate: "2023-11-30",
    resourcesNeeded: 4,
    sector: "Financial Services",
    estimatedValue: 1500000,
  }
];

// Mock Allocations Data
export const allocations: Allocation[] = [
  {
    id: "A001",
    consultantId: "C001",
    projectId: "P001",
    startDate: "2023-01-10",
    endDate: "2023-06-30",
    percentage: 1.0, // 100%
  },
  {
    id: "A002",
    consultantId: "C002",
    projectId: "P002",
    startDate: "2023-02-15",
    endDate: "2023-08-15",
    percentage: 1.0,
  },
  {
    id: "A003",
    consultantId: "C004",
    projectId: "P003",
    startDate: "2023-03-01",
    endDate: "2023-07-31",
    percentage: 0.8, // 80%
  },
  {
    id: "A004",
    consultantId: "C006",
    projectId: "P004",
    startDate: "2023-01-05",
    endDate: "2023-12-20",
    percentage: 1.0,
  }
];

// Mock Dashboard Metrics
export const dashboardMetrics: DashboardMetrics = {
  totalConsultants: consultants.length,
  allocatedConsultants: consultants.filter(c => c.status === "Allocated").length,
  benchedConsultants: consultants.filter(c => c.status === "Benched").length,
  chargeability: 0.75, // 75%
  activeProjects: projects.filter(p => p.status === "Active").length,
  pipelineProjects: pipelineOpportunities.length,
  projectsNeedingResources: projects.filter(p => p.staffingStatus === "Needs Resources").length,
};

// Helper function to get project by ID
export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

// Helper function to get consultant by ID
export const getConsultantById = (id: string): Consultant | undefined => {
  return consultants.find(consultant => consultant.id === id);
};

// Helper function to get allocations for a consultant
export const getAllocationsForConsultant = (consultantId: string): Allocation[] => {
  return allocations.filter(allocation => allocation.consultantId === consultantId);
};

// Helper function to get allocations for a project
export const getAllocationsForProject = (projectId: string): Allocation[] => {
  return allocations.filter(allocation => allocation.projectId === projectId);
};

// Helper function to get consultants allocated to a project
export const getConsultantsForProject = (projectId: string): Consultant[] => {
  const projectAllocations = getAllocationsForProject(projectId);
  const consultantIds = projectAllocations.map(allocation => allocation.consultantId);
  return consultants.filter(consultant => consultantIds.includes(consultant.id));
};
