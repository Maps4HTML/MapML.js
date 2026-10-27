#!/bin/sh

set -e
set -x

if [ -z "$INPUT_SOURCE_FOLDER" ]
then
  INPUT_SOURCE_FOLDER=dist
fi

if [ -z "$INPUT_DESTINATION_BRANCH" ]
then
  INPUT_DESTINATION_BRANCH=master
fi

if [ -z "$INPUT_COMMIT_MSG" ]
then
  INPUT_COMMIT_MSG="Update $INPUT_DESTINATION_FOLDER."
fi

CLONE_DIR=$(mktemp -d)

echo "Cloning destination git repository"
git config --global user.email "$INPUT_USER_EMAIL"
git config --global user.name "$INPUT_USER_NAME"
# Supply the token through a credential helper instead of embedding it in the
# clone URL. With libcurl >= 8.23, git treats a URL with embedded credentials
# as redirected to the bare URL and drops the credentials, so the push fails.
# The single quotes keep the token out of the `set -x` trace.
git config --global credential.helper '!f() { echo username=x-access-token; echo "password=$API_TOKEN_GITHUB"; }; f'
git clone --single-branch --branch $INPUT_DESTINATION_BRANCH "https://github.com/$INPUT_DESTINATION_REPO.git" "$CLONE_DIR"

echo "Removing old destination files"
# Ensure the (possibly nested) destination folder exists so a first-time
# sync into a new subtree doesn't fail on the copy below.
mkdir -p "$CLONE_DIR/$INPUT_DESTINATION_FOLDER"
rm -rf $CLONE_DIR/$INPUT_DESTINATION_FOLDER/*

echo "Copying contents to git repo"
cp -rf $INPUT_SOURCE_FOLDER/. $CLONE_DIR/$INPUT_DESTINATION_FOLDER/
cd "$CLONE_DIR"

echo "Adding git commit"
git add -f .
if git status | grep -q "Changes to be committed"
then
  git commit --message "$INPUT_COMMIT_MSG"
  echo "Pushing git commit"
  git push origin $INPUT_DESTINATION_BRANCH
else
  echo "No changes detected"
fi
