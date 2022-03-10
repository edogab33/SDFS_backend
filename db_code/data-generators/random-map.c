
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
    
	 printf("%llu , %llu , %llu , %llu , %llu , %llu , %llu , %llu\n",
		x,   /*  x coordinate */
		y,   /*  y coordinate */
		(long long unsigned int) round(4380*myrandom()), /* altimetry */
		(long long unsigned int) round(255*myrandom()), /* forest */
		(long long unsigned int) round(255*myrandom()), /* urbanization */
		(long long unsigned int) round(255*myrandom()), /* water1 */
		(long long unsigned int) round(myrandom()), /* water2 */
		(long long unsigned int) (1 + round(89*myrandom())) /* carta natura */
		);
		   
       }  /*  end for x  */
 
   }  /*  end for y  */
 
    return 0;
    
}  /* end main()  */


