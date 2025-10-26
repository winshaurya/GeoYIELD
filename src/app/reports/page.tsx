import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Reports() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dummy Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            Reports Dashboard Coming Soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
