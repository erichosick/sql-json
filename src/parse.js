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