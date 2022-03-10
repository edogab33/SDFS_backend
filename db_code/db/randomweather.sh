#!/bin/sh

dbname="sdfs"
scriptfile="randomweather.sql"

psql "$dbname" -f "$scriptfile"
