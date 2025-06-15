
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Clock, Award, AlertCircle } from 'lucide-react';

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

interface AnalyticsDashboardProps {
  jobs: JobApplication[];
}

export const AnalyticsDashboard = ({ jobs }: AnalyticsDashboardProps) => {
  const analytics = useMemo(() => {
    const total = jobs.length;
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<JobStatus, number>);

    const conversionRate = total > 0 ? ((statusCounts.Interview || 0) / total * 100) : 0;
    const successRate = total > 0 ? (((statusCounts.Offer || 0) + (statusCounts.Accepted || 0)) / total * 100) : 0;
    const rejectionRate = total > 0 ? ((statusCounts.Rejected || 0) / total * 100) : 0;

    // Activity over time
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentApplications = jobs.filter(job => new Date(job.appliedDate) >= last30Days).length;

    // Most active companies
    const companyCounts = jobs.reduce((acc, job) => {
      acc[job.company] = (acc[job.company] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCompanies = Object.entries(companyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Average application frequency
    const avgPerWeek = total > 0 ? (recentApplications / 4) : 0;

    return {
      total,
      statusCounts,
      conversionRate,
      successRate,
      rejectionRate,
      recentApplications,
      topCompanies,
      avgPerWeek
    };
  }, [jobs]);

  const getStatusColor = (status: JobStatus) => {
    const colors = {
      'Applied': 'text-blue-600',
      'Interview': 'text-yellow-600',
      'Offer': 'text-green-600',
      'Rejected': 'text-red-600',
      'Accepted': 'text-purple-600'
    };
    return colors[status];
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Conversion Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-blue-500" />
              Interview Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
            <Progress value={analytics.conversionRate} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">
              {analytics.statusCounts.Interview || 0} of {analytics.total} applications
            </p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="h-4 w-4 mr-2 text-green-500" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.successRate.toFixed(1)}%</div>
            <Progress value={analytics.successRate} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">
              Offers + Accepted applications
            </p>
          </CardContent>
        </Card>

        {/* Activity Level */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
              Weekly Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgPerWeek.toFixed(1)}</div>
            <p className="text-xs text-gray-600 mt-1">Applications per week</p>
            <div className="flex items-center mt-2">
              {analytics.recentApplications > 0 ? (
                <span className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {analytics.recentApplications} in last 30 days
                </span>
              ) : (
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  No recent activity
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rejection Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              Rejection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.rejectionRate.toFixed(1)}%</div>
            <Progress value={analytics.rejectionRate} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">
              Room for improvement
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status Breakdown</CardTitle>
            <CardDescription>Current distribution of your applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(analytics.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="outline" className={getStatusColor(status as JobStatus)}>
                    {status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{count}</span>
                  <div className="w-20">
                    <Progress 
                      value={(count / analytics.total) * 100} 
                      className="h-2"
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10">
                    {((count / analytics.total) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Most Applied Companies</CardTitle>
            <CardDescription>Companies you've applied to most</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topCompanies.length > 0 ? (
              <div className="space-y-3">
                {analytics.topCompanies.map(([company, count], index) => (
                  <div key={company} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">
                        #{index + 1}
                      </span>
                      <span className="text-sm">{company}</span>
                    </div>
                    <Badge variant="secondary">{count} applications</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No applications yet. Start applying to see insights!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
