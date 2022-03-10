
First, say we are running on linux user enrico, then we need to make
enrico owner of database sdfs.


For example:

sudo -u postgres createdb sdfs

sudo -u postgres psql

psql=# grant all privileges on database sdfs to enrico ;
psql=# ALTER DATABASE sdfs OWNER TO enrico;
