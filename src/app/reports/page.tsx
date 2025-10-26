import { useState, useMemo } from 'react';
import { useFarmData } from '@/hooks/useFarmData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Reports() {
  const { data, loading, error } = useFarmData();
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  // Get unique states and crops for filters
  const uniqueStates = [...new Set(data.map(farm => farm.state))];
  const uniqueCrops = [...new Set(data.map(farm => farm.cropType))];

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(farm => {
      const matchesSearch = farm.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           farm.village.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = !stateFilter || farm.state === stateFilter;
      const matchesCrop = !cropFilter || farm.cropType === cropFilter;
      return matchesSearch && matchesState && matchesCrop;
    });
  }, [data, searchTerm, stateFilter, cropFilter]);

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportData = () => {
    console.log('Exporting filtered data:', filteredData);
    // In a real app, this would generate a CSV
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search by Name/Village</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Crop Type</label>
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">All Crops</option>
                {uniqueCrops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={exportData} className="w-full">
                Export Filtered Data (.csv)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Data ({filteredData.length} farms)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farm ID</TableHead>
                <TableHead>Farmer Name</TableHead>
                <TableHead>State</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Crop Type</TableHead>
                <TableHead>Expected Yield</TableHead>
                <TableHead>Predicted Yield</TableHead>
                <TableHead>Variance (%)</TableHead>
                <TableHead>Health Status</TableHead>
                <TableHead>Last UAV Scan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((farm) => (
                <TableRow key={farm.farmId}>
                  <TableCell>
                    <Link
                      to={`/farm/${farm.farmId}`}
                      className="text-primary hover:underline"
                    >
                      {farm.farmId}
                    </Link>
                  </TableCell>
                  <TableCell>{farm.farmerName}</TableCell>
                  <TableCell>{farm.state}</TableCell>
                  <TableCell>{farm.district}</TableCell>
                  <TableCell>{farm.village}</TableCell>
                  <TableCell>{farm.cropType}</TableCell>
                  <TableCell>{farm.expectedYield.toFixed(1)}</TableCell>
                  <TableCell>{farm.predictedYield.toFixed(1)}</TableCell>
                  <TableCell>{farm.yieldVariancePercent.toFixed(1)}%</TableCell>
                  <TableCell>{farm.healthStatus}</TableCell>
                  <TableCell>{new Date(farm.lastUAVScan).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
