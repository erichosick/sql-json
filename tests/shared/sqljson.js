"use strict";

describe("sqljson library", () => {

  // Account test data

  const accountData = [{
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
    firstName: 'Candy',
    familyName: 'Lacy'
  }, {
    accountId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
    firstName: 'Arnold',
    familyName: 'Lane'
  }];

  const accountTableCreateJsonSql01 = {
    sqlJson: {
      sql: `CREATE TABLE account (
              account_id CHAR(36) NOT NULL,
              first_name VARCHAR(80) NOT NULL,
              family_name VARHCAR(80) NOT NULL,
              PRIMARY KEY(account_id)
            );`
    }
  };

  const accountTableCreateJsonSql02 = {
    sqlJson: {
      sql: `
        CREATE TABLE account (
          account_id CHAR(36) NOT NULL,
          first_name VARCHAR(:nameSize) NOT NULL,
          family_name VARHCAR(:nameSize) NOT NULL,
          PRIMARY KEY(account_id)
        );`
    },
    nameSize: 80
  };

  const accountSelectSql = `
      SELECT
        account_id AS accountId,
        first_name AS firstName,
        family_name AS familyName
      FROM account;`;

  const accountSelectJsonSql01 = {
    sqlJson: {
      sql: accountSelectSql,
      dataPath: 'accounts',
      type: 'array'
    }
  };

  const accountSelectCamelSql = `
      SELECT
        account_id,
        first_name,
        family_name
      FROM account;`;

  const accountSelectJsonSqlCamel01 = {
    sqlJson: {
      sql: accountSelectCamelSql,
      dataPath: 'accounts',
      type: 'array'
    }
  };


  // OR so we can do replace multiple variables with the same name
  const accountsSelectJsonSql02 = {
    sqlJson: {
      sql: `SELECT account_id AS accountId,
                         first_name AS firstName,
                         family_name AS familyName
                  FROM account
                  WHERE account_id IN (:accountIds)
                  OR account_id IN (:accountIds);`,
      dataPath: 'accounts',
      type: 'array'
    },
    accountIds: ['961fe224-8943-47fb-b08a-92123d9d7211', 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830']
  };

  const accountInsertJsonSql01 = {
    sqlJson: {
      sql: `INSERT INTO account(account_id, first_name, family_name) VALUES
                    (:accountId, :firstName, :familyName);`,
      dataPath: 'accounts',
    },
    accounts: accountData
  };

  const accountDeleteJsonSql01 = {
    sqlJson: {
      sql: `
      DELETE
      FROM account
      WHERE account_id = '961fe224-8943-47fb-b08a-92123d9d7211';
      `
    }
  };

  const accountsDeleteJsonSql02 = {
    sqlJson: {
      sql: `
        DELETE
        FROM account
        WHERE account_id = :accountId;`
    },
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211'
  };

  // Invoice test data

  const invoiceData = [{
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

  const invoiceTableCreateJsonSql01 = {
    sqlJson: {
      sql: `
        CREATE TABLE invoice (
          invoice_id CHAR(36) NOT NULL,
          account_id CHAR(36) NOT NULL,
          description VARCHAR(80) NOT NULL,
          PRIMARY KEY(invoice_id)
        );`
    }
  };

  const invoiceInsertJsonSql01 = {
    sqlJson: {
      sql: `INSERT INTO invoice(invoice_id, account_id, description) VALUES
                  (:invoiceId, :accountId, :description);`,
      dataPath: 'invoices'
    },
    invoices: invoiceData
  };

  const invoiceSelectSql = `
    SELECT
      invoice_id AS invoiceId,
      account_id AS accountId,
      description
    FROM invoice;`;

  const invoiceSelectJsonSql01 = {
    sqlJson: {
      sql: invoiceSelectSql,
      dataPath: 'invoices',
      type: 'array'
    }
  };

  // Invoice Detail

  const invoiceDetailData = [{
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

  const invoiceDetailTableSql = `
    CREATE TABLE invoice_detail (
      invoice_detail_id CHAR(36) NOT NULL,
      invoice_id CHAR(36) NOT NULL,
      product_description VARCHAR(80),
      quantity INT NOT NULL,
      base_price DECIMAL(18,2) NOT NULL,
      PRIMARY KEY(invoice_detail_id)
    );`

  const accountInvoiceHierachy = [{
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
    firstName: 'Candy',
    familyName: 'Lacy',
    invoices: [{
      invoiceId: 'f91dc9ca-bb9d-4952-85ae-b73ac876de7d',
      accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
      description: 'First Invoice'
    }, {
      invoiceId: 'ad5e6b4d-623b-46f1-a4ae-ba41d40b5dab',
      accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
      description: 'Second Invoice'
    }]
  }, {
    accountId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
    firstName: 'Arnold',
    familyName: 'Lane',
    invoices: [{
      invoiceId: '2d42e427-8f40-47f7-b8d1-dfc1e9ee3237',
      accountId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
      description: 'Third Invoice'
    }]
  }];

  const invoiceAccountHierachy = [{
    invoiceId: 'f91dc9ca-bb9d-4952-85ae-b73ac876de7d',
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
    description: 'First Invoice',
    accounts: [{
      accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
      firstName: 'Candy',
      familyName: 'Lacy'
    }]
  }, {
    invoiceId: 'ad5e6b4d-623b-46f1-a4ae-ba41d40b5dab',
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
    description: 'Second Invoice',
    accounts: [{
      accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
      firstName: 'Candy',
      familyName: 'Lacy'
    }]
  }, {
    invoiceId: '2d42e427-8f40-47f7-b8d1-dfc1e9ee3237',
    accountId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
    description: 'Third Invoice',
    accounts: [{
      accountId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
      firstName: 'Arnold',
      familyName: 'Lane'
    }]
  }];

  // Begin tests

  it("010: should not wipeout Object prototype and be a sqljson", () => {
    const sqljson = sqljsonlib.sqljson();
    expect(sqljson, "sqljson").to.be.an("object");
  });

  it("020: should determine correct type of sql statement.", () => {
    const sqljson = sqljsonlib.sqljson();
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

  it("030: should return correct sqlJson properties.", () => {
    const sqljson = sqljsonlib.sqljson();
    expect(sqljson._sqlJsonProperties(undefined), 'should be an empty array').to.deep.equal([]);
    expect(sqljson._sqlJsonProperties(null), 'should be an empty array').to.deep.equal([]);
    expect(sqljson._sqlJsonProperties({}), 'should be an empty object').to.deep.equal([]);

    const testSqlJson = {
      sqlJson: {
        sql: 'some sql'
      },
      randomStuff: 'stuff'
    };
    const testSqlJsonExpected = [{
      sql: 'some sql'
    }];

    expect(sqljson._sqlJsonProperties(testSqlJson), 'should add the single json object to an array').to.eql(testSqlJsonExpected);

    const testSqlJson2 = {
      sqlJson: [{
        sql: 'some sql'
      }, {
        sql: 'more sql'
      }],
      randomStuff: 'stuff'
    };
    const testSqlJson2Expected = [{
      sql: 'some sql'
    }, {
      sql: 'more sql'
    }]

    expect(sqljson._sqlJsonProperties(testSqlJson2), 'should keep the existing array').to.eql(testSqlJson2Expected);
  });

  it("035: should create a hierarchy from two jsons.", () => {

    const accountData01 = JSON.parse(JSON.stringify(accountData)); // tests are destructive
    const invoiceData01 = JSON.parse(JSON.stringify(invoiceData));

    const sqljson = sqljsonlib.sqljson();
    expect(sqljson._sqlJsonMergeHierarchy(undefined, undefined, undefined, undefined), 'should be empty without parent or association').to.deep.equal({});
    expect(sqljson._sqlJsonMergeHierarchy(null, null, null, null), 'should be empty without parent or association').to.deep.equal({});

    const selfObject = {
      self: 1
    };

    expect(sqljson._sqlJsonMergeHierarchy(selfObject, undefined, undefined, undefined), 'should be return self without association or property').to.deep.equal(selfObject);
    expect(sqljson._sqlJsonMergeHierarchy(selfObject, null, null, null), 'should be return self without association or property').to.deep.equal(selfObject);

    expect(sqljson._sqlJsonMergeHierarchy(accountData01, invoiceData01, undefined, 'invoices'), 'should be return self without association').to.deep.equal(accountData);
    expect(sqljson._sqlJsonMergeHierarchy(accountData01, invoiceData01, null, 'invoices'), 'should be return self without association').to.deep.equal(accountData);

    const relationship = {
      parent: 'accountId',
      child: 'accountId',
      type: 'array'
    };
    expect(sqljson._sqlJsonMergeHierarchy(accountData01, invoiceData01, relationship, undefined), 'should be empty without any property').to.deep.equal(accountData);
    expect(sqljson._sqlJsonMergeHierarchy(accountData01, invoiceData01, relationship, null), 'should be empty without any property').to.deep.equal(accountData);

    const mergeResult = sqljson._sqlJsonMergeHierarchy(accountData01, invoiceData01, relationship, 'invoices');
    expect(accountData01, 'should return an account/invoice hierarchy').to.deep.equal(accountInvoiceHierachy);
    expect(mergeResult, 'should return an account/invoice hierarchy').to.deep.equal(accountInvoiceHierachy);

    const accountData02 = JSON.parse(JSON.stringify(accountData)); // tests are destructive
    const invoiceData02 = JSON.parse(JSON.stringify(invoiceData));
    const mergeResult2 = sqljson._sqlJsonMergeHierarchy(invoiceData02, accountData02, relationship, 'accounts');
    expect(invoiceData02, 'should return an invoice/account hierarchy').to.deep.equal(invoiceAccountHierachy);
    expect(mergeResult2, 'should return an invoice/account hierarchy').to.deep.equal(invoiceAccountHierachy);

    // TODO: Test cases where there is an invalid relationship.
  });

  it(`040: should return correct results when nothing to convert`, (done) => {
    const repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        const sqljson = sqljsonlib.sqljson(repoSqlite3);
        sqljson.run(undefined, (err, res) => {
          expect(err, 'error shold be undefined').to.be.undefined;
          expect(res, 'result shold be undefined').to.be.undefined;
          sqljson.run(null, (err, res) => {
            expect(err, 'error shold be undefined').to.be.undefined;
            expect(res, 'result shold be undefined').to.be.undefined;
            sqljson.run({}, (err, res) => {
              expect(err, 'error shold be undefined').to.be.undefined;
              expect(res, "result should be an array").to.deep.equal({});
              sqljson.run([], (err, res) => {
                expect(err, 'error shold be undefined').to.be.undefined;
                expect(res, "result should be an array").to.deep.equal([]);
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

    const accountData01 = JSON.parse(JSON.stringify(accountData)); // tests could be destructive

    const accountSelectJsonSql02 = JSON.parse(JSON.stringify(accountSelectJsonSql01));

    const repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        const sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreateJsonSql01, (err, res) => {
          expect(err, 'should have no error').to.be.undefined;
          sqljson.run(accountInsertJsonSql01, (err, res) => {
            expect(err, 'should have no error').to.be.undefined;
            sqljson.run(accountSelectJsonSql02, (err, res) => {
              expect(err, 'should have no error').to.be.undefined;
              expect(res, 'should return correct json').to.deep.equal({
                accounts: accountData01
              });
              sqljson.run(accountDeleteJsonSql01, (err, res) => {
                expect(err, 'should have no error').to.be.undefined;
                sqljson.run(accountSelectJsonSql02, (err, res) => {
                  expect(err, 'should have no error').to.be.undefined;
                  expect(res, 'should return correct json').to.deep.equal({
                    accounts: [accountData01[1]]
                  });
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

    const accountData01 = JSON.parse(JSON.stringify(accountData)); // tests could be destructive

    const repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        const sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreateJsonSql02, (err, res) => {
          expect(err, 'should have no error').to.be.undefined;
          // TODO: May want something else to return>
          expect(res, 'should return empty object.').to.deep.equal({});
          sqljson.run(accountInsertJsonSql01, (err, res) => {
            expect(err, 'should have no error').to.be.undefined;
            // TODO: May want something else to return>
            expect(res, 'should return empty object.').to.deep.equal({});
            sqljson.run(accountsSelectJsonSql02, (err, res) => {
              expect(err, 'should have no error').to.be.undefined;
              expect(res, 'should return correct json').to.deep.equal({
                accounts: accountData01
              });
              sqljson.run(accountsDeleteJsonSql02, (err, res) => {
                expect(err, 'should have no error').to.be.undefined;
                sqljson.run(accountSelectJsonSql01, (err, res) => {
                  expect(err, 'should have no error').to.be.undefined;
                  expect(res, 'should return correct json').to.deep.equal({
                    accounts: [accountData01[1]]
                  });
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

    const accountData01 = JSON.parse(JSON.stringify(accountData)); // tests could be destructive
    const invoiceData01 = JSON.parse(JSON.stringify(invoiceData)); // tests could be destructive

    const selectsAtSameLevelSqlJson = {
      sqlJson: [{
        sql: JSON.parse(JSON.stringify(accountSelectSql)),
        dataPath: 'accounts',
        type: 'array'
      }, {
        sql: JSON.parse(JSON.stringify(invoiceSelectSql)),
        dataPath: 'invoices',
        type: 'array'
      }, ]
    };

    const invoiceInsertJsonSql02 = JSON.parse(JSON.stringify(invoiceInsertJsonSql01)); // tests could be destructive

    const repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        const sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreateJsonSql01, (err, res) => {
          expect(err, 'should have no error').to.be.undefined;
          sqljson.run(accountInsertJsonSql01, (err, res) => {
            expect(err, 'should have no error').to.be.undefined;
            sqljson.run(invoiceTableCreateJsonSql01, (err, res) => {
              expect(err, 'should have no error').to.be.undefined;
              sqljson.run(invoiceInsertJsonSql02, (err, res) => {
                expect(err, 'should have no error').to.be.undefined;
                sqljson.run(selectsAtSameLevelSqlJson, (err, res) => {
                  expect(err, 'should have no error').to.be.undefined;
                  expect(res, 'should return correct json').to.deep.equal({
                    accounts: accountData01,
                    invoices: invoiceData01
                  });
                  expect(selectsAtSameLevelSqlJson.sqlJson, "Original statement should not change").to.be.an("array");
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

  it(`080: should fail nicely when an invalid sql statement is ran
             and there is more than one sql query at the same object level`, (done) => {

    const selectsAtSameLevelSqlJson = {
      sqlJson: [{
        sql: `SELECT * FROM NoSuchTable`,
        dataPath: 'accounts',
        type: 'array'
      }, {
        sql: JSON.parse(JSON.stringify(invoiceSelectSql)),
        dataPath: 'invoices',
        type: 'array'
      }, ]
    };

    const invoiceInsertJsonSql02 = JSON.parse(JSON.stringify(invoiceInsertJsonSql01)); // tests could be destructive

    const repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        const sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreateJsonSql01, (err, res) => {
          expect(err, 'should have no error').to.be.undefined;
          sqljson.run(accountInsertJsonSql01, (err, res) => {
            expect(err, 'should have no error').to.be.undefined;
            sqljson.run(invoiceTableCreateJsonSql01, (err, res) => {
              expect(err, 'should have no error').to.be.undefined;
              sqljson.run(invoiceInsertJsonSql02, (err, res) => {
                expect(err, 'should have no error').to.be.undefined;
                sqljson.run(selectsAtSameLevelSqlJson, (err, res) => {
                  expect(err.code, 'should return correct code').to.equal('SQLITE_ERROR');
                  expect(err.errno, 'should return correct error number').to.equal(1);
                  expect(res, 'should have no result').to.be.undefined;
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

  it(`090: should support conversion of one-to-many SQL relationships to hierarchial JSON`, (done) => {

    const accountsHierarchySelectJsonSql01 = {
      sqlJson: [{
        sql: `SELECT
                account_id AS accountId,
                first_name AS firstName,
                family_name AS familyName
              FROM account;`,
        dataPath: 'accounts',
        type: 'array',
        sqlJson: {
          sql: `SELECT
                  invoice_id AS invoiceId,
                  account_id AS accountId,
                  description
                FROM invoice;`,
          dataPath: 'invoices',
          type: 'array',
          relationship: {
            parent: 'accountId',
            child: 'accountId',
            type: 'array'
          }
        }
      }]
    };

    const invoiceInsertJsonSql02 = JSON.parse(JSON.stringify(invoiceInsertJsonSql01)); // tests could be destructive

    const repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        const sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreateJsonSql01, (err, res) => {
          expect(err, 'should have no error 1').to.be.undefined;
          sqljson.run(invoiceTableCreateJsonSql01, (err, res) => {
            expect(err, 'should have no error 2').to.be.undefined;
            sqljson.run(accountInsertJsonSql01, (err, res) => {
              expect(err, 'should have no error 3').to.be.undefined;
              sqljson.run(invoiceInsertJsonSql02, (err, res) => {
                expect(err, 'should have no error 4').to.be.undefined;
                sqljson.run(accountsHierarchySelectJsonSql01, (err, res) => {
                  expect(err, 'should have no error 5').to.be.undefined;
                  expect(res, 'should return an account/invoice hierarchy').to.deep.equal({
                    accounts: accountInvoiceHierachy
                  });
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

  it(`100: should convert from SQL snake-case to JavaScript camelCase by default`, (done) => {

    const accountData01 = JSON.parse(JSON.stringify(accountData)); // tests could be destructive

    const accountSelectJsonSqlCamel02 = JSON.parse(JSON.stringify(accountSelectJsonSqlCamel01));

    const repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        const sqljson = sqljsonlib.sqljson(repoSqlite3);

        sqljson.run(accountTableCreateJsonSql01, (err, res) => {
          expect(err, 'should have no error').to.be.undefined;
          sqljson.run(accountInsertJsonSql01, (err, res) => {
            expect(err, 'should have no error').to.be.undefined;
            sqljson.run(accountSelectJsonSqlCamel02, (err, res) => {
              expect(err, 'should have no error').to.be.undefined;
              expect(res, 'should return correct json').to.deep.equal({
                accounts: accountData01
              });
              done();
            });
          });
        });
      }
    });
    repoSqlite3.open;
  });

});