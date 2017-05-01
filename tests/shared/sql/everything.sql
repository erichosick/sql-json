--Comment
--Comment comment

# Other comment
DROP DATABASE foo;

# Multiline statement
CREATE DATABASE foo
    CHARSET = utf8;

CREATE TABLE bar(
    id CHAR(36) PRIMARY KEY, --comment at the end of a line 
    key VARCHAR(200), --what is this table really for ?
    value INT, /* Multiline "comment"" inside a statement */
) ENGINE = InnoDB or something;

INSERT INTO bar SELECT
    'xxx', 'foo', 1;
INSERT INTO bar SELECT 'yyy', "You should see the quote\" -- and /* this comment */", 2

/* 
done!
