#!/bin/bash
set -e

mongo <<EOF
use admin
db.createUser({
  user:  '$DB_USERNAME',
  pwd: '$DB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: 'admin'
  }]
})
EOF

mongo <<EOF
use admin;
db.grantRolesToUser('$DB_USERNAME', [
  { role: 'root', db: 'admin' }
])
EOF


