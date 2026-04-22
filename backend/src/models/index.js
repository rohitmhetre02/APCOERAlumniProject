// Import all models
import { Education } from './Education.js';
import { Skill } from './Skill.js';
import { Language } from './Language.js';
import { Experience } from './Experience.js';
import { Project } from './Project.js';
import { Achievement } from './Achievement.js';
import { Certification } from './Certification.js';
import { Gallery } from './Gallery.js';

// Export all models for clean imports
export { Education, Skill, Language, Experience, Project, Achievement, Certification, Gallery };

// Initialize all tables
export const initializeAllTables = async () => {
  try {
    console.log('🗄️ Initializing all profile tables...');
    
    await Promise.all([
      Education.createTable(),
      Skill.createTable(),
      Language.createTable(),
      Experience.createTable(),
      Project.createTable(),
      Achievement.createTable(),
      Certification.createTable(),
      Gallery.createTable()
    ]);
    
    // Run migrations for specific tables
   
    await Experience.migrateEmploymentType();
    
   
  } catch (error) {
    console.error('❌ Error initializing profile tables:', error);
    throw error;
  }
};
