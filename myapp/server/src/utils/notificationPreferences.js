/**
 * Notification Preferences Service
 * Manages customer notification settings for email, SMS, and WhatsApp
 */

const logger = require('./logger');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Initialize notification preferences table (run once)
 */
async function createNotificationPreferencesTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL UNIQUE REFERENCES customer_user(id) ON DELETE CASCADE,
      
      -- Email Preferences
      email_enabled BOOLEAN DEFAULT TRUE,
      email_order_confirmation BOOLEAN DEFAULT TRUE,
      email_shipment_updates BOOLEAN DEFAULT TRUE,
      email_delivery_confirmation BOOLEAN DEFAULT TRUE,
      email_promotional BOOLEAN DEFAULT FALSE,
      email_newsletter BOOLEAN DEFAULT TRUE,
      email_reviews BOOLEAN DEFAULT TRUE,
      
      -- SMS Preferences
      sms_enabled BOOLEAN DEFAULT FALSE,
      sms_order_confirmation BOOLEAN DEFAULT TRUE,
      sms_shipment_tracking BOOLEAN DEFAULT TRUE,
      sms_delivery_confirmation BOOLEAN DEFAULT TRUE,
      sms_promotional BOOLEAN DEFAULT FALSE,
      sms_otp BOOLEAN DEFAULT TRUE,
      
      -- WhatsApp Preferences
      whatsapp_enabled BOOLEAN DEFAULT FALSE,
      whatsapp_order_updates BOOLEAN DEFAULT TRUE,
      whatsapp_promotional BOOLEAN DEFAULT FALSE,
      whatsapp_support BOOLEAN DEFAULT TRUE,
      
      -- Push Notifications
      push_enabled BOOLEAN DEFAULT FALSE,
      push_order_updates BOOLEAN DEFAULT TRUE,
      push_promotional BOOLEAN DEFAULT FALSE,
      
      -- Do Not Disturb
      do_not_disturb_enabled BOOLEAN DEFAULT FALSE,
      do_not_disturb_start_time TIME,
      do_not_disturb_end_time TIME,
      do_not_disturb_timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
      
      -- Frequency Preferences
      promotional_frequency VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly, never
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_notification_preferences_customer_id 
      ON notification_preferences(customer_id);
  `;

  try {
    await pool.query(sql);
    logger.info('Notification preferences table created');
    return { success: true };
  } catch (error) {
    logger.error(`Failed to create notification preferences table: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Get customer notification preferences
 */
