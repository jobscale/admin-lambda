#!/bin/bash -eu

. scripts/config

rsa() {
  openssl req \
    -new \
    -newkey rsa:4096 \
    -days 365 \
    -nodes \
    -x509 \
    -subj "/C=$country/ST=$state/L=$locality/O=$organizational/CN=$common" \
    -keyout $directory/$common.key \
    -out $directory/$common.cert
}

ec() {
  openssl req \
    -new \
    -newkey ec \
    -pkeyopt ec_paramgen_curve:prime256v1 \
    -days 365 \
    -nodes \
    -x509 \
    -subj "/C=$country/ST=$state/L=$locality/O=$organizational/CN=$common" \
    -keyout $directory/$common.key \
    -out $directory/$common.cert
}

rsa
