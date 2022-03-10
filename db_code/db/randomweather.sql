
-- COPY SatelliteMaps
-- FROM '../data/Lago_Turano_Completo_Natura.csv' 
-- DELIMITER ',' 
-- CSV HEADER;   -- uncomment if csv header is present


-- \copy SatelliteMaps(SWx, SWy, altimetry, forest, urbanization, water1, water2, cartanatura) FROM '../data/Lago_Turano_Completo_Natura-clean.csv' WITH DELIMITER ',' CSV


UPDATE SatelliteMaps SET windangle = (-pi() + 2*pi()*random()) WHERE windangle IS NULL;

UPDATE SatelliteMaps SET windspeed = 100*random() WHERE windspeed IS NULL;
