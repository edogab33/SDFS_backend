
#include "main.h"


int read_initial_state(PGconn *conn)
{
  myint1 i, j;
   
  cellxytype SWx, SWy;
  double fire;
  double fuel;
  
  long int counter = 0;

  PGresult *res;
  int rows;

  int col_SWx, col_SWy, col_fire, col_fuel;
  
#if (DEBUG > 99999)
  fprintf(stderr, "read_initial_state(): BEGIN\n");
#endif
  

 /* read initial state */

 res = ExecSQLcmd(conn, "BEGIN");
 PQclear(res);

 
  sprintf(sqlcmd, "SELECT SWx, SWy, fire, fuel FROM InitialState WHERE (SWx >= %llu) and (SWx <= %llu) and (SWy >= %llu) and (SWy <= %llu)",
	  minSWx, maxSWx, minSWy, maxSWy);

  
  res = ExecSQLtuples(conn, sqlcmd);

  rows = PQntuples(res);

#if (DEBUG > 0)
  fprintf(stderr, "read_initial_state(): sqlcmd : %s, rows = %d\n", sqlcmd, rows);
#endif


  col_SWx = PQfnumber(res, "SWx");
  col_SWy = PQfnumber(res, "SWy");
  col_fire = PQfnumber(res, "fire");
  col_fuel = PQfnumber(res, "fuel");
  

 for(int k=0; k<rows; k++) {

#if (DEBUG > 0)
   fprintf(stderr, "read_initial_state(): begin reading row %d (%d, %d, %d, %d), (%s, %s, %s, %s)\n", k,
	   col_SWx, col_SWy, col_fire, col_fuel,
	   PQgetvalue(res, k, col_SWx), PQgetvalue(res, k, col_SWy), PQgetvalue(res, k, col_fire), PQgetvalue(res, k, col_fuel)
	   );
#endif

        SWx = atoi(PQgetvalue(res, k, col_SWx));
	SWy = atoi(PQgetvalue(res, k, col_SWy));
	
	fire = atof(PQgetvalue(res, k, col_fire));
	fuel = atof(PQgetvalue(res, k, col_fuel));
	
	i = x2index(SWx);
	j = y2index(SWy);
	
	present_state[index2to1(i, j)].fire = fire;
        present_state[index2to1(i,j)].fuel = fuel;
	snapshot[index2to1(i, j)].fire = fire;
 	snapshot[index2to1(i, j)].fuel = fuel;
	
	counter++;

#if (DEBUG > 0)
	fprintf(stderr, "read_initial_state(): end reading row %d: (%llu, %llu, %lf, %lf)\n", k, SWx, SWy, fire, fuel);
#endif
 
 }  /*  for  */


   
  res = ExecSQLcmd(conn, "COMMIT");    
  PQclear(res);


  /* initialize snapshots   */

  res = ExecSQLcmd(conn, "BEGIN");    
  PQclear(res);


   for(i=0; i < XSize; i++)
     {
       for (j=0; j < YSize; j++)
	 {
	   /*  save state snapshot to db  */

	   sprintf(sqlcmd,
"INSERT INTO SimulatorSnapshots VALUES(%d, %lf, %llu, %llu, %lf, %lf)",
			       SimulationID,  /* SimulationID */
			       ElapsedMinutes,
index2x(i),
index2y(j),
snapshot[index2to1(i, j)].fire,
snapshot[index2to1(i, j)].fuel
		       );
	       
res = ExecSQLcmd(conn, sqlcmd);
 

     }  /*  for j  */
     }  /*  for i  */


  res = ExecSQLcmd(conn, "COMMIT");    
  PQclear(res);

  
  
 /* debug */ 
#if (DEBUG > 0)
 fprintf(stderr, "read_initial_state(): inserted %ld items. END\n", counter);
#endif
  

return (0);
  		  
}  /*  read_initial_state()   */  

