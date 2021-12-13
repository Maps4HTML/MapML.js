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
git clone --single-branch --branch $INPUT_DESTINATION_BRANCH "https://$API_TOKEN_GITHUB@github.com/$INPUT_DESTINATION_REPO.git" "$CLONE_DIR"

echo "Removing old destination files"
rm -rf $CLONE_DIR/$INPUT_DESTINATION_FOLDER/*

echo "Copying contents to git repo"
cp -rf $INPUT_SOURCE_FOLDER/. $CLONE_DIR/$INPUT_DESTINATION_FOLDER/
cd "$CLONE_DIR"

echo "Adding git commit"
git add .
if git status | grep -q "Changes to be committed"
then
  git commit --message "$INPUT_COMMIT_MSG"
  echo "Pushing git commit"
  git push origin $INPUT_DESTINATION_BRANCH
else
  echo "No changes detected"
fi
