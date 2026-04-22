import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const AlumniDirectory = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Helper function to format role display
  const formatRole = (role) => {
    if (!role) return 'User'; // Default fallback for undefined/null
    
    const roleMap = {
      'alumni': 'Alumni',
      'admin': 'Administrator',
      'coordinator': 'Coordinator',
      'mentor': 'Mentor',
      'student': 'Student',
      'faculty': 'Faculty'
    };
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Helper function to get role badge styling
  const getRoleBadgeClasses = (role) => {
    if (!role) return 'bg-gray-100 text-gray-800 border-gray-200'; // Default fallback
    
    const roleStyles = {
      'alumni': 'bg-blue-100 text-blue-800 border-blue-200',
      'admin': 'bg-red-100 text-red-800 border-red-200',
      'coordinator': 'bg-purple-100 text-purple-800 border-purple-200',
      'mentor': 'bg-green-100 text-green-800 border-green-200',
      'student': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'faculty': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return roleStyles[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      
      // Only fetch alumni if user is logged in and has alumni role
      if (!user || user.role !== 'alumni') {
        setError('Access denied. Alumni access required.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('alumni_token');
      
      if (!token) {
        setError('Please login to view alumni directory');
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment);
      if (selectedYear !== 'all') params.append('year', selectedYear);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/alumni/directory?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log('📊 Alumni data received:', data.data);
        setAlumni(data.data);
      } else {
        setError(data.message || 'Failed to fetch alumni directory');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter alumni based on search and filters
  const filteredAlumni = alumni.filter(person => {
    const matchesSearch = !searchTerm || 
      (person.first_name && person.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (person.last_name && person.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (person.first_name && person.last_name && `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      person.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || person.department === selectedDepartment;
    const matchesYear = selectedYear === 'all' || (person.graduation_year?.toString() || '') === selectedYear;
    
    return matchesSearch && matchesDepartment && matchesYear;
  });

  // Get unique departments and years for filters
  const departments = [...new Set(alumni.map(person => person.department))];
  const years = [...new Set(alumni.map(person => person.graduation_year?.toString() || ''))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pt-10 space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">
          Alumni Directory
        </h1>
        <p className="text-gray-500">
          Connect with alumni from our community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            placeholder="Search alumni by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-5 py-3 bg-blue-600 text-white rounded-lg"
        >
          {showFilters ? "Hide Filters" : "Filters"}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-4 transition">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Department</label>
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-600">Passout Year</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Loading alumni directory...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Alumni Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAlumni.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition"
            >
              {/* Avatar */}
              {person.image ? (
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold text-xl">
                    {person.first_name ? person.first_name[0] : 'A'}
                  </span>
                </div>
              )}

              <h3 className="mt-4 font-semibold text-lg text-gray-800">
                {person.first_name && person.last_name 
                  ? `${person.first_name} ${person.last_name}` 
                  : person.name}
              </h3>
              
              <div className="mt-2 flex justify-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClasses(person.role)}`}>
                  {formatRole(person.role)}
                </span>
              </div>
              
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p className="font-medium">{person.department || 'Department not specified'}</p>
                <p>Class of {person.graduation_year || 'N/A'}</p>
                
              </div>

              <Link
                to={`/dashboard/alumni/${person.id}`}
                className="mt-5 block w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniDirectory;
