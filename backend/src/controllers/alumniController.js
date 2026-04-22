import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';
import { getAlumniCredentialsTemplate } from '../utils/emailTemplates.js';
import { pool } from '../config/database.js';
import csv from 'csv-parser';
import fs from 'fs';
import crypto from 'node:crypto';

class AlumniController {
  // Get alumni directory (public access for alumni users)
  static async getAlumniDirectory(req, res) {
    try {
      console.log('🔍 Fetching alumni directory...');
      
      // Get alumni list - only approved alumni
      const alumniQuery = `
        SELECT id, first_name, last_name, email, department, passout_year as graduation_year, prn_number, 
               role, status, is_approved, is_first_login, created_at, updated_at
        FROM users 
        WHERE role = 'alumni' AND is_approved = true AND status = 'active'
        ORDER BY created_at DESC
      `;
      
      const alumniResult = await pool.query(alumniQuery);
      
      res.json({
        success: true,
        data: alumniResult.rows,
        message: 'Alumni directory retrieved successfully'
      });
      
    } catch (error) {
      console.error('❌ Error fetching alumni directory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch alumni directory'
      });
    }
  }

  // Get all alumni with stats
  static async getAllAlumni(req, res) {
    try {
      console.log('🔍 Fetching all alumni...');
      
      // Get alumni list
      const alumniQuery = `
        SELECT id, first_name, last_name, email, department, passout_year as graduation_year, prn_number, 
               role, status, is_approved, is_first_login, created_at, updated_at
        FROM users 
        WHERE role = 'alumni'
        ORDER BY created_at DESC
      `;
      
      const alumniResult = await pool.query(alumniQuery);
      
      // Get stats
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
          COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended
        FROM users 
        WHERE role = 'alumni'
      `;
      
      const statsResult = await pool.query(statsQuery);
      
      res.json({
        success: true,
        alumni: alumniResult.rows,
        stats: {
          total: parseInt(statsResult.rows[0].total),
          active: parseInt(statsResult.rows[0].active),
          inactive: parseInt(statsResult.rows[0].inactive),
          suspended: parseInt(statsResult.rows[0].suspended)
        }
      });
      
    } catch (error) {
      console.error('❌ Error fetching alumni:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch alumni data'
      });
    }
  }

  // Add single alumni
  static async addAlumni(req, res) {
    try {
      console.log('🔍 Adding single alumni:', req.body);
      
      const { firstName, lastName, department, email, graduationYear, prnNumber } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !department || !email || !graduationYear || !prnNumber) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided'
        });
      }
      
      // Check if alumni already exists
      const existingQuery = 'SELECT id FROM users WHERE email = $1';
      const existingResult = await pool.query(existingQuery, [email]);
      
      if (existingResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Alumni with this email already exists'
        });
      }
      
      // Generate temporary password
      const temporaryPassword = crypto.randomBytes(8).toString('hex');
      
      console.log('Generated password for alumni:', {
        email,
        temporaryPassword
      });
      
      // Insert alumni using User.create
      const newAlumni = await User.create({
        firstName,
        lastName,
        email,
        password: temporaryPassword,  // Will be hashed in User.create
        prnNumber,
        department,
        passoutYear: graduationYear,
        role: 'alumni',
        isApproved: true,
        isFirstLogin: true,  // Admin-created alumni need to set password
        status: 'inactive'     // Admin-created alumni are immediately active
      });
      
      console.log('✅ Alumni created:', newAlumni);
      
      // Send email with credentials
      try {
        const { subject, html } = getAlumniCredentialsTemplate(firstName, lastName, email, temporaryPassword);
        await sendEmail(email, subject, html);
        
        console.log('✅ Email sent to alumni:', email);
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError);
        // Don't fail the request if email fails
      }
      
      res.status(201).json({
        success: true,
        message: 'Alumni added successfully',
        alumni: newAlumni
      });
      
    } catch (error) {
      console.error('❌ Error adding alumni:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add alumni'
      });
    }
  }

  // Bulk upload alumni
  static async bulkUploadAlumni(req, res) {
    try {
      console.log('🔍 Bulk uploading alumni...');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const results = [];
      const errors = [];
      
      // Parse CSV file
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
      
      console.log(`📊 Parsed ${results.length} records from CSV`);
      
      let successCount = 0;
      let failureCount = 0;
      
      // Process each record
      for (const [index, record] of results.entries()) {
        try {
          const { 
            'First Name': firstName, 
            'Last Name': lastName, 
            'Department': department, 
            'Email': email, 
            'Graduation Year': graduationYear, 
            'PRN Number': prnNumber 
          } = record;
          
          // Validate required fields
          if (!firstName || !lastName || !department || !email || !graduationYear || !prnNumber) {
            errors.push(`Row ${index + 1}: Missing required fields`);
            failureCount++;
            continue;
          }
          
          // Check if alumni already exists
          const existingQuery = 'SELECT id FROM users WHERE email = $1';
          const existingResult = await pool.query(existingQuery, [email]);
          
          if (existingResult.rows.length > 0) {
            errors.push(`Row ${index + 1}: Alumni with email ${email} already exists`);
            failureCount++;
            continue;
          }
          
          // Generate temporary password with fallback
          let temporaryPassword;
          try {
            temporaryPassword = crypto.randomBytes(8).toString('hex');
          } catch (error) {
            console.log('Crypto randomBytes failed, using fallback method:', error.message);
            // Fallback: Generate random password using Math.random()
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            temporaryPassword = Array.from({length: 12}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
          }
          
          console.log('Generated password for alumni:', {
            email,
            temporaryPassword
          });
          
          // Insert alumni using User.create
          const newAlumni = await User.create({
            firstName,
            lastName,
            email,
            password: temporaryPassword,  // Will be hashed in User.create
            prnNumber,
            department,
            passoutYear: graduationYear,
            role: 'alumni',
            isApproved: true,
            isFirstLogin: true,  // Admin-created alumni need to set password
            status: 'active'       // Admin-created alumni are immediately active
          });
          
          // Check if emails should be delayed
          const shouldDelayEmails = req.body.delayEmails === 'true';
          
          // Create email HTML template using centralized template
          const { subject, html } = getAlumniCredentialsTemplate(firstName, lastName, email, temporaryPassword);
          
          if (shouldDelayEmails) {
            // Send email with delay to prevent server overload
            setTimeout(async () => {
              try {
                await sendEmail(email, subject, html);
                console.log(`✅ Email sent to ${email} with ${(index * 2)} second delay`);
              } catch (emailError) {
                console.error(`❌ Error sending delayed email to ${email}:`, emailError);
              }
            }, index * 2000); // 2-second delay for each email (index * 2000ms)
          } else {
            // Send email immediately (original behavior)
            sendEmail(email, subject, html).catch(emailError => {
              console.error(`❌ Error sending email to ${email}:`, emailError);
            });
          }
          
          successCount++;
          console.log(`✅ Alumni ${index + 1} created: ${email}`);
          
        } catch (error) {
          console.error(`❌ Error processing row ${index + 1}:`, error);
          errors.push(`Row ${index + 1}: ${error.message}`);
          failureCount++;
        }
      }
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        message: `Bulk upload completed. ${successCount} alumni added successfully.`,
        count: successCount,
        errors: errors.length > 0 ? errors : undefined
      });
      
    } catch (error) {
      console.error('❌ Error in bulk upload:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process bulk upload'
      });
    }
  }

  // Update alumni
  static async updateAlumni(req, res) {
    try {
      const { id } = req.params;
      const { first_name, last_name, department, graduation_year, prn_number } = req.body;
      
      console.log(`📝 Updating alumni ${id}...`);
      
      // Check if alumni exists
      const existingAlumni = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [id, 'alumni']
      );
      
      if (existingAlumni.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Alumni not found'
        });
      }
      
      // Update alumni
      const updateQuery = `
        UPDATE users 
        SET first_name = $1, last_name = $2, department = $3, passout_year = $4, prn_number = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 AND role = 'alumni'
        RETURNING id, first_name, last_name, email, department, passout_year as graduation_year, prn_number, status
      `;
      
      const result = await pool.query(updateQuery, [
        first_name, last_name, department, graduation_year, prn_number, id
      ]);
      
      console.log(`✅ Alumni ${id} updated successfully`);
      
      res.json({
        success: true,
        message: 'Alumni updated successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Error updating alumni:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update alumni'
      });
    }
  }

  // Suspend alumni
  static async suspendAlumni(req, res) {
    try {
      const { id } = req.params;
      
      console.log(`⏸️ Suspending alumni ${id}...`);
      
      // Check if alumni exists
      const existingAlumni = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [id, 'alumni']
      );
      
      if (existingAlumni.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Alumni not found'
        });
      }
      
      // Suspend alumni
      const result = await pool.query(
        'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND role = $3 RETURNING id, first_name, last_name, email, status',
        ['suspended', id, 'alumni']
      );
      
      console.log(`✅ Alumni ${id} suspended successfully`);
      
      res.json({
        success: true,
        message: 'Alumni suspended successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Error suspending alumni:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to suspend alumni'
      });
    }
  }

  // Activate alumni
  static async activateAlumni(req, res) {
    try {
      const { id } = req.params;
      
      console.log(`▶️ Activating alumni ${id}...`);
      
      // Check if alumni exists
      const existingAlumni = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [id, 'alumni']
      );
      
      if (existingAlumni.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Alumni not found'
        });
      }
      
      // Activate alumni and approve if not already approved
      const result = await pool.query(
        'UPDATE users SET status = $1, is_approved = true, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND role = $3 RETURNING id, first_name, last_name, email, status, is_approved',
        ['active', id, 'alumni']
      );
      
      console.log(`✅ Alumni ${id} activated successfully`);
      
      res.json({
        success: true,
        message: 'Alumni activated successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Error activating alumni:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate alumni'
      });
    }
  }

  // Delete alumni
  static async deleteAlumni(req, res) {
    try {
      const { id } = req.params;
      
      console.log(`🗑️ Deleting alumni ${id}...`);
      
      // Check if alumni exists
      const existingAlumni = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [id, 'alumni']
      );
      
      if (existingAlumni.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Alumni not found'
        });
      }
      
      // Delete alumni (this will cascade delete related data if foreign keys are set up properly)
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id, first_name, last_name, email',
        [id, 'alumni']
      );
      
      console.log(`✅ Alumni ${id} deleted successfully`);
      
      res.json({
        success: true,
        message: 'Alumni deleted successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Error deleting alumni:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete alumni'
      });
    }
  }

  // Get department alumni stats
  static async getDepartmentStats(req, res) {
    try {
      const { department } = req.query;
      
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Department parameter is required'
        });
      }
      
      console.log(`📊 Fetching alumni stats for department: ${department}`);
      
      // Get department alumni stats
      const statsQuery = `
        SELECT 
          COUNT(CASE WHEN is_approved = true THEN 1 END) as approved,
          COUNT(CASE WHEN is_approved = false THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive
        FROM users 
        WHERE role = 'alumni' AND department = $1
      `;
      
      const statsResult = await pool.query(statsQuery, [department]);
      
      const stats = {
        approved: parseInt(statsResult.rows[0].approved) || 0,
        pending: parseInt(statsResult.rows[0].pending) || 0,
        active: parseInt(statsResult.rows[0].active) || 0,
        inactive: parseInt(statsResult.rows[0].inactive) || 0
      };
      
      console.log(`✅ Department stats retrieved for ${department}:`, stats);
      
      res.json({
        success: true,
        message: 'Department alumni stats retrieved successfully',
        stats
      });
      
    } catch (error) {
      console.error('❌ Error fetching department alumni stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch department alumni stats'
      });
    }
  }
}

export default AlumniController;
