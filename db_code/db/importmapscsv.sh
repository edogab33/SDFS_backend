#!/bin/sh

dbname="sdfs"
scriptfile="importmapscsv.sql"

psql "$dbname" -f "$scriptfile"
