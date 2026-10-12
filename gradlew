#!/bin/sh
# Root gradlew delegating to android/gradlew if needed
if [ -f "./android/gradlew" ]; then
  cd android && ./gradlew "$@"
else
  gradle "$@"
fi
