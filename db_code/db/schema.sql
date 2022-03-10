
\set ON_ERROR_STOP on
-- \set QUIET on
\set db sdfs
drop database if exists :db;
create database :db;
\c :db

-- Percfentage of burning fuel available in cell (0 if cell cannot burn anymore)
create domain fueltype as float check ((value >= 0) and (value <= 100)) ;

create domain bigintgez as bigint check (value >= 0) ;
create type simcmdtype as enum ('nop', 'start', 'stop'); 

create table Parameters (
        CellSize int not null  -- lenght of squared cell side in meters
);


-- Data from satellite maps and weather station
create table Weather (
        SWx bigintgez not null,  -- South-West x, NEx = SWx + CellSize
	SWy bigintgez not null,  -- South-West y, NEy = SWy + CellSize
	windangle  float,
	windspeed  float,	
	constraint "cellweather" primary key (SWx, SWy),
	constraint "windangle" check (windangle >= -pi() and windangle <= pi()),
	constraint "windspeed" check (windspeed >= 0)
	);



-- Data from satellite maps and weather station
create table SatelliteMaps (
        SWx bigintgez not null,  -- South-West x, NEx = SWx + CellSize
	SWy bigintgez not null,  -- South-West y, NEy = SWy + CellSize
	altimetry  int not null,
	forest int not null,
	urbanization int not null,
	water1 int not null,
	water2 int not null, -- NOTE: currently unused by the model
	cartanatura int not null, -- NOTE: currently unused by the model
	windangle  float,
	windspeed  float,	
	-- fuel float,	-- Fuel (in Kg) available in cell for burning, computed from cell satellite data
        constraint "cell" primary key (SWx, SWy),
        constraint "altimetry" check (altimetry >= 0 and altimetry <= 4380),
	-- constraint "forest" check  ((forest >= 0 and forest <= 2) or (forest = 255)),
	constraint "forest" check  ((forest >= 0) and (forest <= 255)),
	constraint "urbanization" check (urbanization >= 0 and urbanization <= 255),
	-- constraint "water1" check ((water1 >= 0 and water1 <= 4) or (water1 = 253) or (water1 = 255)),
	constraint "water1" check ((water1 >= 0) and (water1 <= 255)),
	constraint "cartanatura" check (cartanatura >= 1 and cartanatura <= 90),
	constraint "windangle" check (windangle >= -pi() and windangle <= pi()),
	constraint "windspeed" check (windspeed >= 0)
--	constraint "fuelavailable" check (fuel >= 0)
	);


-- Keeps memory of simulations considered and associates time and name to them.
create table Simulations (
        SimulationID int not null unique,    -- SimulationID
        InitialTime timestamp not null,    -- both initial date and time (no time zone) of simulation
        placename varchar(100) not null,        -- e.g.: Turano
        SWx bigintgez not null,  -- Most South-West x of area, minSWx
	SWy bigintgez not null,  -- Most  South-West y of area, minSWy
	Xsize int not null,  -- Number of cells on x axis, so NEx = SWx + (Xsize - 1)*CellSize
	Ysize int not null,  -- Number of cells on y axis, so NEy = SWy + (Ysize - 1)*CellSize
        TimeStep float not null, -- Time Step (in minutes)
	Horizon float not null, --  Simulation horizon in minutes
	SnapShotTime float not null, --  Time in minutes between snapshots
	CellSize int not null, --  Length (in meters) of side of squared cell (integer)
        constraint "SimulationID" primary key (SimulationID),
	foreign key (SWx, SWy) references SatelliteMaps(SWx, SWy)
);


-- Initialized from inputs from web site before starting the simulation 
create table InitialState (
        SimulationID int DEFAULT 0,    -- SimulationID
        SWx bigintgez not null,  -- Most South-West x of cell, NEx = SWx + CellSize
	SWy bigintgez not null,  -- Most South-Westt y of cell, NEy = SWy + CellSize
        fire float DEFAULT 0.0,
	fuel fueltype DEFAULT 100.0,  -- Percentage of burning fuel available in cell (0 if cell cannot burn anymore)
        constraint initcell primary key (Swx, SWy),
	foreign key (SWx, SWy) references SatelliteMaps(SWx, SWy)
--	foreign key (SimulationID) references Simulations(SimulationID)
);


-- Snapshots of simulation results used to show pictures on the web
create table SimulatorSnapshots (
        SimulationID int not null,    -- SimulationID
        elapsedminutes float not null,    -- minutes elapsed since InitialTime in Simulations(SimulationID)
        SWx bigintgez not null,  -- Most South-West x of cell, NEx = SWx + CellSize
	SWy bigintgez not null,  -- Most South-West y of cell, NEy = SWy + CellSize
        fire float not null, -- true iff cell on fire
	fuel fueltype not null,   -- Percentage of burning fuel available in cell (0 if cell cannot burn anymore)
        constraint "cellsnap" primary key (elapsedminutes, SWx, SWy),
	foreign key (SWx, SWy) references SatelliteMaps(SWx, SWy),
	foreign key (SimulationID) references Simulations(SimulationID)
);




-- Simulator periodically checks this field for requests from web server.
-- After taking in charge a request simulator sets this field to nop, its normal value.
-- field case sensitive
-- available commands:
-- nop: no request pending
-- start: start simulation (with the state from InitialState)
-- stop: stop simulation
create table Requests (
     SimCmd simcmdtype unique,     -- Available commands: nop, start, stop.
     SimulationID int,     -- SimulationID to be simulated
     foreign key (SimulationID) references Simulations(SimulationID)
);


