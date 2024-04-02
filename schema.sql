CREATE TABLE IF NOT EXISTS "user"
(
    discordId  TEXT
        primary key,
    accessCode TEXT
, Baid integer);
CREATE TABLE IF NOT EXISTS "battle"
(
    id          integer not null
        constraint id
            primary key autoincrement,
    songId      integer,
    playerOneId integer,
    playerTwoId integer,
    winnerId integer,
FOREIGN KEY(playerOneId) REFERENCES user(discordId),
FOREIGN KEY(playerTwoId) REFERENCES user(discordId),
FOREIGN KEY(winnerId) REFERENCES user(discordId)
    
);
CREATE TABLE sqlite_sequence(name,seq);
