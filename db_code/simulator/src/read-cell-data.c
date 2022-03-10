
#include "main.h"

int read_cell_data(PGconn *conn)
{

   PGresult *res; 
   unsigned int rows;
   
  cellxytype SWx, SWy;

  myint1 i, j;
  
  myint1 altimetry;
  myint1 forest;
  myint1 urbanization;
  myint1 water1;
  myint1 water2;
  myint1 cartanatura;
  double windangle;
  double windspeed;
  
  long int counter = 0;

  int col_SWx, col_SWy, col_altimetry, col_forest, col_urbanization, col_water1, col_water2, col_cartanatura, col_windangle, col_windspeed;
  
#if (DEBUG > 99999)
  fprintf(stderr, "read_cell_data(): BEGIN\n");
#endif


 res = ExecSQLcmd(conn, "BEGIN");
 PQclear(res);

 
  sprintf(sqlcmd,
	  "SELECT SWx, SWy, altimetry, forest, urbanization, water1, water2, cartanatura,  windangle, windspeed FROM SatelliteMaps WHERE (SWx >= %llu) and (SWx <= %llu) and (SWy >= %llu) and (SWy <= %llu)",
	  minSWx, maxSWx, minSWy, maxSWy);

 
  res = ExecSQLtuples(conn, sqlcmd);

  rows = PQntuples(res);


  col_SWx = PQfnumber(res, "SWx");
  col_SWy = PQfnumber(res, "SWy");
  col_altimetry = PQfnumber(res, "altimetry");
  col_forest = PQfnumber(res, "forest");
  col_urbanization = PQfnumber(res, "urbanization");
  col_water1 = PQfnumber(res, "water1");
  col_water2 = PQfnumber(res, "water2");
  col_cartanatura = PQfnumber(res, "cartanatura");
  col_windangle = PQfnumber(res, "windangle");
  col_windspeed = PQfnumber(res, "windspeed");
  

#if (DEBUG > 0)
  fprintf(stderr, "read_cell_data(): sqlcmd: %s, rows = %d, cols = (%d, %d, %d, %d, %d, %d, %d, %d, %d, %d) \n", sqlcmd, rows,
	  col_SWx, col_SWy, col_altimetry, col_forest, col_urbanization, col_water1, col_water2, col_cartanatura, col_windangle, col_windspeed
	  );
#endif
  
for(int k=0; k<rows; k++) {

#if (DEBUG > 0)
 fprintf(stderr, "read_cell_data(): begin reading row %d)\n", k);
#endif
	SWx = atoi(PQgetvalue(res, k, col_SWx));
	SWy = atoi(PQgetvalue(res, k, col_SWy));
	altimetry = atoi(PQgetvalue(res, k, col_altimetry));
	forest = atoi(PQgetvalue(res, k, col_forest));
	urbanization = atoi(PQgetvalue(res, k, col_urbanization));
	water1 = atoi(PQgetvalue(res, k, col_water1));
	water2 = atoi(PQgetvalue(res, k, col_water2));
	cartanatura = atoi(PQgetvalue(res, k, col_cartanatura));
	windangle = atof(PQgetvalue(res, k, col_windangle));
	windspeed = atof(PQgetvalue(res, k, col_windspeed));

	  i = x2index(SWx); j = y2index(SWy);
           cell_parameters[index2to1(i, j)].altimetry = altimetry;
           cell_parameters[index2to1(i,j)].forest = forest;
           cell_parameters[index2to1(i,j)].urbanization = urbanization;
           cell_parameters[index2to1(i,j)].water1 = water1;
           cell_parameters[index2to1(i,j)].water2 = water2;
           cell_parameters[index2to1(i,j)].cartanatura = cartanatura;
           cell_parameters[index2to1(i,j)].windangle = windangle;
           cell_parameters[index2to1(i,j)].windspeed = windspeed;

	counter++;

#if (DEBUG > 0)
 fprintf(stderr, "read_cell_data(): stored row %d: (%llu, %llu, %ld, %ld, %ld, %ld, %ld, %ld, %lf, %lf) \n",
	 k,
	 SWx, SWy,
	 altimetry, forest, urbanization, water1, water2, cartanatura,
	 windangle, windspeed
	 );
#endif
 
 }  /*  for  */

 
  res = ExecSQLcmd(conn, "COMMIT");    
  PQclear(res);

 

 /* debug */ 
#if (DEBUG > 99999)
 fprintf(stderr, "read_cell_data(): inserted %ld items. END\n", counter);
#endif
  
return (0);
		  
}

