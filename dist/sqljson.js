// sqljson.js
// version: 0.0.2
// author: Eric Hosick (erichosick@gmail.com)
// license: MIT
(function() {
    "use strict";

    let root = this; // window (browser) or exports (server)
    let sqljsonlib = root.sqljsonlib || {}; // merge with previous or new module
    sqljsonlib["version-library"] = '0.0.2'; // version set through gulp build

    // export module for node or the browser
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = sqljsonlib;
    } else {
      root.sqljsonlib = sqljsonlib;
    }
let camelCase = require('camel-case');

function sqljson(repo) {
  const f = Object.create(SqlJson.prototype);
  f.repo = repo;
  return f;
}

function SqlJson() {}
SqlJson.prototype = Object.create(Object.prototype, {});

SqlJson.prototype._sqlStatementType = function(sql) {
  const sqlLower = sql.toLowerCase();
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
      const search = `:${prop}`;
      const replacement = typeof item[prop] === 'string' ? `"${item[prop]}"` : item[prop];
      if (item[prop] instanceof Array) {
        const replacement2 = JSON.stringify(item[prop]).replace('[', '').replace(']', '');
        values = values.split(search).join(replacement2);
      } else {
        values = values.split(search).join(replacement);
      }
    });
  }
  return values;
}

// TODO: Support joins on multiple columns
// Warning: parent is altered.
SqlJson.prototype._sqlJsonMergeHierarchy = function(parent, child, join, propName) {
  if (undefined === parent || null === parent) {
    return {};
  } else {
    if ((undefined === join || null === join || undefined === propName || null === propName)) {
      return parent;
    }

    // Note: Had a hash to get O(2N) but situations exist where O(N^2) is necessary
    //       Will refactor back to O(N) at some point.
    parent.forEach((itemParent) => {
      itemParent[propName] = [];
      child.forEach((itemChild) => {
        if (itemParent[join.parent] === itemChild[join.child]) {
          itemParent[propName].push(itemChild);
        }
      });
    });
    return parent;
  }
}

SqlJson.prototype.toSql = function(context) {
  const json = context.root[context.propName];
  switch (context.type) {
    case 'insert':
      const valueDefined = context.sql.includes('VALUES') ? 'VALUES' : context.sql.includes('values') ? 'values' : '';
      const sqlsplit = context.sql.split(valueDefined);
      let result = sqlsplit[0] + valueDefined;
      const repeat = sqlsplit[1].trim().replace(';', '');
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

SqlJson.prototype._sqlJsonProperties = function(sqljson, firstCall) {
  return (undefined !== firstCall) ? [sqljson] :
    (undefined === sqljson || null === sqljson || undefined === sqljson.sqlJson) ? [] :
    sqljson.sqlJson instanceof Array ? sqljson.sqlJson : [sqljson.sqlJson];
}

SqlJson.prototype._propContextCreate = function(sqljsonformat, sqljson, result) {
  const propContext = {
    root: sqljson,
    propName: sqljsonformat.dataPath,
    sql: sqljsonformat.sql,
    result: result,
    finalSql: undefined,
    type: undefined
  }
  if (propContext.sql instanceof Object) {
    propContext.sql = propContext.sql.sql;
  }
  propContext.type = this._sqlStatementType(propContext.sql);
  propContext.finalSql = this.toSql(propContext);
  return propContext;
}

// Warning: destructive
SqlJson.prototype._camelCase = function(rows) {
  if (undefined !== rows) {
    let changePropNames = false;
    if (undefined !== rows[0]) {
      for (var propName in rows[0]) {
        let propNameCamel = camelCase(propName);
        if (propName !== propNameCamel) {
          changePropNames = true;
          break; // just need to find one
        }
      }
    }

    if (changePropNames) {
      rows.forEach((item) => {
        for (var propName in item) {
          let propNameCamel = camelCase(propName);
          if (propName !== propNameCamel) {
            item[propNameCamel] = item[propName];
            delete item[propName];
          }
        }
      });
    }
  }
  return rows;
}

SqlJson.prototype._runQuery = function(propContext, callback) {
  switch (propContext.type) {
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
        let sqlJson = propContext.root.sqlJson;

        if (sqlJson && ('object' === sqlJson.type)) {
          if (('' === sqlJson.dataPath) || (undefined === sqlJson.dataPath)|| (null === sqlJson.dataPath)) {
            propContext.result = this._camelCase(rows)[0];
          } else {
            propContext.result[propContext.propName] = this._camelCase(rows)[0];
          }
        } else {
          propContext.result[propContext.propName] = this._camelCase(rows);
        }
        callback(err, propContext.result);
      });
      break;
    default:
      console.log(`type was '${type}' which we need to implement`);
      // NOTE: This should never happen so no test was written.
      //       Could always somehow mock out a test to get this line of code covered
      callback(`type was '${type}' which we need to implement`, undefined);
      break;
  }
}

