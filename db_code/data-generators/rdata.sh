#!/bin/sh

datadir="../data"

if [ ! -d ${datadir} ]
then
    echo "Creating dir ${datadir}"
    mkdir ${datadir}
else

    echo "Dir ${datadir} altrady exists"

fi

make

./rmap > ${datadir}/satellite-map.csv

./rweather > ${datadir}/weather.csv

./rinit > ${datadir}/init-state.csv
