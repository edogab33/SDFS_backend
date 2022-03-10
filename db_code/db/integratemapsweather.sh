#!/bin/sh

dbname="sdfs"
scriptfile="integratemapsweather.sql"

psql "$dbname" -f "$scriptfile"
