
#include "main.h"

int init_state_memory()
{
  
#if (DEBUG > 99999)
  fprintf(stderr, "init_state_memory(): BEGIN\n");
#endif

  
  present_state = (CellState *) malloc(XSize*YSize*sizeof(CellState));

  if (present_state == NULL)
    {
      fprintf(stderr, "init_state_variables(): No malloc space for present_state\n");
      exit (1);
    }


  next_state = (CellState *) malloc(XSize*YSize*sizeof(CellState));

  if (next_state == NULL)
    {
      fprintf(stderr, "init_state_variables(): No malloc space for next_state\n");
      exit (1);
    }



  snapshot = (CellState *) malloc(XSize*YSize*sizeof(CellState));

  if (next_state == NULL)
    {
      fprintf(stderr, "init_state_variables(): No malloc space for snapshot\n");
      exit (1);
    }


  
  
#if (DEBUG > 99999)
  fprintf(stderr, "init_state_memory(): END\n");
#endif

  
 /* malloc was OK  */

  return (0);  


    
}

