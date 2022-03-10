
-- COPY SatelliteMaps
-- FROM '../data/Lago_Turano_Completo_Natura.csv' 
-- DELIMITER ',' 
-- CSV HEADER;   -- uncomment if csv header is present


-- \copy SatelliteMaps(SWx, SWy, altimetry, forest, urbanization, water1, water2, cartanatura) FROM '../data/Lago_Turano_Completo_Natura-clean.csv' WITH DELIMITER ',' CSV

\set oldsim 1

\set newsim 2

INSERT INTO Simulations
VALUES(:newsim, '2017-10-19 15:23:54', 'Turano', 4559505000, 2121005000, 1000, 1000, 1.1, 10.1, 2.1, 10);


UPDATE InitialState SET SimulationID = :newsim WHERE SimulationID = :oldsim;

