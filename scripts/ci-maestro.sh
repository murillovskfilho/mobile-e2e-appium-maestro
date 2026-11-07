#!/usr/bin/env bash
# Runs inside the emulator step in CI: the emulator is booted, adb is connected.
set -euo pipefail

adb wait-for-device
adb install -r -g apps/my-demo-app.apk

mkdir -p reports/maestro
maestro test maestro \
  --format junit \
  --output reports/maestro/junit.xml \
  --test-output-dir reports/maestro/artifacts
