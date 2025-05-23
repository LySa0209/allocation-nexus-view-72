
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project, PipelineOpportunity } from '@/lib/types';

interface AddProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProject: (project: Omit<Project, 'id'>) => void;
  onSaveOpportunity: (opportunity: Omit<PipelineOpportunity, 'id'>) => void;
  type: 'active' | 'pipeline';
}

const AddProjectDialog: React.FC<AddProjectDialogProps> = ({
  isOpen,
  onClose,
  onSaveProject,
  onSaveOpportunity,
  type
}) => {
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    description: '',
    startDate: '',
    endDate: '',
    sector: '',
    status: type === 'active' ? 'Active' : 'Proposal',
    resourcesNeeded: 1,
    resourcesAssigned: 0,
    staffingStatus: 'Needs Resources' as const,
    winPercentage: 50
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'active') {
      const project: Omit<Project, 'id'> = {
        name: formData.name,
        clientName: formData.clientName,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        sector: formData.sector,
        status: formData.status as Project['status'],
        resourcesNeeded: formData.resourcesNeeded,
        resourcesAssigned: formData.resourcesAssigned,
        staffingStatus: formData.staffingStatus
      };
      onSaveProject(project);
    } else {
      const opportunity: Omit<PipelineOpportunity, 'id'> = {
        name: formData.name,
        clientName: formData.clientName,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        sector: formData.sector,
        status: formData.status as PipelineOpportunity['status'],
        resourcesNeeded: formData.resourcesNeeded,
        winPercentage: formData.winPercentage
      };
      onSaveOpportunity(opportunity);
    }
    
    // Reset form
    setFormData({
      name: '',
      clientName: '',
      description: '',
      startDate: '',
      endDate: '',
      sector: '',
      status: type === 'active' ? 'Active' : 'Proposal',
      resourcesNeeded: 1,
      resourcesAssigned: 0,
      staffingStatus: 'Needs Resources' as const,
      winPercentage: 50
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add New {type === 'active' ? 'Project' : 'Pipeline Opportunity'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sector">Sector</Label>
            <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Strategy">Strategy</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {type === 'active' ? (
                  <>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="resourcesNeeded">Resources Needed</Label>
            <Input
              id="resourcesNeeded"
              type="number"
              min="1"
              value={formData.resourcesNeeded}
              onChange={(e) => handleInputChange('resourcesNeeded', parseInt(e.target.value))}
              required
            />
          </div>

          {type === 'pipeline' && (
            <div>
              <Label htmlFor="winPercentage">Win Percentage</Label>
              <Input
                id="winPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.winPercentage}
                onChange={(e) => handleInputChange('winPercentage', parseInt(e.target.value))}
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create {type === 'active' ? 'Project' : 'Opportunity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;
