
-- COPY SatelliteMaps
-- FROM '../data/Lago_Turano_Completo_Natura.csv' 
-- DELIMITER ',' 
-- CSV HEADER;   -- uncomment if csv header is present




UPDATE SatelliteMaps SET windangle = (select windangle from Weather where SatelliteMaps.SWx = Weather.SWx and SatelliteMaps.SWy = Weather.SWy);

UPDATE SatelliteMaps SET windspeed = (select windspeed from Weather where SatelliteMaps.SWx = Weather.SWx and SatelliteMaps.SWy = Weather.SWy);

