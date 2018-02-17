CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    date timestamp with time zone not null default current_timestamp,
    name VARCHAR(64) NOT NULL,
    ssn VARCHAR(11) NOT NULL,
    email VARCHAR(64) NOT NULL,
    num INT NOT NULL
);