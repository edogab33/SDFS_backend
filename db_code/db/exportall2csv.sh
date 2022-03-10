#!/bin/sh

dbname="sdfs"
scriptfile="exportall2csv.sql"

psql "$dbname" -f "$scriptfile"
