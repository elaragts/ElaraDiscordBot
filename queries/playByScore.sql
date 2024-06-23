SELECT ud.MyDonName,
       spd.PlayTime,
       spd.Score,
       spd.ComboCount,
       spd.Crown,
       spd.ScoreRank,
       spd.DrumrollCount,
       spd.GoodCount,
       spd.MissCount,
       spd.OkCount,
       c.AccessCode,
       (SELECT (count(*) + 1)
        FROM SongBestData
        WHERE SongId = @songId
          AND Difficulty = @difficulty
          AND BestScore > @score) AS leaderboardPosition
FROM SongPlayData spd
         INNER JOIN UserData ud ON spd.Baid = ud.Baid
         INNER JOIN Card c ON spd.Baid = c.baid
WHERE spd.SongID = @songId
  AND spd.Difficulty = @difficulty
  AND spd.Baid = @Baid
  AND spd.Score = @score
ORDER BY spd.Id