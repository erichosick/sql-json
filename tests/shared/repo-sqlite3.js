"use strict";

describe("repo for Sqlite3 library", () => {
  it("01: should not wipeout Object prototype and be a repoSqlite3", () => {
    var repoSqlite3 = sqljsonlib.repoSqlite3();
    expect(repoSqlite3, "repoSqlite3").to.be.an("object");
  });

  it("02: should have correct default settings", () => {
    var repoSqlite3 = sqljsonlib.repoSqlite3();
    expect(repoSqlite3.repositoryName, "default option is in memory database").to.equal(":memory:");
  });

  it("03: should successfully create and close a database.", (done) => {
    var repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        var repo = repoSqlite3.repository;
        expect(repo.open, "database should be open").to.be.true;
        expect(repo.filename, "database should be in memory").to.equal(':memory:');
        // createTable(db);
        // NOTE: See error message timeout done() being called? Means this callback is not getting called
        repoSqlite3.close;
      },
      afterClose: () => {
        var repo = repoSqlite3.repository;
        expect(repo.open, "database should be open").to.be.fase;
        done();
      }

    });
    var db = repoSqlite3.open;
    expect(db, "valid repository").to.be.defined;
  });

  it("04: should successfully run, insert and select.", (done) => {
    var repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        repoSqlite3.run(`CREATE TABLE IF NOT EXISTS lorem (info TEXT)`, (err) => {
          expect(err, 'should have no error').to.be.undefined;
          repoSqlite3.insert(`INSERT INTO lorem VALUES (?)`, [1, 2, 3, 4, 5], () => {
            repoSqlite3.select(`SELECT rowid AS id, info FROM lorem`, (err, rows) => {
              expect(rows.length, "should have rows").to.equal(5);
              done();
            });
          });
        });
      }
    });
    var db = repoSqlite3.open;
  });

  it("05: should return an error when invalid sql is executed", (done) => {
    var repoSqlite3 = sqljsonlib.repoSqlite3({
      afterOpen: () => {
        repoSqlite3.run(`CREATE TABLE IF NOT EXISTS lorem (info TEXT`, (err) => {
          expect(err, 'should have no error').to.not.be.undefined;
          done();
        });
      }
    });
    var db = repoSqlite3.open;
  });

  it("06: should return an error when run is called without open", () => {
    var repoSqlite3 = sqljsonlib.repoSqlite3({});
    repoSqlite3.run(`CREATE TABLE IF NOT EXISTS lorem (info TEXT)`, (err) => {
      expect(err, 'should have error').to.equal('Call to open required before using repository.');
    });
  });

  it("07: should return an error when insert is called without open", () => {
    var repoSqlite3 = sqljsonlib.repoSqlite3({});
    repoSqlite3.insert(`CREATE TABLE IF NOT EXISTS lorem (info TEXT)`, {}, (err) => {
      expect(err, 'should have error').to.equal('Call to open required before using repository.');
    });
  });

  it("08: should return an error when select is called without open", () => {
    var repoSqlite3 = sqljsonlib.repoSqlite3({});
    repoSqlite3.select(`CREATE TABLE IF NOT EXISTS lorem (info TEXT)`, (err) => {
      expect(err, 'should have error').to.equal('Call to open required before using repository.');
    });
  });

});