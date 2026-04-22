import { pool } from '../config/database.js';
import CloudinaryService from '../services/cloudinaryService.js';
import multer from 'multer';
import { 
  Education, 
  Skill, 
  Language, 
  Experience, 
  Project, 
  Achievement, 
  Certification 
} from '../models/index.js';
import User from '../models/User.js';

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get full profile data
// @desc    Get full profile data by user ID (for alumni details)
// @route   GET /api/profile/user/:userId
// @access  Private
export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user data
    const user = await User.findById(userId);
    
    // Get all related data using models
    const [education, skills, languages, experience, projects, achievements, certifications] = await Promise.all([
      Education.findByUserId(userId),
      Skill.findByUserId(userId),
      Language.findByUserId(userId),
      Experience.findByUserId(userId),
      Project.findByUserId(userId),
      Achievement.findByUserId(userId),
      Certification.findByUserId(userId)
    ]);

    res.status(200).json({
      success: true,
      message: 'Profile data retrieved successfully',
      data: {
        user,
        education,
        skills,
        languages,
        experience,
        projects,
        achievements,
        certifications
      }
    });
  } catch (error) {
    console.error('Error fetching profile by user ID:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile data',
      error: error.message
    });
  }
};

export const getFullProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all related data using models
    const [education, skills, languages, experience, projects, achievements, certifications] = await Promise.all([
      Education.findByUserId(userId),
      Skill.findByUserId(userId),
      Language.findByUserId(userId),
      Experience.findByUserId(userId),
      Project.findByUserId(userId),
      Achievement.findByUserId(userId),
      Certification.findByUserId(userId)
    ]);

    // Get user basic info with all registration data
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email, role, prn_number, contact_number, department, passout_year, is_approved, profile_image FROM users WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: userResult.rows[0],
        education,
        skills,
        languages,
        experience,
        projects,
        achievements,
        certifications
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Update main profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { department, graduation_year, location, contact_number, bio, first_name, last_name } = req.body;

    // Update user details if provided
    if (first_name || last_name || department || contact_number || graduation_year) {
      await pool.query(
        'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), department = COALESCE($3, department), contact_number = COALESCE($4, contact_number), passout_year = COALESCE($5, passout_year) WHERE id = $6',
        [first_name || null, last_name || null, department || null, contact_number || null, graduation_year ? parseInt(graduation_year) : null, userId]
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await CloudinaryService.uploadImage(req.file.buffer);

    // Get current user to delete old image
    const currentUser = await User.findById(userId);

    // Delete old image from Cloudinary if exists
    if (currentUser?.profile_image) {
      try {
        const publicId = currentUser.profile_image.split('/').pop().split('.')[0];
        const cloudinaryPublicId = `alumni-profiles/${publicId}`;
        await CloudinaryService.deleteImage(cloudinaryPublicId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Update user with new image URL
    const user = await User.updateProfileImage(userId, uploadResult.url);

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        url: uploadResult.url,
        user
      }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message
    });
  }
};

// CRUD Operations for Education
export const addEducation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { degree, field, college, start_year, end_year, cgpa } = req.body;

    const education = await Education.create(userId, {
      degree,
      field,
      college,
      start_year,
      end_year,
      cgpa
    });

    res.json({
      success: true,
      message: 'Education added successfully',
      data: education
    });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add education',
      error: error.message
    });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { degree, field, college, start_year, end_year, cgpa } = req.body;

    const education = await Education.update(id, {
      degree,
      field,
      college,
      start_year,
      end_year,
      cgpa
    });

    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education record not found'
      });
    }

    res.json({
      success: true,
      message: 'Education updated successfully',
      data: education
    });
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update education',
      error: error.message
    });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const education = await Education.delete(id, userId);

    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education record not found'
      });
    }

    res.json({
      success: true,
      message: 'Education deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete education',
      error: error.message
    });
  }
};

// CRUD Operations for Skills
export const addSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill_name } = req.body;

    const skill = await Skill.create(userId, { skill_name });

    res.json({
      success: true,
      message: 'Skill added successfully',
      data: skill
    });
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add skill',
      error: error.message
    });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const skill = await Skill.delete(id, userId);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete skill',
      error: error.message
    });
  }
};

// CRUD Operations for Languages
export const addLanguage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, proficiency } = req.body;

    const result = await pool.query(
      'INSERT INTO languages (user_id, language, proficiency, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, language, proficiency, new Date(), new Date()]
    );

    res.json({
      success: true,
      message: 'Language added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding language:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add language',
      error: error.message
    });
  }
};

