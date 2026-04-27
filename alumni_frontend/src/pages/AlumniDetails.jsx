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
      

      {/* MAIN CONTENT LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* LEFT SIDEBAR - Skills, Languages, Achievements */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              
              {/* SKILLS */}
              {profileData?.skills && profileData.skills.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200"
                      >
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* LANGUAGES */}
              {profileData?.languages && profileData.languages.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
                  <div className="space-y-2">
                    {profileData.languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">{lang.language}</span>
                        <span className="text-xs text-gray-500">{lang.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACHIEVEMENTS */}
              {profileData?.achievements && profileData.achievements.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Achievements</h3>
                  <div className="space-y-3">
                    {profileData.achievements.slice(0, 3).map((achievement, index) => (
                      <div key={index}>
                        <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                        {achievement.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{achievement.description}</p>
                        )}
                      </div>
                    ))}
                    {profileData.achievements.length > 3 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        +{profileData.achievements.length - 3} more achievements
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-6">

            {/* EDUCATION */}
            <div id="education" className="bg-white border border-gray-200 rounded-lg">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Education</h2>
              </div>
              <div className="p-6">
                {profileData?.education && profileData.education.length > 0 ? (
                  <div className="space-y-6">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-6 pb-6 last:border-0 last:pb-0">
                        <div className="relative">
                          <div className="absolute -left-[9px] top-0 w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
                          <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                          <p className="text-gray-600 text-sm mt-1">{edu.field}</p>
                          <p className="text-gray-500 text-sm mt-1">{edu.college}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>{edu.start_year} - {edu.end_year || 'Present'}</span>
                            {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No education details added yet</p>
                  </div>
                )}
              </div>
            </div>

            
             

            {/* EXPERIENCE */}
            <div id="experience" className="bg-white border border-gray-200 rounded-lg">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
              </div>
              <div className="p-6">
                {profileData?.experience && profileData.experience.length > 0 ? (
                  <div className="space-y-6">
                    {profileData.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-6 pb-6 last:border-0 last:pb-0">
                        <div className="relative">
                          <div className="absolute -left-[9px] top-0 w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                            {!exp.end_date && (
                              <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200">Current</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-1">{exp.company}</p>
                          {exp.location && (
                            <p className="text-gray-500 text-sm mb-2">{exp.location}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <span>{new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}</span>
                            {exp.employment_type && (
                              <span className="capitalize">{exp.employment_type.replace('-', ' ')}</span>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No work experience added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* PROJECTS */}
            <div id="projects" className="bg-white border border-gray-200 rounded-lg">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
              </div>
              <div className="p-6">
                {profileData?.projects && profileData.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileData.projects.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900">{project.title}</h3>
                          {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                              <LinkIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">{project.description}</p>
                        {project.tech_stack && project.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tech_stack.map((tech, techIndex) => (
                              <span key={techIndex} className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No projects added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* CERTIFICATIONS */}
            {profileData?.certifications && profileData.certifications.length > 0 && (
              <div id="certifications" className="bg-white border border-gray-200 rounded-lg">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {profileData.certifications.map((cert, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-6 pb-4 last:border-0 last:pb-0">
                        <div className="relative">
                          <div className="absolute -left-[9px] top-0 w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
                          <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{cert.issuing_organization}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            {cert.issue_date && <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>}
                            {cert.expiry_date && <span>Expires: {new Date(cert.expiry_date).toLocaleDateString()}</span>}
                          </div>
                          {cert.credential_id && (
                            <p className="text-xs text-gray-500 mt-1">ID: {cert.credential_id}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDetails;
