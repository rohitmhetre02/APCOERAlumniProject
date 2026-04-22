import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  TrophyIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  LinkIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import Card from "../components/ui/Card";

const AlumniDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAlumniDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('alumni_token');
        
        if (!token) {
          setError('Please login to view alumni details');
          setLoading(false);
          return;
        }

        // Fetch basic user info
        const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            setError('Alumni profile not found');
          } else {
            throw new Error('Failed to fetch alumni details');
          }
          return;
        }
        
        const userData = await userResponse.json();
        setAlumni(userData.data);

        // Fetch full profile data (skills, experience, projects, etc.)
        try {
          const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/profile/user/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setProfileData(profileData.data);
          }
        } catch (profileError) {
          console.log('Profile data not available:', profileError.message);
          // Continue without profile data - it's optional
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAlumniDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading alumni profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/dashboard/alumni" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Alumni Directory
          </Link>
        </Card>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The alumni profile you're looking for doesn't exist.</p>
          <Link to="/dashboard/alumni" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Alumni Directory
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BACK BUTTON */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Alumni
        </button>
      </div>

      {/* 🔝 SIMPLE PROFILE HERO SECTION */}
<div className="max-w-5xl mx-auto px-4 py-6">
  <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
    
    <div className="flex items-center gap-5">
      
      {/* Profile Image */}
      <div className="relative">
        <img
          src={alumni.profile_image || "https://via.placeholder.com/150"}
          alt="profile"
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
        />

        {/* Verify Icon */}
        <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white">
          <CheckCircleIcon className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* User Info */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {alumni.first_name && alumni.last_name
            ? `${alumni.first_name} ${alumni.last_name}`
            : "Unknown"}
        </h1>

        <p className="text-gray-600 text-sm mt-1">
          {alumni.department || "Department not specified"}
        </p>

        <p className="text-gray-500 text-sm">
          Class of {alumni.passout_year || "N/A"}
        </p>
      </div>
    </div>

  </div>
</div>
      

      {/* 🔹 MAIN CONTENT LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* 📌 QUICK INFO SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              
              {/* SKILLS CARD */}
              {profileData?.skills && profileData.skills.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CodeBracketIcon className="w-4 h-4 text-purple-600" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.slice(0, 6).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                      >
                        {skill.skill_name}
                      </span>
                    ))}
                    {profileData.skills.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                        +{profileData.skills.length - 6} more
                      </span>
                    )}
                  </div>
                </Card>
              )}

              {/* LANGUAGES CARD */}
              {profileData?.languages && profileData.languages.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <GlobeAltIcon className="w-4 h-4 text-cyan-600" />
                    Languages
                  </h3>
                  <div className="space-y-2">
                    {profileData.languages.slice(0, 3).map((lang, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{lang.language}</span>
                        <span className="text-xs text-gray-500">{lang.proficiency}</span>
                      </div>
                    ))}
                    {profileData.languages.length > 3 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{profileData.languages.length - 3} more
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* SOCIAL LINKS CARD */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-600" />
                  Social Links
                </h3>
                <div className="flex gap-2">
                  <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <LinkIcon className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <GlobeAltIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* 📄 MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-6">

            {/* EDUCATION */}
            <Card id="education" className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                  Education
                </h2>
              </div>
              <div className="p-4">
                {profileData?.education && profileData.education.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-0">
                        <div className="absolute left-0 top-0 w-3 h-3 bg-blue-400 rounded-full -translate-x-1/2"></div>
                        <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                          <h3 className="font-semibold text-gray-900 mb-1">{edu.degree}</h3>
                          <p className="text-gray-600 text-sm mb-1">{edu.field}</p>
                          <p className="text-xs text-gray-500 mb-2">{edu.college}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {edu.start_year} - {edu.end_year || 'Present'}
                            </div>
                            {edu.cgpa && (
                              <div className="flex items-center gap-1">
                                <StarIcon className="w-3 h-3 text-yellow-500" />
                                CGPA: {edu.cgpa}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No education details added yet</p>
                  </div>
                )}
              </div>
            </Card>

            
             

            {/* EXPERIENCE */}
            <Card id="experience" className="overflow-hidden">
              <div className="bg-gradient-to-r from-green-100 to-green-200 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5 text-green-600" />
                  Work Experience
                </h2>
              </div>
              <div className="p-4">
                {profileData?.experience && profileData.experience.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.experience.map((exp, index) => (
                      <div key={index} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-0">
                        <div className="absolute left-0 top-0 w-3 h-3 bg-green-400 rounded-full -translate-x-1/2"></div>
                        <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                            {!exp.end_date && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Current</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-1">{exp.company}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" />
                              {exp.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
                            </div>
                          </div>
                          {exp.description && (
                            <p className="text-gray-600 text-xs leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No work experience added yet</p>
                  </div>
                )}
              </div>
            </Card>

            {/* PROJECTS */}
            <Card id="projects" className="overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-100 to-indigo-200 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <RocketLaunchIcon className="w-5 h-5 text-indigo-600" />
                  Projects
                </h2>
              </div>
              <div className="p-4">
                {profileData?.projects && profileData.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileData.projects.map((project, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          {project.link && (
                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-700 transition-colors">
                              <LinkIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">{project.description}</p>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech, techIndex) => (
                              <span key={techIndex} className="px-2 py-1 bg-white text-gray-700 text-xs font-medium rounded-full border border-gray-300">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <RocketLaunchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No projects added yet</p>
                  </div>
                )}
              </div>
            </Card>

            

            {/* ACHIEVEMENTS */}
            <Card id="achievements" className="overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-600" />
                  Achievements
                </h2>
              </div>
              <div className="p-4">
                {profileData?.achievements && profileData.achievements.length > 0 ? (
                  <div className="space-y-3">
                    {profileData.achievements.map((achievement, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <TrophyIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
                            <p className="text-gray-600 text-sm mb-1">{achievement.description}</p>
                            {achievement.date && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {new Date(achievement.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No achievements added yet</p>
                  </div>
                )}
              </div>
            </Card>

            {/* CERTIFICATIONS */}
            <Card id="certifications" className="overflow-hidden">
              <div className="bg-gradient-to-r from-pink-100 to-pink-200 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-pink-600" />
                  Certifications
                </h2>
              </div>
              <div className="p-4">
                {profileData?.certifications && profileData.certifications.length > 0 ? (
                  <div className="space-y-3">
                    {profileData.certifications.map((cert, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                          {cert.credential_url && (
                            <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-700 transition-colors">
                              <LinkIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{cert.issuing_organization}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            Issued: {cert.issue_date && new Date(cert.issue_date).toLocaleDateString()}
                          </div>
                          {cert.expiry_date && (
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        {cert.credential_id && (
                          <p className="text-xs text-gray-500">ID: {cert.credential_id}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No certifications added yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDetails;
