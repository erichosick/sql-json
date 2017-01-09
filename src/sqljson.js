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

// TODO: Support joins on multiple columns
// Warning: parent is altered.
SqlJson.prototype._sqlJsonMergeHierarchy = function(parent, child, join, propName) {
  if (undefined === parent || null === parent) {
    return {};
  } else {
    if ((undefined === join || null === join || undefined === propName || null === propName)) {
      return parent;
    }

    // var parentHash = {};
    // Note: Had a hash to get O(2N) but situations where O(N^2) is necessary
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
  var json = context.root[context.propName];
  switch (context.type) {
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
        propContext.result[propContext.propName] = rows;
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

SqlJson.prototype.run = function(sqljson, callback) {
  if (undefined !== sqljson && null !== sqljson) {
    var properties = this._sqlJsonProperties(sqljson);
    if (properties.length > 0) {
      var result = {}; // result shared between properties.
      properties.forEach((prop, pos) => {
        var propContext = this._propContextCreate(prop, sqljson, result);
        this._runQuery(propContext, (err, parent) => {
          if (err) {
            callback(err, undefined);
          } else {
            if (pos === properties.length - 1) {
              var sqljsonsub = sqljson[prop];
              var childProperties = this._sqlJsonProperties(sqljsonsub);
              if (0 < childProperties.length) { // short circuit recursive call
                this.run(sqljsonsub, (err, child) => {
                  childProperties.forEach((propChild) => {
                    var propNameChild = this._propNameGet(propChild);
                    this._sqlJsonMergeHierarchy(parent[propContext.propName], child[propNameChild], sqljsonsub[propChild].relationship, propNameChild);
                  });
                  callback(err, parent);
                });
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