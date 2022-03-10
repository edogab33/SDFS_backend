
#include "main.h"
#include "pgsql.h"


int state2db(PGconn *conn, int t)
{

  static float time_since_last_snapshot = 0;

  PGresult *res;

  int counter = 0;
  
  myint1 i, j;
  
  
#if (DEBUG > 99999)
  fprintf(stderr, "state2db(%d): %lf BEGIN\n", t, ElapsedMinutes);
#endif

  
	   if (time_since_last_snapshot >= SnapShotTime)
	     { /* snapshot to db */

	       /* reset timer */
	       time_since_last_snapshot = 0;

	       /* snapshot to db */

  res = ExecSQLcmd(conn, "BEGIN");    
  PQclear(res);

  
  for(i=0; i < XSize; i++)
     {
       for (j=0; j < YSize; j++)
	 {
	   /*  save state snapshot to db  */

#if (DEBUG > 1000000)
	   fprintf(stderr,
		   "state2db(%d): %lf: update (%llu, %llu) deltas: fire = %lf, fuel = %lf\n",
		   t, ElapsedMinutes, index2x(i), index2y(j),
		   fabs(snapshot[index2to1(i,j)].fire - next_state[index2to1(i,j)].fire),
		   fabs(snapshot[index2to1(i,j)].fuel - next_state[index2to1(i,j)].fuel)		   
		   );
#endif


	   if
	     (
	      (fabs(snapshot[index2to1(i,j)].fire - next_state[index2to1(i,j)].fire) > 1E-6) ||
	      (fabs(snapshot[index2to1(i,j)].fuel - next_state[index2to1(i,j)].fuel) > 1E-6)
	      )
	     /* then, update snapshot */
	     {
	       counter++;
	       
#if (DEBUG > 0)
	   fprintf(stderr,
		   "state2db(%d): %lf: update (%llu, %llu) deltas: fire = %lf, fuel = %lf\n",
		   t, ElapsedMinutes, index2x(i), index2y(j),
		   fabs(snapshot[index2to1(i,j)].fire - next_state[index2to1(i,j)].fire),
		   fabs(snapshot[index2to1(i,j)].fuel - next_state[index2to1(i,j)].fuel)		   
		   );
#endif

	   snapshot[index2to1(i,j)].fire = next_state[index2to1(i,j)].fire;
           snapshot[index2to1(i,j)].fuel = next_state[index2to1(i,j)].fuel;
	   
	   sprintf(sqlcmd,
"INSERT INTO SimulatorSnapshots VALUES(%d, %lf, %llu, %llu, %lf, %lf)",
			       SimulationID,  /* SimulationID */
			       ElapsedMinutes,
index2x(i),
index2y(j),
next_state[index2to1(i,j)].fire,
next_state[index2to1(i,j)].fuel
		       );
	       
res = ExecSQLcmd(conn, sqlcmd);    
// PQclear(res);
	     }  /* then */
	   
	 }  /*  for j  */
     }  /*  for i  */

  res = ExecSQLcmd(conn, "COMMIT");    
  PQclear(res);
  
        }  /* end snapshot to db  */

	   else /* no snapshort  */
	     {
	       /* update times */
                time_since_last_snapshot = time_since_last_snapshot + TimeStep;
	     }  /*  end no snapshot  */
	   
	   
  /* updated elapsed time  */
	   ElapsedMinutes = ElapsedMinutes + TimeStep;
  

	   
 /* debug */ 
#if (DEBUG > 0)
	   fprintf(stderr, "state2db(%d): %lf . Updated %d cells. END\n", t, ElapsedMinutes, counter);
#endif
  

return (0);

}

