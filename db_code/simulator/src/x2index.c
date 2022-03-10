
#include "main.h"

/*  old value
#define SCALING 1000
*/

#define SCALING 1


int x2index(cellxytype x)
{

#if (DEBUG > 9999999)
  fprintf(stderr, "x2index(%llu) = %d; minSWx = %llu; x - minSWx = %llu\n", x,
	  (int) ((x - minSWx)/(SCALING*CellSize)),
	  minSWx,
	  (x - minSWx)
	  );
#endif

 
  return ( (int) ((x - minSWx)/(SCALING*CellSize)) );

}   /*  read_XYsize() */


int y2index(cellxytype y)
{

#if (DEBUG > 9999999)
  fprintf(stderr, "y2index(%llu) = %ld; minSWy = %llu; y - minSWy = %llu, (y - minSWx)/(SCALING*CellSize) = %d\n",
	  y,
	  ((myint1) ((y - minSWy)/SCALING))/CellSize,
	  minSWy,
          (y - minSWy),
	  (int) ((y - minSWy)/(SCALING*CellSize))
	  );
#endif
  
  return ( (int) ((y - minSWy)/(SCALING*CellSize)) );

}   /*  read_XYsize() */


cellxytype index2x(int z)
{
 
  return ( minSWx + z*SCALING*CellSize);

}   /*  read_XYsize() */


cellxytype index2y(int z)
{
 
  return ( minSWy + z*SCALING*CellSize );

}   /*  read_XYsize() */
