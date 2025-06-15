
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
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
  followUpDate?: string;
}

interface ReminderSystemProps {
  jobs: JobApplication[];
  onUpdateJob: (updatedJob: JobApplication) => void;
}

interface Reminder {
  id: string;
  type: 'follow-up' | 'stale-application' | 'interview-prep';
  priority: 'high' | 'medium' | 'low';
  message: string;
  dueDate: string;
  job: JobApplication;
}

export const ReminderSystem = ({ jobs, onUpdateJob }: ReminderSystemProps) => {
  const { toast } = useToast();

  const reminders = useMemo(() => {
    const today = new Date();
    const reminderList: Reminder[] = [];

    jobs.forEach(job => {
      const appliedDate = new Date(job.appliedDate);
      const daysSinceApplied = Math.floor((today.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));

      // Follow-up reminders
      if (job.followUpDate) {
        const followUpDate = new Date(job.followUpDate);
        const daysUntilFollowUp = Math.floor((followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilFollowUp <= 0 && job.status !== 'Rejected' && job.status !== 'Accepted') {
          reminderList.push({
            id: `followup-${job.id}`,
            type: 'follow-up',
            priority: 'high',
            message: `Follow up with ${job.company} about ${job.role}`,
            dueDate: job.followUpDate,
            job
          });
        }
      }

      // Stale application reminders
      if (job.status === 'Applied' && daysSinceApplied >= 14) {
        reminderList.push({
          id: `stale-${job.id}`,
          type: 'stale-application',
          priority: daysSinceApplied >= 21 ? 'high' : 'medium',
          message: `No response from ${job.company} for ${daysSinceApplied} days - consider following up`,
          dueDate: today.toISOString(),
          job
        });
      }

      // Interview preparation reminders
      if (job.status === 'Interview') {
        reminderList.push({
          id: `prep-${job.id}`,
          type: 'interview-prep',
          priority: 'high',
          message: `Prepare for interview at ${job.company}`,
          dueDate: today.toISOString(),
          job
        });
      }
    });

    return reminderList.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [jobs]);

  const handleMarkComplete = (reminder: Reminder) => {
    if (reminder.type === 'follow-up' && reminder.job.followUpDate) {
      // Set next follow-up date
      const nextFollowUp = new Date();
      nextFollowUp.setDate(nextFollowUp.getDate() + 7);
      
      const updatedJob = {
        ...reminder.job,
        followUpDate: nextFollowUp.toISOString().split('T')[0],
        notes: reminder.job.notes + `\n[${new Date().toLocaleDateString()}] Followed up with company.`
      };
      
      onUpdateJob(updatedJob);
      toast({
        title: "Follow-up completed!",
        description: "Next follow-up scheduled for next week."
      });
    } else if (reminder.type === 'stale-application') {
      // Update to add follow-up note
      const updatedJob = {
        ...reminder.job,
        notes: reminder.job.notes + `\n[${new Date().toLocaleDateString()}] Addressed stale application.`
      };
      
      onUpdateJob(updatedJob);
      toast({
        title: "Reminder addressed!",
        description: "Application noted as reviewed."
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'follow-up': return <Bell className="h-4 w-4" />;
      case 'stale-application': return <AlertTriangle className="h-4 w-4" />;
      case 'interview-prep': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Reminders & Action Items
          {reminders.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {reminders.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Stay on top of your job search with smart reminders
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending action items at the moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getReminderIcon(reminder.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {reminder.message}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <Badge className={getPriorityColor(reminder.priority)} variant="outline">
                        {reminder.priority} priority
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {reminder.type.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkComplete(reminder)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Done
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
