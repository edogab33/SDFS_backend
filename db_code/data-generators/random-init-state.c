
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
		(myrandom() <= 0.3) ? 0.0 : 1.0, /* fire status: 0 = no fire, 1 = fire */
		100*myrandom()  /*  percentage of fuel available for combustion  */
		);
		   
       }  /*  end for x  */
 
   }  /*  end for y  */
 
    return 0;
    
}  /* end main()  */


