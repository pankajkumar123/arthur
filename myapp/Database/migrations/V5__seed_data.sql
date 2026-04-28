BEGIN;

INSERT INTO category (name, slug)
VALUES
  ('Office Supplies', 'office-supplies'),
  ('Safety', 'safety'),
  ('Power Tools', 'power-tools'),
  ('Cleaning', 'cleaning'),
  ('Furniture', 'furniture');

INSERT INTO product (category_id, name, description, sku, price, image_url)
SELECT c.id, p.name, p.description, p.sku, p.price, p.image_url
FROM (
  VALUES
    ('office-supplies', 'Ergo Task Chair', 'Premium lumbar support chair.', 'CHAIR-ERG-001', 4500, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=800&auto=format&fit=crop'),
    ('office-supplies', 'LED Desk Lamp', 'Adjustable desk lamp.', 'LAMP-LED-010', 1200, 'https://images.unsplash.com/photo-1453749024858-4bca89bd9edc?q=80&w=800&auto=format&fit=crop'),
    ('office-supplies', 'Wireless Keyboard', 'Compact wireless keyboard.', 'KEYB-WLS-025', 2800, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop'),
    ('safety', 'Industrial Gloves Pack', 'Cut resistance level 5, pack of 12.', 'SAFE-GLV-012', 890, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop'),
    ('power-tools', 'Cordless Drill Kit', '18V kit with 2 batteries and case.', 'TOOL-DRL-018', 9500, 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=800&auto=format&fit=crop'),
    ('cleaning', 'Facility Starter Pack', 'Sanitizers, mops, and refill kits.', 'CLN-STR-001', 3200, 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=800&auto=format&fit=crop')
) AS p(category_slug, name, description, sku, price, image_url)
JOIN category c ON c.slug = p.category_slug;

COMMIT;
