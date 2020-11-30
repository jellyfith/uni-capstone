PRAGMA user_version=3;
BEGIN TRANSACTION;

DROP TABLE IF EXISTS plans;
CREATE TABLE "plans" (
    "plan_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plan_name" TEXT DEFAULT "",
    "events" TEXT DEFAULT ""
);

DROP TABLE IF EXISTS events;
CREATE TABLE "events" (
    "event_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event_title" TEXT DEFAULT "",
    "activities" TEXT DEFAULT "",
    "notes" TEXT DEFAULT ""
);

DROP TABLE IF EXISTS event_items;

DROP TABLE IF EXISTS activities;
CREATE TABLE "activities" (
    "activity_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activity_content" TEXT DEFAULT "",
    "notes" TEXT DEFAULT ""
);

DROP TABLE IF EXISTS notes;
CREATE TABLE "notes" (
    "note_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "note_content" TEXT DEFAULT ""
);

COMMIT TRANSACTION;