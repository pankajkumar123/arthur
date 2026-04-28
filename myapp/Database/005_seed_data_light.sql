-- Local-only light seed data (no payments)

BEGIN;

INSERT INTO app_user (id, email, password_hash, full_name, phone)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'bcrypt$sample_hash_1', 'Alice Carter', '+15550101')
ON CONFLICT (email) DO NOTHING;

INSERT INTO product (id, sku, name, description, currency, base_price, status)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'SKU-TSHIRT', 'Essential T-Shirt', 'Soft cotton tee', 'USD', 20.00, 'active')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variant (id, product_id, sku, name, price, status)
VALUES
    ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'SKU-TSHIRT-BLK-M', 'Black / M', 22.00, 'active')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO warehouse (id, name, region)
VALUES
    ('88888888-8888-8888-8888-888888888888', 'Primary Warehouse', 'US-WEST')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (id, warehouse_id, product_id, variant_id, on_hand, reserved)
VALUES
    ('aaaaaaaa-1111-1111-1111-aaaaaaaa1111', '88888888-8888-8888-8888-888888888888', NULL, '55555555-5555-5555-5555-555555555555', 50, 0)
ON CONFLICT (warehouse_id, product_id, variant_id) DO NOTHING;

COMMIT;
