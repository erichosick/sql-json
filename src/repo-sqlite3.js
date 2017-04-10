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

// TODO: This will not work with ; in quotes or comments, etc.
//       IN A HUGE WAY, this will need to be updated
RepoSqlite3.prototype._split = function(sql) {
  return (undefined === sql) ? [] : sql.split(';').filter((sql) => sql.trim() !== '' );
}

RepoSqlite3.prototype.run = function(sql, callback) {
  if (undefined === this.repository) {
      callback('Call to open required before calling run.');
  } else {
    let sqlArr = this._split(sql);
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