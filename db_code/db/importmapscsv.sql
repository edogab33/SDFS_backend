
-- COPY SatelliteMaps
-- FROM '../data/Lago_Turano_Completo_Natura.csv' 
-- DELIMITER ',' 
-- CSV HEADER;   -- uncomment if csv header is present


\copy SatelliteMaps(SWx, SWy, altimetry, forest, urbanization, water1, water2, cartanatura) FROM '../data/satellite-map.csv' WITH DELIMITER ',' CSV


--\copy SatelliteMaps(SWx, SWy, altimetry, forest, urbanization, water1, water2, cartanatura) FROM '../data/Lago_Turano_Completo_Natura-clean.csv' WITH DELIMITER ',' CSV


--\copy SatelliteMaps(SWx, SWy, altimetry, forest, urbanization, water1, water2, cartanatura) FROM '../data/short.csv' WITH DELIMITER ',' CSV


