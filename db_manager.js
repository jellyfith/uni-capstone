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

  savePlan(params) {
    console.dir("savePlan");
    return new Promise(async (resolve, reject) => {
      let newPlan = {
        plan_id: params.plan_id,
        plan_name: params.plan_name,
        events: ""
      }
      let temp = [];
      if (params.events && params.events.length) {
        for (let i = 0; i < params.events.length; i++) {
          const event = params.events[i];
          let e_data = await this.saveEvent(event);
          console.dir("saveEvent resolved");
          temp.push(e_data.event_id);
        }
        newPlan.events = temp.join(",");
      }
      console.dir("inserting plan");
      this.DB.all(`INSERT OR REPLACE INTO plans (plan_id, plan_name, events) VALUES (${newPlan.plan_id || "NULL"},"${newPlan.plan_name}","${newPlan.events}")`, async (err) => {
        this.DB.get(`SELECT * FROM plans WHERE plan_id = ${newPlan.plan_id || "(SELECT MAX(plan_id) FROM plans)"}`, (err, p_data) => {
          this.getPlan(p_data).then((full) => resolve(full));
        });
      });
    });
  }
  saveEvent(params) {
    console.dir("saveEvent");
    return new Promise(async (resolve, reject) => {
      let newEvent = {
        event_id: params.event_id,
        event_title: params.event_title,
        activities: "",
        notes: params.notes
      }
      let temp = [];
      if (params.activities && params.activities.length > 0) {
        for (let i = 0; i < params.activities.length; i++) {
          const activity = params.activities[i];
          let a_data = await this.saveActivity(activity);
          console.dir("saveActivity resolved");
          temp.push(a_data.activity_id);
        }
        newEvent.activities = temp.join(',');
      }
      console.dir("inserting event");
      this.DB.all(`INSERT OR REPLACE INTO events (event_id, event_title, activities, notes) VALUES (${newEvent.event_id || "NULL"},"${newEvent.event_title}","${newEvent.activities}","${newEvent.notes}")`, async (err) => {
        this.DB.get(`SELECT * FROM events WHERE event_id = ${newEvent.event_id || "(SELECT MAX(event_id) FROM events)"}`, (err, e_data) => {
          resolve(e_data);
        });
      });
    });
  }
  saveActivity(params) {
    console.dir("saveActivity");
    return new Promise((resolve, reject) => {
      console.dir("inserting activity");
      this.DB.all(`INSERT OR REPLACE INTO activities (activity_id, activity_content, notes) VALUES (${params.activity_id || "NULL"},"${params.activity_content}","${params.notes}")`, async (err) => {
        this.DB.get(`SELECT * FROM activities WHERE activity_id = ${params.activity_id || "(SELECT MAX(activity_id) FROM activities)"}`, (err, a_data) => {
          resolve(a_data);
        });
      });
    });
  }

}

module.exports = new Database();