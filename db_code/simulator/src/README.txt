
In file pgsql.c  within function connect2db()  replace the instruction

PGconn *conn = PQconnectdb("user=enrico dbname=sdfs");

with

PGconn *conn = PQconnectdb("user=XXX dbname=sdfs");

where XXX is a linux users with access to the postgresql database sdfs

-----


To compile:

> make


To run:

> ./main


Results will be in the directory "outputs".




