#!/bin/bash

# Get directory for this script
cd $(dirname $0)

BASEURL=$(grep -i baseurl ../.env)
HOSTNAME=$(echo $BASEURL | cut -d'/' -f3 | cut -d':' -f1)
PROTO=$(echo $BASEURL | cut -d'=' -f2 | cut -d':' -f1)

if [ $PROTO = "http" ]; then
  exit 0
fi

echo "Generating self signed certificates for $HOSTNAME".
sed -e "s/localhost/${HOSTNAME}/g" cert_config_template >cert_config

# Create a new RSA keypair and create self-signed x509 cert.
openssl req -newkey rsa -nodes -config cert_config -x509 -out ../cert.pem -days 730

rm cert_config
