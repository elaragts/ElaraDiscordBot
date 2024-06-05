WITH count_cte AS (SELECT Baid,
                          count(*)                                   AS totalCount,
                          SUM(CASE WHEN Crown = 1 THEN 1 ELSE 0 END) AS clearCount,
                          SUM(CASE WHEN Crown = 2 THEN 1 ELSE 0 END) AS fullComboCount,
                          SUM(CASE WHEN Crown = 3 THEN 1 ELSE 0 END) AS zenryouCount
                   FROM SongPlayData
                   WHERE SongId = @SongId
                     AND Difficulty = @Difficulty
                     AND Baid = @Baid)
SELECT s.BestScore,
       s.BestCrown,
       c.clearCount     AS clearCount,
       c.totalCount     AS playCount,
       c.fullComboCount AS fullComboCount,
       c.zenryouCount   AS zenryouCount
FROM SongBestData s
         INNER JOIN count_cte c ON c.Baid = s.Baid
WHERE s.SongId = @SongId
  AND s.Difficulty = @Difficulty
  AND s.Baid = @Baid