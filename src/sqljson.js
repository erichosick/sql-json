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