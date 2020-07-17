if ["$TRAVIS_PULL_REQUEST" = "false" ];
then
  npm run chromatic -- --auto-accept-changes --skip 'dependabot/**' --exit-once-uploaded
else
  npm run chromatic -- --exit-zero-on-changes --skip 'dependabot/**' --exit-once-uploaded
fi
