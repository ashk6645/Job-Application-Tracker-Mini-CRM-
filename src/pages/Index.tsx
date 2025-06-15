
import { useState, useMemo } from 'react';
import { Plus, Filter, Search, Calendar, Building, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
}

// Mock data for demonstration
const mockJobs: JobApplication[] = [
  {
    id: '1',
    company: 'Google',
    role: 'Frontend Developer',
    status: 'Interview',
    appliedDate: '2024-06-10',
    notes: 'Applied through careers page. Technical interview scheduled for next week.',
    location: 'Mountain View, CA',
    salary: '$120,000 - $180,000',
    type: 'Full-time'
  },
  {
    id: '2',
    company: 'Microsoft',
    role: 'Software Engineer',
    status: 'Applied',
    appliedDate: '2024-06-08',
    notes: 'LinkedIn application. Waiting for response.',
    location: 'Seattle, WA',
    salary: '$110,000 - $160,000',
    type: 'Full-time'
  },
  {
    id: '3',
    company: 'Meta',
    role: 'React Developer',
    status: 'Offer',
    appliedDate: '2024-06-05',
    notes: 'Great interview process. Offer received!',
    location: 'Menlo Park, CA',
    salary: '$130,000 - $190,000',
    type: 'Full-time'
  },
  {
    id: '4',
    company: 'Amazon',
    role: 'Full Stack Developer',
    status: 'Rejected',
    appliedDate: '2024-06-01',
    notes: 'Technical interview did not go well.',
    location: 'Austin, TX',
    salary: '$100,000 - $150,000',
    type: 'Full-time'
  }
];

const Index = () => {
  const [jobs, setJobs] = useState<JobApplication[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // New job form state
  const [newJob, setNewJob] = useState({
    company: '',
    role: '',
    status: 'Applied' as JobStatus,
    appliedDate: new Date().toISOString().split('T')[0],
    notes: '',
    location: '',
    salary: '',
    type: 'Full-time'
  });

  const statusColors = {
    'Applied': 'bg-blue-100 text-blue-800 border-blue-200',
    'Interview': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Offer': 'bg-green-100 text-green-800 border-green-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
    'Accepted': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = 
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        case 'date-asc':
          return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
        case 'company':
          return a.company.localeCompare(b.company);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [jobs, searchQuery, statusFilter, sortBy]);

  const handleAddJob = () => {
    if (!newJob.company || !newJob.role) {
      toast({
        title: "Error",
        description: "Company and role are required fields.",
        variant: "destructive"
      });
      return;
    }

    const jobToAdd: JobApplication = {
      ...newJob,
      id: Date.now().toString()
    };

    setJobs([jobToAdd, ...jobs]);
    setNewJob({
      company: '',
      role: '',
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      notes: '',
      location: '',
      salary: '',
      type: 'Full-time'
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success!",
      description: "Job application added successfully."
    });
  };

  const getStatusStats = () => {
    return {
      total: jobs.length,
      applied: jobs.filter(j => j.status === 'Applied').length,
      interview: jobs.filter(j => j.status === 'Interview').length,
      offer: jobs.filter(j => j.status === 'Offer').length,
      accepted: jobs.filter(j => j.status === 'Accepted').length,
      rejected: jobs.filter(j => j.status === 'Rejected').length
    };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Application Tracker</h1>
          <p className="text-gray-600">Manage and track your job applications in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-500">{stats.applied}</div>
              <div className="text-sm text-gray-600">Applied</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-500">{stats.interview}</div>
              <div className="text-sm text-gray-600">Interviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">{stats.offer}</div>
              <div className="text-sm text-gray-600">Offers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-500">{stats.accepted}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search companies or roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Offer">Offer</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="company">Company A-Z</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Button>
            </DialogTrigger>
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
                      value={newJob.appliedDate}
                      onChange={(e) => setNewJob({...newJob, appliedDate: e.target.value})}
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
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Job Applications Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {job.role}
                    </CardTitle>
                    <CardDescription className="flex items-center text-gray-600 mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company}
                    </CardDescription>
                  </div>
                  <Badge className={`${statusColors[job.status]} border`}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Applied: {new Date(job.appliedDate).toLocaleDateString()}
                </div>
                
                {job.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {job.location}
                  </div>
                )}
                
                {job.salary && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {job.salary}
                  </div>
                )}
                
                {job.notes && (
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {job.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first job application!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
