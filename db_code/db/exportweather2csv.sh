#!/bin/sh

dbname="sdfs"
scriptfile="exportweather2csv.sql"

psql "$dbname" -f "$scriptfile"
