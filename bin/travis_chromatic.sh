if ["$TRAVIS_PULL_REQUEST" = "false" ];
then
  npm run chromatic -- --auto-accept-changes
else
  npm run chromatic -- --exit-zero-on-changes
fi
