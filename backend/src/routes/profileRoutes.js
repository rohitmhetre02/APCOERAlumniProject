import express from 'express';
import { body, param } from 'express-validator';
import {
  getFullProfile,
  getProfileByUserId,
  updateProfile,
  uploadProfileImage,
  addEducation,
  updateEducation,
  deleteEducation,
  addSkill,
  deleteSkill,
  addLanguage,
  updateLanguage,
  deleteLanguage,
  addExperience,
  updateExperience,
  deleteExperience,
  addProject,
  updateProject,
  deleteProject,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  addCertification,
  updateCertification,
  deleteCertification,
  upload
} from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to authenticate all routes
router.use(authenticateToken);

// Get full profile data
router.get('/', getFullProfile);

// Get profile data by user ID (for alumni details)
router.get('/user/:userId', getProfileByUserId);

// Update main profile
router.post('/',
  [
    body('first_name').optional().isString(),
    body('last_name').optional().isString(),
    body('department').optional().isString(),
    body('graduation_year').optional().isString(),
    body('location').optional().isString(),
    body('contact_number').optional().isString(),
    body('bio').optional().isString()
  ],
  updateProfile
);

// Upload profile image
router.post('/upload-image',
  upload.single('image'),
  uploadProfileImage
);

// Education CRUD
router.post('/education',
  [
    body('degree').notEmpty().withMessage('Degree is required'),
    body('field').notEmpty().withMessage('Field is required'),
    body('college').notEmpty().withMessage('College is required'),
    body('start_year').notEmpty().withMessage('Start year is required'),
    body('end_year').optional().isString(),
    body('cgpa').optional().isString()
  ],
  addEducation
);

router.put('/education/:id',
  [
    param('id').isInt().withMessage('Invalid education ID'),
    body('degree').notEmpty().withMessage('Degree is required'),
    body('field').notEmpty().withMessage('Field is required'),
    body('college').notEmpty().withMessage('College is required'),
    body('start_year').notEmpty().withMessage('Start year is required'),
    body('end_year').optional().isString(),
    body('cgpa').optional().isString()
  ],
  updateEducation
);

router.delete('/education/:id',
  [
    param('id').isInt().withMessage('Invalid education ID')
  ],
  deleteEducation
);

// Skills CRUD
router.post('/skills',
  [
    body('skill_name').notEmpty().withMessage('Skill name is required')
  ],
  addSkill
);

router.delete('/skills/:id',
  [
    param('id').isInt().withMessage('Invalid skill ID')
  ],
  deleteSkill
);

// Languages CRUD
router.post('/languages',
  [
    body('language').notEmpty().withMessage('Language is required'),
    body('proficiency').notEmpty().withMessage('Proficiency is required')
  ],
  addLanguage
);

router.put('/languages/:id',
  [
    param('id').isInt().withMessage('Invalid language ID'),
    body('language').notEmpty().withMessage('Language is required'),
    body('proficiency').notEmpty().withMessage('Proficiency is required')
  ],
  updateLanguage
);

router.delete('/languages/:id',
  [
    param('id').isInt().withMessage('Invalid language ID')
  ],
  deleteLanguage
);

// Experience CRUD
router.post('/experience',
  [
    body('role').notEmpty().withMessage('Role is required'),
    body('company').notEmpty().withMessage('Company is required'),
    body('start_date').notEmpty().withMessage('Start date is required'),
    body('end_date').optional().isString(),
    body('location').optional().isString(),
    body('description').optional().isString()
  ],
  addExperience
);

router.put('/experience/:id',
  [
    param('id').isInt().withMessage('Invalid experience ID'),
    body('role').notEmpty().withMessage('Role is required'),
    body('company').notEmpty().withMessage('Company is required'),
    body('start_date').notEmpty().withMessage('Start date is required'),
    body('end_date').optional().isString(),
    body('location').optional().isString(),
    body('description').optional().isString()
  ],
  updateExperience
);

router.delete('/experience/:id',
  [
    param('id').isInt().withMessage('Invalid experience ID')
  ],
  deleteExperience
);

// Projects CRUD
router.post('/projects',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('tech_stack').optional().isArray(),
    body('project_url').optional().isURL(),
    body('github_url').optional().isURL(),
    body('start_date').optional().isString(),
    body('end_date').optional().isString()
  ],
  addProject
);

router.put('/projects/:id',
  [
    param('id').isInt().withMessage('Invalid project ID'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('tech_stack').optional().isArray(),
    body('project_url').optional().isURL(),
    body('github_url').optional().isURL(),
    body('start_date').optional().isString(),
    body('end_date').optional().isString()
  ],
  updateProject
);

router.delete('/projects/:id',
  [
    param('id').isInt().withMessage('Invalid project ID')
  ],
  deleteProject
);

// Achievements CRUD
router.post('/achievements',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('date').optional().isString(),
    body('type').optional().isString()
  ],
  addAchievement
);

router.put('/achievements/:id',
  [
    param('id').isInt().withMessage('Invalid achievement ID'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('date').optional().isString(),
    body('type').optional().isString()
  ],
  updateAchievement
);

router.delete('/achievements/:id',
  [
    param('id').isInt().withMessage('Invalid achievement ID')
  ],
  deleteAchievement
);


// Certifications CRUD
router.post('/certifications',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('organization').notEmpty().withMessage('Organization is required'),
    body('year').notEmpty().withMessage('Year is required'),
    body('credential_id').optional().isString(),
    body('credential_url').optional().isURL(),
    body('issue_date').optional().isString(),
    body('expiry_date').optional().isString()
  ],
  addCertification
);

router.put('/certifications/:id',
  [
    param('id').isInt().withMessage('Invalid certification ID'),
    body('title').notEmpty().withMessage('Title is required'),
    body('organization').notEmpty().withMessage('Organization is required'),
    body('year').notEmpty().withMessage('Year is required'),
    body('credential_id').optional().isString(),
    body('credential_url').optional().isURL(),
    body('issue_date').optional().isString(),
    body('expiry_date').optional().isString()
  ],
  updateCertification
);

router.delete('/certifications/:id',
  [
    param('id').isInt().withMessage('Invalid certification ID')
  ],
  deleteCertification
);

export default router;
