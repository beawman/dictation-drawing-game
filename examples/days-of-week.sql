-- SQL to insert "Days of the Week" word set directly into the database
-- This creates a word set with all 7 days of the week

INSERT INTO wordsets (
    title, 
    "startDate", 
    "endDate", 
    items, 
    "createdBy", 
    active,
    "createdAt"
) VALUES (
    'Days of the Week',                                    -- title
    CURRENT_DATE,                                          -- startDate (today)
    CURRENT_DATE + INTERVAL '7 days',                     -- endDate (7 days from now)
    '[
        {"word": "monday", "order": 1},
        {"word": "tuesday", "order": 2},
        {"word": "wednesday", "order": 3},
        {"word": "thursday", "order": 4},
        {"word": "friday", "order": 5},
        {"word": "saturday", "order": 6},
        {"word": "sunday", "order": 7}
    ]'::jsonb,                                             -- items as JSONB
    'system',                                              -- createdBy (system user)
    true,                                                  -- active (set as active)
    NOW()                                                  -- createdAt (current timestamp)
);