# *SqlJson*

*SqlJson* is a standard **data format** used to convert *SQL* to *JSON* and *JSON* to *SQL*.

*SqlJson* is especially useful for mapping hierarchial *JSON* to *SQL* and visa versa.

**Warning**: This is a new project and we're working on the standard. As such, it may change.

## Introduction

We hope this standard will be implemented in different languages (Java, Javascript, C#, Objective-C, etc.). We're starting with Javascript due to it's native support of *JSON*.

### What *SqlJson* Isn't!

* *SqlJson* is **not** an ORM (Object Resource Manager)[^1]. It is a data format.
* *SqlJson*, at this time, does not support transactions.
* *SqlJson* does not understand models[^2].
* *SqlJson* does not validate *SQL*. It is a data format.
* *SqlJson*, currently, does not know what flavor of *SQL* is being used.

# Documentation

## SqlJson: Introduction

### SqlJson: Basic Format

The *SqlJson* has the following basic format:

```
{
  sqlJson: {
    sql: `SELECT * FROM NoSuchTable`,
    propertyName: 'accounts',
    type: 'array'
  }
}


*SqlJson* looks for properties ending with the word **Sql**, runs the **SQL** in that property, creates a new object with a property of the same name minus the word **Sql** and places the result in that property.

The following **SqlJson**:

```js
{
  accountsSql: `SELECT * FROM account;`
}
```

becomes:

```js
{
  accounts: <account data>
}
```

### SqlJson: Additional Sql Meta-Data

Use the following if you need to provide additional *SQL* meta-data:

```js
{
  accountsSql: {
    sql: `SELECT * FROM account;`,
    resultType: 'array',
    propertyName: 'acct'
  }
}
```

becomes:

```js
{
  acct: [<account data>]
}
```

Note the *acct* property is now an array.

TODO: Implement *propertyName*.

## Choosing The Result Type

The results of a *SQL* call can be one of the following:

* A primitive type: string, number, etc.
* An *object*: {}
* An *array*: []

### An Array

```js
{
  accountsSql: `SELECT * FROM account;`,
  accounts: []
}
```

Because the *accounts* property is initialized to an *array*, *SqlJson* will populate the *array* with the results of the *Sql* call: even if only one item is returned. SqlJson will leave the *array* empty if no items are returned.

### An Object

```js
{
  accountsSql: 'SELECT * FROM account WHERE account_id = 1;',
  accounts: {}
}
```

Because the *accounts* property is initialized to an *object*, *SqlJson* will populate the object with the results of the *Sql* call. An exception is thrown if more than one row is returned from the *Sql* call. If no rows are returned, accounts would be set to undefined[^3].

### A primitive type

```js
{
  accountNameSql: `
    SELECT account_name AS accountName
    FROM account
    WHERE account_id = 1;`,
  accountName: ''
}
```

Because the account property is initialized to an empty string, *SqlJson* will populate the object with the results of the *accountName* field of the *Sql* call. An exception is thrown if more than one row is returned from the *Sql* call. If no rows are returned, account would be set to undefined (not null).

### No Type Provided

```js
{
  accountSql: `SELECT * FROM account;`
}
```

or

```js
{
  accountSql: `SELECT * FROM account;`,
  account: undefined
}
```

Because no property is provided or the property is undefined, *SqlJson* will do the following:

* One Result: *SqlJson* will create an *object*, populate the *object*, and place that *object* in the property. A single result will never result in a primitive data type.
* Multiple Results: *SqlJson* will create an *array*, fill the *array* with the results, and place the *array* in the *property*.

### Forcing a Result Type

You may want to force the type of result. You can do this using the *resultType* meta-data property as follows:

```js
{
  accountsSql: {
    sql: 'SELECT * FROM account;',
    resultType: 'array'
  }
  accounts: undefined
}
```

or

```js
{
  accountsSql: {
    sql: 'SELECT * FROM account;',
    resultType: 'array'
  }
}
```

This will cause the *accounts* property to be of type array.

The valid resultType values are:

* *array*
* *object*
* *string*
* *number*


# Features

## *SQL* to *JSON* - *SQL* SELECT

To read from a *SQL* database and convert results to *JSON* use the following *SqlJson* format:

```js
var selectExample = {
  accountsSql: {
    sql: `SELECT account_id AS accountId,
                 first_name AS firstName,
                 family_name AS familyName,
          FROM account;`
  }
}
```

The Query result is mapped to the users property. This example contains two records in the database.

```js
var repoSqlite3 = sqljsonlib.repoSqlite3({
  afterOpen: () => {
    var sqljson = sqljsonlib.sqljson(repoSqlite3);
        sqljson.run(selectExample, (err, res) => {
          console.log(res);
        });
  });
  reposqllite3.run;
```

will log to the console:

```js
{
  accounts: [{
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
    firstName: 'Candy',
    familyName: 'Lacy'
  }, {
    accountId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
    firstName: 'Arnold',
    familyName: 'Lane'
  }]
}
```

* *SqlJson* uses the column names in the select statement to generate the *JSON* objects.

## *JSON* to *SQL* - *SQL* INSERT 

To convert and persist *JSON* to *SQL* use the following *SqlJson* format:

```js
var insertExample = {
  accountsSql: {
    sql: `INSERT INTO accounts(account_id, first_name, family_name)
          VALUES(@accountId@, @firstName@, @familyName@);`
  },
  accounts : [{
    accountId: '961fe224-8943-47fb-b08a-92123d9d7211',
    firstName: 'Candy',
    lastName: 'Lacy'
  }, {
    accountId: 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830',
    firstName: 'Arnold',
    lastName: 'Lane'
  }]
}
```

* *SqlJson* uses the property name (or a jquery statement) surrounded by the **@** symbol.

The following generates and runs *SQL* against the repository:

```js
var repoSqlite3 = sqljsonlib.repoSqlite3({
  afterOpen: () => {
    var sqljson = sqljsonlib.sqljson(repoSqlite3);
        sqljson.run(insertExample, (err, res) => {
          console.log(res);
        });
  });
  reposqllite3.run;
```

Under the hood, the followig *SQL* is generated:

```sql
INSERT INTO users(
  user_id, email            , display_name , password ) VALUES
( 1      , "user@gmail.com" , "First User" , "1234"   ),
( 2      , "user2@gmail.com", "Second User", "5678"   );
```

### Variables In *SQL*

*SqlJson* supports variables within the *SQL* that will be replaced by *SqlJson* before executing the *SQL*.

```js
var selectInExample = {
  accountsSql: {
    sql: `SELECT account_id AS accountId,
                 first_name AS firstName,
                 family_name AS familyName,
          FROM account
          WHERE account_id IN (@userIds@);`,
    userIds: ['961fe224-8943-47fb-b08a-92123d9d7211',
              'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830']
  }
};
```

Under the hood, the following *SQL* statement is generated.

```sql
SELECT account_id AS accountId,
       first_name AS firstName,
       family_name AS familyName,
FROM account
WHERE account_id IN
  ('961fe224-8943-47fb-b08a-92123d9d7211',
  'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830');
```

### Multiple Selects in Same Object

*SqlJson* supports multiple *SQL* statements within an object:

```
var multipleStatements = {
  accountsSql: `
    SELECT account_id AS accountId,
           first_name AS firstName,
           family_name AS familyName,
    FROM account;`,
  invoicesSql: `
    SELECT invoice_id AS invoiceId,
           account_id AS accountId,
           description
    FROM invoice;`
  }
}
```

becomes:

```js
{
  accounts: [<account data>],
  invoices: [<invoice data>]
}
```

### Hierarchical Selects

*SqlJson* supports converting nested *SQL* hierarchies to *JSON*.

```js
{
  accountsSql: {
    sql: `SELECT account_id AS accountId,
                 first_name AS firstName,
                 family_name AS familyName
          FROM account;`,
    invoicesSql: {
      sql: `SELECT invoice_id AS invoiceId,
                   account_id AS accountId,
                   description
            FROM invoice`,
      relationship: {
        parent: 'accountId',
        child: 'accountId',
        type: 'array'
      }
    }
  }
}
```

The relationship is defined in the child using the relationship property and following structure:

```js
{
  parent: 'accountId',
  child: 'accountId',
  type: 'array'
}
```

* *Parent* == *Child* - A comparison is done using the parent property name and child property name.
* type - Expected type of the Parent property children are placed into. By default, this is an array.

Example output:

```js
{
  accounts: [{
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
  }]
}

```

Notice *invoices* are now properties of accounts.

## Future Features

* Use Jquery, instead of just a property name, to get data from the data property.
* Provide information on sql format standard (Oracle, MySql, sqlite, etc.). May not be required/beyond scope.
* Some kind of security so people can't do things like accidentally drop a database. Could be beyond scope.
* Invalid sql statments are not valided by us. We will just take the results from back end server and display them if the sql is invalid.
* sqljson should return how many rows update
* Perhaps provide non-array for sqljson.data property in the future.
* Use table schema to figure out data type in *SQL* database. For now use values in json. Or, maybe, in future, assure json datatype matches sql.
* CONSIDER: Provide the final *SQL* statement used to SELECT data and/or provide an option to return it as part of the result?


## Features Considered and Not Implemented




## Setup

Install:
```
$ npm install
```

Continuous test:
```
$ gulp
```

Test:
```
$ gulp webtests
```

### Test Server

Read documentation in gulpfile.js to see how to setup automated web testing.

```
$ gulp webserver
```

# Research

Node Packages

https://www.npmjs.com/package/jsonsql
https://www.npmjs.com/package/json-sql
https://www.npmjs.com/package/json-to-sql - Define a sql statement in Json.
https://www.npmjs.com/package/sql-insert-to-json
https://www.npmjs.com/package/sql-json-transformer

[^1]: *SqlJson* would be a good data format to build an ORM on top of.
[^2]: You can always add meta-data to your json which you can later use to map the results to models.
[^3]: Javascript *Null* is not used within this framework: something recommended by Douglas Crockford.