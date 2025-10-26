const fs = require('fs');
const { faker } = require('@faker-js/faker');

// Indian names data
const indianFirstNames = [
  'Amit', 'Rajesh', 'Suresh', 'Ramesh', 'Vijay', 'Sanjay', 'Arun', 'Mohan', 'Ravi', 'Kiran',
  'Sunil', 'Anil', 'Vinod', 'Mahesh', 'Rajendra', 'Prakash', 'Dinesh', 'Ashok', 'Rajkumar', 'Vikram',
  'Priya', 'Kavita', 'Sunita', 'Rekha', 'Meera', 'Anita', 'Sarika', 'Poonam', 'Kiran', 'Geeta',
  'Seema', 'Ritu', 'Neha', 'Pooja', 'Komal', 'Rina', 'Sonia', 'Kavita', 'Anjali', 'Shweta'
];

const indianLastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Jain', 'Agarwal', 'Yadav', 'Chauhan',
  'Pandey', 'Mishra', 'Tiwari', 'Dubey', 'Rao', 'Nair', 'Pillai', 'Menon', 'Iyer', 'Shastri',
  'Joshi', 'Desai', 'Shah', 'Mehta', 'Kapoor', 'Khanna', 'Malhotra', 'Saxena', 'Bhatnagar', 'Trivedi'
];

// List of Indian states
const indianStates = [
  'Maharashtra', 'Uttar Pradesh', 'Karnataka', 'Madhya Pradesh', 'Gujarat',
  'Rajasthan', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'West Bengal',
  'Bihar', 'Punjab', 'Haryana', 'Odisha', 'Kerala'
];

// Crop types
const cropTypes = ['Wheat', 'Rice', 'Sugarcane', 'Cotton'];

// Health statuses
const healthStatuses = ['Healthy', 'Stressed_Water', 'Stressed_Pest', 'Damaged_Weather'];

// Generate realistic coordinates for Indian states (approximate)
const stateCoordinates = {
  'Maharashtra': { lat: [15.5, 22.0], lng: [72.5, 80.5] },
  'Uttar Pradesh': { lat: [23.5, 31.0], lng: [77.0, 84.5] },
  'Karnataka': { lat: [11.5, 18.5], lng: [74.0, 78.5] },
  'Madhya Pradesh': { lat: [21.0, 26.5], lng: [74.0, 82.5] },
  'Gujarat': { lat: [20.0, 24.5], lng: [68.5, 74.5] },
  'Rajasthan': { lat: [23.0, 30.0], lng: [69.5, 78.5] },
  'Tamil Nadu': { lat: [8.0, 13.5], lng: [76.5, 80.5] },
  'Andhra Pradesh': { lat: [13.0, 19.5], lng: [77.0, 84.5] },
  'Telangana': { lat: [15.5, 19.5], lng: [77.5, 81.5] },
  'West Bengal': { lat: [21.5, 27.0], lng: [85.5, 89.5] },
  'Bihar': { lat: [24.0, 27.5], lng: [83.0, 88.0] },
  'Punjab': { lat: [29.5, 32.5], lng: [74.0, 76.5] },
  'Haryana': { lat: [27.5, 30.5], lng: [74.5, 77.5] },
  'Odisha': { lat: [17.5, 22.5], lng: [81.5, 87.5] },
  'Kerala': { lat: [8.0, 12.5], lng: [74.5, 77.5] }
};

// Generate time series data
function generateTimeSeriesData() {
  const data = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11); // Start 11 months ago

  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    data.push({
      date: date.toISOString(),
      value: faker.number.float({ min: 0.2, max: 0.9, precision: 0.01 })
    });
  }
  return data;
}

function generateSoilMoistureData() {
  const data = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11);

  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    data.push({
      date: date.toISOString(),
      value: faker.number.float({ min: 20, max: 60, precision: 0.1 })
    });
  }
  return data;
}

// Generate farm data
function generateFarmData() {
  const state = faker.helpers.arrayElement(indianStates);
  const coords = stateCoordinates[state];
  const lat = faker.number.float({ min: coords.lat[0], max: coords.lat[1], precision: 0.0001 });
  const lng = faker.number.float({ min: coords.lng[0], max: coords.lng[1], precision: 0.0001 });

  const expectedYield = faker.number.float({ min: 2.5, max: 6.5, precision: 0.1 });
  const variance = faker.number.float({ min: -0.5, max: 0.5, precision: 0.1 });
  const predictedYield = Math.max(0, expectedYield + variance);

  return {
    farmId: `FARM-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`,
    farmerName: `${faker.helpers.arrayElement(indianFirstNames)} ${faker.helpers.arrayElement(indianLastNames)}`,
    state: state,
    district: faker.location.city(),
    village: faker.location.streetAddress(),
    coordinates: { lat, lng },
    cropType: faker.helpers.arrayElement(cropTypes),
    sowingDate: faker.date.past({ years: 1 }).toISOString(),
    expectedYield: expectedYield,
    predictedYield: predictedYield,
    yieldVariancePercent: ((predictedYield - expectedYield) / expectedYield) * 100,
    healthStatus: faker.helpers.arrayElement(healthStatuses),
    lastUAVScan: faker.date.recent({ days: 30 }).toISOString(),
    ndviHistory: generateTimeSeriesData(),
    soilMoistureHistory: generateSoilMoistureData()
  };
}

// Generate 10,000 farms
const farmData = [];
for (let i = 0; i < 10000; i++) {
  farmData.push(generateFarmData());
  if (i % 1000 === 0) {
    console.log(`Generated ${i} farms...`);
  }
}

// Write to file
fs.writeFileSync('public/farmData.json', JSON.stringify(farmData, null, 2));
console.log('Generated 10,000 farm data entries in public/farmData.json');
