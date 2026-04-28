-- Phase 4: Payment Logs Table
-- Tracks all payment transactions for audit and reporting

CREATE TABLE IF NOT EXISTS payment_logs (
  id SERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customer_user(id) ON DELETE CASCADE,
  
  -- Razorpay Details
  razorpay_order_id VARCHAR(50) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(50) UNIQUE,
  razorpay_signature VARCHAR(255),
  
  -- Payment Information
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method VARCHAR(50) DEFAULT 'razorpay', -- razorpay, credit_card, upi, etc.
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, success, failed, refunded
  
  -- Transaction Details
  transaction_id VARCHAR(100),
  merchant_reference_id VARCHAR(100),
  
  -- Refund Information
  refund_id VARCHAR(50),
  refund_amount NUMERIC(12, 2) DEFAULT 0,
  refund_status VARCHAR(20), -- pending, success, failed
  refund_reason VARCHAR(255),
  
  -- Customer Details (cached)
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Verification
  signature_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  verified_by VARCHAR(50),
  
  -- Metadata
  webhook_received BOOLEAN DEFAULT FALSE,
  webhook_received_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_customer_id ON payment_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_razorpay_order_id ON payment_logs(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_razorpay_payment_id ON payment_logs(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_status ON payment_logs(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at);

-- Add payment_status column to orders table (if not exists)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Add transaction_id column to orders table (if not exists)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);

-- View for payment statistics
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
  DATE(created_at) as payment_date,
  payment_status,
  COUNT(*) as total_transactions,
  COUNT(DISTINCT customer_id) as unique_customers,
  SUM(amount_paise) / 100.0 as total_amount_inr,
  AVG(amount_paise) / 100.0 as avg_amount_inr
FROM payment_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), payment_status
ORDER BY payment_date DESC, payment_status;

-- View for pending payments
CREATE OR REPLACE VIEW pending_payments AS
SELECT 
  pl.id,
  pl.order_id,
  pl.customer_id,
  pl.razorpay_order_id,
  pl.amount_paise / 100.0 as amount_inr,
  pl.created_at,
  o.customer_name,
  o.customer_email
FROM payment_logs pl
JOIN orders o ON pl.order_id = o.id
WHERE pl.payment_status = 'pending'
  AND pl.created_at >= NOW() - INTERVAL '1 day'
ORDER BY pl.created_at DESC;

-- Add comment to table
COMMENT ON TABLE payment_logs IS 'Audit trail for all payment transactions via Razorpay';
