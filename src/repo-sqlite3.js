let sqlite3 = require('sqlite3');

function repoSqlite3(options, database) {
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
  this.repository.run(sql, (err, res) => {
    callback(null === err ? undefined : err, res);
  });
}

RepoSqlite3.prototype.insert = function(sql, data, callback) {
  const stmt = this.repository.prepare(sql);
  for (let i = 0; i < data.length; i++) {
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