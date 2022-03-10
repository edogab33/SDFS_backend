
#include "global.h"


int main() {
    
long long unsigned int x, y;

  /*   prg  */
  
  /* Intialize random number generator */
 srand((unsigned) time(NULL));
  

 
   
for (y = MAX_y; y >= MIN_y; y = y - STEP)
   {  /*  begin for y  */
  
     for (x = MIN_x; x <= MAX_x; x = x + STEP)
       {  /*  begin for x  */
    
	 printf("%llu , %llu , %lf , %lf\n",
		x,   /*  x coordinate */
		y,   /*  y coordinate */
		(-M_PI + 2*M_PI*myrandom()), /* wind direction */
		100*myrandom()  /*  wind strength  */
		);
		   
       }  /*  end for x  */
 
   }  /*  end for y  */
 
    return 0;
    
}  /* end main()  */


