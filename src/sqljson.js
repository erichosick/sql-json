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

SqlJson.prototype._endsWithSql = function(str) {
  return str.indexOf('Sql', str.length - 3) !== -1;
}

SqlJson.prototype._propNameGet = function(propNameRaw) {
  return propNameRaw.replace('Sql', '');
}

SqlJson.prototype._sqlJsonProperties = function(sqljson, firstCall) {

  return (undefined !== firstCall) ? [sqljson] :
    (undefined === sqljson || null === sqljson || undefined === sqljson.sqlJson) ? [] :
    sqljson.sqlJson instanceof Array ? sqljson.sqlJson : [sqljson.sqlJson];
}

SqlJson.prototype._propContextCreate = function(sqljsonformat, sqljson, result) {
  const propContext = {
    root: sqljson,
    propName: sqljsonformat.propertyName,
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
                    this._sqlJsonMergeHierarchy(parent[propNameParent], child[sqljsonsub.propertyName], sqljsonsub.relationship, sqljsonsub.propertyName);
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