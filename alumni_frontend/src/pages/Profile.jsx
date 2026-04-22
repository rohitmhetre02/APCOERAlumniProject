import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserCircleIcon, 
  AcademicCapIcon, 
  BriefcaseIcon, 
  CodeBracketIcon, 
  TrophyIcon,
  DocumentTextIcon,
  LanguageIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CameraIcon,
  XMarkIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('about');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalItem, setModalItem] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [editingItem, setEditingItem] = useState({ type: null, id: null });
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profileDetailsForm, setProfileDetailsForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    graduation_year: ''
  });
  const [formErrors, setFormErrors] = useState({
    phone: ''
  });
  
  // Form state for COMMON UI RULES
  const [showFormSection, setShowFormSection] = useState(null);
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [isPursuing, setIsPursuing] = useState(false);
  const [degreeType, setDegreeType] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');

  // Form data states for each section
  const [aboutForm, setAboutForm] = useState({ bio: '' });
  const [skillForm, setSkillForm] = useState({ skill_name: '' });
  const [experienceForm, setExperienceForm] = useState({
    role: '',
    company: '',
    location: '',
    employment_type: '',
    start_date: '',
    end_date: '',
    currently_working: false,
    description: ''
  });
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tech_stack: '',
    project_url: '',
    github_url: '',
    start_date: '',
    end_date: ''
  });
  const [educationForm, setEducationForm] = useState({
    degree: '',
    field_of_study: '',
    college: '',
    start_year: '',
    end_year: '',
    cgpa: ''
  });
  const [languageForm, setLanguageForm] = useState({
    language: '',
    proficiency: ''
  });
  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    date: '',
    type: ''
  });
  const [certificationForm, setCertificationForm] = useState({
    title: '',
    organization: '',
    year: '',
    credential_id: '',
    credential_url: '',
    issue_date: '',
    expiry_date: ''
  });

  // Fetch profile data from API
  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('alumni_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Profile data received:', data.data);
        setProfileData(data.data);
      } else if (response.status === 401) {
        console.error('Authentication failed - token may be expired');
      } else {
        console.error('Failed to fetch profile data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('alumni_token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            profile_image: data.data.url
          }
        }));
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Add/Edit functions for each section
  const handleAddItem = async (type, item) => {
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({
          ...prev,
          [type]: [...(prev[type] || []), data.data]
        }));
        setShowModal(false);
      } else {
        console.error(`Failed to add ${type}`);
      }
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
    }
  };

  const handleUpdateItem = async (type, id, item) => {
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/${type}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({
          ...prev,
          [type]: prev[type].map(item => 
            item.id === id ? data.data : item
          )
        }));
        setShowModal(false);
      } else {
        console.error(`Failed to update ${type}`);
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  };

  const handleDeleteItem = async (type, id) => {
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/${type}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setProfileData(prev => ({
          ...prev,
          [type]: prev[type].filter(item => item.id !== id)
        }));
      } else {
        console.error(`Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  // COMMON UI RULES handlers
  const setShowForm = (section) => {
    setShowFormSection(showFormSection === section ? null : section);
  };

  const handleSave = async (type) => {
    try {
      const token = localStorage.getItem('alumni_token');
      let endpoint = '';
      let data = {};
      let method = 'POST';

      // Check if we're editing an existing item
      const isEditing = editingItem.type === type && editingItem.id;

      switch (type) {
        case 'about':
          endpoint = `${import.meta.env.VITE_API_URL}/profile`;
          method = 'PUT';
          data = { bio: aboutForm.bio };
          break;
        case 'skills':
          endpoint = isEditing 
            ? `${import.meta.env.VITE_API_URL}/profile/skills/${editingItem.id}`
            : `${import.meta.env.VITE_API_URL}/profile/skills`;
          method = isEditing ? 'PUT' : 'POST';
          data = { skill_name: skillForm.skill_name };
          break;
        case 'experience':
          endpoint = isEditing 
            ? `${import.meta.env.VITE_API_URL}/profile/experience/${editingItem.id}`
            : `${import.meta.env.VITE_API_URL}/profile/experience`;
          method = isEditing ? 'PUT' : 'POST';
          data = { ...experienceForm };
          break;
        case 'projects':
          endpoint = isEditing 
            ? `${import.meta.env.VITE_API_URL}/profile/projects/${editingItem.id}`
            : `${import.meta.env.VITE_API_URL}/profile/projects`;
          method = isEditing ? 'PUT' : 'POST';
          data = { ...projectForm };
          break;
        case 'education':
          endpoint = isEditing 
            ? `${import.meta.env.VITE_API_URL}/profile/education/${editingItem.id}`
            : `${import.meta.env.VITE_API_URL}/profile/education`;
          method = isEditing ? 'PUT' : 'POST';
          data = { 
            degree: educationForm.degree,
            field: educationForm.field_of_study,
            college: educationForm.college,
            start_year: educationForm.start_year,
            end_year: educationForm.end_year,
            cgpa: educationForm.cgpa
          };
          break;
        case 'languages':
          endpoint = isEditing 
            ? `${import.meta.env.VITE_API_URL}/profile/languages/${editingItem.id}`
            : `${import.meta.env.VITE_API_URL}/profile/languages`;
          method = isEditing ? 'PUT' : 'POST';
          data = { ...languageForm };
          break;
        case 'achievements':
          endpoint = isEditing 
            ? `${import.meta.env.VITE_API_URL}/profile/achievements/${editingItem.id}`
            : `${import.meta.env.VITE_API_URL}/profile/achievements`;
          method = isEditing ? 'PUT' : 'POST';
          data = { ...achievementForm };
          break;
        case 'certifications':
          endpoint = isEditing 
            ? `${import.meta.env.VITE_API_URL}/profile/certifications/${editingItem.id}`
            : `${import.meta.env.VITE_API_URL}/profile/certifications`;
          method = isEditing ? 'PUT' : 'POST';
          data = { ...certificationForm };
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`${type} saved successfully:`, result);
        
        // Show success notification
        const sectionName = type.charAt(0).toUpperCase() + type.slice(1);
        const action = isEditing ? 'updated' : 'saved';
        showNotification(`${sectionName} ${action} successfully!`, 'success');
        
        // Refresh profile data
        await fetchProfileData();
        // Clear form
        setShowFormSection(null);
        // Reset editing state
        setEditingItem({ type: null, id: null });
        // Reset form state
        resetForm(type);
      } else {
        console.error(`Failed to save ${type}:`, response.statusText);
        showNotification(`Failed to save ${type}`, 'error');
      }
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      showNotification(`Error saving ${type}`, 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const errors = {
      phone: ''
    };

    let isValid = true;

    if (!validatePhone(profileDetailsForm.phone)) {
      errors.phone = 'Contact must be exactly 10 digits';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleProfileDetailsSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('alumni_token');
      
      // Update profile details (names, department, graduation_year, contact_number, bio)
      const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: profileDetailsForm.first_name,
          last_name: profileDetailsForm.last_name,
          department: profileDetailsForm.department,
          graduation_year: profileDetailsForm.graduation_year,
          contact_number: profileDetailsForm.phone,
          bio: '' // Keep existing bio or empty
        })
      });

      if (profileResponse.ok) {
        showNotification('Profile details updated successfully!', 'success');
        await fetchProfileData();
        setShowProfilePopup(false);
        setFormErrors({ email: '', phone: '', prn: '' });
      } else {
        showNotification('Failed to update profile details', 'error');
      }
    } catch (error) {
      console.error('Error updating profile details:', error);
      showNotification('Error updating profile details', 'error');
    }
  };

  const handleCancel = (section) => {
    setShowFormSection(null);
    resetForm(section);
  };

  const resetForm = (section) => {
    // Reset editing state
    setEditingItem({ type: null, id: null });
    
    switch(section) {
      case 'skills':
        setSkillForm({ skill_name: '' });
        break;
      case 'experience':
        setExperienceForm({
          role: '',
          company: '',
          location: '',
          employment_type: '',
          start_date: '',
          end_date: '',
          description: '',
          currently_working: false
        });
        setCurrentlyWorking(false);
        break;
      case 'projects':
        setProjectForm({
          title: '',
          description: '',
          tech_stack: '',
          project_url: '',
          github_url: ''
        });
        break;
      case 'education':
        setEducationForm({
          degree: '',
          field_of_study: '',
          college: '',
          start_year: '',
          end_year: '',
          cgpa: ''
        });
        setDegreeType('');
        setFieldOfStudy('');
        setIsPursuing(false);
        break;
      case 'languages':
        setLanguageForm({ language: '', proficiency: '' });
        break;
      case 'achievements':
        setAchievementForm({ title: '', date: '', description: '' });
        break;
      case 'certifications':
        setCertificationForm({
          title: '',
          organization: '',
          year: '',
          credential_id: ''
        });
        break;
    }
  };

  const handleEdit = (type, item) => {
    console.log(`Editing ${type}:`, item);
    
    // Set form data with existing item data
    switch(type) {
      case 'skills':
        setSkillForm({ skill_name: item.skill_name });
        break;
      case 'experience':
        setExperienceForm({
          role: item.role,
          company: item.company,
          location: item.location,
          employment_type: item.employment_type,
          start_date: item.start_date,
          end_date: item.end_date,
          description: item.description,
          currently_working: item.currently_working
        });
        setCurrentlyWorking(item.currently_working);
        break;
      case 'projects':
        setProjectForm({
          title: item.title,
          description: item.description,
          tech_stack: item.tech_stack,
          project_url: item.project_url,
          github_url: item.github_url
        });
        break;
      case 'education':
        setEducationForm({
          degree: item.degree,
          field_of_study: item.field,
          college: item.college,
          start_year: item.start_year,
          end_year: item.end_year,
          cgpa: item.cgpa
        });
        setDegreeType(item.degree);
        setFieldOfStudy(item.field);
        break;
      case 'languages':
        setLanguageForm({ 
          language: item.language, 
          proficiency: item.proficiency 
        });
        break;
      case 'achievements':
        setAchievementForm({ 
          title: item.title, 
          date: item.date, 
          description: item.description 
        });
        break;
      case 'certifications':
        setCertificationForm({
          title: item.title,
          organization: item.organization,
          year: item.year,
          credential_id: item.credential_id
        });
        break;
    }
    
    // Show form for editing
    setEditingItem({ type, id: item.id });
    setShowFormSection(type);
  };

  const handleDelete = async (type, id) => {
    console.log(`Deleting ${type} with id: ${id}`);
    try {
      const token = localStorage.getItem('alumni_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/${type}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`, 'success');
        await fetchProfileData();
      } else {
        showNotification(`Failed to delete ${type}`, 'error');
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      showNotification(`Error deleting ${type}`, 'error');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load profile data</p>
        <button 
          onClick={fetchProfileData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { user: userData, profile = {}, education, skills, languages, experience, projects, achievements, exams, certifications } = profileData;
  console.log('🔍 Destructured data:', { userData, profile });

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Profile Card with User Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              {userData?.profile_image ? (
                <img 
                  src={userData.profile_image} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                  <UserCircleIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg">
                <CameraIcon className="w-4 h-4" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            
            {/* User Details Card */}
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {userData?.first_name || 'N/A'} {userData?.last_name || 'N/A'}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <strong>Email:</strong> {userData?.email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <strong>Contact:</strong> {userData?.contact_number || profile?.contact_number || 'Not added'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <strong>Department:</strong> {userData?.department || profile?.department || 'Not added'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DocumentIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <strong>PRN:</strong> {userData?.prn_number || profile?.prn_number || 'Not added'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <strong>Graduation:</strong> {userData?.passout_year || profile?.graduation_year || 'Not added'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <strong>Role:</strong> {userData?.role || 'Not added'}
                    </span>
                  </div>
                </div>
                
                {!profile && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Profile not found. Please edit your profile to add your information.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Edit Button */}
            <button
              onClick={() => {
                setProfileDetailsForm({
                  first_name: userData?.first_name || '',
                  last_name: userData?.last_name || '',
                  phone: userData?.contact_number || profile?.contact_number || '',
                  department: userData?.department || profile?.department || '',
                  graduation_year: userData?.passout_year || profile?.graduation_year || ''
                });
                setShowProfilePopup(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Edit </span>
            </button>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <div className="border-t mt-4 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap space-x-2 p-4 border-b">
            {[
              { id: 'about', label: 'About' },
              { id: 'skills', label: 'Skills' },
              { id: 'experience', label: 'Experience' },
              { id: 'projects', label: 'Projects' },
              { id: 'education', label: 'Education' },
              { id: 'languages', label: 'Languages' },
              { id: 'achievements', label: 'Achievements' },
              { id: 'certifications', label: 'Certifications' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors mb-2 ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area - COMMON UI RULES for All Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          
          {/* ABOUT SECTION */}
          {activeSection === 'about' && (
            <div className="rounded-xl shadow-sm p-5 bg-white">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Bio</label>
                  <textarea 
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                    rows="4"
                    placeholder="Tell us about yourself..."
                    value={aboutForm.bio || profile?.bio || ''}
                    onChange={(e) => setAboutForm({ bio: e.target.value })}
                  ></textarea>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleSave('about')}
                    className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SKILLS SECTION */}
          {activeSection === 'skills' && (
            <div className="rounded-xl shadow-sm p-5 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
                <button 
                  onClick={() => setShowForm('skills')}
                  className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              
              {showFormSection === 'skills' ? (
                <div className="space-y-4 border-t border-blue-100 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Skill Name</label>
                    <input 
                      type="text" 
                      className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                      placeholder="e.g., JavaScript, React, Python..."
                      value={skillForm.skill_name}
                      onChange={(e) => setSkillForm({ skill_name: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleSave('skills')}
                      className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => handleCancel(activeSection)}
                      className="border border-blue-200 text-gray-600 rounded-lg px-4 py-2 hover:bg-blue-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {skills && skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <div key={skill.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                          {skill.skill_name}
                          <button 
                            onClick={() => handleEdit('skills', skill)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <PencilIcon className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDelete('skills', skill.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No skills added yet</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* EXPERIENCE SECTION */}
          {activeSection === 'experience' && (
            <div className="rounded-xl shadow-sm p-5 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
                <button 
                  onClick={() => setShowForm('experience')}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {showFormSection === 'experience' ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Job Title</label>
                      <input 
                        type="text" 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        placeholder="e.g., Software Engineer"
                        value={experienceForm.role}
                        onChange={(e) => setExperienceForm({...experienceForm, role: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Company</label>
                      <input 
                        type="text" 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        placeholder="e.g., Tech Company"
                        value={experienceForm.company}
                        onChange={(e) => setExperienceForm({...experienceForm, company: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Location</label>
                      <input 
                        type="text" 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        placeholder="e.g., Mumbai, India"
                        value={experienceForm.location}
                        onChange={(e) => setExperienceForm({...experienceForm, location: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Employment Type</label>
                      <select 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        value={experienceForm.employment_type}
                        onChange={(e) => setExperienceForm({...experienceForm, employment_type: e.target.value})}
                      >
                        <option value="">Select Type</option>
                        <option value="full-time">Full-time</option>
                        <option value="internship">Internship</option>
                        <option value="part-time">Part-time</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input 
                          type="month" 
                          className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                          value={experienceForm.start_date}
                          onChange={(e) => setExperienceForm({...experienceForm, start_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input 
                          type="month" 
                          className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                          disabled={currentlyWorking}
                          value={experienceForm.end_date}
                          onChange={(e) => setExperienceForm({...experienceForm, end_date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2"
                          checked={experienceForm.currently_working}
                          onChange={(e) => {
                            setCurrentlyWorking(e.target.checked);
                            setExperienceForm({...experienceForm, currently_working: e.target.checked});
                          }}
                        />
                        <span className="text-sm text-gray-600">Currently Working</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                    <textarea 
                      className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                      rows="3"
                      placeholder="Describe your role and responsibilities..."
                      value={experienceForm.description}
                      onChange={(e) => setExperienceForm({...experienceForm, description: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleSave('experience')}
                      className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => handleCancel(activeSection)}
                      className="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {experience && experience.length > 0 ? (
                    experience.map((exp) => (
                      <div key={exp.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                            <p className="text-gray-600">{exp.company}</p>
                            <p className="text-sm text-gray-500">{exp.location}</p>
                            <p className="text-sm text-gray-400">{exp.start_date} - {exp.end_date || 'Present'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit('experience', exp)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('experience', exp.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No experience added yet</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PROJECTS SECTION */}
          {activeSection === 'projects' && (
            <div className="rounded-xl shadow-sm p-5 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                <button 
                  onClick={() => setShowForm('projects')}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {showFormSection === 'projects' ? (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Project Title</label>
                    <input 
                      type="text" 
                      className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                      placeholder="e.g., E-commerce Website"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Technologies Used</label>
                    <input 
                      type="text" 
                      className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                      placeholder="e.g., React, Node.js, MongoDB"
                      value={projectForm.tech_stack}
                      onChange={(e) => setProjectForm({...projectForm, tech_stack: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                    <textarea 
                      className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                      rows="3"
                      placeholder="Describe your project and your role..."
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Project Link</label>
                    <input 
                      type="url" 
                      className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                      placeholder="https://yourproject.com"
                      value={projectForm.project_url}
                      onChange={(e) => setProjectForm({...projectForm, project_url: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">GitHub Link</label>
                    <input 
                      type="url" 
                      className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                      placeholder="https://github.com/username/repo"
                      value={projectForm.github_url}
                      onChange={(e) => setProjectForm({...projectForm, github_url: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleSave('projects')}
                      className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => handleCancel(activeSection)}
                      className="border border-blue-200 text-gray-600 rounded-lg px-4 py-2 hover:bg-blue-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects && projects.length > 0 ? (
                    projects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{project.title}</h4>
                            <p className="text-gray-600">{project.description}</p>
                            {project.project_link && (
                              <a href={project.project_link} className="text-blue-600 text-sm hover:underline">
                                View Project →
                              </a>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit('projects', project)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('projects', project.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No projects added yet</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* EDUCATION SECTION */}
          {activeSection === 'education' && (
            <div className="rounded-xl shadow-sm p-5 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                <button 
                  onClick={() => setShowForm('education')}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {showFormSection === 'education' ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Degree</label>
                      <select 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        value={educationForm.degree}
                        onChange={(e) => {
                          setDegreeType(e.target.value);
                          setEducationForm({...educationForm, degree: e.target.value});
                        }}
                      >
                        <option value="">Select Degree</option>
                        <option value="ssc">SSC</option>
                        <option value="hsc">HSC</option>
                        <option value="undergraduate">Undergraduate</option>
                        <option value="postgraduate">Postgraduate</option>
                        <option value="phd">PhD</option>
                      </select>
                    </div>
                    
                    {/* SSC - No additional fields needed */}
                    {degreeType === 'ssc' && (
                      <div className="text-sm text-gray-500">
                        SSC selected - No additional fields required
                      </div>
                    )}
                    
                    {/* HSC - Show Stream field */}
                    {degreeType === 'hsc' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stream</label>
                        <select className="border rounded-lg px-3 py-2 w-full">
                          <option value="">Select Stream</option>
                          <option value="pcm">PCM (Physics, Chemistry, Mathematics)</option>
                          <option value="pcb">PCB (Physics, Chemistry, Biology)</option>
                          <option value="pcbm">PCBM (Physics, Chemistry, Biology, Mathematics)</option>
                          <option value="arts">Arts</option>
                          <option value="commerce">Commerce</option>
                        </select>
                      </div>
                    )}
                    
                    {/* Undergraduate, Postgraduate, PhD - Show Field of Study */}
                    {(degreeType === 'undergraduate' || degreeType === 'postgraduate' || degreeType === 'phd') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Field of Study</label>
                        <select 
                          className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                          value={educationForm.field_of_study}
                          onChange={(e) => {
                            setFieldOfStudy(e.target.value);
                            setEducationForm({...educationForm, field_of_study: e.target.value});
                          }}
                        >
                          <option value="">Select Field</option>
                          {degreeType === 'undergraduate' && (
                            <>
                              <option value="be-btech">BE/BTech</option>
                              <option value="bvoc">B.Voc</option>
                            </>
                          )}
                          {degreeType === 'postgraduate' && (
                            <>
                              <option value="me-btech">ME/MTech</option>
                              <option value="msc">MSc</option>
                              <option value="ma">MA</option>
                              <option value="mcom">MCom</option>
                              <option value="mba">MBA</option>
                              <option value="mca">MCA</option>
                              <option value="llm">LLM</option>
                              <option value="mpharm">MPharm</option>
                              <option value="march">MArch</option>
                              <option value="md">MD</option>
                              <option value="other">Other</option>
                            </>
                          )}
                          {degreeType === 'phd' && (
                            <>
                              <option value="phd-engg">PhD Engineering</option>
                              <option value="phd-science">PhD Science</option>
                              <option value="phd-arts">PhD Arts</option>
                              <option value="phd-commerce">PhD Commerce</option>
                              <option value="phd-medicine">PhD Medicine</option>
                              <option value="phd-pharmacy">PhD Pharmacy</option>
                              <option value="other">Other</option>
                            </>
                          )}
                        </select>
                      </div>
                    )}
                    
                    {fieldOfStudy === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specify Field</label>
                        <input 
                          type="text" 
                          className="border rounded-lg px-3 py-2 w-full"
                          placeholder="Enter field of study"
                        />
                      </div>
                    )}
                    
                    {/* Show Department only for Engineering fields - EXCLUDE SSC and HSC */}
                    {degreeType !== 'ssc' && degreeType !== 'hsc' && (fieldOfStudy === 'be-btech' || fieldOfStudy === 'me-btech' || fieldOfStudy === 'phd-engg') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <select className="border rounded-lg px-3 py-2 w-full">
                          <option value="">Select Department</option>
                          <option value="civil">Civil Engineering</option>
                          <option value="computer">Computer Engineering</option>
                          <option value="it">Information Technology</option>
                          <option value="extc">Electronics & Telecommunication</option>
                          <option value="mechanical">Mechanical Engineering</option>
                          <option value="ai-ds">Artificial Intelligence & Data Science</option>
                          <option value="vlsi">VLSI Design & Technology</option>
                          <option value="advanced-communication">Advanced Communication</option>
                          <option value="electrical">Electrical Engineering</option>
                          <option value="chemical">Chemical Engineering</option>
                          <option value="production">Production Engineering</option>
                          <option value="biomedical">Biomedical Engineering</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Institution</label>
                      <input 
                        type="text" 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        placeholder="e.g., APCOER"
                        value={educationForm.college}
                        onChange={(e) => setEducationForm({...educationForm, college: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">CGPA / Percentage</label>
                      <input 
                        type="text" 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        placeholder="e.g., 8.5 CGPA or 85%"
                        value={educationForm.cgpa}
                        onChange={(e) => setEducationForm({...educationForm, cgpa: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Duration</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Year</label>
                        <input 
                          type="number" 
                          className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                          placeholder="2020"
                          min="2000"
                          max="2030"
                          value={educationForm.start_year}
                          onChange={(e) => setEducationForm({...educationForm, start_year: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Year</label>
                        <input 
                          type="number" 
                          className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                          placeholder="2024"
                          min="2000"
                          max="2030"
                          value={educationForm.end_year}
                          onChange={(e) => setEducationForm({...educationForm, end_year: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2"
                          onChange={(e) => setIsPursuing(e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">Pursuing</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleSave('education')}
                      className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => handleCancel(activeSection)}
                      className="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {education && education.length > 0 ? (
                    education.map((edu) => (
                      <div key={edu.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                            <p className="text-gray-600">{edu.field}</p>
                            <p className="text-gray-500">{edu.college}</p>
                            <p className="text-sm text-gray-400">{edu.start_year} - {edu.end_year || 'Present'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit('education', edu)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('education', edu.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No education added yet</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LANGUAGES SECTION */}
          {activeSection === 'languages' && (
            <div className="rounded-xl shadow-sm p-5 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Languages</h2>
                <button 
                  onClick={() => setShowForm('languages')}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {showFormSection === 'languages' ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Language</label>
                      <input 
                        type="text" 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        placeholder="e.g., English"
                        value={languageForm.language}
                        onChange={(e) => setLanguageForm({...languageForm, language: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Proficiency</label>
                      <select 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        value={languageForm.proficiency}
                        onChange={(e) => setLanguageForm({...languageForm, proficiency: e.target.value})}
                      >
                        <option value="">Select Proficiency</option>
                        <option value="basic">Basic</option>
                        <option value="fluent">Fluent</option>
                        <option value="native">Native</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleSave('languages')}
                      className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => handleCancel(activeSection)}
                      className="border border-blue-200 text-gray-600 rounded-lg px-4 py-2 hover:bg-blue-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {languages && languages.length > 0 ? (
                    languages.map((lang) => (
                      <div key={lang.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-900">{lang.language}</h4>
                            <p className="text-sm text-gray-600">{lang.proficiency}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit('languages', lang)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('languages', lang.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No languages added yet</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ACHIEVEMENTS SECTION */}
          {activeSection === 'achievements' && (
            <div className="rounded-xl shadow-sm p-5 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
                <button 
                  onClick={() => setShowForm('achievements')}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {showFormSection === 'achievements' ? (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
                    <input 
                      type="text" 
                      className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                      placeholder="e.g., Best Project Award"
                      value={achievementForm.title}
                      onChange={(e) => setAchievementForm({...achievementForm, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Date</label>
                    <input 
                      type="date" 
                      className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                      value={achievementForm.date}
                      onChange={(e) => setAchievementForm({...achievementForm, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                    <textarea 
                      className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                      rows="3"
                      placeholder="Describe your achievement..."
                      value={achievementForm.description}
                      onChange={(e) => setAchievementForm({...achievementForm, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleSave('achievements')}
                      className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => handleCancel(activeSection)}
                      className="border border-blue-200 text-gray-600 rounded-lg px-4 py-2 hover:bg-blue-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements && achievements.length > 0 ? (
                    achievements.map((achievement) => (
                      <div key={achievement.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                            <p className="text-gray-600">{achievement.description}</p>
                            <p className="text-sm text-gray-500">{achievement.date}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit('achievements', achievement)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('achievements', achievement.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No achievements added yet</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CERTIFICATIONS SECTION */}
          {activeSection === 'certifications' && (
            <div className="rounded-xl shadow-sm p-5 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Certifications</h2>
                <button 
                  onClick={() => setShowForm('certifications')}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              {showFormSection === 'certifications' ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
                      <input 
                        type="text" 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        placeholder="e.g., AWS Certified Developer"
                        value={certificationForm.title}
                        onChange={(e) => setCertificationForm({...certificationForm, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Organization</label>
                      <input 
                        type="text" 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        placeholder="e.g., Amazon Web Services"
                        value={certificationForm.organization}
                        onChange={(e) => setCertificationForm({...certificationForm, organization: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Year</label>
                      <input 
                        type="number" 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        placeholder="2024"
                        min="2000"
                        max="2030"
                        value={certificationForm.year}
                        onChange={(e) => setCertificationForm({...certificationForm, year: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Credential ID</label>
                      <input 
                        type="text" 
                        className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                        placeholder="e.g., AWS-12345678"
                        value={certificationForm.credential_id}
                        onChange={(e) => setCertificationForm({...certificationForm, credential_id: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleSave('certifications')}
                      className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => handleCancel(activeSection)}
                      className="border border-blue-200 text-gray-600 rounded-lg px-4 py-2 hover:bg-blue-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {certifications && certifications.length > 0 ? (
                    certifications.map((cert) => (
                      <div key={cert.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{cert.title}</h4>
                            <p className="text-gray-600">{cert.organization}</p>
                            <p className="text-sm text-gray-500">{cert.year}</p>
                            {cert.credential_id && (
                              <p className="text-xs text-blue-600">ID: {cert.credential_id}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit('certifications', cert)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('certifications', cert.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No certifications added yet</p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modal Placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editItem ? `Edit ${modalType}` : `Add ${modalType}`}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-500 text-center py-8">
              Form for {modalType} will be implemented here
            </p>
          </div>
        </div>
      )}

      {/* Profile Details Popup */}
      {showProfilePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Edit Profile Details</h2>
              <button 
                onClick={() => setShowProfilePopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Picture */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {userData?.profile_image ? (
                    <img 
                      src={userData.profile_image} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                      <UserCircleIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg">
                    <CameraIcon className="w-4 h-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">First Name</label>
                  <input 
                    type="text" 
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                    value={profileDetailsForm.first_name}
                    onChange={(e) => setProfileDetailsForm({...profileDetailsForm, first_name: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                    value={profileDetailsForm.last_name}
                    onChange={(e) => setProfileDetailsForm({...profileDetailsForm, last_name: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Contact and Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Contact</label>
                  <input 
                    type="tel" 
                    className={`border rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none ${
                      formErrors.phone ? 'border-red-300' : 'border-blue-200'
                    }`}
                    value={profileDetailsForm.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setProfileDetailsForm({...profileDetailsForm, phone: value});
                      if (formErrors.phone) {
                        setFormErrors({...formErrors, phone: ''});
                      }
                    }}
                    placeholder="9370949370"
                    maxLength="10"
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Department</label>
                  <select 
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                    value={profileDetailsForm.department}
                    onChange={(e) => setProfileDetailsForm({...profileDetailsForm, department: e.target.value})}
                  >
                    <option value="">Select Department</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Telecommunication Engineering">Electronics & Telecommunication Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                    <option value="Electronics Engineering (VLSI Design And Technology)">Electronics Engineering (VLSI Design And Technology)</option>
                    <option value="Electronics & Communication (Advanced Communication Technology)">Electronics & Communication (Advanced Communication Technology)</option>
                  </select>
                </div>
              </div>

              {/* Graduation Year */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Graduation Year</label>
                <select 
                  className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:border-blue-400 focus:outline-none"
                  value={profileDetailsForm.graduation_year}
                  onChange={(e) => setProfileDetailsForm({...profileDetailsForm, graduation_year: e.target.value})}
                >
                  <option value="">Select Year</option>
                  {Array.from({length: 2026 - 2012 + 1}, (_, i) => 2012 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button 
                onClick={handleProfileDetailsSave}
                className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setShowProfilePopup(false)}
                className="border border-gray-300 text-gray-700 rounded-lg px-6 py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
