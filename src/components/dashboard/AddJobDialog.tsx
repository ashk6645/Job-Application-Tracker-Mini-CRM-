
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Accepted';

interface AddJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (jobData: any) => Promise<void>;
}

export const AddJobDialog = ({ isOpen, onClose, onAdd }: AddJobDialogProps) => {
  const { toast } = useToast();
  
  const [newJob, setNewJob] = useState({
    company: '',
    role: '',
    status: 'Applied' as JobStatus,
    applied_date: new Date().toISOString().split('T')[0],
    notes: '',
    location: '',
    salary: '',
    type: 'Full-time',
    contact_person: '',
    follow_up_date: '',
    job_url: ''
  });

  const handleAddJob = async () => {
    if (!newJob.company || !newJob.role) {
      toast({
        title: "Error",
        description: "Company and role are required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onAdd(newJob);
      setNewJob({
        company: '',
        role: '',
        status: 'Applied',
        applied_date: new Date().toISOString().split('T')[0],
        notes: '',
        location: '',
        salary: '',
        type: 'Full-time',
        contact_person: '',
        follow_up_date: '',
        job_url: ''
      });
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Job Application</DialogTitle>
          <DialogDescription>
            Fill in the details for your new job application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={newJob.company}
                onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                placeholder="Google"
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={newJob.role}
                onChange={(e) => setNewJob({...newJob, role: e.target.value})}
                placeholder="Software Engineer"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newJob.status} onValueChange={(value: JobStatus) => setNewJob({...newJob, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="appliedDate">Applied Date</Label>
              <Input
                id="appliedDate"
                type="date"
                value={newJob.applied_date}
                onChange={(e) => setNewJob({...newJob, applied_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newJob.location}
                onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                value={newJob.salary}
                onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                placeholder="$120,000 - $180,000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={newJob.notes}
              onChange={(e) => setNewJob({...newJob, notes: e.target.value})}
              placeholder="Add any notes about this application..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddJob} className="flex-1">
              Add Application
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
