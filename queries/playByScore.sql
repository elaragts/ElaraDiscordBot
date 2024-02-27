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
       c.AccessCode
FROM SongPlayData spd
         INNER JOIN UserData ud ON spd.Baid = ud.Baid
         INNER JOIN Card c ON spd.Baid = c.baid
WHERE spd.SongID = ?
  AND spd.Difficulty = ?
  AND spd.Baid = ?
  AND spd.Score = ?
ORDER BY spd.Id