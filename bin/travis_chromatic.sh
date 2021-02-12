if ["$TRAVIS_PULL_REQUEST" = "false" ];
then
  yarn chromatic --auto-accept-changes --skip 'dependabot/**' --exit-once-uploaded
else
  yarn chromatic --exit-zero-on-changes --skip 'dependabot/**' --exit-once-uploaded
fi
