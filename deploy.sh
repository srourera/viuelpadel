#!/bin/bash

# Cargar solo la contraseña
source .env

yarn build

FTP_USER="sroureragestion@gestion.vpadel.com"
FTP_HOST="ftp.vpadel.com"
FTP_PATH="/"

lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<EOF
set ssl:verify-certificate no

cd $FTP_PATH

rm -f index.html
rm -r assets

mirror -R dist/ ./

bye
EOF
