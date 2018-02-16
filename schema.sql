CREATE TABLE results (
    id INT PRIMARY KEY,
    date timestamp with time zone not null default current_timestamp,
    name VARCHAR(50),
    ssn VARCHAR(11),
    email VARCHAR(50),
    num INT
);