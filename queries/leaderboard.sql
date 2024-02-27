SELECT ud.MyDonName, c.AccessCode, sbd.BestScore, sbd.BestCrown, sbd.BestScoreRank
FROM SongBestData sbd
         INNER JOIN UserData ud ON sbd.Baid = ud.Baid
         INNER JOIN Card c ON sbd.Baid = c.Baid
WHERE SongID = ?
  AND Difficulty = ?
ORDER BY sbd.BestScore DESC
LIMIT 10