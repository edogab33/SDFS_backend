#!/bin/sh

./create-schema.sh

./importmapscsv.sh

./importweathercsv.sh

./integratemapsweather.sh

# ./exportall2csv.sh

./random-init-state.sh
