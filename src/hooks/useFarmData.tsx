import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FarmData = {
  farmId: string;
  farmerName: string;
  state: string;
  district: string;
  village: string;
  coordinates: { lat: number; lng: number };
  farmSize: number;
  soilType: string;
  irrigationType: string;
  cropType: 'Wheat' | 'Rice' | 'Sugarcane' | 'Cotton' | 'Maize' | 'Soybean' | 'Groundnut' | 'Chickpea';
  sowingDate: string;
  expectedYield: number;
  predictedYield: number;
  yieldVariancePercent: number;
  healthStatus: 'Healthy' | 'Stressed_Water' | 'Stressed_Pest' | 'Damaged_Weather' | 'Nutrient_Deficient';
  lastUAVScan: string;
  ndviHistory: { date: string; value: number }[];
  soilMoistureHistory: { date: string; value: number }[];
  weatherHistory: { date: string; temperature: number; rainfall: number }[];
};

type FarmDataContextType = {
  data: FarmData[];
  loading: boolean;
  error: string | null;
};

const FarmDataContext = createContext<FarmDataContextType | undefined>(undefined);

export const FarmDataProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const [data, setData] = useState<FarmData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/farmData.json');
        if (!response.ok) {
          throw new Error('Failed to fetch farm data');
        }
        const farmData: FarmData[] = await response.json();
        setData(farmData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <FarmDataContext.Provider value={{ data, loading, error }}>
      {children}
    </FarmDataContext.Provider>
  );
};

export const useFarmData = () => {
  const context = useContext(FarmDataContext);
  if (context === undefined) {
    throw new Error('useFarmData must be used within a FarmDataProvider');
  }
  return context;
};
