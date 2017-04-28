"use strict";

const fs = require('fs');

describe("SQL Parser", () => {
  let parse = sqljsonlib._parse;

  it("should not fail on undefined", () => {
    let result = parse();
    expect(result).to.be.an("array");
    expect(result.length).to.equal(0);
  })

  it("should read an empty file", () => {
    let result = parse(readFile("empty.sql"));
    expect(result).to.be.an("array");
    expect(result.length).to.equal(0);
  });

  it("should skip comments", () => {
    let result = parse(readFile("comments.sql"));
    expect(result).to.be.an("array");
    expect(result.length).to.equal(2);
    expect(result[0]).to.equal("INSERT INTO foo_bar (foo_id, x) 'lfdkljdfkjlsdlf', 2000");
    expect(result[1]).to.equal("SELECT * FROM foo_bar \n    WHERE \n    x > 12");
  });

  it("should not split string literals", () => {
    let result = parse(readFile("strings.sql"));
    expect(result).to.be.an("array");
    expect(result.length).to.equal(6);
    expect(result[0]).to.equal(`SELECT 'A simple string'`)
    expect(result[1]).to.equal(`SELECT 'SQL within sql SELECT ''SQL within SQL ''''SELECT \\'A simple string\\' '''';'';'`)
    expect(result[2]).to.equal(`SELECT "A double-quoted; string"`)
    expect(result[3]).to.equal(`SELECT "An escaped \\"double-quoted\\" string"`)
    expect(result[4]).to.equal(`SELECT 'A; string -- with an embedded comment;'`)
    expect(result[5]).to.equal(`SELECT "Another string; with /*an embedded #comment */;"`)
  });

  it("should parse a SQL file with all kinds of strings and comments", () => {
    let result = parse(readFile("everything.sql"));
    expect(result).to.be.an("array");
    expect(result.length).to.equal(5);
    expect(result[0]).to.equal('DROP DATABASE foo')
    expect(result[1]).to.equal('CREATE DATABASE foo\n    CHARSET = utf8');

    // the newlines are not all preserved because some of them are 
    expect(result[2]).to.equal(`CREATE TABLE bar(
    id CHAR(36) PRIMARY KEY, 
    key VARCHAR(200), 
    value INT, 
) ENGINE = InnoDB or something`);

    expect(result[3]).to.equal(`INSERT INTO bar SELECT
    'xxx', 'foo', 1`);
    expect(result[4]).to.equal(`INSERT INTO bar SELECT 'yyy', "You should see the quote\\" -- and /* this comment */", 2`);

  });
});

function readFile(file) {
  return fs.readFileSync(`./tests/shared/sql/${file}`).toString('utf8');
}