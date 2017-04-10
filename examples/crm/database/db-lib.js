// Support for creating a database and
// inserting test data for CRM demo

let dbSchema = require('./db-schema.sql');

const databaseCreate = {
  sqlJson: {
    sql: dbSchema
  }
};

const loadDbSqlJson = {
  sqlJson: [{
      sql: `INSERT INTO individual(individual_id, first_name, family_name) VALUES
                    (:individualId, :firstName, :familyName);`,
      dataPath: 'individuals',
    }, {
      sql: `INSERT INTO country(country_id, country_alpha_2, country_alpha_3, country_name) VALUES
                    (:countryId, :countryAlpha2, :countryAlpha3, :countryName);`,
      dataPath: 'countries',
    }, {
      sql: `INSERT INTO address_type(address_type_id, display, description ) VALUES
                    (:addressTypeId, :display, :description);`,
      dataPath: 'addressTypes',
    }
  ],
  individuals:   [
    { individualId: '961fe224-8943-47fb-b08a-92123d9d7211', firstName: 'Candy' , familyName: 'Lacy' },
    { individualId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830', firstName: 'Arnold', familyName: 'Lane' }
  ],
  countries: [
    { countryId: 1, countryAlpha2: 'US', countryAlpha3: 'USA', countryName: 'United States of America' }
  ],
  addressTypes: [
    { addressTypeId: 1, display: 'Home', description: 'Home Address' },
    { addressTypeId: 2, display: 'Work', description: 'Work Address' }
  ]
};

module.exports.databaseCreate = databaseCreate;
module.exports.loadDbSqlJson = loadDbSqlJson;