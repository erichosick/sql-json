INSERT INTO foo_bar (foo_id, x) 'lfdkljdfkjlsdlf', 2000;

SELECT * FROM foo_bar 
    WHERE /* A multiline comment
    you should not see this
    XXX

    */
    x > 12
;

