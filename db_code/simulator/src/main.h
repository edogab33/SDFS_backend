
#ifndef main_h
#define main_h

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>
#include <stddef.h>
#include <limits.h>

#include "pgsql.h"

#define DEBUG 100000

#define MAX(x, y) (((x) > (y)) ? (x) : (y))
#define MIN(x, y) (((x) < (y)) ? (x) : (y))


#define FileNameSize 100
#define SQLCMD_SIZE 500

typedef unsigned long long cellxytype;

typedef long int myint1;

typedef struct CellRecord {
  myint1 altimetry;
  myint1 forest;
  myint1 urbanization;
  myint1 water1;
  myint1 water2;
  myint1 cartanatura;
  double windangle;
  double windspeed;  
} CellParameters;

typedef struct StateRecord {
  double fire ;
  double fuel ; 
} CellState;


int init_global(PGconn *conn);
int read_XYsize(PGconn *conn);

CellState* init_state();
CellParameters* init_cell_parameters();
int read_initial_state(PGconn *conn);
int read_cell_data();
void update(myint1 i, myint1 j);
int index2to1(int i, int j);
int print_state(int t);

int init_cell_memory();
int init_state_memory();

int x2index(cellxytype x);
int y2index(cellxytype y);
cellxytype index2x(int z);
cellxytype index2y(int z);

int state2db(PGconn *conn, int t);
int GetSimulationID(PGconn *conn);

void update_state(myint1 i, myint1 j);

extern CellState* present_state;
extern CellState* next_state;
extern CellState* snapshot;

extern CellParameters* cell_parameters;

extern cellxytype minSWx;
extern cellxytype minSWy;
extern cellxytype maxSWx;
extern cellxytype maxSWy;

extern myint1 XSize;  /*  Num of cells for X axis  */
extern myint1 YSize;  /*  Num of cells for Y axis  */
extern double Horizon;
extern double SnapShotTime;
extern double TimeStep;
extern myint1 CellSize;

extern char ConfigFileName[FileNameSize];
extern char DataFileName[FileNameSize];
extern char InitStateFileName[FileNameSize];
extern char PresentStateFileName[FileNameSize];

extern char sqlcmd[SQLCMD_SIZE];

extern int SimulationSteps;
extern int SimulationID;
extern double ElapsedMinutes;

#endif
