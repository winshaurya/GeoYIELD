import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Scalability() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>National Scalability Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            Interactive India Map Coming Soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
