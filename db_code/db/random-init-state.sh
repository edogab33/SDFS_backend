#!/bin/sh

dbname="sdfs"
scriptfile="random-init-state.sql"

psql "$dbname" -f "$scriptfile"
