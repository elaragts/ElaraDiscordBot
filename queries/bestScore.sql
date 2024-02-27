SELECT BestScore,
       BestCrown
FROM SongBestData
WHERE SongID = ?
  AND Difficulty = ?
  AND Baid = ?