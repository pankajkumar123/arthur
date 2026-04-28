-- Sample seed data for local/dev environments

BEGIN;

INSERT INTO app_user (id, email, password_hash, full_name, phone)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'bcrypt$sample_hash_1', 'Alice Carter', '+15550101'),
    ('22222222-2222-2222-2222-222222222222', 'bob@example.com', 'bcrypt$sample_hash_2', 'Bob Singh', '+15550102')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_address (id, user_id, label, line1, city, region, postal_code, country_code)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Home', '100 Market St', 'San Francisco', 'CA', '94103', 'US'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Office', '200 Commerce Ave', 'Austin', 'TX', '73301', 'US')
ON CONFLICT (id) DO NOTHING;

INSERT INTO product (id, sku, name, description, currency, base_price, status)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'SKU-TSHIRT', 'Essential T-Shirt', 'Soft cotton tee', 'USD', 20.00, 'active'),
    ('44444444-4444-4444-4444-444444444444', 'SKU-MUG', 'Coffee Mug', 'Ceramic 12oz', 'USD', 12.50, 'active')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variant (id, product_id, sku, name, price, status)
VALUES
    ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'SKU-TSHIRT-BLK-M', 'Black / M', 22.00, 'active'),
    ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'SKU-TSHIRT-WHT-L', 'White / L', 22.00, 'active')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_image (id, product_id, url, is_primary, sort_order)
VALUES
    ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'https://cdn.example.com/products/tshirt.jpg', true, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO warehouse (id, name, region)
VALUES
    ('88888888-8888-8888-8888-888888888888', 'Primary Warehouse', 'US-WEST')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (id, warehouse_id, product_id, variant_id, on_hand, reserved)
VALUES
    ('99999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', NULL, 200, 0),
    ('aaaaaaaa-1111-1111-1111-aaaaaaaa1111', '88888888-8888-8888-8888-888888888888', NULL, '55555555-5555-5555-5555-555555555555', 150, 0),
    ('bbbbbbbb-1111-1111-1111-bbbbbbbb1111', '88888888-8888-8888-8888-888888888888', NULL, '66666666-6666-6666-6666-666666666666', 120, 0)
ON CONFLICT (warehouse_id, product_id, variant_id) DO NOTHING;

INSERT INTO customer_order (id, user_id, order_number, currency, subtotal, tax_total, shipping_total, grand_total, status)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'ORD-10001', 'USD', 44.00, 3.52, 5.00, 52.52, 'paid')
ON CONFLICT (order_number) DO NOTHING;

INSERT INTO order_item (id, order_id, product_id, variant_id, sku, name, quantity, unit_price, line_total)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'SKU-TSHIRT-BLK-M', 'Essential T-Shirt - Black / M', 2, 22.00, 44.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment (id, order_id, provider, provider_ref, amount, currency, status)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'stripe', 'pi_123456', 52.52, 'USD', 'captured')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_event (id, payment_id, event_type, event_payload)
VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'payment_intent.succeeded', '{"provider":"stripe","status":"succeeded"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory_reservation (id, order_id, inventory_id, quantity, status, expires_at)
VALUES
    ('12121212-1212-1212-1212-121212121212', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-1111-1111-1111-aaaaaaaa1111', 2, 'released', now() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

COMMIT;
