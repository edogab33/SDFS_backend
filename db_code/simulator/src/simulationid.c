
#include "main.h"
#include "pgsql.h"


int GetSimulationID(PGconn *conn)
{

  PGresult *res;
 
  
#if (DEBUG > 99999)
  fprintf(stderr, "SimulationID(): BEGIN\n");
#endif

		       sprintf(sqlcmd,
"select SimulationID from Requests where SimCmd = 'start'");

		       res = ExecSQLtuples(conn, sqlcmd);

#if (DEBUG > 1)
 fprintf(stderr, "SimulationID(): PQgetvalue(res, 0, 0) = %s\n", PQgetvalue(res, 0, 0));
#endif
 
		       
 SimulationID = atoi(PQgetvalue(res, 0, 0));  
		       
PQclear(res);


  
 /* debug */ 
#if (DEBUG > 99999)
 fprintf(stderr, "SimulationID(): %d   END\n", SimulationID);
#endif
  

return (0);

}

