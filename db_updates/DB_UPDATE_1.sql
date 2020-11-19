PRAGMA user_version=2;
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
    "event_items" TEXT DEFAULT ""
);

DROP TABLE IF EXISTS event_items;
CREATE TABLE "event_items" (
    "event_item_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT DEFAULT "",
    "content" TEXT DEFAULT ""
);

COMMIT TRANSACTION;