export const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { language, proficiency } = req.body;

    const result = await pool.query(
      'UPDATE languages SET language = $1, proficiency = $2, updated_at = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [language, proficiency, new Date(), id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    res.json({
      success: true,
      message: 'Language updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating language:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update language',
      error: error.message
    });
  }
};

export const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM languages WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    res.json({
      success: true,
      message: 'Language deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting language:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete language',
      error: error.message
    });
  }
};

// CRUD Operations for Experience
export const addExperience = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role, company, start_date, end_date, location, description } = req.body;

    const result = await pool.query(
      'INSERT INTO experience (user_id, role, company, start_date, end_date, location, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [userId, role, company, start_date, end_date, location, description, new Date(), new Date()]
    );

    res.json({
      success: true,
      message: 'Experience added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add experience',
      error: error.message
    });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { role, company, start_date, end_date, location, description } = req.body;

    const result = await pool.query(
      'UPDATE experience SET role = $1, company = $2, start_date = $3, end_date = $4, location = $5, description = $6, updated_at = $7 WHERE id = $8 AND user_id = $9 RETURNING *',
      [role, company, start_date, end_date, location, description, new Date(), id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    res.json({
      success: true,
      message: 'Experience updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update experience',
      error: error.message
    });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM experience WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    res.json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete experience',
      error: error.message
    });
  }
};

// CRUD Operations for Projects
export const addProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, tech_stack, project_url, github_url } = req.body;

    // Convert tech_stack string to array if it's not already
    const techStackArray = tech_stack ? tech_stack.split(',').map(tech => tech.trim()).filter(tech => tech) : [];

    const projectData = {
      title,
      description,
      tech_stack: techStackArray,
      project_url,
      github_url
    };

    const result = await Project.create(userId, projectData);

    res.json({
      success: true,
      message: 'Project added successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add project',
      error: error.message
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, tech_stack, project_url, github_url } = req.body;

    // Convert tech_stack string to array if it's not already
    const techStackArray = tech_stack ? tech_stack.split(',').map(tech => tech.trim()).filter(tech => tech) : [];

    const result = await pool.query(
      'UPDATE projects SET title = $1, description = $2, tech_stack = $3, project_url = $4, github_url = $5, updated_at = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
      [title, description, techStackArray, project_url, github_url, new Date(), id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};

// CRUD Operations for Achievements
export const addAchievement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, date, type } = req.body;

    const result = await pool.query(
      'INSERT INTO achievements (user_id, title, description, date, type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, title, description, date, type, new Date(), new Date()]
    );

    res.json({
      success: true,
      message: 'Achievement added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add achievement',
      error: error.message
    });
  }
};

export const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, date, type } = req.body;

    const result = await pool.query(
      'UPDATE achievements SET title = $1, description = $2, date = $3, type = $4, updated_at = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [title, description, date, type, new Date(), id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update achievement',
      error: error.message
    });
  }
};

export const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM achievements WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete achievement',
      error: error.message
    });
  }
};


// CRUD Operations for Certifications
export const addCertification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, organization, year, credential_id, credential_url, issue_date, expiry_date } = req.body;

    const result = await pool.query(
      'INSERT INTO certifications (user_id, title, organization, year, credential_id, credential_url, issue_date, expiry_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [userId, title, organization, year, credential_id, credential_url, issue_date, expiry_date, new Date(), new Date()]
    );

    res.json({
      success: true,
      message: 'Certification added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add certification',
      error: error.message
    });
  }
};

export const updateCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, organization, year, credential_id, credential_url, issue_date, expiry_date } = req.body;

    const result = await pool.query(
      'UPDATE certifications SET title = $1, organization = $2, year = $3, credential_id = $4, credential_url = $5, issue_date = $6, expiry_date = $7, updated_at = $8 WHERE id = $9 AND user_id = $10 RETURNING *',
      [title, organization, year, credential_id, credential_url, issue_date, expiry_date, new Date(), id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    res.json({
      success: true,
      message: 'Certification updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating certification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update certification',
      error: error.message
    });
  }
};

export const deleteCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM certifications WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    res.json({
      success: true,
      message: 'Certification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete certification',
      error: error.message
    });
  }
};

// Export upload middleware for routes
export { upload };
