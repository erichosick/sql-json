"use strict";

describe("sqljson library", () => {

  var accountTableSql = `CREATE TABLE account (
            account_id CHAR(36) NOT NULL,
            first_name VARCHAR(80) NOT NULL,
            family_name VARHCAR(80) NOT NULL,
            PRIMARY KEY(account_id)
          );`;

  var invoiceTableSql = `CREATE TABLE invoice (
            invoice_id CHAR(36) NOT NULL,
            account_id CHAR(36) NOT NULL,
            description VARCHAR(80) NOT NULL,
            PRIMARY KEY(invoice_id)
          );`;

  var invoiceDetailTableSql = `CREATE TABLE invoice_detail (
                invoice_detail_id CHAR(36) NOT NULL,
                invoice_id CHAR(36) NOT NULL,
                product_description VARCHAR(80),
                quantity INT NOT NULL,
                base_price DECIMAL(18,2) NOT NULL,
                PRIMARY KEY(invoice_detail_id)
              );`

  var accountData = [{
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
    firstName: 'Candy',
    lastName: 'Lacy'
  }, {
    accountId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
    firstName: 'Arnold',
    lastName: 'Lane'
  }];

  var invoiceData = [{
    invoiceId: 'f91dc9ca-bb9d-4952-85ae-b73ac876de7d',
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
    description: 'First Invoice'
  }, {
    invoiceId: 'ad5e6b4d-623b-46f1-a4ae-ba41d40b5dab',
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
    description: 'Second Invoice'
  }, {
    invoiceId: '2d42e427-8f40-47f7-b8d1-dfc1e9ee3237',
    accountId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
    description: 'Third Invoice'
  }];

  var invoiceDetailData = [{
    invoiceDetailId: '17b917e0-49df-4929-ab1d-71a8f7c01f60',
    invoiceId: 'f91dc9ca-bb9d-4952-85ae-b73ac876de7d',
    productDescription: 'Some Book',
    quantity: 1,
    basePrice: 23.45
  }, {
    invoiceDetailId: 'ec4716a8-cad8-4772-8887-e2bfa8bce8ed',
    invoiceId: 'f91dc9ca-bb9d-4952-85ae-b73ac876de7d',
    productDescription: 'Second Book',
    quantity: 2,
    basePrice: 12.00
  }, {
    invoiceDetailId: '34c9e2f6-fd5f-4ba5-981c-8eecf2c6512e',
    invoiceId: 'f91dc9ca-bb9d-4952-85ae-b73ac876de7d',
    productDescription: 'Final Book',
    quantity: 1,
    basePrice: 16.70
  }, {
    invoiceDetailId: '7ac4b44a-614f-44ef-b5a2-e106a75fa341',
    invoiceId: 'ad5e6b4d-623b-46f1-a4ae-ba41d40b5dab',
    productDescription: 'Second Book',
    quantity: 3,
    basePrice: 12.00
  }, {
    invoiceDetailId: 'fad69bfa-ad44-446c-9e46-eee5762781e9',
    invoiceId: 'ad5e6b4d-623b-46f1-a4ae-ba41d40b5dab',
    productDescription: 'Basic Book',
    quantity: 1,
    basePrice: 5.00
  }, {
    invoiceDetailId: '91c1cd85-a9ad-4447-9775-879f68d63ebb',
    invoiceId: '2d42e427-8f40-47f7-b8d1-dfc1e9ee3237',
    productDescription: 'Green Ham',
    quantity: 3,
    basePrice: 22.43
  }];

  var accountTableCreate01 = {
    Sql: accountTableSql
  };

  var accountsDeleteJsonSql01 = {
    accountsSql: `DELETE FROM account WHERE account_id = '961fe224-8943-47fb-b08a-92123d9d7211';`
  };

  var accountsSelectJsonSql01 = {
    accountsSql: `SELECT
                      account_id AS accountId,
                      first_name AS firstName,
                      family_name AS familyName
                    FROM account;`,
    accounts: []
  };

  var accountsInsertJsonSql01 = {
    accountsSql: `INSERT INTO account(account_id, first_name, family_name) VALUES
                    (@accountId@, @firstName@, @familyName@);`,
    accounts: [{
      accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
      firstName: 'Candy',
      familyName: 'Lacy'
    }, {
      accountId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
      firstName: 'Arnold',
      familyName: 'Lane'
    }]
  };

  it("01: should not wipeout Object prototype and be a sqljson", () => {
    var sqljson = sqljsonlib.sqljson();
    expect(sqljson, "sqljson").to.be.an("object");
  });

  it("02: should determine correct type of sql statement.", () => {
    var sqljson = sqljsonlib.sqljson();
    expect(sqljson._sqlStatementType('select * from user;'), 'should be a select statement').to.equal('select');
    expect(sqljson._sqlStatementType('SELECT * from user;'), 'should be a select statement').to.equal('select');
    expect(sqljson._sqlStatementType('update user set name = 5;'), 'should be an update statement').to.equal('update');
    expect(sqljson._sqlStatementType('UPDATE user set name = 5;'), 'should be an update statement').to.equal('update');
    expect(sqljson._sqlStatementType('insert INTO USER(name) VALUES("one");'), 'should be an insert statement').to.equal('insert');
    expect(sqljson._sqlStatementType('INSERT INTO USER(name) VALUES("one");'), 'should be an insert statement').to.equal('insert');
    expect(sqljson._sqlStatementType('delete from user where  FROM USER WHERE Name = "one";'), 'should be a delete statement').to.equal('delete');
    expect(sqljson._sqlStatementType('DELETE FROM USER WHERE Name = "one";'), 'should be a delete statement').to.equal('delete');
    expect(sqljson._sqlStatementType('call some_sp();'), 'should be a call statement').to.equal('call');
    expect(sqljson._sqlStatementType('CALL some_sp();'), 'should be a call statement').to.equal('call');

    expect(sqljson._sqlStatementType('CREATE TABLE Users (user_id INT NOT NULL);'), 'should be a create statement').to.equal('create');
    expect(sqljson._sqlStatementType('create table Users (user_id INT NOT NULL);'), 'should be a create statement').to.equal('create');

    expect(sqljson._sqlStatementType('invalid sql'), 'should be an empty statement').to.equal('');
  });

  it(`03: should create a repository and call afterOpen,
          then sqljson should create a table,
          then sqljson should instert data into that table,
          then sqljson should read the data from that table,
          then sqljson should delete a record from the table,
          then sqljson should read again from the table.`, (done) => {

    var repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        var sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreate01, (err, res) => {
          expect(err, 'should have no error').to.be.undefined;
          sqljson.run(accountsInsertJsonSql01, (err, res) => {
            expect(err, 'should have no error').to.be.undefined;
            sqljson.run(accountsSelectJsonSql01, (err, res) => {
              expect(err, 'should have no error').to.be.undefined;
              expect(res.accounts.length, 'should have two items').to.equal(2);
              expect(res.accounts[0].accountId, 'should have correct accountId').to.equal('961fe224-8943-47fb-b08a-92123d9d7211');
              expect(res.accounts[0].firstName, 'should have correct firstName').to.equal('Candy');
              sqljson.run(accountsDeleteJsonSql01, (err, res) => {
                expect(err, 'should have no error').to.be.undefined;
                sqljson.run(accountsSelectJsonSql01, (err, res) => {
                  expect(err, 'should have no error').to.be.undefined;
                  expect(res.accounts.length, 'should have two items').to.equal(1);
                  expect(res.accounts[0].accountId, 'should have correct accountId').to.equal('cb89b50c-65e0-4ed5-a8ed-fb240b3b2830');
                  expect(res.accounts[0].firstName, 'should have correct firstName').to.equal('Arnold');
                  done();
                });
              });
            });
          });
        });
      }
    });
    repoSqlite3.open;
  });

  it(`03: should support variable names in create, and delete statements`, (done) => {

    var accountTableCreate = {
      tableDataSql: `CREATE TABLE account (
                     account_id CHAR(36) NOT NULL,
                     first_name VARCHAR(@nameSize@) NOT NULL,
                     family_name VARHCAR(@nameSize@) NOT NULL,
                     PRIMARY KEY(account_id)
                   );`,
      nameSize: 80
    };

    // OR so we can do replace multiple variables with the same name
    var accountsSelectJsonSql02 = {
      accountsSql: `SELECT account_id AS accountId,
                         first_name AS firstName,
                         family_name AS familyName
                  FROM account
                  WHERE account_id IN (@accountIds@)
                  OR account_id IN (@accountIds@);`,
      accountIds: ['961fe224-8943-47fb-b08a-92123d9d7211', 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830'],
      accounts: []
    };

    var accountsDeleteJsonSql02 = {
      accountsSql: `DELETE FROM account WHERE account_id = @accountId@;`,
      accountId: '961fe224-8943-47fb-b08a-92123d9d7211'
    };

    var repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        var sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreate, (err, res) => {
          expect(err, 'should have no error').to.be.undefined;
          sqljson.run(accountsInsertJsonSql01, (err, res) => {
            expect(err, 'should have no error').to.be.undefined;
            sqljson.run(accountsSelectJsonSql02, (err, res) => {
              expect(err, 'should have no error').to.be.undefined;
              expect(res.accounts.length, 'should have two items').to.equal(2);
              expect(res.accounts[0].accountId, 'should have correct accountId').to.equal('961fe224-8943-47fb-b08a-92123d9d7211');
              expect(res.accounts[0].firstName, 'should have correct firstName').to.equal('Candy');
              sqljson.run(accountsDeleteJsonSql02, (err, res) => {
                expect(err, 'should have no error').to.be.undefined;
                sqljson.run(accountsSelectJsonSql01, (err, res) => {
                  expect(err, 'should have no error').to.be.undefined;
                  expect(res.accounts.length, 'should have two items').to.equal(1);
                  expect(res.accounts[0].accountId, 'should have correct accountId').to.equal('cb89b50c-65e0-4ed5-a8ed-fb240b3b2830');
                  expect(res.accounts[0].firstName, 'should have correct firstName').to.equal('Arnold');
                  done();
                });
              });
            });
          });
        });
      }
    });
    repoSqlite3.open;
  });

  it(`04: should support conversion from one-to-many to hierarchial JSON`, (done) => {

    var invoiceTableCreate = {
      invoiceSql: {
        sql: invoiceTableSql
      }
    };

    var invoiceInsertJsonSql = {
      invoicesSql: {
        sql: `INSERT INTO invoice(invoice_id, account_id, description) VALUES
                    (@invoiceId@, @accountId@, @description@);`
      },
      invoices: invoiceData
    };

    var repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        var sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreate01, (err, res) => {
          expect(err, 'should have no error').to.be.undefined;
          sqljson.run(invoiceTableCreate, (err, res) => {
            expect(err, 'should have no error').to.be.undefined;
            sqljson.run(accountsInsertJsonSql01, (err, res) => {
              expect(err, 'should have no error').to.be.undefined;
              sqljson.run(invoiceInsertJsonSql, (err, res) => {
                expect(err, 'should have no error').to.be.undefined;
                //         sqljson.run(accountsSelectJsonSql01, (err, res) => {
                //           expect(err, 'should have no error').to.be.undefined;
                //           expect(res.accounts.length, 'should have two items').to.equal(1);
                //           expect(res.accounts[0].accountId, 'should have correct accountId').to.equal('cb89b50c-65e0-4ed5-a8ed-fb240b3b2830');
                //           expect(res.accounts[0].firstName, 'should have correct firstName').to.equal('Arnold');
                done();
                //         });
              });
            });
          });
        });
      }
    });
    repoSqlite3.open;
  });

});