CREATE TABLE IF NOT EXISTS "user"
(
    discordId  TEXT
        primary key,
    accessCode TEXT
, Baid integer);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE IF NOT EXISTS "battle"
(
    id          integer not null
        constraint id
            primary key autoincrement,
    songId      integer,
    playerOneBaid integer,
    playerTwoBaid integer,
    winnerBaid integer

);
