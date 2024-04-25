#!/usr/bin/env bash

# This script receives the list of generated files, each in a separate argument.
# Some of them are relative to the project root, and some of them are absolute.
# Convert to a newline-separated list of paths relative to the project root
files_to_keep=$(echo "$@" | tr ' ' '\n' | sed "s|$(pwd)|.|g")

# Delete all files with the extension *.generated.ts that aren't in the $files_to_keep list
stale_files=$(find . -type f -name "*.generated.ts" | grep --fixed-strings --line-regexp --invert-match --file <(echo "$files_to_keep"))
if [[ -n $stale_files ]]; then
  rm $stale_files
fi
