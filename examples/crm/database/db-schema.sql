-- An individual
CREATE TABLE individual (
    individual_id CHAR(36) NOT NULL,
    first_name VARCHAR(256) NOT NULL DEFAULT '',
    middle_name VARCHAR(256) NOT NULL DEFAULT '',
    family_name VARHCAR(256) NOT NULL DEFAULT '',
    PRIMARY KEY(individual_id)
);

-- Simple address table for demonstration
-- Very limited
CREATE TABLE address (
    address_id CHAR(36) NOT NULL,
    line_01 VARCHAR(128) NOT NULL DEFAULT '',
    line_02 VARCHAR(128) NOT NULL DEFAULT '',
    city VARCHAR(128) NOT NULL,
    PRIMARY KEY(address_id)
);