SqlJson.prototype.run = function(sqljson, callback, firstCall) {
  if (undefined !== sqljson && null !== sqljson) {
    const properties = this._sqlJsonProperties(sqljson, firstCall);
    if (properties.length > 0) {
      const result = {}; // result shared between recursive calls.
      properties.forEach((prop, pos) => {
        const propContext = this._propContextCreate(prop, sqljson, result);
        this._runQuery(propContext, (err, parent) => {
          if (err) {
            callback(err, undefined);
          } else {
            if (pos === properties.length - 1) {
              const sqljsonsub = prop.sqlJson;
              if (undefined !== sqljsonsub) { // short circuit recursive call
                this.run(sqljsonsub, (err, child) => {
                  Object.keys(result).forEach((propNameParent) => {
                    this._sqlJsonMergeHierarchy(parent[propNameParent], child[sqljsonsub.dataPath], sqljsonsub.relationship, sqljsonsub.dataPath);
                  });
                  callback(err, parent);
                }, 1);
              } else {
                callback(err, parent);
              }
            }
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

function repoSqlite3(options) {
  const defaultOptions = {
    repositoryName: ':memory:',
    afterOpen: function() {},
    afterClose: function() {}
  };
  const f = Object.create(RepoSqlite3.prototype);
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
  if (undefined === this.repository) {
      callback('Call to open required before calling run.');
  } else {
    let sqlArr = sqljsonlib._parse(sql);
    let sqlLastPos = sqlArr.length - 1;

    sqlArr.forEach( (sql, index) => {
      this.repository.run(sql, (err, res) => {
        if (sqlLastPos === index) {
          callback(null === err ? undefined : err, res);
        }
      });
    });
  }
}

RepoSqlite3.prototype.insert = function(sql, data, callback) {
  if (undefined === this.repository) {
      callback('Call to open required before calling insert.');
  } else {
    const stmt = this.repository.prepare(sql);
    for (let i = 0; i < data.length; i++) {
      stmt.run("Ipsum " + data[i]);
    }
    stmt.finalize(callback);
  }
}

RepoSqlite3.prototype.select = function(sql, callback) {
  if (undefined === this.repository) {
    callback('Call to open required before calling select.', 0);
  } else {
    this.repository.all(sql, (err, rows) => {
      callback(err === null ? undefined : err, rows);
    });
  }
}

sqljsonlib.repoSqlite3 = repoSqlite3;

/**
 * split a chunk of SQL into each statement delimited by ';'
 */
(function () {
  this._parse = (sql) => [...parse(sql)];

  /**
   * the regex:
   * \/\*[^]*?(\*\|$)/  match multiline comments (important - keep the question 
   *                      mark to ensure a non-greedy match 
   * --.*?(\n|$)        match dashed comments until EOL or EOF
   * #.*?(\n|$)         match perl-style comments until EOF or EOF
   * '([^']|\\').*'     match single-quoted strings
   * "([^"]|\\").*"     match double-quoted strings
   */
  const regex = /\/\*[^]*?(\*\/|$)|--.*?(\n|$)|#.*?(\n|$)|'([^']|\\').*'|"([^"]|\\").*"/;

  // iterate over each matched / non-matched chunk of `sql`, emitting statements 
  // delimited by ';'
  function* parse(sql) {

    // return empty array for undefined
    if (sql === undefined) {
      return;
    }

    let stmt = '';
    while (true) {
      // this 
      let m = sql.match(regex);
      if (m == null) {
        // we're done parsing comments and strings
        // finish the current statement and output everything
        let A = sql.split(';');
        A[0] = stmt + A[0];
        for (let s of A) {
          s = s.trim();
          void(s && (yield s));
        }
        return;
      }

      // accumulate the sql string into `stmt`
      let A = sql.substring(0, m.index).split(';');
      stmt += A.splice(0, 1)[0];

      // if there was a ';', emit the accumulated statement
      if (A.length) {
        stmt = stmt.trim();
        void(stmt && (yield stmt));

        // emit any full statements after the last one
        for (let s of A.splice(0, A.length - 1)) {
          s = s.trim();
          void(s && (yield s));
        }

        // start a new statement
        stmt = A[0];
      }

      let c = m[0].charAt(0);
      // if we're in a string literal, add it to the statement
      if (c == '"' || c == "'") {
        stmt += m[0];
      }
      // comment includes newline. keep the newline
      else if (c == '-' || c == '#') {
        stmt += '\n';
      }
      sql = sql.substring(m.index + m[0].length);
    }
  }
}).call(sqljsonlib);

}.call(this));