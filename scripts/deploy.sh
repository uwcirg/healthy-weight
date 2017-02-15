# Deploy to CIRG IHE VM
echo "Deploying CIRG IHE VM"
sshpass -p$TRAVIS_SSH_PASS scp -o StrictHostKeyChecking=no -r dist/* travis@ihe.cirg.washington.edu:/var/www/himss/healthy-weight/
