-- Phase 5: Email & Notifications Extensions
-- Tables for notification preferences and history

CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE REFERENCES customer_user(id) ON DELETE CASCADE,
  
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

-- Notification history table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer_user(id) ON DELETE CASCADE,
  
  -- Notification details
  notification_type VARCHAR(50) NOT NULL, -- 'order', 'shipment', 'delivery', 'promotion', etc.
  channel VARCHAR(20) NOT NULL, -- 'email', 'sms', 'whatsapp', 'push'
  subject VARCHAR(255),
  message TEXT,
  
  -- Related records
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  order_item_id INTEGER REFERENCES order_items(id) ON DELETE SET NULL,
  
  -- Delivery tracking
  recipient_address VARCHAR(255), -- email, phone, etc.
  external_message_id VARCHAR(100), -- Message ID from Twilio/SendGrid/etc.
  delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed, bounced
  delivery_timestamp TIMESTAMP,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMP,
  
  -- Metadata
  user_agent VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '90 days'
);

CREATE INDEX IF NOT EXISTS idx_notifications_customer_id 
  ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_notification_type 
  ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_status 
  ON notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_notifications_channel 
  ON notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id 
  ON notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
  ON notifications(created_at);

-- Notification template table (for managing templates)
CREATE TABLE IF NOT EXISTS notification_templates (
  id SERIAL PRIMARY KEY,
  
  -- Template identification
  template_name VARCHAR(100) NOT NULL UNIQUE,
  template_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp'
  notification_type VARCHAR(50) NOT NULL, -- 'order_confirmation', 'shipment', etc.
  
  -- Template content
  subject VARCHAR(255),
  body TEXT,
  html_body TEXT,
  short_code TEXT, -- For SMS/WhatsApp (short version)
  
  -- Variables
  required_variables TEXT[], -- JSON array of variable names
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_type 
  ON notification_templates(notification_type);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  customer_id UUID UNIQUE REFERENCES customer_user(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  
  -- Subscription details
  subscription_status VARCHAR(20) DEFAULT 'active', -- active, inactive, unsubscribed
  subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribe_date TIMESTAMP,
  
  -- Preferences
  frequency VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly
  categories TEXT[], -- JSON array of categories
  
  -- Engagement tracking
  total_emails_sent INTEGER DEFAULT 0,
  total_emails_opened INTEGER DEFAULT 0,
  total_emails_clicked INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMP,
  last_email_opened_at TIMESTAMP,
  
  -- Bounce tracking
  bounce_count INTEGER DEFAULT 0,
  bounce_type VARCHAR(20), -- permanent, temporary, complaint
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_customer_id 
  ON newsletter_subscribers(customer_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email 
  ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status 
  ON newsletter_subscribers(subscription_status);

-- SMS gateway logs (for audit trail)
CREATE TABLE IF NOT EXISTS sms_logs (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customer_user(id) ON DELETE SET NULL,
  
  -- Message details
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT,
  message_type VARCHAR(50), -- 'otp', 'confirmation', 'notification', etc.
  
  -- Provider and delivery
  provider VARCHAR(50) DEFAULT 'twilio', -- 'twilio', 'nexmo', etc.
  provider_message_id VARCHAR(100),
  delivery_status VARCHAR(20) DEFAULT 'pending', -- sent, delivered, failed
  delivery_timestamp TIMESTAMP,
  
  -- Cost tracking (in cents)
  cost_cents INTEGER,
  
  -- Error handling
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sms_logs_customer_id 
  ON sms_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_phone_number 
  ON sms_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_logs_delivery_status 
  ON sms_logs(delivery_status);

-- Email gateway logs (for audit trail)
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customer_user(id) ON DELETE SET NULL,
  
  -- Email details
  recipient_email VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255),
  subject VARCHAR(255),
  
  -- Provider and delivery
  provider VARCHAR(50) DEFAULT 'nodemailer', -- 'nodemailer', 'sendgrid', etc.
  provider_message_id VARCHAR(100) UNIQUE,
  delivery_status VARCHAR(20) DEFAULT 'pending', -- sent, delivered, opened, clicked, failed, bounced
  
  -- Engagement tracking
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP,
  bounced BOOLEAN DEFAULT FALSE,
  bounce_type VARCHAR(20), -- permanent, temporary, complaint
  
  -- Error handling
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_logs_customer_id 
  ON email_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email 
  ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_delivery_status 
  ON email_logs(delivery_status);
CREATE INDEX IF NOT EXISTS idx_email_logs_provider_message_id 
  ON email_logs(provider_message_id);

-- Create views for analytics
CREATE OR REPLACE VIEW notification_statistics AS
SELECT 
  DATE(created_at) as notification_date,
  customer_id,
  channel,
  notification_type,
  COUNT(*) as total_count,
  SUM(CASE WHEN delivery_status = 'sent' THEN 1 ELSE 0 END) as sent_count,
  SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END) as delivered_count,
  SUM(CASE WHEN delivery_status = 'failed' THEN 1 ELSE 0 END) as failed_count
FROM notifications
GROUP BY DATE(created_at), customer_id, channel, notification_type
ORDER BY notification_date DESC;

CREATE OR REPLACE VIEW email_engagement_summary AS
SELECT 
  DATE(created_at) as email_date,
  COUNT(*) as total_emails,
  SUM(CASE WHEN opened THEN 1 ELSE 0 END) as opened_count,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked_count,
  SUM(CASE WHEN delivery_status = 'bounced' THEN 1 ELSE 0 END) as bounced_count,
  ROUND(100.0 * SUM(CASE WHEN opened THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
  ROUND(100.0 * SUM(CASE WHEN clicked THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
FROM email_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY email_date DESC;

-- Add comment to tables
COMMENT ON TABLE notification_preferences IS 'Customer notification channel preferences and frequency settings';
COMMENT ON TABLE notifications IS 'Audit trail for all notifications sent to customers';
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscription management and engagement tracking';
COMMENT ON TABLE sms_logs IS 'SMS delivery logs and cost tracking via Twilio';
COMMENT ON TABLE email_logs IS 'Email delivery logs with engagement metrics';
