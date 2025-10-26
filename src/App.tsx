import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FarmDataProvider } from './hooks/useFarmData';
import Layout from './app/(root)/layout';
import Dashboard from './app/(root)/page';
import FarmDetail from './app/farm/[farmId]/page';
import Scalability from './app/scalability/page';
import Reports from './app/reports/page';
import Prototype from './app/prototype/page';

export default function App() {
  return (
    <FarmDataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="farm/:farmId" element={<FarmDetail />} />
            <Route path="scalability" element={<Scalability />} />
            <Route path="reports" element={<Reports />} />
            <Route path="prototype" element={<Prototype />} />
          </Route>
        </Routes>
      </Router>
    </FarmDataProvider>
  );
}
