
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BarChart3, Download } from 'lucide-react';

interface QuickActionsProps {
  onAddApplication: () => void;
  onViewAnalytics: () => void;
  onExportData: () => void;
}

export const QuickActions = ({ onAddApplication, onViewAnalytics, onExportData }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={onAddApplication}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Application
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={onViewAnalytics}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={onExportData}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </CardContent>
    </Card>
  );
};
