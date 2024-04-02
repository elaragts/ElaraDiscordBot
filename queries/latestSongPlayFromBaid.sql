SELECT Id,
       Score,
       ScoreRank,
       Crown,
       GoodCount,
       OkCount,
       MissCount,
       DrumrollCount,
       ComboCount
FROM SongPlayData
WHERE Baid = ?
  AND SongId = ?
  AND Difficulty = ?
ORDER BY Id DESC
LIMIT 1;