#!/bin/bash

node generate-grid.js > logs/grid-generation.log 2>&1
node test-simulation.js > logs/test-simulation.log 2>&1