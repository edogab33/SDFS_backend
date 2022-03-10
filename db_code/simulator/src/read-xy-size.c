
#include "main.h"

int read_XYsize(PGconn *conn)
{

 PGresult *res; 

 unsigned int rows;
 
#if (DEBUG > 99999)
  fprintf(stderr, "read_XYsize(): BEGIN\n");
#endif

res = ExecSQLcmd(conn, "BEGIN");
 PQclear(res);


 sprintf(sqlcmd, "SELECT SWx, SWy, Xsize, Ysize FROM Simulations WHERE SimulationID = %d", SimulationID);
  
  res = ExecSQLtuples(conn, sqlcmd);

  rows = PQntuples(res);

  minSWx = atoi(PQgetvalue(res, 0, PQfnumber(res, "SWx")));
  minSWy = atoi(PQgetvalue(res, 0, PQfnumber(res, "SWy")));
  XSize = atoi(PQgetvalue(res, 0, PQfnumber(res, "Xsize")));
  YSize = atoi(PQgetvalue(res, 0, PQfnumber(res, "Ysize")));

  PQclear(res);
  
  res = ExecSQLcmd(conn, "COMMIT");    
  PQclear(res);
  
  maxSWx = minSWx + (XSize - 1)*CellSize;
  maxSWy = minSWy + (YSize - 1)*CellSize;
  

 /* debug */ 
#if (DEBUG > 99999)
  fprintf(stderr, "read_XYsize(): minSWx = %llu\n", minSWx);
  fprintf(stderr, "read_XYsize(): minSWy = %llu\n", minSWy);
  fprintf(stderr, "read_XYsize(): maxSWx = %llu\n", maxSWx);
  fprintf(stderr, "read_XYsize(): maxSWy = %llu\n", maxSWy);
  fprintf(stderr, "read_XYsize(): XSize = %ld\n", XSize);
  fprintf(stderr, "read_XYsize(): YSize = %ld\n", YSize);
  fprintf(stderr, "read_XYsize(): END\n");
#endif
  
return (0);

}   /*  read_XYsize() */

