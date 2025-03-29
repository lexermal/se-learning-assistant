#!/bin/bash
set -e

# Registry URL variable
REGISTRY_URL="registry.rimori.se/language"

# Check that a version has been provided
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <new_version>"
  exit 1
fi

NEW_VERSION=$1

echo "Releasing version ${NEW_VERSION}..."

# Pump the version in package.json without creating an automatic git tag
echo "Updating package.json version..."
npm version ${NEW_VERSION} --no-git-tag-version

# Update the version in the LICENSE file
echo "Updating LICENSE file..."
sed -i "s/Licensed Work:        Rimori [0-9]\+\.[0-9]\+\.[0-9]\+/Licensed Work:        Rimori ${NEW_VERSION}/g" LICENSE

echo "Committing version bump..."
# Add updated files and commit the changes
git add package.json LICENSE
git commit -m "Bump version to ${NEW_VERSION}"

echo "Creating git tag..."
git tag -a "v${NEW_VERSION}" -m "Release version ${NEW_VERSION}"

# (Optional) Push commit and tags to the remote repository
echo "Pushing commits and tags..."
git push origin HEAD
git push origin --tags

# Build with docker compose
echo "Building with docker compose..."
docker compose up --build -d

# Tag and push Docker images with both version and latest tags
echo "Tagging and pushing Rimori UI Docker image..."
docker tag ${REGISTRY_URL}/rimori-ui:latest ${REGISTRY_URL}/rimori-ui:${NEW_VERSION}
sudo docker push ${REGISTRY_URL}/rimori-ui:${NEW_VERSION}
sudo docker push ${REGISTRY_URL}/rimori-ui:latest

echo "Tagging and pushing Rimori Plugins Docker image..."
docker tag ${REGISTRY_URL}/rimori-plugins:latest ${REGISTRY_URL}/rimori-plugins:${NEW_VERSION}
sudo docker push ${REGISTRY_URL}/rimori-plugins:${NEW_VERSION}
sudo docker push ${REGISTRY_URL}/rimori-plugins:latest

echo "Release complete!"

echo "Todo: Deploy the new version ${NEW_VERSION} to production"