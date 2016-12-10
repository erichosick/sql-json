# Design Decisions

The *JsonSql* standard should be as un-intrusive as possible. We should:

* Keep the JSON structure with *SQL* meta-data as similar as possible to existing JSON.
* Keep object defenitions as close to the original object definition as possible. This is especially important if we are working with strongly typed langauges.

## Non-Hierarchical Data

### Embedding *SQL* meta-data in the Object

The following would be considered intrusive because we're embedding the *SQL* specific meta-data in the *JSON* object:

```
{
  accounts: {
    sql: `INSERT INTO account ( ... ) VALUES ( ... );`
  }
}
```

Accounts will most likely need to be an array and right now it is an object. Further, where are we getting the data to do the insert for the accounts? We would need to alter the *JSON* objects to contains, say, a data property:

```
{
  accounts: {
    sql: `INSERT INTO account ( ... ) VALUES ( ... );`,
    data: [ { ... }, { ... }, ...] -- Accounts data here.
  }
}
```

This imposes a very specific object format on the user of *JsonSql* and goes against general best practice of simply making the accounts property an array:

```
{
  accounts: [ { ... }, { ... }, ...]
}
```

There is no way to add meta-data to an array. This isn't valid *JSON*:

```
{
  accounts: {
    sql: `INSERT INTO account ( ... ) VALUES ( ... );`,
    [ { ... }, { ... }, ...]
  }
}
```

### Providing *SQL* meta-data outside the Object

This means the *SQL* specific meta-data needs to live outside of the *JSON* object we are describing. This leads us to the following:

```
{
  accountsSql: `SELECT * FROM account;`,
  accounts: [
    { name: 'one' }, { name: 'two'}
  ]
}
```

The accounts property has an associated *accountsSql* property which contains any meta-data required to associate *SQL* with the accounts property.

## Hierarchial Data

A primary goal of *JsonSql* is to provide a standard way of mapping hierarchical *JSON* data to relations in a *SQL* database.

### Providing *SQL* meta-data Close to the Object

Let's consider the following **possible** format:

```
  {
    accountsSql: 'SELECT * FROM account;',
    accounts: [
      {
        account_id: 1,
        name: 'my account',
        invoicesSql: `SELECT * FROM invoice WHERE account_id = @account_id@`,
        invoices: [
        ]
      },
      {
        account_id: 2,
        name: 'my second account',
        invoicesSql: `SELECT * FROM invoice WHERE account_id = @account_id@`,
        invoices: [
        ]
      }
    ],
    
  }
```

A few things come to mind that make this non-optimal.

* We have to repeat the invoices *SQL* for every account returned from the database.
* We need to run a *select* against invoices for each account returned which is really inefficient.
* We need to have the results of the accounts query before we can build out the rest of the *JSON*. This is what we really have before we run the accounts select:

```
  {
    accountsSql: 'SELECT * FROM account;',
    accounts: [
    ],
    
  }
```

Where is the JSON do we store the invoice *SQL*?

### Providing *SQL* meta-data In It's Own Object

Let's try this:

```
  {
    accountsSql: {
      sql: 'SELECT * FROM account;',
      invoicesSql: `SELECT *
                    FROM invoices
                    INNER JOIN accounts ON accounts.account_id = invoices.account_id;`
    },
    accounts: [
    ],    
  }
```

Note:

* We no longer repeat our invoice SQL
* We only need to run the invoice SQL one time.
* Don't need any objects in the accounts array contain the invoice SQL.

It seems we've now further disassociated our invoice *SQL* meta-data from the JSON that contains the invoices. 

Maybe this is the best we're going to get so let's run with it.

