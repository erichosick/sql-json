# *SqlJson*

*SqlJson* is a standard json data format used to convert *SQL* to *JSON* and *JSON* to *SQL*.

## Introduction

### What It Is

The *SqlJson* data format is used to convert *SQL* to *JSON* and *JSON* to *SQL*. We hope this standard will be implemented in different languages (Java, Javascript, C#, Objective-C, etc.). We're starting with Javascript because of it's native support of *JSON*.

*SqlJson* is especially useful for mapping hierarchial *JSON* to *SQL* and visa versa (see documenation).

### What It Isn'tS

* *SqlJson* is **not** intended to be used as an ORM (Object Resource Manager). *SqlJson* would be a good format to build an ORM on top of.
* *SqlJson* is not intended to handle transactions though we may come up with a more advanced *SqlJson* data format to support transactions.
* *SqlJson* does not understand models as it is simply a dataformat though we may add meta-data support for mapping the results of *SqlJson* to a model.
* *SqlJson* does not validate *SQL* nor does it know what flavor of *SQL* being used. We may add support for multiple flavors of *SQL* to the *SqlJson* format.

# Documentation


## SqlJson meta-data Naming

The property name for *SQL* meta-data is the name of the property the meta-data is for plus the literal word 'Sql'. For example:

```
  {
    accountsSql: 'SELECT * FROM account;',
    accounts: []
  }
```

## SqlJson Object

If the only meta-data required is the *SQL* statement, then you can use the following short form:

```
  {
    accountsSql: 'SELECT * FROM account;',
    accounts: []
  }
```

However, if you need to provide additional *SQL* meta-data then use the following long form:

```
  {
    accountsSql: {
      sql: 'SELECT * FROM account;',
      resultType: 'array'
    }
    accounts: []
  }
```

## Determining Property Type

A property can be one of the following types:

* A primitive type: string, number, etc.
* An *object*: {}
* An *array*: []

It would be nice, when we run our sql, to have the results return using the desired property type.

Examples then would be:

### An Array

```
  {
    accountsSql: 'SELECT * FROM account;',
    accounts: []
  }
```

Because the *accounts* property is initialized to an *array*, *JsonSql* will populate the *array* with the results of the *Sql* call: even if only one item is returned. JsonSql will leave the *array* empty if no items are returned.

### An Object

```
  {
    accountSql: 'SELECT * FROM account WHERE account_id = 1;',
    account: {}
  }
```

Because the *account* property is initialized to an *object*, *JsonSql* will populate the object with the results of the *Sql* call. An exception is thrown if more than one row is returned from the *Sql* call. If no rows are returned, account would be set to undefined (not null).

### A primitive type

```
  {
    accountNameSql: 'SELECT account_name AS accountName FROM account WHERE account_id = 1;',
    accountName: ''
  }
```

Because the account property is initialized to an empty string, *JsonSql* will populate the object with the results of the *accountName* field of the *Sql* call. An exception is thrown if more than one row is returned from the *Sql* call. If no rows are returned, account would be set to undefined (not null).

### No Type Provided

```
  {
    accountSql: 'SELECT account_name AS accountName FROM account;',
  }
```

OR

```
  {
    accountSql: 'SELECT account_name AS accountName FROM account;',
    account: undefined
  }
```

Because no property is provided or the property is undefined, *SqlJson* will do the following:

* One Result: *SqlJson* will create an *object*, populate the *object*, and place that *object* in the property.
* Multiple Results: *SqlJson* will create an *array*, fill the *array* with the results, and place the *array* in the *property*.

### Forcing a Result Type

You may want to force the type of result. You can do this using the resultType meta-data property as follows:

```
  {
    accountsSql: {
      sql: 'SELECT * FROM account;',
      resultType: 'array'
    }
    accounts: undefined
  }
```

OR

```
  {
    accountsSql: {
      sql: 'SELECT * FROM account;',
      resultType: 'array'
    }
  }
```

This will cause the *accounts* property to be of type array.

The valid resultType values are:

* array
* object
* string
* number


# Features

## *SQL* to *JSON* - *SQL* SELECT

To read from a *SQL* database and convert results to *JSON* use the following *SqlJson* format:

```javascript
var selectExample = {
  accountsSql: {
    sql: `SELECT account_id AS accountId,
                 first_name AS firstName,
                 family_name AS familyName,
          FROM account;`
  },
  accounts: []
}
```

The Query result is mapped to the users property. This example contains two records in the database.

```javascript
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

```javascript
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

### *SQL* SELECT - WHERE IN

SqlJson supports *SQL*'s **IN**.

```javascript
var selectInExample = {
  accountsSql: {
    sql: `SELECT account_id AS accountId,
                 first_name AS firstName,
                 family_name AS familyName,
          FROM account
          WHERE account_id IN (@userIds@);`,
    userIds: ['961fe224-8943-47fb-b08a-92123d9d7211', 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830']
  }
};
```

Under the hood, the following *SQL* statement is generated.

```sql
SELECT account_id AS accountId,
       first_name AS firstName,
       family_name AS familyName,
FROM account
WHERE account_id IN ('961fe224-8943-47fb-b08a-92123d9d7211', 'cb89b50c-65e0-4ed5-a8ed-fb240b3b2830');
```

## *JSON* to *SQL* - *SQL* INSERT 

To convert and persist *JSON* to *SQL* use the following *SqlJson* format:

```javascript
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

```javascript
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

