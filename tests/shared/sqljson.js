"use strict";

describe("sqljson library", () => {

  // Account test data

  var accountData = [{
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
    firstName: 'Candy',
    familyName: 'Lacy'
  }, {
    accountId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
    firstName: 'Arnold',
    familyName: 'Lane'
  }];

  var accountTableCreateJsonSql01 = {
    Sql: `
    CREATE TABLE account (
        account_id CHAR(36) NOT NULL,
        first_name VARCHAR(80) NOT NULL,
        family_name VARHCAR(80) NOT NULL,
        PRIMARY KEY(account_id)
    );`
  };

  var accountTableCreateJsonSql02 = {
    tableDataSql: `
      CREATE TABLE account (
       account_id CHAR(36) NOT NULL,
       first_name VARCHAR(@nameSize@) NOT NULL,
       family_name VARHCAR(@nameSize@) NOT NULL,
       PRIMARY KEY(account_id)
     );`,
    nameSize: 80
  };

  var accountSelectSql = `
      SELECT
        account_id AS accountId,
        first_name AS firstName,
        family_name AS familyName
      FROM account;`;

  var accountSelectJsonSql01 = {
    accountsSql: accountSelectSql,
    accounts: []
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

  var accountInsertJsonSql01 = {
    accountsSql: `INSERT INTO account(account_id, first_name, family_name) VALUES
                    (@accountId@, @firstName@, @familyName@);`,
    accounts: accountData
  };

  var accountDeleteJsonSql01 = {
    accountsSql: `
      DELETE
      FROM account
      WHERE account_id = '961fe224-8943-47fb-b08a-92123d9d7211';`
  };

  var accountsDeleteJsonSql02 = {
    accountsSql: `
      DELETE
      FROM account
      WHERE account_id = @accountId@;`,
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211'
  };

  // Invoice test data

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

  var invoiceTableCreateJsonSql01 = {
    invoiceSql: {
      sql: `
        CREATE TABLE invoice (
          invoice_id CHAR(36) NOT NULL,
          account_id CHAR(36) NOT NULL,
          description VARCHAR(80) NOT NULL,
          PRIMARY KEY(invoice_id)
        );`
    }
  };

  var invoiceInsertJsonSql01 = {
    invoicesSql: {
      sql: `INSERT INTO invoice(invoice_id, account_id, description) VALUES
                  (@invoiceId@, @accountId@, @description@);`
    },
    invoices: invoiceData
  };

  var invoiceSelectSql = `
    SELECT
      invoice_id AS invoiceId,
      account_id AS accountId,
      description
    FROM invoice;`;

  var invoiceSelectJsonSql01 = {
    invoicesSql: invoiceSelectSql,
    invoices: []
  };

  // Invoice Detail

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

  var invoiceDetailTableSql = `
    CREATE TABLE invoice_detail (
      invoice_detail_id CHAR(36) NOT NULL,
      invoice_id CHAR(36) NOT NULL,
      product_description VARCHAR(80),
      quantity INT NOT NULL,
      base_price DECIMAL(18,2) NOT NULL,
      PRIMARY KEY(invoice_detail_id)
    );`

  // Begin tests

  it("010: should not wipeout Object prototype and be a sqljson", () => {
    var sqljson = sqljsonlib.sqljson();
    expect(sqljson, "sqljson").to.be.an("object");
  });

  it("020: should determine correct type of sql statement.", () => {
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

  it("030: should find all sqlJson properties.", () => {
    var sqljson = sqljsonlib.sqljson();
    expect(sqljson._sqlJsonProperties(undefined), 'should be an empty array').to.be.empty;
    expect(sqljson._sqlJsonProperties(null), 'should be an empty array').to.be.empty;
    expect(sqljson._sqlJsonProperties({}), 'should be an empty object').to.be.empty;
    expect(sqljson._sqlJsonProperties({
      accountsSql: 'some sql'
    }), 'should be an empty array').to.eql(['accountsSql']);
    expect(sqljson._sqlJsonProperties({
      accounts: 'some sql'
    }), 'should be an empty array').to.be.empty;
    expect(sqljson._sqlJsonProperties({
      accountsSql: 'some sql',
      invoicesSql: 'more Sql'
    }), 'should be an empty array').to.eql(['accountsSql', 'invoicesSql']);
  });

  it(`040: should return correct results when nothing to convert`, (done) => {
    var repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        var sqljson = sqljsonlib.sqljson(repoSqlite3);
        sqljson.run(undefined, (err, res) => {
          expect(err, 'error shold be undefined').to.be.undefined;
          expect(res, 'result shold be undefined').to.be.undefined;
          sqljson.run(null, (err, res) => {
            expect(err, 'error shold be undefined').to.be.undefined;
            expect(res, 'result shold be undefined').to.be.undefined;
            sqljson.run({}, (err, res) => {
              expect(err, 'error shold be undefined').to.be.undefined;
              expect(res, 'result shold be empty object').to.be.empty;
              expect(res, "result should be an object").to.be.an("object");
              sqljson.run([], (err, res) => {
                expect(err, 'error shold be undefined').to.be.undefined;
                expect(res, 'result shold be empty array').to.be.empty;
                expect(res, "result should be an array").to.be.an("array");
                sqljson.run(5, (err, res) => {
                  expect(err, 'error shold be undefined').to.be.undefined;
                  expect(res, 'result shold be the same number').to.equal(5);
                  sqljson.run('a string', (err, res) => {
                    expect(err, 'error shold be undefined').to.be.undefined;
                    expect(res, 'result shold be the same string').to.equal('a string');
                    done();
                  });
                });
              });
            });
          });
        });
      }
    });
    repoSqlite3.open;
  });
  it(`050: should create a repository and call afterOpen,
          then sqljson should create a table,
          then sqljson should instert data into that table,
          then sqljson should read the data from that table,
          then sqljson should delete a record from the table,
          then sqljson should read again from the table.`, (done) => {

    var repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        var sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreateJsonSql01, (err, res) => {
          expect(err, 'should have no error').to.be.undefined;
          sqljson.run(accountInsertJsonSql01, (err, res) => {
            expect(err, 'should have no error').to.be.undefined;
            sqljson.run(accountSelectJsonSql01, (err, res) => {
              expect(err, 'should have no error').to.be.undefined;
              expect(res.accounts.length, 'should have two items').to.equal(2);
              expect(res.accounts[0].accountId, 'should have correct accountId').to.equal('961fe224-8943-47fb-b08a-92123d9d7211');
              expect(res.accounts[0].firstName, 'should have correct firstName').to.equal('Candy');
              sqljson.run(accountDeleteJsonSql01, (err, res) => {
                expect(err, 'should have no error').to.be.undefined;
                sqljson.run(accountSelectJsonSql01, (err, res) => {
                  expect(err, 'should have no error').to.be.undefined;
                  expect(res.accounts.length, 'should have one item').to.equal(1);
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

  it(`060: should support variable names in create, and delete statements`, (done) => {

    var repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        var sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreateJsonSql02, (err, res) => {
          expect(err, 'should have no error').to.be.undefined;
          sqljson.run(accountInsertJsonSql01, (err, res) => {
            expect(err, 'should have no error').to.be.undefined;
            sqljson.run(accountsSelectJsonSql02, (err, res) => {
              expect(err, 'should have no error').to.be.undefined;
              expect(res.accounts.length, 'should have two items').to.equal(2);
              expect(res.accounts[0].accountId, 'should have correct accountId').to.equal('961fe224-8943-47fb-b08a-92123d9d7211');
              expect(res.accounts[0].firstName, 'should have correct firstName').to.equal('Candy');
              sqljson.run(accountsDeleteJsonSql02, (err, res) => {
                expect(err, 'should have no error').to.be.undefined;
                sqljson.run(accountSelectJsonSql01, (err, res) => {
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

  it(`070: should support more than one sql query at the same object level`, (done) => {

    var selectsAtSameLevelSqlJson = {
      accountsSql: accountSelectSql,
      invoicesSql: invoiceSelectSql
    };

    var repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        var sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreateJsonSql01, (err, res) => {
          expect(err, 'should have no error').to.be.undefined;
          sqljson.run(accountInsertJsonSql01, (err, res) => {
            expect(err, 'should have no error').to.be.undefined;
            sqljson.run(invoiceTableCreateJsonSql01, (err, res) => {
              expect(err, 'should have no error').to.be.undefined;
              sqljson.run(invoiceInsertJsonSql01, (err, res) => {
                expect(err, 'should have no error').to.be.undefined;
                sqljson.run(selectsAtSameLevelSqlJson, (err, res) => {
                  expect(err, 'should have no error').to.be.undefined;
                  expect(res['invoices'], "Should have invoices").to.be.an("array");
                  expect(res['invoices'].length, "Should have 3 invoices").to.equal(3);
                  expect(res['accounts'], "Should have accounts").to.be.an("array");
                  expect(res['accounts'].length, "Should have 2 accounts").to.equal(2);
                  expect(res['invoicesSql'], "Should not contain sql").to.be.undefined;
                  expect(res['accountsSql'], "Should not contain sql").to.be.undefined;
                  expect(selectsAtSameLevelSqlJson['accountsSql'], "Original statement should not change").to.be.a("string");
                  expect(selectsAtSameLevelSqlJson['invoicesSql'], "Original statement should not change").to.be.a("string");
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

  // it(`XXX: should support conversion of one-to-many SQL relationships to hierarchial JSON`, (done) => {

  //   var accountsHierarchySelectJsonSql01 = {
  //     accountsSql: {
  //       sql: `
  //         SELECT
  //         account_id AS accountId,
  //         first_name AS firstName,
  //         family_name AS familyName
  //       FROM account;
  //       `,
  //       invoicesSql: {
  //         sql: `
  //           SELECT
  //             invoice_id AS invoiceId,
  //             account_id AS accountId,
  //             description
  //           FROM invoice
  //           INNER JOIN account ON account_id = invoice.invoice_id;`
  //       }
  //     },
  //     accounts: []
  //   };

  //   var repoSqlite3 = sqljsonlib.repoSqlite3({
  //     afterOpen: () => {
  //       var sqljson = sqljsonlib.sqljson(repoSqlite3);

  //       sqljson.run(accountTableCreateJsonSql01, (err, res) => {
  //         expect(err, 'should have no error').to.be.undefined;
  //         sqljson.run(invoiceTableCreateJsonSql01, (err, res) => {
  //           expect(err, 'should have no error').to.be.undefined;
  //           sqljson.run(accountInsertJsonSql01, (err, res) => {
  //             expect(err, 'should have no error').to.be.undefined;
  //             sqljson.run(invoiceInsertJsonSql01, (err, res) => {
  //               expect(err, 'should have no error').to.be.undefined;
  //               sqljson.run(accountsHierarchySelectJsonSql01, (err, res) => {
  //                 // console.log(res);
  //                 //           expect(err, 'should have no error').to.be.undefined;
  //                 //           expect(res.accounts.length, 'should have two items').to.equal(1);
  //                 //           expect(res.accounts[0].accountId, 'should have correct accountId').to.equal('cb89b50c-65e0-4ed5-a8ed-fb240b3b2830');
  //                 //           expect(res.accounts[0].firstName, 'should have correct firstName').to.equal('Arnold');
  //                 done();
  //               });
  //             });
  //           });
  //         });
  //       });
  //     }
  //   });
  //   repoSqlite3.open;
  // });

});