
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Consultant } from '@/lib/types';

interface AddConsultantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveConsultant: (consultant: Omit<Consultant, 'id'>) => void;
}

const AddConsultantDialog: React.FC<AddConsultantDialogProps> = ({
  isOpen,
  onClose,
  onSaveConsultant
}) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    serviceLine: '',
    expertise: '',
    status: 'Benched' as const,
    currentProject: '',
    rate: 0,
    preferredSector: '',
    location: '',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const consultant: Omit<Consultant, 'id'> = {
      name: formData.name,
      role: formData.role,
      serviceLine: formData.serviceLine,
      expertise: formData.expertise,
      status: formData.status,
      currentProject: formData.currentProject || undefined,
      rate: formData.rate || undefined,
      preferredSector: formData.preferredSector || undefined,
      location: formData.location || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined
    };
    
    onSaveConsultant(consultant);
    
    // Reset form
    setFormData({
      name: '',
      role: '',
      serviceLine: '',
      expertise: '',
      status: 'Benched' as const,
      currentProject: '',
      rate: 0,
      preferredSector: '',
      location: '',
      startDate: '',
      endDate: ''
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
          <DialogTitle>Add New Consultant</DialogTitle>
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
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Partner">Partner</SelectItem>
                <SelectItem value="Senior Manager">Senior Manager</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Senior Consultant">Senior Consultant</SelectItem>
                <SelectItem value="Consultant">Consultant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="serviceLine">Service Line</Label>
            <Select value={formData.serviceLine} onValueChange={(value) => handleInputChange('serviceLine', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service line" />
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
            <Label htmlFor="expertise">Expertise</Label>
            <Input
              id="expertise"
              value={formData.expertise}
              onChange={(e) => handleInputChange('expertise', e.target.value)}
              placeholder="e.g., Digital Strategy, Data Analytics"
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Benched">Benched</SelectItem>
                <SelectItem value="Allocated">Allocated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., New York, London"
            />
          </div>

          <div>
            <Label htmlFor="preferredSector">Preferred Sector</Label>
            <Select value={formData.preferredSector} onValueChange={(value) => handleInputChange('preferredSector', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select preferred sector" />
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
              />
            </div>
          </div>

          <div>
            <Label htmlFor="rate">Rate (per day)</Label>
            <Input
              id="rate"
              type="number"
              min="0"
              value={formData.rate}
              onChange={(e) => handleInputChange('rate', parseInt(e.target.value))}
              placeholder="e.g., 1500"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Consultant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddConsultantDialog;
