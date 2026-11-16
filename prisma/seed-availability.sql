-- Default weekly hours for intro calls: Monday to Friday, 10:00 to 16:00 New York.
-- Runs only while AvailabilityRule is empty, so it never doubles up hours that
-- were already set (or edited) from the dashboard.

INSERT INTO "AvailabilityRule" ("id", "dayOfWeek", "startTime", "endTime", "timezone")
SELECT gen_random_uuid()::text, d, '10:00', '16:00', 'America/New_York'
FROM generate_series(1, 5) AS d
WHERE NOT EXISTS (SELECT 1 FROM "AvailabilityRule");
