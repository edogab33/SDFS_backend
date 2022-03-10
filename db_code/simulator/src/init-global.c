
#include "main.h"

int init_global(PGconn *conn)
{

  PGresult *res;
  
  int rows;
  
  
#if (DEBUG > 99999)
  fprintf(stderr, "init_global(): BEGIN\n");
#endif

  
 /* Intializes random number generator */
srand((unsigned) time(0));

 /* Get simulation configuration parameters */

 
res = ExecSQLcmd(conn, "BEGIN");
 PQclear(res);

 sprintf(sqlcmd, "SELECT TimeStep, Horizon, SnapShotTime, CellSize FROM Simulations WHERE SimulationID = %d", SimulationID);
  
  res = ExecSQLtuples(conn, sqlcmd);

  rows = PQntuples(res);

  TimeStep = atof(PQgetvalue(res, 0, PQfnumber(res, "TimeStep")));
  Horizon = atof(PQgetvalue(res, 0, PQfnumber(res, "Horizon")));
  SnapShotTime = atof(PQgetvalue(res, 0, PQfnumber(res, "SnapShotTime")));
  CellSize = atoi(PQgetvalue(res, 0, PQfnumber(res, "CellSize")));

  PQclear(res);
  
  res = ExecSQLcmd(conn, "COMMIT");    
  PQclear(res);

SimulationSteps = ceil(Horizon/TimeStep);

 
 /* debug */ 
#if (DEBUG > 0)
  fprintf(stderr, "TimeStep = %lf\n", TimeStep);
  fprintf(stderr, "Horizon = %lf\n", Horizon);
  fprintf(stderr, "SnapShotTime = %lf\n", SnapShotTime);
  fprintf(stderr, "CellSize = %ld\n", CellSize);
  fprintf(stderr, "SimulationSteps = %d\n", SimulationSteps);
  fprintf(stderr, "init_global(): END\n");
#endif


 return (0);
 
}  /*  init_global() */

