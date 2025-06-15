
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Table, Calendar } from 'lucide-react';
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
  contactPerson?: string;
  followUpDate?: string;
  jobUrl?: string;
}

interface ExportDataProps {
  jobs: JobApplication[];
}

export const ExportData = ({ jobs }: ExportDataProps) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState<'all' | '30days' | '90days' | 'year'>('all');
  const { toast } = useToast();

  const filterJobsByDate = (jobs: JobApplication[], range: string) => {
    if (range === 'all') return jobs;
    
    const today = new Date();
    const cutoffDate = new Date();
    
    switch (range) {
      case '30days':
        cutoffDate.setDate(today.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(today.getDate() - 90);
        break;
      case 'year':
        cutoffDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        return jobs;
    }
    
    return jobs.filter(job => new Date(job.appliedDate) >= cutoffDate);
  };

  const exportToCSV = (data: JobApplication[]) => {
    const headers = [
      'Company',
      'Role',
      'Status',
      'Applied Date',
      'Location',
      'Salary',
      'Type',
      'Contact Person',
      'Follow-up Date',
      'Job URL',
      'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(job => [
        `"${job.company}"`,
        `"${job.role}"`,
        `"${job.status}"`,
        `"${job.appliedDate}"`,
        `"${job.location || ''}"`,
        `"${job.salary || ''}"`,
        `"${job.type || ''}"`,
        `"${job.contactPerson || ''}"`,
        `"${job.followUpDate || ''}"`,
        `"${job.jobUrl || ''}"`,
        `"${job.notes.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `job-applications-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: JobApplication[]) => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalApplications: data.length,
      applications: data
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `job-applications-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = (data: JobApplication[]) => {
    const stats = {
      total: data.length,
      applied: data.filter(j => j.status === 'Applied').length,
      interview: data.filter(j => j.status === 'Interview').length,
      offer: data.filter(j => j.status === 'Offer').length,
      accepted: data.filter(j => j.status === 'Accepted').length,
      rejected: data.filter(j => j.status === 'Rejected').length
    };

    const reportContent = `
JOB APPLICATION TRACKER REPORT
Generated on: ${new Date().toLocaleDateString()}
Date Range: ${dateRange === 'all' ? 'All time' : dateRange}

SUMMARY STATISTICS:
- Total Applications: ${stats.total}
- Applied: ${stats.applied}
- Interview Stage: ${stats.interview}
- Offers Received: ${stats.offer}
- Accepted: ${stats.accepted}
- Rejected: ${stats.rejected}

SUCCESS RATES:
- Interview Rate: ${stats.total > 0 ? ((stats.interview / stats.total) * 100).toFixed(1) : 0}%
- Success Rate: ${stats.total > 0 ? (((stats.offer + stats.accepted) / stats.total) * 100).toFixed(1) : 0}%

DETAILED APPLICATIONS:
${data.map((job, index) => `
${index + 1}. ${job.company} - ${job.role}
   Status: ${job.status}
   Applied: ${new Date(job.appliedDate).toLocaleDateString()}
   Location: ${job.location || 'Not specified'}
   Salary: ${job.salary || 'Not specified'}
   Notes: ${job.notes || 'No notes'}
`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `job-applications-report-${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    const filteredJobs = filterJobsByDate(jobs, dateRange);
    
    if (filteredJobs.length === 0) {
      toast({
        title: "No data to export",
        description: "No applications found for the selected date range.",
        variant: "destructive"
      });
      return;
    }

    try {
      switch (exportFormat) {
        case 'csv':
          exportToCSV(filteredJobs);
          break;
        case 'json':
          exportToJSON(filteredJobs);
          break;
        case 'pdf':
          generateReport(filteredJobs);
          break;
      }

      toast({
        title: "Export successful!",
        description: `Downloaded ${filteredJobs.length} applications as ${exportFormat.toUpperCase()}.`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return <Table className="h-4 w-4" />;
      case 'json': return <FileText className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  const filteredCount = filterJobsByDate(jobs, dateRange).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="h-5 w-5 mr-2" />
          Export Data
        </CardTitle>
        <CardDescription>
          Download your job application data in various formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'json' | 'pdf') => setExportFormat(value)}>
              <SelectTrigger>
                <div className="flex items-center">
                  {getFormatIcon(exportFormat)}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center">
                    <Table className="h-4 w-4 mr-2" />
                    CSV Spreadsheet
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    JSON Data
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Text Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Select value={dateRange} onValueChange={(value: 'all' | '30days' | '90days' | 'year') => setDateRange(value)}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium">Ready to export</p>
            <p className="text-xs text-gray-600">
              {filteredCount} applications will be exported
            </p>
          </div>
          <Button onClick={handleExport} disabled={filteredCount === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>CSV:</strong> Perfect for Excel/Google Sheets analysis</p>
          <p><strong>JSON:</strong> Structured data for technical use</p>
          <p><strong>Report:</strong> Human-readable summary with statistics</p>
        </div>
      </CardContent>
    </Card>
  );
};
