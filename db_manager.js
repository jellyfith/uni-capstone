const sqlite3 = require('sqlite3');
const fs = require('fs');
const { resolve } = require('path');

class Database {
  constructor() {
      this.DB = null;
      // this.initializeDB();
  }
  initializeDB() {
    return new Promise(async (resolve, reject) => {
      let fileLocation = `${__dirname}/vacation_planner.db`;
      if (fs.existsSync(fileLocation) === false) {
        console.log('db_manager::initializeDB::creating new db');
        this.DB = new sqlite3.Database(fileLocation, (err) => {
          if (err) {
            console.error('db_manager::initializeDB::creating::error', new Error(err));
            return console.error(`db_manager::initializeDB::creating::err${err.message}`); 
          }
        });
        // apply db creation script
        //
        await this.createDB(this.DB);
        console.log('db_manager::initializeDB::db created');
        await this.validateDBUpdates();
        resolve();
      } else {
        console.log('db_manager::initializeDB::loading::begin');
        this.DB = new sqlite3.Database(fileLocation, (err) => {
          if (err) { 
            console.error('db_manager::initializeDB::loading::error', new Error(err));
            return console.error(`db_manager::initializeDB::err${err.message}`);
          }
        });
        await this.validateDBUpdates();
        resolve();
        console.log('db_manager::initializeDB::loading::end');
      }
    });
  }
  createDB(db) {
    return new Promise((resolve, reject) => {
      console.log('db_manager::createDB');
      let data = fs.readFileSync('./db_updates/CREATE.sql', 'utf8');
      if (data == null) return console.error('db_manager::createDB::CREATE file not found');
      console.log('db_manager::createDB::creating database');
      db.serialize( () => { 
        db.exec(data);
      });
      resolve();
    });
  }
  validateDBUpdates() {
    return new Promise((resolve, reject) => {
      console.log('db_manager::validateDBUpdates');
      this.DB.serialize(() =>{
        this.DB.get("PRAGMA user_version", (err, db) => {
          if (err) {
            console.error(`db_manager::validateDBUpdates::get user_version::err - ${err}`);
            return;
          }
          if(db == undefined || db.length === 0) return;
          console.log(`db_manager::validateDBUpdates::dbVersion[${db.user_version}]`);
          const file = `./db_updates/DB_UPDATE_${db.user_version}.sql`;
          if(fs.existsSync(file)){
            console.log(`db_manager::validateDBUpdates::db applying[${file}]`);
            fs.readFile(file, 'utf8', (err, data) => {
              if (err) { 
                console.error(`db_manager::validateDBUpdates::db error reading update file[${file}]`);
                return reject(err); // error reading update file
              // throw err; // error reading update file
              }
              console.log(`db_manager::validateDBUpdates::validateDBUpdates::db update begin[${file}]`);
              this.DB.serialize(() => { 
                try {
                  this.DB.exec(data); 
                }
                catch(e) {
                  console.error(e);
                  return reject(e);
                }
                resolve(this.validateDBUpdates());
              });
              console.log(`db_manager::validateDBUpdates::update end[${file}]`);
            });
          } else {
            console.info(`db_manager::validateDBUpdates::db up to date`);
            resolve();
          }
        });
      });
    });
  }

  // Plan functions

  getEvent(id) {
    return new Promise((resolve, reject) => {
      this.DB.get(`SELECT * FROM events WHERE event_id = ${id}`, async (err, edata) => {
        if (edata == null) resolve(null);
        console.log('edata :>> ', edata);
        let activities = [];
        if (edata.activities && edata.activities.length) {
          let aids = edata.activities.split(',');
          console.log('aids :>> ', aids);
          for (let i = 0; i < aids.length; i++) {
            const a = aids[i];
            let activity = await this.getActivity(parseInt(a));
            activities.push(activity);
          }
        }
        resolve({
          event_id: edata.event_id,
          event_title: edata.event_title,
          notes: edata.notes,
          activities: activities
        });
      });
    });
  }
  getActivity(id) {
    return new Promise((resolve, reject) => {
      this.DB.get(`SELECT * FROM activities WHERE activity_id = ${id}`, async (err, adata) => {
        console.log('adata :>> ', adata);
        if (adata == null) resolve(null);
        resolve({
          activity_id: adata.activity_id,
          activity_content: adata.activity_content,
          notes: adata.notes
        });
      });
    });
  }
  getPlan(params) {
    return new Promise((resolve, reject) => {
      var plan = {};
      this.DB.get(`SELECT * FROM plans WHERE plan_id = ${params.plan_id}`, async (err, pdata) => {
        if (pdata == null || pdata.events == null || pdata.events.length == 0) return resolve(plan);
        plan = {
          plan_id: pdata.plan_id,
          plan_name: pdata.plan_name,
          events: []
        }
        
        if (pdata.events.length) {
          let eids = pdata.events.split(',');
          console.log('eids :>> ', eids);
          for (let i = 0; i < eids.length; i++) {
            const e = eids[i];
            let event = await this.getEvent(parseInt(e));
            plan.events.push(event);
          }
        }
        return resolve(plan);
      });
    });
  }

  // Event functions

  setEvent(params) {
    return new Promise((resolve, reject) => {
      if (params == null || params.event_title == null || !params.event_title.length) return reject("invalid parameters");

      const event_id = params.event_id;
      const event_title = params.event_title || "";
      const event_text = params.event_text || "";
      const event_subevent_ids = params.event_subevent_ids || "";

      resolve();
    });
  }

  // Event-Item functions

  setEventItem(params) {
    return new Promise((resolve, reject) => {
      if (params == null || params.event_title == null || !params.event_title.length) return reject("invalid parameters");

      const event_id = params.event_id;
      const event_title = params.event_title || "";
      const event_text = params.event_text || "";
      const event_subevent_ids = params.event_subevent_ids || "";

      resolve();
    });
  }
}

module.exports = new Database();