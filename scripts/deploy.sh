# Deploy to CIRG IHE VM
echo "Deploying CIRG IHE VM"
sshpass -p$TRAVIS_SSH_PASS ssh -o StrictHostKeyChecking=no travis@ihe.cirg.washington.edu 'cd /var/www/himss/healthy-weight/ && git fetch origin && git reset --hard origin/gh-pages';
