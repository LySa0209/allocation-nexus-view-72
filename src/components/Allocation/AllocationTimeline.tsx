
import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { addDays, addMonths, format, isBefore, isAfter, isWithinInterval, eachWeekOfInterval } from 'date-fns';
import { Allocation, Consultant, Project, PipelineOpportunity } from '@/lib/types';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AllocationTimelineProps {
  consultants: Consultant[];
  allocations: Allocation[];
  projects: Project[];
  pipelineOpportunities: PipelineOpportunity[];
  onSelectAllocation?: (allocation: Allocation) => void;
  onSelectConsultant?: (consultant: Consultant) => void;
  onSelectTimeSlot?: (consultant: Consultant, startDate: Date, endDate: Date) => void;
}

const AllocationTimeline: React.FC<AllocationTimelineProps> = ({
  consultants,
  allocations,
  projects,
  pipelineOpportunities,
  onSelectAllocation,
  onSelectConsultant,
  onSelectTimeSlot,
}) => {
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addMonths(today, 6));
  const [zoomLevel, setZoomLevel] = useState<'weeks' | 'months'>('weeks');
  
  // Generate time units based on zoom level
  const timeUnits = React.useMemo(() => {
    if (zoomLevel === 'weeks') {
      return eachWeekOfInterval({ start: startDate, end: endDate });
    } else {
      // Generate months
      const months = [];
      let current = new Date(startDate);
      while (isBefore(current, endDate) || format(current, 'MM yyyy') === format(endDate, 'MM yyyy')) {
        months.push(new Date(current));
        current = addMonths(current, 1);
      }
      return months;
    }
  }, [startDate, endDate, zoomLevel]);
  
  // Handle timeline navigation
  const handlePrevPeriod = () => {
    if (zoomLevel === 'weeks') {
      setStartDate(addDays(startDate, -28));
      setEndDate(addDays(endDate, -28));
    } else {
      setStartDate(addMonths(startDate, -2));
      setEndDate(addMonths(endDate, -2));
    }
  };
  
  const handleNextPeriod = () => {
    if (zoomLevel === 'weeks') {
      setStartDate(addDays(startDate, 28));
      setEndDate(addDays(endDate, 28));
    } else {
      setStartDate(addMonths(startDate, 2));
      setEndDate(addMonths(endDate, 2));
    }
  };
  
  const handleZoomIn = () => {
    setZoomLevel('weeks');
  };
  
  const handleZoomOut = () => {
    setZoomLevel('months');
  };
  
  // Get all allocations for a consultant
  const getConsultantAllocations = (consultantId: string) => {
    return allocations.filter(a => a.consultantId === consultantId);
  };
  
  // Get project details by ID (from both projects and pipeline)
  const getProjectById = (projectId: string) => {
    return projects.find(p => p.id === projectId) || 
           pipelineOpportunities.find(p => p.id === projectId);
  };
  
  // Calculate position and width of allocation block
  const calculateBlockStyle = (allocation: Allocation) => {
    const allocationStart = new Date(allocation.startDate);
    const allocationEnd = new Date(allocation.endDate);
    
    // Check if allocation is visible in current timeline view
    if (isAfter(allocationStart, endDate) || isBefore(allocationEnd, startDate)) {
      return { display: 'none' };
    }
    
    // Calculate start position percentage
    const timelineSpan = timeUnits.length - 1;
    let startPosition = 0;
    
    if (isBefore(allocationStart, startDate)) {
      startPosition = 0;
    } else {
      // Find which time unit contains the start date
      for (let i = 0; i < timeUnits.length; i++) {
        const currentUnit = timeUnits[i];
        const nextUnit = i < timeUnits.length - 1 ? timeUnits[i + 1] : addDays(timeUnits[i], zoomLevel === 'weeks' ? 7 : 30);
        
        if (isWithinInterval(allocationStart, { start: currentUnit, end: nextUnit })) {
          const unitSpan = (nextUnit.getTime() - currentUnit.getTime());
          const dateOffset = (allocationStart.getTime() - currentUnit.getTime());
          const unitPercentage = dateOffset / unitSpan;
          startPosition = (i + unitPercentage) / timelineSpan * 100;
          break;
        }
      }
    }
    
    // Calculate width percentage
    let endPosition = 100;
    if (isBefore(allocationEnd, endDate)) {
      for (let i = 0; i < timeUnits.length; i++) {
        const currentUnit = timeUnits[i];
        const nextUnit = i < timeUnits.length - 1 ? timeUnits[i + 1] : addDays(timeUnits[i], zoomLevel === 'weeks' ? 7 : 30);
        
        if (isWithinInterval(allocationEnd, { start: currentUnit, end: nextUnit })) {
          const unitSpan = (nextUnit.getTime() - currentUnit.getTime());
          const dateOffset = (allocationEnd.getTime() - currentUnit.getTime());
          const unitPercentage = dateOffset / unitSpan;
          endPosition = (i + unitPercentage) / timelineSpan * 100;
          break;
        }
      }
    }
    
    const width = endPosition - startPosition;
    
    // Determine block color based on project type
    const project = getProjectById(allocation.projectId);
    let backgroundColor = '#9b87f5'; // Default color
    
    if (project) {
      if ('status' in project && project.status === 'Active') {
        backgroundColor = '#4ade80'; // Green for active projects
      } else if ('winPercentage' in project) {
        // Pipeline opportunity
        const winPercentage = project.winPercentage;
        if (winPercentage >= 70) {
          backgroundColor = '#f97316'; // Orange for high probability pipeline
        } else {
          backgroundColor = '#60a5fa'; // Blue for lower probability pipeline
        }
      }
    }
    
    return {
      left: `${startPosition}%`,
      width: `${width}%`,
      backgroundColor,
      position: 'absolute' as const,
      height: '80%',
      top: '10%',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '0.75rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
      cursor: 'pointer',
    };
  };
  
  // Handle empty time slot click
  const handleTimeSlotClick = (consultant: Consultant, unitIndex: number) => {
    if (onSelectTimeSlot) {
      const slotStart = timeUnits[unitIndex];
      const slotEnd = unitIndex < timeUnits.length - 1 
        ? timeUnits[unitIndex + 1] 
        : addDays(timeUnits[unitIndex], zoomLevel === 'weeks' ? 7 : 30);
      
      onSelectTimeSlot(consultant, slotStart, slotEnd);
    }
  };
  
  // Calculate today marker position
  const todayPosition = React.useMemo(() => {
    if (isBefore(today, startDate) || isAfter(today, endDate)) {
      return null;
    }
    
    const timelineSpan = timeUnits.length - 1;
    for (let i = 0; i < timeUnits.length; i++) {
      const currentUnit = timeUnits[i];
      const nextUnit = i < timeUnits.length - 1 ? timeUnits[i + 1] : addDays(timeUnits[i], zoomLevel === 'weeks' ? 7 : 30);
      
      if (isWithinInterval(today, { start: currentUnit, end: nextUnit })) {
        const unitSpan = (nextUnit.getTime() - currentUnit.getTime());
        const dateOffset = (today.getTime() - currentUnit.getTime());
        const unitPercentage = dateOffset / unitSpan;
        return (i + unitPercentage) / timelineSpan * 100;
      }
    }
    
    return null;
  }, [timeUnits, startDate, endDate, today]);
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Allocation Timeline</h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevPeriod}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextPeriod}
              className="flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomIn}
              disabled={zoomLevel === 'weeks'}
              className="flex items-center space-x-1"
            >
              <ZoomIn className="h-4 w-4" />
              <span>Weeks</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomOut}
              disabled={zoomLevel === 'months'}
              className="flex items-center space-x-1"
            >
              <ZoomOut className="h-4 w-4" />
              <span>Months</span>
            </Button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
        </div>
      </div>
      
      <div className="relative">
        <ScrollArea className="h-[500px]">
          <div className="min-w-[800px]">
            {/* Timeline header */}
            <div className="flex border-b border-gray-200">
              <div className="w-[200px] flex-shrink-0 bg-gray-50 p-3 border-r border-gray-200">
                <div className="font-medium">Consultant</div>
              </div>
              <div className="flex-grow relative">
                <div className="flex">
                  {timeUnits.map((unit, index) => (
                    <div 
                      key={index} 
                      className="flex-1 p-2 text-center text-xs border-r border-gray-200 last:border-r-0"
                    >
                      {zoomLevel === 'weeks' 
                        ? `${format(unit, 'MMM d')}`
                        : `${format(unit, 'MMM yyyy')}`
                      }
                    </div>
                  ))}
                </div>
                
                {/* Today marker */}
                {todayPosition !== null && (
                  <div 
                    className="absolute top-0 bottom-0 w-[2px] bg-red-500"
                    style={{ left: `${todayPosition}%` }}
                  />
                )}
              </div>
            </div>
            
            {/* Timeline rows */}
            {consultants.map(consultant => {
              const consultantAllocations = getConsultantAllocations(consultant.id);
              
              return (
                <div key={consultant.id} className="flex border-b border-gray-200 hover:bg-gray-50">
                  {/* Consultant info */}
                  <div 
                    className="w-[200px] flex-shrink-0 p-3 border-r border-gray-200 cursor-pointer"
                    onClick={() => onSelectConsultant && onSelectConsultant(consultant)}
                  >
                    <div className="font-medium">{consultant.name}</div>
                    <div className="text-xs text-gray-500">{consultant.role}</div>
                  </div>
                  
                  {/* Timeline cells */}
                  <div className="flex-grow relative h-12">
                    {/* Time unit cells for click targets */}
                    <div className="flex absolute inset-0">
                      {timeUnits.map((_, index) => (
                        <div 
                          key={index}
                          className="flex-1 border-r border-gray-200 last:border-r-0 h-full cursor-pointer"
                          onClick={() => handleTimeSlotClick(consultant, index)}
                        />
                      ))}
                    </div>
                    
                    {/* Allocation blocks */}
                    {consultantAllocations.map(allocation => {
                      const project = getProjectById(allocation.projectId);
                      if (!project) return null;
                      
                      return (
                        <div 
                          key={allocation.id}
                          style={calculateBlockStyle(allocation)}
                          onClick={() => onSelectAllocation && onSelectAllocation(allocation)}
                          title={`Project: ${project.name || 'Unknown'}\nDates: ${format(new Date(allocation.startDate), 'MMM d, yyyy')} - ${format(new Date(allocation.endDate), 'MMM d, yyyy')}`}
                        >
                          {project.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AllocationTimeline;
