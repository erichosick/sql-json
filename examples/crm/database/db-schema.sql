CREATE TABLE individual (
    individual_id CHAR(36) NOT NULL,
    first_name VARCHAR(80) NOT NULL,
    family_name VARHCAR(80) NOT NULL,
    PRIMARY KEY(individual_id)
);

CREATE TABLE class (
    class_id CHAR(36) NOT NULL,
    class_name VARCHAR(128) NOT NULL,
    PRIMARY KEY(class_id)
);