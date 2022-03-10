
#ifndef pgsql_h
#define pgsql_h

#include <stdio.h>
#include <stdlib.h>
#include <libpq-fe.h>

void do_exit(PGconn *conn);

PGconn*  connect2db();

PGresult* ExecSQLcmd(PGconn *conn, char *sqlcmd);

PGresult* ExecSQLtuples(PGconn *conn, char *sqlcmd);
  
#endif 
