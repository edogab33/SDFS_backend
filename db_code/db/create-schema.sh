#!/bin/sh

dbname="sdfs"
schemafile="schema.sql"

#psql "$dbname" -f "$schemafile"

psql postgres -f "$schemafile"
