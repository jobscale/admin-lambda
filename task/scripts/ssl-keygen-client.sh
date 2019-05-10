#!/bin/bash -eu

. scripts/config

rsa() {
  openssl genrsa \
    -out $directory/client.key 4096
  openssl req \
    -new \
    -subj "/C=$country/ST=$state/L=$locality/O=$organizational/CN=$common" \
    -key $directory/client.key \
    -out $directory/client.csr
  openssl x509 \
    -req \
    -days 365 \
    -in $directory/client.csr \
    -CA $directory/$common.cert \
    -CAkey $directory/$common.key \
    -set_serial 01 \
    -out $directory/client.crt
}

rsa
