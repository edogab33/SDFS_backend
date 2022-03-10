#!/bin/sh

dbname="sdfs"
scriptfile="exportmaps2csv.sql"

psql "$dbname" -f "$scriptfile"
