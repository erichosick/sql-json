-- An individual
CREATE TABLE individual (
    individual_id CHAR(36) NOT NULL UNIQUE,
    first_name VARCHAR(256) NOT NULL DEFAULT '',
    middle_name VARCHAR(256) NOT NULL DEFAULT '',
    family_name VARHCAR(256) NOT NULL DEFAULT ''
);

CREATE TABLE address_type (
    address_type_id SMALLINT NOT NULL UNIQUE,
    display VARCHAR(64) NOT NULL DEFAULT '',
    description VARCHAR(128) NOT NULL DEFAULT ''
);

CREATE TABLE country (
    country_id SMALLINT NOT NULL UNIQUE,
    country_alpha_2 CHAR(2) NOT NULL DEFAULT '',
    country_alpha_3 CHAR(3) NOT NULL DEFAULT '',
    country_name VARCHAR(64) NOT NULL DEFAULT ''
);

-- Simple ; address table for demonstration: very limited
CREATE TABLE address (
    address_id CHAR(36) NOT NULL UNIQUE,
    country_id SMALL NOT NULL DEFAULT 0,
    name VARCHAR(256) NOT NULL DEFAULT '',
    line_01 VARCHAR(256) NOT NULL DEFAULT '',
    line_02 VARCHAR(256) NOT NULL DEFAULT '',
    city VARCHAR(128) NOT NULL DEFAULT '',
    state VARCHAR(64) NOT NULL DEFAULT '',
    country VARCHAR(128) NOT NULL DEFAULT '',
    postal_code VARCHAR(64) NOT NULL DEFAULT '',
    FOREIGN KEY (country_id) REFERENCES country(country_id)
);

CREATE TABLE phone_number (
    phone_number_id SMALLINT NOT NULL UNIQUE,
    phone_number VARCHAR(32)
);

