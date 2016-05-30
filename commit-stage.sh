#!/bin/sh
set -e
set -u
set -x

cat <<COMMIT_STAGE
This repo doesn't have tests (at the moment), so we leave this 'empty'
commit-stage so it doesn't have a generated one that tries to run those
tests.

Once this repo has tests you can remove this file.
COMMIT_STAGE
