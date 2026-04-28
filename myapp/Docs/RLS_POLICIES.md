# RLS Policy Templates

These templates assume the application sets the session variable `app.user_id` for each request:

```sql
SELECT set_config('app.user_id', '11111111-1111-1111-1111-111111111111', true);
```

## Core Policies

```sql
ALTER TABLE customer_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_address ENABLE ROW LEVEL SECURITY;

CREATE POLICY customer_order_is_owner
    ON customer_order
    USING (user_id = current_setting('app.user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY order_item_matches_order_owner
    ON order_item
    USING (
        EXISTS (
            SELECT 1
            FROM customer_order co
            WHERE co.id = order_item.order_id
              AND co.user_id = current_setting('app.user_id', true)::uuid
        )
    );

CREATE POLICY payment_matches_order_owner
    ON payment
    USING (
        EXISTS (
            SELECT 1
            FROM customer_order co
            WHERE co.id = payment.order_id
              AND co.user_id = current_setting('app.user_id', true)::uuid
        )
    );

CREATE POLICY user_address_is_owner
    ON user_address
    USING (user_id = current_setting('app.user_id', true)::uuid)
    WITH CHECK (user_id = current_setting('app.user_id', true)::uuid);
```

## Admin Access

For admin or service roles, grant `BYPASSRLS` only to tightly controlled roles:

```sql
ALTER ROLE app_admin BYPASSRLS;
```

## Notes
- Use `SECURITY DEFINER` functions carefully; avoid using them to bypass RLS unless audited.
- Combine with least-privilege role grants and parameterized queries.
