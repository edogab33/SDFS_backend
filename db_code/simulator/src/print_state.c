
#include "main.h"

int print_state(int t)
{

  static int k = 0;
  myint1 i, j;
   
  FILE *fp;

  long int counter = 0;
  
#if (DEBUG > 99999)
  fprintf(stderr, "print_state(%d): BEGIN\n", t);
#endif

  if (k == 0)
    {
fp = fopen(PresentStateFileName, "w");
 k = 1;
    }
  else
    {
fp = fopen(PresentStateFileName, "a");
    }
  
 if (fp == NULL)
   {  /* error */
     fprintf(stderr, "print_state(%d): Could not open config file. Expected to be: %s\n", t, PresentStateFileName);
     exit(1);
   }



  for(i=0; i < XSize; i++)
     {
       for (j=0; j < YSize; j++)
	 {
	   /*  print to csv  */
	   counter++;
	   fprintf(fp, "%d,%llu,%llu,%lf,%lf\n",
		   t,
		   index2x(i), index2y(j),
		   present_state[index2to1(i,j)].fire,
		   present_state[index2to1(i,j)].fuel
	     );
	 }  /*  for j  */
     }  /*  for i  */

  
 /* debug */ 
#if (DEBUG > 99999)
  fprintf(stderr, "print_state(%d): inserted %ld items. END\n", t, counter);
#endif
  
 fclose(fp);

return (0);

}

