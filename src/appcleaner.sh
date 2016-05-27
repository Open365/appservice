#!/bin/sh
CLEAN_INTERVAL=${CLEAN_INTERVAL:-"30"}
while :
do
	TOBEDELETED=$(docker ps -q -a -f "status=exited" -f "ancestor=docker-registry.eyeosbcn.com/open365-app-docker")
	AMOUNT=$(docker ps -q -a -f "status=exited" -f "ancestor=docker-registry.eyeosbcn.com/open365-app-docker" | wc -l)
	if [ ! -z "$TOBEDELETED" ]; then
		echo "Deleting $AMOUNT containers"
		docker rm $TOBEDELETED
	else
		echo "No container to be deleted"
	fi
	echo "Waiting for next loop $CLEAN_INTERVAL seconds"
	sleep $CLEAN_INTERVAL
done
