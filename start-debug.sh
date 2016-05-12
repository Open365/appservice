#!/bin/bash
set -e
set -u

node --debug-brk=5858 src/eyeos-appservice.js
