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
ORDER BY Id DESC
LIMIT 1;