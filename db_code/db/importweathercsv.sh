#!/bin/sh

dbname="sdfs"
scriptfile="importweathercsv.sql"

psql "$dbname" -f "$scriptfile"
