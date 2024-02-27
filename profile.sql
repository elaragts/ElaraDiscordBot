WITH DifficultyCTE AS (SELECT Baid,
                              AchievementDisplayDifficulty AS NewDifficulty
                       FROM UserData
                       WHERE Baid = ?
                       UNION
                       SELECT Baid,
                              CASE
                                  WHEN AchievementDisplayDifficulty = 5 THEN AchievementDisplayDifficulty - 1
                                  ELSE AchievementDisplayDifficulty
                                  END AS NewDifficulty
                       FROM UserData
                       WHERE Baid = ?
                         AND AchievementDisplayDifficulty = 5),
     AchievementPanel AS (SELECT s.Baid,
                                 BestScoreRank,
                                 BestCrown,
                                 COUNT(s.Baid) AS Count
                          FROM SongBestData s
                                   INNER JOIN DifficultyCTE d ON s.Baid = d.Baid
                              AND (s.Difficulty = d.NewDifficulty)
                          GROUP BY s.Baid, BestScoreRank, BestCrown),
     PlayCount AS (SELECT Baid, COUNT(Baid) AS PlayCount
                   FROM SongPlayData
                   WHERE Baid = ?),
     Dan AS (SELECT Baid, MAX(DanId) AS DanId, ClearState
             FROM DanScoreData
             WHERE DanType = 1
               AND Baid = ?
               AND ClearState > 0)
SELECT ud.MyDonName,
       ud.AchievementDisplayDifficulty,
       pc.PlayCount,
       d.DanId,
       d.ClearState,
       bsr.bestscorerank_1,
       bsr.bestscorerank_2,
       bsr.bestscorerank_3,
       bsr.bestscorerank_4,
       bsr.bestscorerank_5,
       bsr.bestscorerank_6,
       bsr.bestscorerank_7,
       bsr.bestscorerank_8,
       bcr.bestcrownrank_1,
       bcr.bestcrownrank_2,
       bcr.bestcrownrank_3
FROM UserData ud
         INNER JOIN (SELECT Baid,
                            SUM(CASE WHEN BestScoreRank = 1 THEN Count ELSE 0 END) AS bestscorerank_1,
                            SUM(CASE WHEN BestScoreRank = 2 THEN Count ELSE 0 END) AS bestscorerank_2,
                            SUM(CASE WHEN BestScoreRank = 3 THEN Count ELSE 0 END) AS bestscorerank_3,
                            SUM(CASE WHEN BestScoreRank = 4 THEN Count ELSE 0 END) AS bestscorerank_4,
                            SUM(CASE WHEN BestScoreRank = 5 THEN Count ELSE 0 END) AS bestscorerank_5,
                            SUM(CASE WHEN BestScoreRank = 6 THEN Count ELSE 0 END) AS bestscorerank_6,
                            SUM(CASE WHEN BestScoreRank = 7 THEN Count ELSE 0 END) AS bestscorerank_7,
                            SUM(CASE WHEN BestScoreRank = 8 THEN Count ELSE 0 END) AS bestscorerank_8
                     FROM AchievementPanel
                     WHERE BestScoreRank IS NOT NULL
                     GROUP BY Baid) bsr ON ud.Baid = bsr.Baid
         INNER JOIN (SELECT Baid,
                            SUM(CASE WHEN BestCrown = 1 THEN Count ELSE 0 END) AS bestcrownrank_1,
                            SUM(CASE WHEN BestCrown = 2 THEN Count ELSE 0 END) AS bestcrownrank_2,
                            SUM(CASE WHEN BestCrown = 3 THEN Count ELSE 0 END) AS bestcrownrank_3
                     FROM AchievementPanel
                     WHERE BestCrown IS NOT NULL
                     GROUP BY Baid) bcr ON ud.Baid = bcr.Baid
         INNER JOIN PlayCount pc ON ud.Baid = pc.Baid
         LEFT JOIN Dan d ON ud.Baid = d.Baid
WHERE ud.Baid = ?;
