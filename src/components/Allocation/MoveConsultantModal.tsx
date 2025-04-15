
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project, Consultant } from '@/lib/types';

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
  consultant?: Consultant;
  projects?: Project[];
  project?: Project;
  consultants?: Consultant[];
  type: 'fromConsultant' | 'fromProject';
}

const MoveConsultantModal: React.FC<MoveConsultantModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  consultant,
  projects,
  project,
  consultants,
  type
}) => {
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>(consultant ? consultant.id : '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(project ? project.id : '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    project ? new Date(project.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    project ? new Date(project.endDate) : undefined
  );
  const [percentage, setPercentage] = useState<number>(100);

  const handleConfirm = () => {
    if (!selectedConsultantId || !selectedProjectId || !startDate || !endDate) {
      return;
    }

    onConfirm({
      consultantId: selectedConsultantId,
      projectId: selectedProjectId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      percentage: percentage / 100
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'fromConsultant' 
              ? 'Assign Consultant to Project' 
              : 'Add Consultant to Project'}
          </DialogTitle>
          <DialogDescription>
            {type === 'fromConsultant' 
              ? 'Select a project and allocation period for this consultant.' 
              : 'Select a consultant and allocation period for this project.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Consultant selection (only shown when coming from project view) */}
          {type === 'fromProject' && consultants && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="consultant" className="text-sm font-medium col-span-4">
                Consultant
              </label>
              <select
                id="consultant"
                className="col-span-4 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedConsultantId}
                onChange={(e) => setSelectedConsultantId(e.target.value)}
                required
              >
                <option value="">Select a consultant</option>
                {consultants
                  .filter(c => c.status === 'Benched')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.role}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Project selection (only shown when coming from consultant view) */}
          {type === 'fromConsultant' && projects && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="project" className="text-sm font-medium col-span-4">
                Project
              </label>
              <select
                id="project"
                className="col-span-4 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  const selectedProject = projects.find(p => p.id === e.target.value);
                  if (selectedProject) {
                    setStartDate(new Date(selectedProject.startDate));
                    setEndDate(new Date(selectedProject.endDate));
                  }
                }}
                required
              >
                <option value="">Select a project</option>
                {projects
                  .filter(p => p.status === 'Active' && p.staffingStatus === 'Needs Resources')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Allocation period */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="startDate" className="text-sm font-medium col-span-4">
              Start Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant={"outline"}
                  className={cn(
                    "col-span-4 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="endDate" className="text-sm font-medium col-span-4">
              End Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant={"outline"}
                  className={cn(
                    "col-span-4 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  disabled={(date) => date < (startDate || new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Allocation percentage */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="percentage" className="text-sm font-medium col-span-4">
              Allocation Percentage
            </label>
            <input
              id="percentage"
              type="number"
              min="1"
              max="100"
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value) || 100)}
            />
            <span className="text-sm">%</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedConsultantId || !selectedProjectId || !startDate || !endDate}
          >
            Confirm Allocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveConsultantModal;
