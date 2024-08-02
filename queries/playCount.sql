SELECT
    strftime('%Y-%m', PlayTime) AS Month,
    COUNT(*) AS PlayCount
FROM
    SongPlayData
WHERE
    Baid = ?
GROUP BY
    strftime('%Y-%m', PlayTime)
ORDER BY
    Month;