
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, DollarSign, Building, Clock, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Accepted';

interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  appliedDate: string;
  notes: string;
  location?: string;
  salary?: string;
  type?: string;
  jobUrl?: string;
  contactPerson?: string;
  followUpDate?: string;
}

interface JobApplicationModalProps {
  job: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedJob: JobApplication) => void;
  onDelete: (jobId: string) => void;
  mode: 'view' | 'edit';
}

export const JobApplicationModal = ({ job, isOpen, onClose, onUpdate, onDelete, mode }: JobApplicationModalProps) => {
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [editedJob, setEditedJob] = useState<JobApplication | null>(job);
  const { toast } = useToast();

  const statusColors = {
    'Applied': 'bg-blue-100 text-blue-800 border-blue-200',
    'Interview': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Offer': 'bg-green-100 text-green-800 border-green-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
    'Accepted': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  if (!job || !editedJob) return null;

  const handleSave = () => {
    if (!editedJob.company || !editedJob.role) {
      toast({
        title: "Error",
        description: "Company and role are required fields.",
        variant: "destructive"
      });
      return;
    }

    onUpdate(editedJob);
    setIsEditing(false);
    toast({
      title: "Success!",
      description: "Job application updated successfully."
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      onDelete(job.id);
      onClose();
      toast({
        title: "Deleted",
        description: "Job application deleted successfully."
      });
    }
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {isEditing ? 'Edit Application' : editedJob.role}
              </DialogTitle>
              <DialogDescription className="flex items-center mt-1">
                <Building className="h-4 w-4 mr-1" />
                {editedJob.company}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {!isEditing ? (
            /* View Mode */
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className={`${statusColors[editedJob.status]} border`}>
                  {editedJob.status}
                </Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Applied {getDaysAgo(editedJob.appliedDate)} days ago
                </div>
              </div>

              {editedJob.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {editedJob.location}
                </div>
              )}

              {editedJob.salary && (
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {editedJob.salary}
                </div>
              )}

              {editedJob.contactPerson && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Contact:</span>
                  {editedJob.contactPerson}
                </div>
              )}

              {editedJob.jobUrl && (
                <div className="flex items-center text-sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <a href={editedJob.jobUrl} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">
                    View Job Posting
                  </a>
                </div>
              )}

              {editedJob.followUpDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Follow up on: {new Date(editedJob.followUpDate).toLocaleDateString()}
                </div>
              )}

              {editedJob.notes && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Notes:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{editedJob.notes}</p>
                </div>
              )}
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={editedJob.company}
                    onChange={(e) => setEditedJob({...editedJob, company: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={editedJob.role}
                    onChange={(e) => setEditedJob({...editedJob, role: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editedJob.status} onValueChange={(value: JobStatus) => setEditedJob({...editedJob, status: value})}>
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
                    value={editedJob.appliedDate}
                    onChange={(e) => setEditedJob({...editedJob, appliedDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editedJob.location || ''}
                    onChange={(e) => setEditedJob({...editedJob, location: e.target.value})}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input
                    id="salary"
                    value={editedJob.salary || ''}
                    onChange={(e) => setEditedJob({...editedJob, salary: e.target.value})}
                    placeholder="$120,000 - $180,000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={editedJob.contactPerson || ''}
                    onChange={(e) => setEditedJob({...editedJob, contactPerson: e.target.value})}
                    placeholder="John Doe - HR Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="followUpDate">Follow-up Date</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={editedJob.followUpDate || ''}
                    onChange={(e) => setEditedJob({...editedJob, followUpDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="jobUrl">Job Posting URL</Label>
                <Input
                  id="jobUrl"
                  value={editedJob.jobUrl || ''}
                  onChange={(e) => setEditedJob({...editedJob, jobUrl: e.target.value})}
                  placeholder="https://company.com/careers/job-id"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editedJob.notes}
                  onChange={(e) => setEditedJob({...editedJob, notes: e.target.value})}
                  placeholder="Add any notes about this application..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
