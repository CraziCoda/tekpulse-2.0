'use client';

import { useState } from 'react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Navigation, Clock, Phone, Globe } from 'lucide-react';

const campusLocations = [
  {
    id: 1,
    name: 'Main Library',
    category: 'library',
    description: '24/7 study space with computer labs and group rooms',
    hours: 'Open 24/7',
    coordinates: { x: 45, y: 30 },
    contact: '(555) 123-4567'
  },
  {
    id: 2,
    name: 'Student Center',
    category: 'dining',
    description: 'Food court, bookstore, and student services',
    hours: '7:00 AM - 11:00 PM',
    coordinates: { x: 55, y: 45 },
    contact: '(555) 123-4568'
  },
  {
    id: 3,
    name: 'Science Building',
    category: 'academic',
    description: 'Chemistry, Physics, and Biology labs and classrooms',
    hours: '6:00 AM - 10:00 PM',
    coordinates: { x: 25, y: 60 },
    contact: '(555) 123-4569'
  },
  {
    id: 4,
    name: 'Gymnasium',
    category: 'recreation',
    description: 'Fitness center, basketball courts, and swimming pool',
    hours: '5:00 AM - 11:00 PM',
    coordinates: { x: 75, y: 25 },
    contact: '(555) 123-4570'
  },
  {
    id: 5,
    name: 'Engineering Building',
    category: 'academic',
    description: 'Computer labs, engineering workshops, and lecture halls',
    hours: '6:00 AM - 12:00 AM',
    coordinates: { x: 35, y: 75 },
    contact: '(555) 123-4571'
  },
  {
    id: 6,
    name: 'Parking Lot A',
    category: 'parking',
    description: 'Student parking - 500 spaces available',
    hours: 'Always Open',
    coordinates: { x: 15, y: 20 },
    contact: 'No phone'
  },
  {
    id: 7,
    name: 'Dormitory Complex',
    category: 'housing',
    description: 'On-campus housing for 1,200 students',
    hours: 'Residents Only',
    coordinates: { x: 65, y: 70 },
    contact: '(555) 123-4572'
  },
  {
    id: 8,
    name: 'Health Center',
    category: 'services',
    description: 'Medical services and counseling for students',
    hours: '8:00 AM - 6:00 PM',
    coordinates: { x: 80, y: 50 },
    contact: '(555) 123-4573'
  }
];

export default function CampusMapPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All', color: 'bg-gray-500' },
    { value: 'academic', label: 'Academic', color: 'bg-blue-500' },
    { value: 'library', label: 'Library', color: 'bg-purple-500' },
    { value: 'dining', label: 'Dining', color: 'bg-orange-500' },
    { value: 'recreation', label: 'Recreation', color: 'bg-green-500' },
    { value: 'parking', label: 'Parking', color: 'bg-yellow-600' },
    { value: 'housing', label: 'Housing', color: 'bg-pink-500' },
    { value: 'services', label: 'Services', color: 'bg-red-500' }
  ];

  const getCategoryColor = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.color || 'bg-gray-500';
  };

  const filteredLocations = campusLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || location.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Map</h1>
          <p className="text-muted-foreground">
            Navigate your way around campus with our interactive map
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Interactive Campus Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-green-50 rounded-lg overflow-hidden" style={{ aspectRatio: '16/12' }}>
                  {/* Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200">
                    {/* Paths */}
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                      <path
                        d="M 10% 90% Q 30% 70% 50% 80% T 90% 60%"
                        stroke="#8B5CF6"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="5,5"
                      />
                      <path
                        d="M 20% 10% Q 40% 30% 60% 20% T 80% 40%"
                        stroke="#8B5CF6"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="5,5"
                      />
                    </svg>
                    
                    {/* Location Markers */}
                    {filteredLocations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => setSelectedLocation(location.id)}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${
                          selectedLocation === location.id ? 'scale-125 z-20' : 'z-10'
                        }`}
                        style={{
                          left: `${location.coordinates.x}%`,
                          top: `${location.coordinates.y}%`
                        }}
                      >
                        <div className={`w-4 h-4 rounded-full ${getCategoryColor(location.category)} border-2 border-white shadow-lg`}></div>
                        <div className="mt-1 px-2 py-1 bg-white rounded shadow-sm text-xs font-medium whitespace-nowrap">
                          {location.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.filter(c => c.value !== 'all').map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm">{category.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location List and Details */}
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Location Details */}
            {selectedLocation && (
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const location = campusLocations.find(l => l.id === selectedLocation);
                    if (!location) return null;
                    
                    return (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{location.name}</h3>
                          <Badge className={`${getCategoryColor(location.category)} text-white mt-1`}>
                            {location.category}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground">{location.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{location.hours}</span>
                          </div>
                          {location.contact !== 'No phone' && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-4 w-4" />
                              <span>{location.contact}</span>
                            </div>
                          )}
                        </div>
                        
                        <Button className="w-full">
                          <Navigation className="h-4 w-4 mr-2" />
                          Get Directions
                        </Button>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Location List */}
            <Card>
              <CardHeader>
                <CardTitle>All Locations</CardTitle>
                <CardDescription>
                  {filteredLocations.length} locations found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredLocations.map((location) => (
                    <div
                      key={location.id}
                      onClick={() => setSelectedLocation(location.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedLocation === location.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{location.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {location.description}
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(location.category)} mt-1`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}