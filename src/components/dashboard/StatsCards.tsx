import { Card, CardContent } from '@/components/ui/card';
import { JobApplication } from '@/hooks/useJobApplications';

interface StatsCardsProps {
  jobs: JobApplication[];
}

export const StatsCards = ({ jobs }: StatsCardsProps) => {
  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'Applied').length,
    interview: jobs.filter(j => j.status === 'Interview').length,
    offer: jobs.filter(j => j.status === 'Offer').length,
    accepted: jobs.filter(j => j.status === 'Accepted').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
  );
};
