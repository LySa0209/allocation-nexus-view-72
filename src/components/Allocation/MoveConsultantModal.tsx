
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Consultant, Project, PipelineOpportunity } from '@/lib/types';

interface MoveConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    consultantId: string;
    projectId: string;
    startDate: string;
    endDate: string;
    percentage: number;
  }) => void;
  consultants: Consultant[];
  project: Project | null;
  type: 'fromProject' | 'toPipeline';
  pipelineOpportunities?: PipelineOpportunity[];
  preselectedConsultant?: Consultant;
}

const MoveConsultantModal = ({
  isOpen,
  onClose,
  onConfirm,
  consultants,
  project,
  type,
  pipelineOpportunities = [],
  preselectedConsultant
}: MoveConsultantModalProps) => {
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [allocPercentage, setAllocPercentage] = useState<number>(100);
  
  // Filter consultants based on type
  const availableConsultants = type === 'fromProject'
    ? consultants.filter(c => c.status === 'Benched')
    : [preselectedConsultant].filter(Boolean) as Consultant[];
  
  // Set default values
  useEffect(() => {
    if (isOpen) {
      if (preselectedConsultant) {
        setSelectedConsultantId(preselectedConsultant.id);
      } else {
        setSelectedConsultantId(availableConsultants.length > 0 ? availableConsultants[0].id : '');
      }
      
      if (type === 'fromProject' && project) {
        setSelectedProjectId(project.id);
        setStartDate(new Date(project.startDate));
        setEndDate(new Date(project.endDate));
      } else if (type === 'toPipeline' && pipelineOpportunities && pipelineOpportunities.length > 0) {
        setSelectedProjectId(pipelineOpportunities[0].id);
        setStartDate(new Date(pipelineOpportunities[0].startDate));
        setEndDate(new Date(pipelineOpportunities[0].endDate));
      }
      
      setAllocPercentage(100);
    }
  }, [isOpen, project, preselectedConsultant, availableConsultants, pipelineOpportunities, type]);
  
  // Handle project selection change
  const handleProjectChange = (value: string) => {
    setSelectedProjectId(value);
    
    if (type === 'toPipeline') {
      const selectedOpportunity = pipelineOpportunities.find(p => p.id === value);
      if (selectedOpportunity) {
        setStartDate(new Date(selectedOpportunity.startDate));
        setEndDate(new Date(selectedOpportunity.endDate));
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!selectedConsultantId || !selectedProjectId || !startDate || !endDate) {
      return;
    }
    
    onConfirm({
      consultantId: selectedConsultantId,
      projectId: selectedProjectId,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      percentage: allocPercentage / 100,
    });
  };
  
  const title = type === 'fromProject' 
    ? 'Add Consultant to Project' 
    : 'Allocate Consultant to Pipeline Project';
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="consultant" className="text-right">
              Consultant
            </Label>
            <Select 
              value={selectedConsultantId} 
              onValueChange={setSelectedConsultantId}
              disabled={type === 'toPipeline' && !!preselectedConsultant}
            >
              <SelectTrigger id="consultant" className="col-span-3">
                <SelectValue placeholder="Select a consultant" />
              </SelectTrigger>
              <SelectContent>
                {availableConsultants.map((consultant) => (
                  <SelectItem key={consultant.id} value={consultant.id}>
                    {consultant.name} ({consultant.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              {type === 'fromProject' ? 'Project' : 'Pipeline Project'}
            </Label>
            <Select 
              value={selectedProjectId} 
              onValueChange={handleProjectChange}
              disabled={type === 'fromProject' && !!project}
            >
              <SelectTrigger id="project" className="col-span-3">
                <SelectValue placeholder={`Select a ${type === 'fromProject' ? 'project' : 'pipeline project'}`} />
              </SelectTrigger>
              <SelectContent>
                {type === 'fromProject' ? (
                  project && (
                    <SelectItem value={project.id}>
                      {project.name}
                    </SelectItem>
                  )
                ) : (
                  pipelineOpportunities.map((opportunity) => (
                    <SelectItem key={opportunity.id} value={opportunity.id}>
                      {opportunity.name} ({opportunity.status})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant="outline"
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => startDate ? date < startDate : false}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="percentage" className="text-right">
              Allocation %
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Slider
                id="percentage"
                value={[allocPercentage]}
                onValueChange={(values) => setAllocPercentage(values[0])}
                min={10}
                max={100}
                step={10}
                className="flex-1"
              />
              <span className="w-12 text-center">{allocPercentage}%</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedConsultantId || !selectedProjectId || !startDate || !endDate}>
            Confirm Allocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveConsultantModal;
