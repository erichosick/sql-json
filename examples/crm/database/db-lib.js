// Support for creating a database and
// inserting test data for CRM demo

let dbSchema = require('./db-schema.sql');

const individuals = 
  [{
    individualId: '961fe224-8943-47fb-b08a-92123d9d7211',
    firstName: 'Candy',
    familyName: 'Lacy'
  }, {
    individualId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
    firstName: 'Arnold',
    familyName: 'Lane'
  }];

const databaseCreate = {
  sqlJson: {
    sql: dbSchema
  }
};

const indivisualSqlJson = {
  sqlJson: {
    sql: `INSERT INTO individual(individual_id, first_name, family_name) VALUES
                  (:individualId, :firstName, :familyName);`,
    dataPath: 'individuals',
  },
  individuals: individuals
};
  

module.exports.individuals = individuals;
module.exports.databaseCreate = databaseCreate;
module.exports.indivisualSqlJson = indivisualSqlJson;
