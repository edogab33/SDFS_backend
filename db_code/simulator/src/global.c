#include "main.h"

CellState* present_state = NULL;
CellState* next_state = NULL;
CellState* snapshot = NULL;

CellParameters* cell_parameters = NULL;

myint1 XSize = 0;  /*  Num of cells for X axis  */
myint1 YSize = 0;  /*  Num of cells for Y axis  */
double Horizon = 0.0;
double SnapShotTime = 0.0;
double TimeStep = 0.0;
myint1 CellSize = 0;

cellxytype minSWx = 0;
cellxytype minSWy = 0;
cellxytype maxSWx = 0;
cellxytype maxSWy = 0;

char ConfigFileName[FileNameSize] = "../../data/config.txt";
char DataFileName[FileNameSize] = "../../data/exportall.csv";
char InitStateFileName[FileNameSize] = "../../data/init-state.csv";
char PresentStateFileName[FileNameSize] = "../../data/present-state.csv";

char sqlcmd[SQLCMD_SIZE];
int SimulationSteps;
int SimulationID = 1;
double ElapsedMinutes = 0.0;
