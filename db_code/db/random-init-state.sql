
-- COPY SatelliteMaps
-- FROM '../data/Lago_Turano_Completo_Natura.csv' 
-- DELIMITER ',' 
-- CSV HEADER;   -- uncomment if csv header is present


-- \copy SatelliteMaps(SWx, SWy, altimetry, forest, urbanization, water1, water2, cartanatura) FROM '../data/Lago_Turano_Completo_Natura-clean.csv' WITH DELIMITER ',' CSV

\set simid 1

INSERT INTO Simulations
--VALUES(:simid, '2017-10-19 15:23:54', 'Turano', 4559505, 2121005, 1000, 1000, 1.1, 10.1, 2.1, 10);
VALUES(:simid, '2017-10-19 15:23:54', 'Turano', 4559505, 2121005, 5, 5, 1.1, 10.1, 2.1, 10);


\copy InitialState(SWx, SWy, fire, fuel) FROM '../data/init-state.csv' WITH DELIMITER ',' CSV

UPDATE InitialState SET SimulationID = :simid  WHERE SimulationID = 0 ;

--INSERT INTO InitialState
--SELECT :simid, SWx, SWy, floor(0.05 + random()), 100*random()
--FROM SatelliteMaps;


INSERT INTO Requests VALUES('start', :simid);

-- UPDATE InitialState
--        SET (SWx, SWy) = (select SWx, SWy from SatelliteMaps);


--       SWx = x, SWy = y, fire = random(), fuel = 100*random()
--       FROM SatelliteMaps
--       WHERE (SatelliteMaps.SWx = InitialState.x)  and
--             (SatelliteMaps.SWy = InitialState.y);

