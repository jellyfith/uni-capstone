PRAGMA user_version=1;
BEGIN TRANSACTION;

CREATE TABLE "events" (
    "event_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event_title" TEXT DEFAULT "",
    "event_text" TEXT DEFAULT "",
    "event_subevent_ids" TEXT DEFAULT ""
);

COMMIT TRANSACTION;