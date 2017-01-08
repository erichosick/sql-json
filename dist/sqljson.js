// sqljson.js
// version: 0.0.1
// author: Eric Hosick (erichosick@gmail.com)
// license: MIT
(function() {
    "use strict";

    var root = this; // window (browser) or exports (server)
    var sqljsonlib = root.sqljsonlib || {}; // merge with previous or new module
    sqljsonlib["version-library"] = '0.0.1'; // version set through gulp build

    // export module for node or the browser
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = sqljsonlib;
    } else {
      root.sqljsonlib = sqljsonlib;
    }
function sqljson(repo) {
  var f = Object.create(SqlJson.prototype);
  f.repo = repo;
  return f;
}

function SqlJson() {}
SqlJson.prototype = Object.create(Object.prototype, {});

SqlJson.prototype._sqlStatementType = function(sql) {
  var sqlLower = sql.toLowerCase();
  return sqlLower.includes('select') ? 'select' :
    sqlLower.includes('update') ? 'update' :
    sqlLower.includes('values') ? 'insert' :
    sqlLower.includes('call') ? 'call' :
    sqlLower.includes('create') ? 'create' :
    sqlLower.includes('delete') ? 'delete' : '';
}

SqlJson.prototype._replace = function(item, values) {
  if (undefined !== item) {
    Object.keys(item).forEach((prop) => {
      var search = `@${prop}@`;
      var replacement = typeof item[prop] === 'string' ? `"${item[prop]}"` : item[prop];
      if (item[prop] instanceof Array) {
        var replacement2 = JSON.stringify(item[prop]).replace('[', '').replace(']', '');
        values = values.split(search).join(replacement2);
      } else {
        values = values.split(search).join(replacement);
      }
    });
  }
  return values;
}

SqlJson.prototype.toSql = function(context) {
  var json = context.root[context.propName];
  var type = this._sqlStatementType(context.sql);
  switch (type) {
    case 'insert':
      var valueDefined = context.sql.includes('VALUES') ? 'VALUES' : context.sql.includes('values') ? 'values' : '';
      var sqlsplit = context.sql.split(valueDefined);
      var result = sqlsplit[0] + valueDefined;
      var repeat = sqlsplit[1].trim().replace(';', '');
      json.forEach((item) => {
        result = result + "\n" + this._replace(item, repeat) + ",";
      });
      result = result.replace(/,\s*$/, "") + ";";
      return result;
      break;
    case 'select':
    case 'delete':
    case 'create':
      context.sql = this._replace(json, context.sql);
      return this._replace(context.root, context.sql);
      break;
  };
}

SqlJson.prototype._endsWithSql = function(str) {
  return str.indexOf('Sql', str.length - 3) !== -1;
}

SqlJson.prototype._propNameGet = function(propNameRaw) {
  return propNameRaw.replace('Sql', '');
}

SqlJson.prototype._sqlJsonProperties = function(sqljson) {
  return undefined === sqljson || null === sqljson ? [] : Object.keys(sqljson).filter(this._endsWithSql);
}

SqlJson.prototype._propContextCreate = function(prop, sqljson, result) {
  var propContext = {
    prop: prop,
    root: sqljson,
    propName: this._propNameGet(prop),
    sql: sqljson[prop],
    result: result
  }
  if (propContext.sql instanceof Object) {
    propContext.sql = propContext.sql.sql;
  }
  propContext.finalSql = this.toSql(propContext);
  return propContext;
}

SqlJson.prototype._runQuery = function(propContext, callback) {
  var type = this._sqlStatementType(propContext.finalSql);
  switch (type) {
    case 'insert':
    case 'delete':
    case 'create':
      this.repo.run(propContext.finalSql, (err, rows) => {
        callback(err, propContext.result);
        return;
      });
      break;
    case 'select':
      this.repo.select(propContext.finalSql, (err, rows) => {
        propContext.result[propContext.propName] = rows;
        callback(err, propContext.result);
      });
      break;
    default:
      // TODO: Add tests and figure out what to return for this
      console.log(`type was '${type}'`);
      break;
  }
}

SqlJson.prototype.run = function(sqljson, callback) {
  if (undefined !== sqljson && null !== sqljson) {
    var properties = this._sqlJsonProperties(sqljson);
    if (properties.length > 0) {
      var result = {};
      properties.forEach((prop, pos) => {
        var propContext = this._propContextCreate(prop, sqljson, result);
        this._runQuery(propContext, (err, res) => {
          if (pos === properties.length - 1) {
            callback(err, res);
          }
        });
      });
    } else {
      callback(undefined, sqljson); // nothing to do: return what was sent
    }
  } else {
    callback(undefined, undefined);
  }
}

sqljsonlib.sqljson = sqljson;
let sqlite3 = require('sqlite3');

function repoSqlite3(options, database) {
  var defaultOptions = {
    repositoryName: ':memory:',
    afterOpen: function() {},
    afterClose: function() {}
  };
  var f = Object.create(RepoSqlite3.prototype);
  f._options = Object.assign(defaultOptions, options);
  return f;
}

function RepoSqlite3() {}

RepoSqlite3.prototype = Object.create(Object.prototype, {
  repositoryName: {
    get: function() {
      return this._options.repositoryName;
    }
  },
  open: {
    get: function() {
      if (undefined === this._repository) {
        this._repository = new sqlite3.Database(
          this.repositoryName, this._options.afterOpen
        );
        this._repository;
      }
      return this._repository;
    }
  },
  close: {
    get: function() {
      if (undefined !== this._repository) {
        this._repository.close(this._options.afterClose);
      }
    }
  },
  repository: {
    get: function() {
      return this._repository;
    }
  }
});

RepoSqlite3.prototype.run = function(sql, callback) {
  this.repository.run(sql, (err, res) => {
    callback(null === err ? undefined : err, res);
  });
}

RepoSqlite3.prototype.insert = function(sql, data, callback) {
  var stmt = this.repository.prepare(sql);
  for (var i = 0; i < data.length; i++) {
    stmt.run("Ipsum " + data[i]);
  }
  stmt.finalize(callback);
}

RepoSqlite3.prototype.select = function(sql, callback) {
  this.repository.all(sql, (err, rows) => {
    callback(err === null ? undefined : err, rows);
  });
}

sqljsonlib.repoSqlite3 = repoSqlite3;

}.call(this));