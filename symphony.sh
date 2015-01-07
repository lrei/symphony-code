#!/bin/sh
rm -rf db/*
rm lock
qm create -def=../../qmtwittertools/qmschema/base/twitter.def.js
qm start -noserver -script=load_tweets.qm -verbose -file=/home/rei/DATA/symphony/uk_tweets_by_location.txt
qm start -noserver -script=symphony -file=/home/rei/DATA/symphony/ftse-100.json
qm start -noserver -script=symphony -extract
