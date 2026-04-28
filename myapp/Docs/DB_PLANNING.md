# Database Planning

## Goals
- Support a live market with Products, Orders, Users, Inventory, and Payments.
- Enforce integrity with foreign keys and constraints.
- Provide indexing for low-latency reads and writes.
- Keep the design ACID-compliant using PostgreSQL defaults and transactions.

## Schema Overview
- Users: `app_user` for customer identities; `user_address` for multiple addresses.
- Products: `product` for catalog items, `product_variant` for variants, and `product_image` for media.
- Inventory: `warehouse` for stock locations, `inventory` for item counts, and `inventory_reservation` for live allocations.
- Orders: `customer_order` as the order header and `order_item` for line items.
- Payments: `payment` records payment attempts and `payment_event` keeps provider webhook/audit history.
- Invoices: `invoice` for billing headers and `invoice_item` for line items with stored PDF metadata.
- Notifications: `notification_outbox` and `notification_attempt` for reliable email/WhatsApp delivery.

## Design Notes
- Monetary columns use `NUMERIC(12,2)` to avoid floating point rounding.
- UUID primary keys provide safe distributed ID generation.
- `inventory_reservation` supports short-lived holds to prevent overselling.
- `payment_event` stores raw provider callbacks in `JSONB` for auditing and dispute resolution.
- `notification_outbox` implements the outbox pattern to keep invoices, email, and WhatsApp in sync.

## Indexing Strategy
- Unique indexes on `email`, `sku`, and `order_number` ensure fast lookups.
- Status-based indexes (`product.status`, `customer_order.status`, `payment.status`) enable common filters.
- Foreign key lookup indexes speed joins (order lines, variants, reservations).

## Security Best Practices
- Use row-level security (RLS) for tenant or per-user data access:
  - Enable RLS on `customer_order`, `order_item`, `payment`, and `user_address`.
  - Create policies that restrict access to `current_setting('app.user_id')`.
- Store only password hashes (e.g., `argon2` or `bcrypt`), never raw passwords.
- Use least-privilege database roles (read-only, app-user, admin).
- Encrypt sensitive secrets in the application, not in the DB.

## Scaling Strategy
- Read scaling: add read replicas and use application-side read/write splitting.
- Write scaling: use partitioning for large tables (`customer_order`, `payment_event`).
- Cache hot data with a dedicated cache layer (e.g., Redis) for product catalog reads.
- Use logical replication and WAL archiving for disaster recovery.
- Monitor bloat and VACUUM / ANALYZE regularly for healthy performance.

## Operational Notes
- Run all schema changes through versioned SQL migrations.
- Keep migrations idempotent and transactional.
- Ensure backups are tested and restore procedures are documented.
