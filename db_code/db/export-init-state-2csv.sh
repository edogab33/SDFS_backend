#!/bin/sh

dbname="sdfs"
scriptfile="export-init-state-2csv.sql"

psql "$dbname" -f "$scriptfile"
