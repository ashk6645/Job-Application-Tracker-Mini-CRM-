
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Table, Calendar, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Accepted';

interface AutoTableOptions {
  head: string[][];
  body: string[][];
  startY: number;
  styles: { fontSize: number };
  headStyles: { fillColor: number[] };
  columnStyles: Record<number, { cellWidth: number }>;
}

interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  applied_date: string;
  notes?: string;
  location?: string;
  salary?: string;
  type?: string;
  contact_person?: string;
  follow_up_date?: string;
  job_url?: string;
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
    
    return jobs.filter(job => new Date(job.applied_date) >= cutoffDate);
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
        `"${job.status}"`,        `"${job.applied_date}"`,
        `"${job.location || ''}"`,
        `"${job.salary || ''}"`,
        `"${job.type || ''}"`,
        `"${job.contact_person || ''}"`,
        `"${job.follow_up_date || ''}"`,
        `"${job.job_url || ''}"`,
        `"${(job.notes || '').replace(/"/g, '""')}"`
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
  const exportToPDF = (data: JobApplication[]) => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Job Application Tracker Report', 20, 20);
      
      // Add generation date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
      doc.text(`Date Range: ${dateRange === 'all' ? 'All time' : dateRange}`, 20, 45);
      
      // Calculate statistics
      const stats = {
        total: data.length,
        applied: data.filter(j => j.status === 'Applied').length,
        interview: data.filter(j => j.status === 'Interview').length,
        offer: data.filter(j => j.status === 'Offer').length,
        accepted: data.filter(j => j.status === 'Accepted').length,
        rejected: data.filter(j => j.status === 'Rejected').length
      };
      
      // Add summary statistics
      doc.setFontSize(16);
      doc.text('Summary Statistics', 20, 65);
      doc.setFontSize(11);
      doc.text(`Total Applications: ${stats.total}`, 20, 80);
      doc.text(`Applied: ${stats.applied}`, 20, 90);
      doc.text(`Interview Stage: ${stats.interview}`, 20, 100);
      doc.text(`Offers Received: ${stats.offer}`, 20, 110);
      doc.text(`Accepted: ${stats.accepted}`, 20, 120);
      doc.text(`Rejected: ${stats.rejected}`, 20, 130);
      
      // Add success rates
      const interviewRate = stats.total > 0 ? ((stats.interview / stats.total) * 100).toFixed(1) : '0';
      const successRate = stats.total > 0 ? (((stats.offer + stats.accepted) / stats.total) * 100).toFixed(1) : '0';
      doc.text(`Interview Rate: ${interviewRate}%`, 120, 80);
      doc.text(`Success Rate: ${successRate}%`, 120, 90);
      
      // Prepare table data with error handling
      const tableColumns = ['Company', 'Role', 'Status', 'Applied Date', 'Location'];
      const tableRows = data.map(job => [
        job.company || 'N/A',
        job.role || 'N/A',
        job.status || 'N/A',
        job.applied_date ? new Date(job.applied_date).toLocaleDateString() : 'N/A',
        job.location || 'N/A'
      ]);      // Add table using autoTable with error handling
      if (typeof (doc as jsPDF & { autoTable?: (options: AutoTableOptions) => void }).autoTable === 'function') {
        (doc as jsPDF & { autoTable: (options: AutoTableOptions) => void }).autoTable({
          head: [tableColumns],
          body: tableRows,
          startY: 150,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185] },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 45 },
            2: { cellWidth: 25 },
            3: { cellWidth: 30 },
            4: { cellWidth: 35 }
          }
        });
      } else {        // Fallback if autoTable is not available
        const yPos = 150;
        tableRows.forEach((row, index) => {
          doc.text(row.join(' | '), 20, yPos + (index * 10));
        });
      }
      
      // Save the PDF
      const fileName = `job-applications-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report');
    }
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
   Applied: ${new Date(job.applied_date).toLocaleDateString()}
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

    try {      switch (exportFormat) {
        case 'csv':
          exportToCSV(filteredJobs);
          break;
        case 'json':
          exportToJSON(filteredJobs);
          break;
        case 'pdf':
          exportToPDF(filteredJobs);
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
      });    }
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
            <label className="text-sm font-medium mb-2 block">Export Format</label>            <Select value={exportFormat} onValueChange={(value: 'csv' | 'json' | 'pdf') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
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
                </SelectItem>                <SelectItem value="pdf">
                  <div className="flex items-center">
                    <File className="h-4 w-4 mr-2" />
                    PDF Report
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
        </div>        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>CSV:</strong> Perfect for Excel/Google Sheets analysis</p>
          <p><strong>JSON:</strong> Structured data for technical use</p>
          <p><strong>PDF Report:</strong> Professional report with statistics and data table</p>
        </div>
      </CardContent>
    </Card>
  );
};
