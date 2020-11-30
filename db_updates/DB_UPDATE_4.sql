PRAGMA user_version=5;
BEGIN TRANSACTION;

DELETE FROM plans;
DELETE FROM events;
DELETE FROM activities;

INSERT OR REPLACE INTO plans (plan_id, plan_name, events) VALUES (1, "Paris Plan", "1,2,3");

INSERT OR REPLACE INTO events (event_id, event_title, activities, notes) VALUES (1, "The Louvre", "1,2", "All tours depart from the Group Reception Area under the Pyramid. Opening hours: 9 a.m.–5:30 p.m. (until 9:30 p.m. on Wednesdays and Fridays)");
INSERT OR REPLACE INTO activities (activity_id, activity_content, notes) VALUES (1, "Winged Victory of Samothrace", "created in about the 2nd century BC");
INSERT OR REPLACE INTO activities (activity_id, activity_content, notes) VALUES (2, "Mona Lisa", "Nephew HAS to see it.");

INSERT OR REPLACE INTO events (event_id, event_title, activities, notes) VALUES (2, "Musée d’Orsay", "3", "");
INSERT OR REPLACE INTO activities (activity_id, activity_content, notes) VALUES (3, "Starry Night Over the Rhône", "They also have works by Renoir and Cézanne!");

INSERT OR REPLACE INTO events (event_id, event_title, activities, notes) VALUES (3, "Eiffel Tower", "", "Wear a mask and get there early! They open at 7:30.");

COMMIT TRANSACTION;