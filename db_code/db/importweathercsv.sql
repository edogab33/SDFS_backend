
-- COPY SatelliteMaps
-- FROM '../data/Lago_Turano_Completo_Natura.csv' 
-- DELIMITER ',' 
-- CSV HEADER;   -- uncomment if csv header is present



\copy Weather(SWx, SWy, windangle, windspeed) FROM '../data/weather.csv' WITH DELIMITER ',' CSV


--\copy SatelliteMaps(SWx, SWy, altimetry, forest, urbanization, water1, water2, cartanatura) FROM '../data/short.csv' WITH DELIMITER ',' CSV


