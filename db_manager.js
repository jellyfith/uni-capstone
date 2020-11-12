const sqlite3 = require('sqlite3');
const fs = require('fs');

class Database {
  constructor() {
      this.DB = null;
      this.DBVersion = 1;
      this.initializeDB();
  }
  initializeDB() {
    let fileLocation = `${__dirname}/vacation_planner.db`;
    if(fs.existsSync(fileLocation) === false){
      console.log('db_manager::initializeDB::creating new db');
      this.DB = new sqlite3.Database(fileLocation, (err) => {
        if (err) {
          console.error('db_manager::initializeDB::creating::error', new Error(err));
          return console.error(`db_manager::initializeDB::creating::err${err.message}`); 
        }
      });
      // apply db creation script
      //
      this.createDB(this.DB);
      console.log('db_manager::initializeDB::db created');
      this.validateDBUpdates();
    } else {
      console.log('db_manager::initializeDB::loading::begin');
      this.DB = new sqlite3.Database(fileLocation, (err) => {
        if (err) { 
          console.error('db_manager::initializeDB::loading::error', new Error(err));
          return console.error(`db_manager::initializeDB::err${err.message}`);
        }
      });
      this.validateDBUpdates();
      console.log('db_manager::initializeDB::loading::end');
    }
  }
  createDB(db) {
    console.log('db_manager::createDB');
    let data = fs.readFileSync('./db_updates/CREATE.sql', 'utf8');
    if (data == null) return console.error('db_manager::createDB::CREATE file not found');
    console.log('db_manager::createDB::creating database');
    db.serialize( () => { 
      db.exec(data);
    });
  }
  validateDBUpdates() {
    //   return Promise
    console.log('db_manager::validateDBUpdates');
    this.DB.serialize(() =>{
      this.DB.get("PRAGMA user_version", (err, db) => {
        if (err) {
          console.error(`db_manager::validateDBUpdates::get user_version::err - ${err}`);
          return;
        }
        if(db == undefined || db.length === 0) return;
        console.log(`db_manager::validateDBUpdates::dbVersion[${db.user_version}]`);
        if (db.user_version === this.DBVersion) {
          console.info(`db_manager::validateDBUpdates::db up to date`);
          // resolve()
        }
        return console.log('returning');
        const file = `./db_updates/UPDATE_FOR_${this.DBVersion}.sql`;
        console.log(`db_manager::validateDBUpdates::db applying[${file}]`);
        if(fs.existsSync(file)){
          fs.readFile(file, 'utf8', (err, data) => {
            if (err) { 
              console.info(`db_manager::validateDBUpdates::db error reading update file[${file}]`);
              return; // error reading update file
            // throw err; // error reading update file
            }
            console.log(`db_manager::validateDBUpdates::validateDBUpdates::db update begin[${file}]`);
            this.DB.serialize( () => { 
              try{
                this.DB.exec(data); 
              }
              catch(e){
                console.error(e);
              }
              // resolve(this.validateDBUpdates());
            });
            console.log(`db_manager::validateDBUpdates::update end[${file}]`);
          });
        }
        else{
          console.error(`db_manager::update update[${file}] not found.`);
        }
      });
    });
  }
  setEvent(params) {
    return new Promise((resolve, reject) => {
      if (params == null || params.event_title == null || !params.event_title.length) return reject("invalid parameters");

      const event_id = params.event_id;
      const event_title = params.event_title || "";
      const event_text = params.event_text || "";
      const event_subevent_ids = params.event_subevent_ids || "";
      this.DB.all(`INSERT OR REPLACE INTO events (${event_id ? 'event_id,': ''} event_title, event_text, event_subevent_ids) VALUES (${event_id ? event_id + ',' : ''} "${event_title}", "${event_text}", "${event_subevent_ids}")`).then(err => {
        if (err) {
            console.log(`db_manager::setEvents::insert - ${err}`);
            return reject(err);
        }
        if (params.subevents == null || params.subevents.length <= 0) {
          resolve();
        } else {
          params.subevents.forEach(async (event) => {
            await this.DB.setEvent(event);
          });
          resolve();
        }
      });
    });
  }

}

module.exports = new Database();