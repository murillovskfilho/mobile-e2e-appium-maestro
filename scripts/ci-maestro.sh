#!/usr/bin/env bash
# Runs inside the emulator step in CI: the emulator is booted, adb is connected.
set -euo pipefail

adb wait-for-device
# No "isn't responding" or crash dialogs over the app: on a software-GPU emulator they cover the screen.
adb shell settings put global hide_error_dialogs 1
adb shell settings put global anr_show_background 0
adb shell input keyevent 82   # unlock / wake
adb install -r -g apps/my-demo-app.apk

mkdir -p reports/maestro
maestro test maestro \
  --format junit \
  --output reports/maestro/junit.xml \
  --test-output-dir reports/maestro/artifacts
