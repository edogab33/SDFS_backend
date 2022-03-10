#!/bin/sh

dbname="sdfs"
scriptfile="update-init-state.sql"

psql "$dbname" -f "$scriptfile"
