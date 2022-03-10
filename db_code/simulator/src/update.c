
#include "main.h"

void update_state(myint1 i, myint1 j)
{

#if (DEBUG > 0)
  static long long unsigned int counter = 0;

  counter++;
#endif
  
  // fprintf(stderr, "Compute next state for cell %d, %d (TBD)\n", i, j);

  /*  fake  */

#if (DEBUG > 999999)
  fprintf(stderr, "update_state(%ld, %ld): BEGIN\n", i, j);
#endif
     
	   /*  fake reading  */
  next_state[index2to1(i,j)].fuel = MAX(0, present_state[index2to1(i,j)].fuel - TimeStep*20*present_state[index2to1(i,j)].fire);
	   
  next_state[index2to1(i,j)].fire =  (present_state[index2to1(i,j)].fire >= 1.0) &&( present_state[index2to1(i,j)].fuel > 0.0) ? 1.0 : 0.0;
    

#if (DEBUG > 0)
  
  fprintf(stderr, "update_state(%ld, %ld): call %llu: present.fuel = %lf, next.fuel = %lf, present.fire = %lf, next.fire = %lf\n", i, j, counter,
	  present_state[index2to1(i,j)].fuel,
	  next_state[index2to1(i,j)].fuel,
	  present_state[index2to1(i,j)].fire,
	  next_state[index2to1(i,j)].fire
	  );

     
   if
	     (
	      (fabs(present_state[index2to1(i,j)].fire - next_state[index2to1(i,j)].fire) > 1E-4) ||
	      (fabs(present_state[index2to1(i,j)].fuel - next_state[index2to1(i,j)].fuel) > 1E-4)
	      )
   {
     fprintf(stderr, "update_state(%ld, %ld): call %llu: next state updated END\n", i, j, counter);
   }
#if 0
   else
     {
    fprintf(stderr, "update_state(%ld, %ld): call %llu: NO next state updated END\n", i, j, counter);
     }
#endif
#endif	   
}

