import EventRegistration from '../models/EventRegistration.js';
import Event from '../models/Event.js';

class EventRegistrationController {
  // Register for an event
  static async register(req, res) {
    try {
      const { event_id, contact_number } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!event_id || !contact_number) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: event_id, contact_number'
        });
      }

      // Check if event exists and is approved
      const event = await Event.findById(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      if (event.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'This event is not available for registration'
        });
      }

      // Check if user has already registered
      const existingRegistration = await EventRegistration.checkExistingRegistration(userId, event_id);
      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: 'You have already registered for this event'
        });
      }

      // Create registration
      const registrationData = {
        event_id,
        user_id: userId,
        contact_number,
        status: 'registered'
      };

      const registration = await EventRegistration.create(registrationData);

      // Get updated event with registration count
      const updatedEvent = await Event.findById(event_id);

      res.status(201).json({
        success: true,
        data: registration,
        event: updatedEvent,
        message: 'Event registration successful'
      });

    } catch (error) {
      console.error('❌ Error registering for event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register for event'
      });
    }
  }

  // Get user's event registrations
  static async getMyRegistrations(req, res) {
    try {
      const userId = req.user.id;

      const registrations = await EventRegistration.getByUserId(userId);

      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('❌ Error fetching registrations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch registrations'
      });
    }
  }

  // Get registrations for a specific event
  static async getEventRegistrations(req, res) {
    try {
      const { eventId } = req.params;

      const registrations = await EventRegistration.getByEventId(eventId);

      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('❌ Error fetching event registrations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event registrations'
      });
    }
  }

  // Get registration statistics
  static async getRegistrationStats(req, res) {
    try {
      const stats = await EventRegistration.getRegistrationStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error fetching registration stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch registration statistics'
      });
    }
  }

  // Cancel registration
  static async cancelRegistration(req, res) {
    try {
      const { registrationId } = req.params;
      const userId = req.user.id;

      const query = `
        UPDATE event_registrations 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [registrationId, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Registration cancelled successfully'
      });
    } catch (error) {
      console.error('❌ Error cancelling registration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel registration'
      });
    }
  }
}

export default EventRegistrationController;
