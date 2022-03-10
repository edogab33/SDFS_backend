
#include "main.h"

CellState* init_state()
{
  myint1 i, j;

  CellState* state_var;
   
  state_var = (CellState *) malloc(XSize*YSize*sizeof(CellState));

  if (state_var == NULL)
    {
      fprintf(stderr, "init_state_variables(): No malloc space for state_var\n");
      exit (1);
    }

 
 /* malloc was OK  */

  return (state_var);  


    
}

