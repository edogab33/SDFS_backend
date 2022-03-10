
#include "main.h"
#include "pgsql.h"

int main()
{
  int i, j, t;
 CellState* tmp = NULL;
 
  PGconn *conn;
  PGresult *res;

#if (DEBUG > 0)
  setvbuf(stdout, (char*) NULL, _IONBF, 0);
  setvbuf(stderr, (char*) NULL, _IONBF, 0);
#endif
  
  /*  connect to db  */
conn = connect2db();
   
 GetSimulationID(conn);
 
 /* Intializes global variables */
  init_global(conn);

  /*   read area size   */
  read_XYsize(conn);

  /*   initialize data structures  */

  init_cell_memory();

  init_state_memory();

  /*   read map and weather data from csv file  */
  read_cell_data(conn);
  
 
     /*   read initial state from file into preset_state */
  read_initial_state(conn);

 
  for (t=0; t <= SimulationSteps; t++)
    {

     for(i=0; i < XSize; i++)
      {
          for(j=0; j < YSize; j++)
          {	    
            update_state(i, j);
          }  /*  for j  */

      }  /*  for i  */


     /* update snapshot  */

      state2db(conn, t);

      /* update present state */

     tmp = present_state;

     present_state = next_state;

     next_state = tmp;
    
    }  /*  for t  */

  
}  /*  main()  */

