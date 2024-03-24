SELECT ud.MyDonName, sbd.Baid, sbd.BestScore, sbd.BestCrown, sbd.BestScoreRank
FROM SongBestData sbd
         INNER JOIN UserData ud ON sbd.Baid = ud.Baid
WHERE SongID = ?
  AND Difficulty = ?
ORDER BY sbd.BestScore DESC
LIMIT 10
OFFSET ?