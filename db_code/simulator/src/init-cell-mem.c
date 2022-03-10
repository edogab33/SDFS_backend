
#include "main.h"

int init_cell_memory()
{
 
#if (DEBUG > 99999)
  fprintf(stderr, "init_cell_memory(): BEGIN\n");
#endif

  
  cell_parameters = (CellParameters *) malloc(XSize*YSize*sizeof(CellParameters));

  if (cell_parameters == NULL)
    {
      fprintf(stderr, "init_cell_parameters(): No malloc space\n");
      exit (1);
    }

#if (DEBUG > 99999)
  fprintf(stderr, "init_cell_memory(): END\n");
#endif

  /* malloc was OK  */

  return (0);
    
}