async function getPreferences(customerId) {
  try {
    const result = await pool.query(
      'SELECT * FROM notification_preferences WHERE customer_id = $1',
      [customerId]
    );

    if (result.rows.length === 0) {
      // Create default preferences if not exist
      await createDefaultPreferences(customerId);
      return getPreferences(customerId);
    }

    return { success: true, preferences: result.rows[0] };
  } catch (error) {
    logger.error(`Failed to get notification preferences: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Create default notification preferences for new customer
 */
async function createDefaultPreferences(customerId) {
  try {
    await pool.query(
      `INSERT INTO notification_preferences (customer_id) VALUES ($1)`,
      [customerId]
    );
    logger.info(`Default notification preferences created for customer ${customerId}`);
    return { success: true };
  } catch (error) {
    if (error.code !== '23505') { // Ignore duplicate key error
      logger.error(`Failed to create default preferences: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Update notification preferences
 */
async function updatePreferences(customerId, preferences) {
  const updates = [];
  const values = [];
  let paramCount = 1;

  // Build dynamic update query
  const allowedFields = [
    'email_enabled',
    'email_order_confirmation',
    'email_shipment_updates',
    'email_delivery_confirmation',
    'email_promotional',
    'email_newsletter',
    'email_reviews',
    'sms_enabled',
    'sms_order_confirmation',
    'sms_shipment_tracking',
    'sms_delivery_confirmation',
    'sms_promotional',
    'sms_otp',
    'whatsapp_enabled',
    'whatsapp_order_updates',
    'whatsapp_promotional',
    'whatsapp_support',
    'push_enabled',
    'push_order_updates',
    'push_promotional',
    'do_not_disturb_enabled',
    'do_not_disturb_start_time',
    'do_not_disturb_end_time',
    'do_not_disturb_timezone',
    'promotional_frequency'
  ];

  for (const field of allowedFields) {
    if (preferences.hasOwnProperty(field)) {
      updates.push(`${field} = $${paramCount}`);
      values.push(preferences[field]);
      paramCount++;
    }
  }

  if (updates.length === 0) {
    return { success: false, error: 'No valid fields to update' };
  }

  try {
    values.push(customerId);
    const sql = `
      UPDATE notification_preferences 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(sql, values);

    if (result.rows.length === 0) {
      // Create preferences if don't exist
      await createDefaultPreferences(customerId);
      return updatePreferences(customerId, preferences);
    }

    logger.info(`Notification preferences updated for customer ${customerId}`);
    return { success: true, preferences: result.rows[0] };
  } catch (error) {
    logger.error(`Failed to update preferences: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Enable/disable all notifications
 */
async function setAllNotifications(customerId, enabled) {
  const preferences = {
    email_enabled: enabled,
    sms_enabled: enabled,
    whatsapp_enabled: enabled,
    push_enabled: enabled
  };

  return updatePreferences(customerId, preferences);
}

/**
 * Check if customer should receive notification
 */
async function shouldNotify(customerId, notificationType) {
  /*
    notificationType examples:
    - 'email_order_confirmation'
    - 'sms_shipment_tracking'
    - 'whatsapp_promotional'
    - 'push_order_updates'
  */

  try {
    const result = await pool.query(
      'SELECT * FROM notification_preferences WHERE customer_id = $1',
      [customerId]
    );

    if (result.rows.length === 0) {
      return true; // Default to true if preferences not set
    }

    const prefs = result.rows[0];
    const [channel, type] = notificationType.split('_');

    // Check if channel is enabled
    if (!prefs[`${channel}_enabled`]) {
      return false;
    }

    // Check if notification type is enabled
    if (prefs[notificationType] === false) {
      return false;
    }

    // Check Do Not Disturb window
    if (prefs.do_not_disturb_enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [startHour, startMin] = prefs.do_not_disturb_start_time.split(':').map(Number);
      const [endHour, endMin] = prefs.do_not_disturb_end_time.split(':').map(Number);
      
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      if (startTime < endTime) {
        // Normal window (e.g., 22:00 to 06:00 wraps around)
        if (currentTime >= startTime && currentTime < endTime) {
          return false;
        }
      } else {
        // Wraps around midnight
        if (currentTime >= startTime || currentTime < endTime) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    logger.error(`Failed to check notification preference: ${error.message}`);
    return true; // Default to true on error
  }
}

/**
 * Get notification summary for dashboard
 */
async function getNotificationSummary(customerId) {
  try {
    const result = await pool.query(
      'SELECT * FROM notification_preferences WHERE customer_id = $1',
      [customerId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Preferences not found' };
    }

    const prefs = result.rows[0];
    return {
      success: true,
      summary: {
        channels: {
          email: prefs.email_enabled,
          sms: prefs.sms_enabled,
          whatsapp: prefs.whatsapp_enabled,
          push: prefs.push_enabled
        },
        notifications: {
          orderUpdates: [
            prefs.email_order_confirmation,
            prefs.sms_order_confirmation,
            prefs.whatsapp_order_updates
          ].some(x => x),
          shipmentUpdates: [
            prefs.email_shipment_updates,
            prefs.sms_shipment_tracking,
            prefs.whatsapp_order_updates
          ].some(x => x),
          promotional: [
            prefs.email_promotional,
            prefs.sms_promotional,
            prefs.whatsapp_promotional
          ].some(x => x)
        }
      }
    };
  } catch (error) {
    logger.error(`Failed to get notification summary: ${error.message}`);
    return { success: false, error: error.message };
  }
}

module.exports = {
  createNotificationPreferencesTable,
  getPreferences,
  createDefaultPreferences,
  updatePreferences,
  setAllNotifications,
  shouldNotify,
  getNotificationSummary
};
