
#include "pgsql.h"
#include "main.h"


void do_exit(PGconn *conn) {
    
    PQfinish(conn);
    exit(1);
}



PGconn*  connect2db()
{
  
  // connect linux user to database (must have privileges)
  //    PGconn *conn = PQconnectdb("dbname=sdfs");

      PGconn *conn = PQconnectdb("user=edoardogabrielli dbname=sdfs");
  //  PGconn *conn = PQconnectdb("user=sdfs dbname=sdfs");    // on MPM server

    if (PQstatus(conn) != CONNECTION_OK) {
        
        fprintf(stderr, "Connection to database failed: %s\n",
        PQerrorMessage(conn));
        do_exit(conn);
    }

#if 0
    fprintf(stderr, "connect2db: PQconnectPoll: %d\n", PQconnectPoll(conn));        
    fprintf(stderr, "connect2db: PQstatus: %d\n", PQstatus(conn));       
    fprintf(stderr, "connetc2db: Connection to DB successfully established \n");        
#endif

    return(conn);
    
}  /* connetc2db() */



/* use this for commands returning no data, e.g. INSERT */
PGresult* ExecSQLcmd(PGconn *conn, char *sqlcmd)
{


#if (DEBUG > 1000000)
  fprintf(stderr, "ExecSQLcmd(): PQexec on: %s\n", sqlcmd);        
  fprintf(stderr, "ExecSQLcmd(): PQconnectPoll: %d\n", PQconnectPoll(conn));        
  fprintf(stderr, "ExecSQLcmd(): PQstatus: %d\n", PQstatus(conn));        
#endif

  return (NULL);
  
  
  PGresult *res = PQexec(conn, sqlcmd);    

#if (DEBUG > 1000000)
    fprintf(stderr, "ExecSQLcmd(): PQexec done\n");        
#endif
    
    if (PQresultStatus(res) != PGRES_COMMAND_OK) {

      fprintf(stderr, "ExecSQLcmd(): SQL command failed: %s\n", sqlcmd);
      fprintf(stderr, "ExecSQLcmd(): %s\n",
	      PQresStatus(PQresultStatus(res)));
      fprintf(stderr, "ExecSQLcmd(): PQresultErrorMessage: %s\n",
	      PQresultErrorMessage(res) ) ;
           
        PQclear(res);
        do_exit(conn);
    }    

#if 0
    fprintf(stderr, "ExecSQLcmd() SQL command OK: %s\n", sqlcmd);        
#endif

    return (res);
}


/* use this for commands returning data, e.g. SELECT */
PGresult* ExecSQLtuples(PGconn *conn, char *sqlcmd)
{


  PGresult *res = PQexec(conn, sqlcmd);    
	
    if (PQresultStatus(res) != PGRES_TUPLES_OK) {

      fprintf(stderr, "ExecSQLtuples(): SQL command failed: %s\n", sqlcmd);
      fprintf(stderr, "ExecSQLtuples(): %s\n",
	      PQresStatus(PQresultStatus(res)));

        PQclear(res);
        do_exit(conn);
    }    

#if 0
    fprintf(stderr, "ExecSQLtuples() OK: %s\n", sqlcmd);        
#endif

    return (res);
}
